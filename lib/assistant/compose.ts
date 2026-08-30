export function composeUserContent(
  message: string,
  attachments: Array<{ name: string; type: string; text?: string }>
): string {
  const parts = [message.trim()];
  for (const file of attachments) {
    if (file.text?.trim()) {
      parts.push(`\n[Attached ${file.name}]\n${file.text.trim()}`);
    } else {
      parts.push(
        `\n[Attached ${file.name} (${file.type || "file"}) — binary not sent]`
      );
    }
  }
  return parts.join("\n").trim();
}
