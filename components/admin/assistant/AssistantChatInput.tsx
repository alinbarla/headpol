"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArchiveIcon,
  ArrowUpIcon,
  BrainIcon,
  ChevronDownIcon,
  PlusIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getDashboardSnapshotAction } from "@/app/admin/assistant/actions";
import {
  FilePreviewCard,
  type DraftAttachment,
} from "@/components/admin/assistant/FilePreviewCard";
import type { AssistantAttachment } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";

const LONG_PASTE = 300;
const MAX_ATTACHMENTS = 8;
const MAX_TEXT_CHARS = 20_000;

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function fileToDraft(file: File): Promise<DraftAttachment> {
  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
  const isText =
    file.type.startsWith("text/") ||
    /\.(txt|md|csv|json|xml|log|html|css|js|ts)$/i.test(file.name);

  let text: string | undefined;
  if (isText) {
    text = (await file.text()).slice(0, MAX_TEXT_CHARS);
  }

  return {
    id: newId(),
    name: file.name || "Untitled",
    size: file.size,
    type: isImage ? file.type || "image/unknown" : file.type || "application/octet-stream",
    text,
    preview: isImage ? URL.createObjectURL(file) : undefined,
    kind: "file",
  };
}

function toPayload(files: DraftAttachment[]): AssistantAttachment[] {
  return files.map(({ name, size, type, text }) => ({ name, size, type, text }));
}

export function AssistantChatInput({
  pending,
  onSend,
}: {
  pending: boolean;
  onSend: (data: {
    message: string;
    attachments: AssistantAttachment[];
    thinking: boolean;
  }) => void;
}) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<DraftAttachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [thinking, setThinking] = useState(true);
  const [loadingDash, setLoadingDash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasContent = message.trim().length > 0 || files.length > 0;
  const canSend = !pending && hasContent;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 384)}px`;
  }, [message]);

  const addFiles = useCallback((next: DraftAttachment[]) => {
    setFiles((current) => {
      const merged = [...current, ...next];
      if (merged.length > MAX_ATTACHMENTS) {
        toast.error(`At most ${MAX_ATTACHMENTS} attachments.`);
        return merged.slice(0, MAX_ATTACHMENTS);
      }
      return merged;
    });
  }, []);

  const handleFiles = useCallback(
    async (list: FileList | File[]) => {
      const rows = await Promise.all(Array.from(list).map(fileToDraft));
      if (rows.length === 0) return;
      addFiles(rows);
    },
    [addFiles]
  );

  function send() {
    if (!canSend) return;
    onSend({
      message: message.trim(),
      attachments: toPayload(files),
      thinking,
    });
    setMessage("");
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  async function addDashboardData() {
    setLoadingDash(true);
    try {
      const result = await getDashboardSnapshotAction();
      if (!result.ok || !result.text) {
        toast.error(result.message ?? "Could not load dashboard data.");
        return;
      }
      addFiles([
        {
          id: newId(),
          name: "Dashboard snapshot",
          size: result.text.length,
          type: "text/plain",
          text: result.text.slice(0, MAX_TEXT_CHARS),
          kind: "dashboard",
        },
      ]);
      setMessage((current) =>
        current.trim()
          ? current
          : "Summarize the current bookings and SEO snapshot."
      );
    } finally {
      setLoadingDash(false);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div
        className={cn(
          "relative z-10 rounded-2xl border border-border bg-card",
          "shadow-[0_0_15px_rgba(0,0,0,0.08)] transition-shadow",
          "focus-within:shadow-[0_0_25px_rgba(0,0,0,0.18)]",
          dragging && "border-primary"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
      >
        <div className="flex flex-col gap-2 px-3 pt-3 pb-2">
          {files.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {files.map((file) => (
                <FilePreviewCard
                  key={file.id}
                  file={file}
                  onRemove={() =>
                    setFiles((current) => current.filter((row) => row.id !== file.id))
                  }
                />
              ))}
            </div>
          ) : null}

          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            disabled={pending}
            placeholder="How can I help you today?"
            className="min-h-10 w-full resize-none bg-transparent py-1 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            onPaste={(event) => {
              const clipboard = event.clipboardData;
              if (clipboard.files.length > 0) {
                event.preventDefault();
                void handleFiles(clipboard.files);
                return;
              }
              const text = clipboard.getData("text/plain");
              if (text.length > LONG_PASTE) {
                event.preventDefault();
                addFiles([
                  {
                    id: newId(),
                    name: "Pasted text",
                    size: text.length,
                    type: "text/plain",
                    text: text.slice(0, MAX_TEXT_CHARS),
                    kind: "paste",
                  },
                ]);
              }
            }}
          />

          <div className="flex w-full items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) void handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <PlusIcon className="size-5" />
            </button>
            <button
              type="button"
              aria-pressed={thinking}
              aria-label="Extended thinking"
              onClick={() => setThinking((value) => !value)}
              className={cn(
                "grid size-8 place-items-center rounded-lg transition-colors",
                thinking
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <BrainIcon className="size-5" />
            </button>

            <div className="flex-1" />

            <span className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Assistant
              <ChevronDownIcon className="size-3.5 opacity-50" />
            </span>

            <button
              type="button"
              disabled={!canSend}
              onClick={send}
              aria-label="Send message"
              className={cn(
                "grid size-8 place-items-center rounded-xl transition-colors",
                canSend
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-primary/30 text-primary-foreground/60"
              )}
            >
              <ArrowUpIcon className="size-4" />
            </button>
          </div>
        </div>

        {dragging ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-muted/90">
            <ArchiveIcon className="mb-2 size-8 animate-bounce text-primary" />
            <p className="text-sm font-medium text-primary">Drop files to attach</p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          disabled={pending || loadingDash}
          onClick={() => void addDashboardData()}
          className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {loadingDash ? "Loading dashboard…" : "Add dashboard data"}
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Answers can be wrong. Check bookings and SEO data before acting.
      </p>
    </div>
  );
}
