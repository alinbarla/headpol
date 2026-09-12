"use client";

import { useEffect, useRef, useState } from "react";
import { Cookie, Shield, Info, X, ChevronDown, ChevronUp, Check } from "lucide-react";
import {
  ALL_PREFS,
  CONSENT_KEY,
  DENIED_PREFS,
  persistPrefs,
  readStoredPrefs,
  type CookiePrefs,
} from "@/lib/analytics/consent";
import { cn } from "@/lib/utils";

interface CookiePanelProps {
  title?: string;
  message?: string;
  acceptText?: string;
  rejectText?: string;
  customizeText?: string;
  icon?: "cookie" | "shield" | "info";
  className?: string;
  privacyHref?: string;
  termsHref?: string;
}

function PrefRow({
  title,
  desc,
  field,
  locked,
  prefs,
  setPrefs,
}: {
  title: string;
  desc: string;
  field: keyof CookiePrefs;
  locked?: boolean;
  prefs: CookiePrefs;
  setPrefs: React.Dispatch<React.SetStateAction<CookiePrefs>>;
}) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg border border-border">
      <button
        type="button"
        disabled={locked}
        onClick={() => !locked && setPrefs((p) => ({ ...p, [field]: !p[field] }))}
        className={cn(
          "mt-0.5 inline-flex size-5 items-center justify-center rounded border",
          locked
            ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
            : "bg-background border-border hover:bg-accent cursor-pointer"
        )}
        aria-pressed={prefs[field]}
        aria-label={`${title} cookie preference`}
      >
        {prefs[field] && <Check className="size-4" />}
      </button>

      <div className="flex-1">
        <div className="text-xs font-medium">
          {title}{" "}
          {locked && (
            <span className="text-[10px] text-muted-foreground">(krävs)</span>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

const CookiePanel = (props: CookiePanelProps) => {
  const {
    title = "Denna webbplats använder cookies",
    message = "Vi använder cookies för att förbättra din upplevelse.",
    acceptText = "Acceptera alla",
    rejectText = "Neka alla",
    customizeText = "Anpassa",
    icon = "cookie",
    className,
    privacyHref = "/integritetspolicy",
    termsHref = "/villkor",
  } = props;

  const [visible, setVisible] = useState(false);
  const [render, setRender] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(DENIED_PREFS);

  const prefsRef = useRef<HTMLDivElement | null>(null);
  const [prefsHeight, setPrefsHeight] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    const storedPrefs = readStoredPrefs();

    const frame = requestAnimationFrame(() => {
      if (storedPrefs) setPrefs(storedPrefs);
      if (!stored) {
        setRender(true);
        requestAnimationFrame(() => setVisible(true));
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (showPrefs && prefsRef.current) {
      setPrefsHeight(prefsRef.current.scrollHeight);
    } else {
      setPrefsHeight(0);
    }
  }, [showPrefs, prefs]);

  const closeBanner = () => {
    setVisible(false);
    setTimeout(() => setRender(false), 300);
  };

  const acceptAll = () => {
    setPrefs(ALL_PREFS);
    persistPrefs(ALL_PREFS);
    setShowPrefs(false);
    closeBanner();
  };

  const rejectAll = () => {
    setPrefs(DENIED_PREFS);
    persistPrefs(DENIED_PREFS);
    setShowPrefs(false);
    closeBanner();
  };

  const savePreferences = () => {
    const next = { ...prefs, necessary: true as const };
    setPrefs(next);
    persistPrefs(next);
    setShowPrefs(false);
    closeBanner();
  };

  if (!render) return null;

  const IconEl =
    icon === "shield" ? Shield : icon === "info" ? Info : Cookie;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className={cn(
        "fixed right-4 bottom-4 md:right-6 md:bottom-6",
        "z-50 w-[360px] max-w-[90vw]"
      )}
    >
      <div
        className={cn(
          "relative border border-border/70 rounded-xl bg-card/95 text-card-foreground shadow-xl backdrop-blur",
          "p-4 flex flex-col gap-3",
          visible
            ? cn("animate-in", "fade-in", "slide-in-from-bottom-8")
            : cn("animate-out", "fade-out", "slide-out-to-bottom-8"),
          "duration-300 ease-out",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <IconEl className="size-5" aria-hidden="true" />
          </span>

          <h2 className="text-sm font-semibold leading-5">{title}</h2>

          <button
            type="button"
            onClick={rejectAll}
            className="ml-auto inline-flex size-8 items-center justify-center rounded-md hover:bg-foreground/5 cursor-pointer"
            aria-label="Neka alla cookies"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          {message} Läs vår{" "}
          <a
            href={privacyHref}
            className="underline underline-offset-4 hover:text-foreground cursor-pointer"
          >
            integritetspolicy
          </a>{" "}
          och våra{" "}
          <a
            href={termsHref}
            className="underline underline-offset-4 hover:text-foreground cursor-pointer"
          >
            villkor
          </a>
          .
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPrefs((p) => !p)}
            className={cn(
              "px-3 py-1.5 rounded-md border border-border/70 cursor-pointer",
              "bg-muted text-muted-foreground text-xs",
              "hover:bg-muted/80 transition-colors flex items-center gap-1"
            )}
            aria-expanded={showPrefs}
            aria-controls="cookie-preferences-inline"
          >
            {customizeText}
            {showPrefs ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </button>

          <button
            type="button"
            onClick={rejectAll}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs cursor-pointer",
              "bg-foreground text-background",
              "hover:bg-foreground/90 transition-colors"
            )}
          >
            {rejectText}
          </button>

          <button
            type="button"
            onClick={acceptAll}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs cursor-pointer",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors"
            )}
          >
            {acceptText}
          </button>
        </div>

        <div
          id="cookie-preferences-inline"
          ref={prefsRef}
          style={{ height: prefsHeight ? `${prefsHeight}px` : 0 }}
          className={cn(
            "overflow-hidden transition-[height] duration-300 ease-out will-change-[height]"
          )}
        >
          {showPrefs && (
            <div className="mt-2 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <PrefRow
                title="Nödvändiga"
                desc="Krävs för att webbplatsen ska fungera."
                field="necessary"
                locked
                prefs={prefs}
                setPrefs={setPrefs}
              />

              <PrefRow
                title="Funktionella"
                desc="Sparar dina preferenser."
                field="functional"
                prefs={prefs}
                setPrefs={setPrefs}
              />

              <PrefRow
                title="Analys"
                desc="Hjälper oss förbättra webbplatsen."
                field="analytics"
                prefs={prefs}
                setPrefs={setPrefs}
              />

              <PrefRow
                title="Marknadsföring"
                desc="Personligt anpassade annonser."
                field="marketing"
                prefs={prefs}
                setPrefs={setPrefs}
              />

              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowPrefs(false)}
                  className="px-2.5 py-1 rounded-md border border-border bg-muted text-muted-foreground text-xs hover:bg-muted/80 cursor-pointer"
                >
                  Avbryt
                </button>

                <button
                  type="button"
                  onClick={savePreferences}
                  className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 cursor-pointer"
                >
                  Spara val
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { CookiePanel };
