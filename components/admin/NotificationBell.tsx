"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { BellIcon } from "lucide-react";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/admin/actions";
import type { AdminNotification } from "@/lib/admin/notifications";
import { formatTimestamp } from "@/lib/time";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const next = await listNotificationsAction();
      setItems(next);
    });
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const unread = items.filter((item) => !item.read_at).length;

  async function onOpen() {
    setOpen((value) => !value);
    if (!open) refresh();
  }

  async function onMarkAll() {
    await markAllNotificationsReadAction();
    refresh();
  }

  async function onOpenItem(item: AdminNotification) {
    if (!item.read_at) {
      await markNotificationReadAction(item.id);
      setItems((current) =>
        current.map((row) =>
          row.id === item.id
            ? { ...row, read_at: new Date().toISOString() }
            : row
        )
      );
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="relative"
        aria-label={
          unread > 0 ? `${unread} unread notifications` : "Notifications"
        }
        onClick={onOpen}
      >
        <BellIcon className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-lg border border-border bg-background shadow-lg">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
              <p className="text-sm font-medium">Notifications</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={unread === 0 || pending}
                onClick={onMarkAll}
              >
                Mark all read
              </Button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No Stripe alerts yet.
                </li>
              ) : (
                items.map((item) => {
                  const href = item.booking_id
                    ? `/admin/bookings/${item.booking_id}`
                    : null;
                  const content = (
                    <>
                      <p
                        className={cn(
                          "text-sm",
                          item.read_at
                            ? "text-muted-foreground"
                            : "font-medium text-foreground"
                        )}
                      >
                        {item.title}
                      </p>
                      {item.body && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.body}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatTimestamp(item.created_at)}
                      </p>
                    </>
                  );

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "border-b border-border last:border-0",
                        !item.read_at && "bg-secondary/40"
                      )}
                    >
                      {href ? (
                        <Link
                          href={href}
                          className="block px-3 py-2.5 transition-colors hover:bg-secondary/60"
                          onClick={() => onOpenItem(item)}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="block w-full px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
                          onClick={() => onOpenItem(item)}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
