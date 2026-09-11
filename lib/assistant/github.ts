import "server-only";

import pLimit from "p-limit";

type GitHubCommitSummary = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
    committer: { name: string; date: string } | null;
    tree: { sha: string };
  };
  author: { login: string } | null;
};

type GitHubTreeEntry = {
  path: string;
  mode: string;
  type: "blob" | "tree" | string;
  sha: string;
  size?: number;
};

type GitHubTreeResponse = {
  sha: string;
  truncated: boolean;
  tree: GitHubTreeEntry[];
};

type GitHubBlob = {
  content: string;
  encoding: string;
  size: number;
};

export type GithubSnapshotPart = {
  name: string;
  text: string;
};

/** Soft budgets so the model still sees most of the app without blowing the request. */
const MAX_FILE_BYTES = 120_000;
const MAX_PART_CHARS = 100_000;
const MAX_PARTS = 10;
const MAX_TOTAL_CHARS = MAX_PART_CHARS * MAX_PARTS;
const FETCH_CONCURRENCY = 8;

const SKIP_PATH_PREFIXES = [
  "node_modules/",
  ".git/",
  ".next/",
  "dist/",
  "build/",
  "coverage/",
  ".turbo/",
  ".vercel/",
  "public/",
];

const SKIP_EXACT = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "bun.lock",
]);

const SKIP_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".icns",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".mp4",
  ".webm",
  ".mov",
  ".mp3",
  ".wav",
  ".pdf",
  ".zip",
  ".gz",
  ".tgz",
  ".7z",
  ".bin",
  ".exe",
  ".dmg",
  ".map",
  ".lock",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".htm",
  ".svg",
  ".sql",
  ".yml",
  ".yaml",
  ".toml",
  ".txt",
  ".csv",
  ".env",
  ".example",
  ".gitignore",
  ".npmrc",
  ".editorconfig",
]);

function resolveRepo(): { owner: string; repo: string } | null {
  const explicit = process.env.GITHUB_REPO?.trim();
  if (explicit) {
    const [owner, repo] = explicit.split("/");
    if (owner && repo) return { owner, repo };
  }

  const owner = process.env.VERCEL_GIT_REPO_OWNER?.trim();
  const repo = process.env.VERCEL_GIT_REPO_SLUG?.trim();
  if (owner && repo) return { owner, repo };

  return null;
}

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "stralkastarpolering-assistant",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `GitHub API ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }

  return (await response.json()) as T;
}

function extensionOf(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  return base.slice(dot).toLowerCase();
}

function shouldIncludePath(path: string, size: number | undefined): boolean {
  const normalized = path.replace(/^\/+/, "");
  if (SKIP_EXACT.has(normalized) || SKIP_EXACT.has(normalized.split("/").pop() ?? "")) {
    return false;
  }
  if (SKIP_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }
  if (size != null && size > MAX_FILE_BYTES) return false;

  const base = normalized.split("/").pop() ?? normalized;
  if (
    base === "LICENSE" ||
    base === "Dockerfile" ||
    base.startsWith(".env") ||
    base.endsWith(".example")
  ) {
    return true;
  }

  const ext = extensionOf(normalized);
  if (SKIP_EXTENSIONS.has(ext)) return false;
  if (!ext) {
    // Extensionless config-ish files
    return /^(Dockerfile|Makefile|Procfile|Rakefile)$/i.test(base);
  }
  return TEXT_EXTENSIONS.has(ext);
}

function pathPriority(path: string): number {
  if (path.startsWith("app/")) return 0;
  if (path.startsWith("components/")) return 1;
  if (path.startsWith("lib/")) return 2;
  if (path.startsWith("supabase/")) return 3;
  if (path.startsWith("messages/") || path.startsWith("i18n/")) return 4;
  if (
    path === "proxy.ts" ||
    path === "next.config.ts" ||
    path === "package.json" ||
    path === "vercel.json" ||
    path === "tsconfig.json"
  ) {
    return 5;
  }
  return 10;
}

function decodeBlob(blob: GitHubBlob): string | null {
  if (blob.encoding !== "base64") {
    return typeof blob.content === "string" ? blob.content : null;
  }
  try {
    const raw = Buffer.from(blob.content.replace(/\n/g, ""), "base64");
    // Skip obviously binary payloads
    if (raw.includes(0)) return null;
    return raw.toString("utf8");
  } catch {
    return null;
  }
}

function packParts(
  header: string,
  files: Array<{ path: string; content: string }>
): GithubSnapshotPart[] {
  const chunks: string[] = [];
  let current = `${header}\n\n`;
  let used = 0;

  const pushCurrent = () => {
    const text = current.trimEnd();
    if (!text || !text.includes("===== FILE:")) return;
    chunks.push(text);
    used += text.length;
    current = `${header}\n\n(Continued…)\n\n`;
  };

  for (const file of files) {
    if (chunks.length >= MAX_PARTS || used >= MAX_TOTAL_CHARS) break;

    let content = file.content;
    let truncated = false;
    const maxBlock = MAX_PART_CHARS - header.length - 80;
    if (content.length > maxBlock) {
      content = content.slice(0, Math.max(0, maxBlock));
      truncated = true;
    }

    const block = `===== FILE: ${file.path}${
      truncated ? " (truncated)" : ""
    } =====\n${content}\n\n`;

    if (
      current.length + block.length > MAX_PART_CHARS &&
      current.includes("===== FILE:")
    ) {
      pushCurrent();
      if (chunks.length >= MAX_PARTS || used >= MAX_TOTAL_CHARS) break;
    }

    if (used + current.length + block.length > MAX_TOTAL_CHARS) {
      current += "[Stopped early — remaining files omitted to fit limit]\n";
      break;
    }

    current += block;
  }

  pushCurrent();

  if (chunks.length === 0) {
    return [
      {
        name: "Latest app source",
        text: `${header}\n\nNo text source files could be packed.`,
      },
    ];
  }

  if (chunks.length === 1) {
    return [{ name: "Latest app source", text: chunks[0] }];
  }

  return chunks.map((text, index) => ({
    name: `Latest app source (${index + 1}/${chunks.length})`,
    text,
  }));
}

/**
 * Latest commit on the default branch, with the text source files of that
 * app version (not just the push metadata / changed-file names).
 */
export async function lastGithubAppSnapshot(): Promise<GithubSnapshotPart[]> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    return [
      {
        name: "Latest app source",
        text: "Last GitHub push: not configured (set GITHUB_TOKEN).",
      },
    ];
  }

  const repo = resolveRepo();
  if (!repo) {
    return [
      {
        name: "Latest app source",
        text: "Last GitHub push: not configured (set GITHUB_REPO=owner/name).",
      },
    ];
  }

  try {
    const list = await githubFetch<GitHubCommitSummary[]>(
      `/repos/${repo.owner}/${repo.repo}/commits?per_page=1`,
      token
    );
    const head = list[0];
    if (!head?.sha) {
      return [
        {
          name: "Latest app source",
          text: `Last GitHub push: no commits found for ${repo.owner}/${repo.repo}.`,
        },
      ];
    }

    const when =
      head.commit.committer?.date ?? head.commit.author?.date ?? "unknown";
    const who =
      head.author?.login ??
      head.commit.author?.name ??
      head.commit.committer?.name ??
      "unknown";
    const message =
      head.commit.message.split("\n")[0]?.trim() || "(no message)";

    const tree = await githubFetch<GitHubTreeResponse>(
      `/repos/${repo.owner}/${repo.repo}/git/trees/${head.commit.tree.sha}?recursive=1`,
      token
    );

    const candidates = tree.tree
      .filter(
        (entry) =>
          entry.type === "blob" &&
          shouldIncludePath(entry.path, entry.size)
      )
      .sort(
        (a, b) =>
          pathPriority(a.path) - pathPriority(b.path) ||
          a.path.localeCompare(b.path)
      );

    const limit = pLimit(FETCH_CONCURRENCY);
    const fetched = await Promise.all(
      candidates.map((entry) =>
        limit(async () => {
          try {
            const blob = await githubFetch<GitHubBlob>(
              `/repos/${repo.owner}/${repo.repo}/git/blobs/${entry.sha}`,
              token
            );
            const content = decodeBlob(blob);
            if (content == null) return null;
            return { path: entry.path, content };
          } catch (error) {
            console.error(
              `[assistant] github blob failed for ${entry.path}`,
              error
            );
            return null;
          }
        })
      )
    );

    const files = fetched.filter(
      (row): row is { path: string; content: string } => row != null
    );

    const omitted = candidates.length - files.length;
    const header = [
      `Latest app version · ${repo.owner}/${repo.repo}`,
      `- SHA: ${head.sha.slice(0, 7)}`,
      `- When: ${when}`,
      `- Author: ${who}`,
      `- Message: ${message}`,
      head.html_url ? `- URL: ${head.html_url}` : null,
      `- Source files included: ${files.length}${
        omitted > 0 ? ` (${omitted} skipped/unreadable)` : ""
      }`,
      tree.truncated ? "- Warning: GitHub tree response was truncated." : null,
      "",
      "Full file contents follow. Each file is marked with ===== FILE: path =====.",
    ]
      .filter(Boolean)
      .join("\n");

    if (files.length === 0) {
      return [
        {
          name: "Latest app source",
          text: `${header}\n\nNo text source files could be loaded.`,
        },
      ];
    }

    return packParts(header, files);
  } catch (error) {
    console.error("[assistant] github app snapshot failed", error);
    return [
      {
        name: "Latest app source",
        text: `Last GitHub push: could not load (${
          error instanceof Error ? error.message : "error"
        }).`,
      },
    ];
  }
}

/** Single-string fallback used by the generic context builder. */
export async function lastGithubPushLines(): Promise<string> {
  const parts = await lastGithubAppSnapshot();
  return parts.map((part) => part.text).join("\n\n");
}
