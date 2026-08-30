"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  HomeIcon,
  ListIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Today", icon: HomeIcon, exact: true },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDaysIcon },
  { href: "/admin/bookings", label: "Bookings", icon: ListIcon },
  { href: "/admin/payments", label: "Payments", icon: CreditCardIcon },
  { href: "/admin/seo", label: "SEO", icon: SearchIcon },
  {
    href: "/admin/availability",
    label: "Availability",
    icon: SlidersHorizontalIcon,
  },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

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

          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOutIcon className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </form>
        </div>
      </header>

      {/* Padding-bottom clears the mobile tab bar. */}
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-7 border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
