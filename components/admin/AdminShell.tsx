"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  FlameIcon,
  HomeIcon,
  ListIcon,
  LogOutIcon,
  MailIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Today", icon: HomeIcon, exact: true },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDaysIcon },
  { href: "/admin/bookings", label: "Bookings", icon: ListIcon },
  { href: "/admin/payments", label: "Payments", icon: CreditCardIcon },
  { href: "/admin/seo", label: "SEO", icon: SearchIcon },
  { href: "/admin/heatmap", label: "Heatmap", icon: FlameIcon },
  { href: "/admin/visitors", label: "Visitors", icon: UsersIcon },
  { href: "/admin/mail-list", label: "Mail list", icon: MailIcon },
  { href: "/admin/assistant", label: "Assistant", icon: MessageSquareIcon },
  {
    href: "/admin/availability",
    label: "Availability",
    icon: SlidersHorizontalIcon,
  },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const DOCK = [
  NAV[0],
  NAV[2],
  NAV[5],
  NAV[6],
] as const;

const MORE = NAV.filter(
  (item) => !DOCK.some((dock) => dock.href === item.href)
);

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const moreActive = MORE.some((item) => isActive(item.href, item.exact));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="shrink-0">
            <span className="text-sm font-bold uppercase tracking-[0.15em] text-primary">
              Strålkastarpolering
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <NotificationBell />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOutIcon className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 md:pb-10">
        {children}
      </main>

      <nav
        className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden"
        aria-label="Admin"
      >
        <div className="pointer-events-auto flex w-[min(100%-1.5rem,26rem)] items-center justify-around rounded-full border border-white/10 bg-zinc-950/80 px-2 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {DOCK.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-12 flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] transition-transform",
                  active
                    ? "scale-105 bg-primary/15 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex min-w-12 flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px]",
                  moreActive
                    ? "scale-105 bg-primary/15 text-primary"
                    : "text-muted-foreground"
                )}
                aria-label="More admin pages"
              >
                <MoreHorizontalIcon className="size-5" />
                More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="mb-2 w-48">
              {MORE.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}
