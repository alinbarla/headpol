import "server-only";

type GitHubCommitFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
};

type GitHubCommitDetail = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
    committer: { name: string; date: string } | null;
  };
  author: { login: string } | null;
  files?: GitHubCommitFile[];
  stats?: { total: number; additions: number; deletions: number };
};

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

/** Latest push/commit on the default branch, including changed files. */
export async function lastGithubPushLines(): Promise<string> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    return "Last GitHub push: not configured (set GITHUB_TOKEN).";
  }

  const repo = resolveRepo();
  if (!repo) {
    return "Last GitHub push: not configured (set GITHUB_REPO=owner/name).";
  }

  try {
    const list = await githubFetch<Array<{ sha: string }>>(
      `/repos/${repo.owner}/${repo.repo}/commits?per_page=1`,
      token
    );
    const sha = list[0]?.sha;
    if (!sha) {
      return `Last GitHub push: no commits found for ${repo.owner}/${repo.repo}.`;
    }

    const detail = await githubFetch<GitHubCommitDetail>(
      `/repos/${repo.owner}/${repo.repo}/commits/${sha}`,
      token
    );

    const when =
      detail.commit.committer?.date ?? detail.commit.author?.date ?? "unknown";
    const who =
      detail.author?.login ??
      detail.commit.author?.name ??
      detail.commit.committer?.name ??
      "unknown";
    const message = detail.commit.message.split("\n")[0]?.trim() || "(no message)";
    const files = detail.files ?? [];
    const stats = detail.stats;

    const lines = [
      `Last GitHub push · ${repo.owner}/${repo.repo}`,
      `- SHA: ${detail.sha.slice(0, 7)}`,
      `- When: ${when}`,
      `- Author: ${who}`,
      `- Message: ${message}`,
      stats
        ? `- Diff: +${stats.additions} / -${stats.deletions} (${stats.total} total)`
        : null,
      detail.html_url ? `- URL: ${detail.html_url}` : null,
      files.length > 0
        ? `- Files (${files.length}):`
        : "- Files: none listed",
      ...files.slice(0, 80).map((file) => {
        const mark =
          file.status === "added"
            ? "A"
            : file.status === "removed"
              ? "D"
              : file.status === "renamed"
                ? "R"
                : "M";
        return `  ${mark} ${file.filename} (+${file.additions}/-${file.deletions})`;
      }),
      files.length > 80 ? `  …and ${files.length - 80} more files` : null,
    ].filter(Boolean) as string[];

    return lines.join("\n");
  } catch (error) {
    console.error("[assistant] github push failed", error);
    return `Last GitHub push: could not load (${error instanceof Error ? error.message : "error"}).`;
  }
}
