"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PaperclipIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { askAssistantAction } from "@/app/admin/assistant/actions";
import { FilePreviewCard } from "@/components/admin/assistant/FilePreviewCard";
import { Button } from "@/components/shadcn/button";
import { Textarea } from "@/components/shadcn/textarea";
import type { AssistantAttachment } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";

const LONG_PASTE = 400;
const MAX_ATTACHMENTS = 8;
const MAX_TEXT_CHARS = 20_000;

async function fileToAttachment(file: File): Promise<AssistantAttachment> {
  const isText =
    file.type.startsWith("text/") ||
    /\.(txt|md|csv|json|xml|log|html|css|js|ts)$/i.test(file.name);

  let text: string | undefined;
  if (isText) {
    const raw = await file.text();
    text = raw.slice(0, MAX_TEXT_CHARS);
  }

  return {
    name: file.name || "Untitled",
    size: file.size,
    type: file.type || "application/octet-stream",
    text,
  };
}

export function AssistantChatInput({ threadId }: { threadId: string }) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<AssistantAttachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const canSend = !pending && (message.trim().length > 0 || attachments.length > 0);

  function addAttachments(next: AssistantAttachment[]) {
    setAttachments((current) => {
      const merged = [...current, ...next];
      if (merged.length > MAX_ATTACHMENTS) {
        toast.error(`At most ${MAX_ATTACHMENTS} attachments.`);
        return merged.slice(0, MAX_ATTACHMENTS);
      }
      return merged;
    });
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    const rows = await Promise.all(list.map(fileToAttachment));
    addAttachments(rows);
  }

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }

  function send() {
    if (!canSend) return;
    const payload = {
      threadId,
      message: message.trim(),
      attachments,
    };
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    startTransition(async () => {
      const result = await askAssistantAction(payload);
      router.refresh();
      if (result.message) {
        if (result.ok) toast.success(result.message);
        else toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-2">
      {attachments.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {attachments.map((file, index) => (
            <FilePreviewCard
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() =>
                setAttachments((current) => current.filter((_, i) => i !== index))
              }
            />
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "relative rounded-2xl border border-border bg-card p-2 shadow-sm",
          dragging && "border-primary bg-muted"
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
      >
        {dragging ? (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-2xl border border-dashed border-primary bg-muted/80 text-sm text-muted-foreground">
            Drop files here
          </div>
        ) : null}

        <Textarea
          ref={textareaRef}
          rows={1}
          value={message}
          disabled={pending}
          placeholder="Ask about bookings or SEO…"
          className="min-h-12 resize-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
          onChange={(event) => {
            setMessage(event.target.value);
            resize();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          onPaste={(event) => {
            const clipboard = event.clipboardData;
            const files = clipboard.files;
            if (files.length > 0) {
              event.preventDefault();
              void handleFiles(files);
              return;
            }
            const text = clipboard.getData("text/plain");
            if (text.length > LONG_PASTE) {
              event.preventDefault();
              addAttachments([
                {
                  name: "Pasted text",
                  size: text.length,
                  type: "text/plain",
                  text: text.slice(0, MAX_TEXT_CHARS),
                },
              ]);
            }
          }}
        />

        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <div>
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
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file"
            >
              <PaperclipIcon className="size-4" />
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!canSend}
            onClick={send}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            <SendIcon className="size-4" />
            {pending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Answers can be wrong. Check bookings and SEO data before acting.
      </p>
    </div>
  );
}
