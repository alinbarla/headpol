import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";

export function NewChatButton({ className }: { className?: string }) {
  return (
    <Button asChild size="sm" className={className}>
      <Link href="/admin/assistant">
        <PlusIcon className="size-4" />
        New chat
      </Link>
    </Button>
  );
}
