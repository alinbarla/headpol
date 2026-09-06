"use client";

import { useEffect } from "react";
import { HEATMAP_PREVIEW_PARAM } from "@/lib/analytics/constants";

type ReadyMessage = {
  type: "heatmap-ready";
  documentH: number;
  viewportW: number;
  viewportH: number;
};

type ScrollMessage = {
  type: "heatmap-scroll";
  scrollY: number;
};

type InputsMessage = {
  type: "heatmap-inputs";
  values: Record<string, string>;
};

function isScrollMessage(value: unknown): value is ScrollMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return message.type === "heatmap-scroll" && typeof message.scrollY === "number";
}

function isInputsMessage(value: unknown): value is InputsMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return message.type === "heatmap-inputs" && Boolean(message.values) && typeof message.values === "object";
}

function findField(field: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  const escaped = CSS.escape(field);
  const node = document.querySelector(`[name="${escaped}"], #${escaped}`);
  if (
    node instanceof HTMLInputElement ||
    node instanceof HTMLTextAreaElement ||
    node instanceof HTMLSelectElement
  ) {
    return node;
  }
  return null;
}

function setNativeValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
) {
  if (el instanceof HTMLSelectElement) {
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  const prototype =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function applyInputs(values: Record<string, string>) {
  for (const [field, value] of Object.entries(values)) {
    const el = findField(field);
    if (!el) continue;
    if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
      el.checked = value === "true" || (value !== "" && el.value === value);
      el.dispatchEvent(new Event("change", { bubbles: true }));
      continue;
    }
    setNativeValue(el, value);
  }
}

export function ReplayBridge({ adminOrigins }: { adminOrigins: string[] }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;
    if (new URLSearchParams(window.location.search).get(HEATMAP_PREVIEW_PARAM) !== "1") {
      return;
    }

    const allowed = new Set(adminOrigins);
    const doc = document.documentElement;

    const ready: ReadyMessage = {
      type: "heatmap-ready",
      documentH: Math.max(doc.scrollHeight, doc.offsetHeight, 1),
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
    };

    for (const origin of adminOrigins) {
      window.parent.postMessage(ready, origin);
    }

    function onMessage(event: MessageEvent) {
      if (!allowed.has(event.origin)) return;
      if (isScrollMessage(event.data)) {
        window.scrollTo({ top: Math.max(0, event.data.scrollY), behavior: "auto" });
        return;
      }
      if (isInputsMessage(event.data)) {
        applyInputs(event.data.values);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [adminOrigins]);

  return null;
}
