"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";

const sections = [
  { id: "hero", key: "brand" as const },
  { id: "benefits", key: "benefits" as const },
  { id: "process", key: "process" as const },
  { id: "services", key: "services" as const },
  { id: "faq", key: "faq" as const },
  { id: "booking", key: "booking" as const },
  { id: "contact", key: "contact" as const },
];

export function SectionNav() {
  const t = useTranslations("nav");
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -45% 0px", threshold: 0.1 }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-void/70 backdrop-blur-xl">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-beam focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-void"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <a
          href="#hero"
          className="headline-display text-xl font-bold tracking-tight text-beam"
        >
          {t("brand")}
        </a>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
          {sections.slice(1).map(({ id, key }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "true" : undefined}
              className={`font-display text-sm font-semibold transition-colors ${
                active === id
                  ? "text-beam"
                  : "text-text-secondary hover:text-beam"
              }`}
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <LocaleSwitcher />
      </div>
    </header>
  );
}
