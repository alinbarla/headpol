import { z } from "zod";
import {
  MAX_BATCH_BYTES,
  MAX_EVENTS_PER_BATCH,
  MAX_INPUT_FIELD_LENGTH,
  MAX_INPUT_VALUE_LENGTH,
} from "@/lib/analytics/constants";
import { sanitizePagePath, sanitizeReferrerPath } from "@/lib/analytics/page";
import type { HeatmapDevice, UserEvent } from "@/lib/analytics/types";

const finiteInt = z.number().finite();

const pointEvent = (type: "click" | "move") =>
  z.object({
    type: z.literal(type),
    x: finiteInt,
    y: finiteInt,
    scrollY: finiteInt,
    timestamp: finiteInt,
  });

const scrollEvent = z.object({
  type: z.literal("scroll"),
  scrollY: finiteInt,
  timestamp: finiteInt,
});

const attentionEvent = z.object({
  type: z.literal("attention"),
  x: finiteInt,
  y: finiteInt,
  scrollY: finiteInt,
  dwellMs: finiteInt.min(1).max(120_000),
  timestamp: finiteInt,
});

const inputEvent = z.object({
  type: z.literal("input"),
  field: z.string().min(1).max(MAX_INPUT_FIELD_LENGTH),
  value: z.string().max(MAX_INPUT_VALUE_LENGTH),
  timestamp: finiteInt,
});

const eventSchema = z.discriminatedUnion("type", [
  pointEvent("click"),
  pointEvent("move"),
  scrollEvent,
  attentionEvent,
  inputEvent,
]);

const envelopeSchema = z.object({
  sessionId: z.uuid(),
  visitorId: z.string().min(8).max(80),
  page: z.string(),
  referrer: z.string().max(400).optional().nullable(),
  viewportW: finiteInt.min(1).max(10000),
  viewportH: finiteInt.min(1).max(10000),
  documentH: finiteInt.min(1).max(100000),
  device: z.enum(["mobile", "tablet", "desktop"]),
  events: z.array(eventSchema).min(1).max(MAX_EVENTS_PER_BATCH),
});

export type ParsedIngest = {
  sessionId: string;
  visitorId: string;
  page: string;
  referrer: string | null;
  viewportW: number;
  viewportH: number;
  documentH: number;
  device: HeatmapDevice;
  events: UserEvent[];
};

export function parseIngestBody(raw: unknown, byteLength: number): ParsedIngest | null {
  if (byteLength > MAX_BATCH_BYTES) return null;

  const parsed = envelopeSchema.safeParse(raw);
  if (!parsed.success) return null;

  const page = sanitizePagePath(parsed.data.page);
  if (!page) return null;

  const now = Date.now();
  const events: UserEvent[] = [];

  for (const event of parsed.data.events) {
    if (event.timestamp < now - 24 * 60 * 60 * 1000 || event.timestamp > now + 60_000) {
      continue;
    }
    if (event.type === "scroll") {
      if (event.scrollY < 0 || event.scrollY > 200000) continue;
      events.push({
        type: "scroll",
        scrollY: event.scrollY,
        timestamp: event.timestamp,
      });
      continue;
    }
    if (event.type === "input") {
      if (!/^[\w.:#-]+$/.test(event.field)) continue;
      events.push({
        type: "input",
        field: event.field,
        value: event.value,
        timestamp: event.timestamp,
      });
      continue;
    }
    if (event.x < 0 || event.y < 0 || event.x > 20000 || event.y > 200000) continue;
    if (event.scrollY < 0 || event.scrollY > 200000) continue;
    if (event.type === "attention") {
      events.push({
        type: "attention",
        x: event.x,
        y: event.y,
        scrollY: event.scrollY,
        dwellMs: event.dwellMs,
        timestamp: event.timestamp,
      });
      continue;
    }
    events.push({
      type: event.type,
      x: event.x,
      y: event.y,
      scrollY: event.scrollY,
      timestamp: event.timestamp,
    });
  }

  if (events.length === 0) return null;

  return {
    sessionId: parsed.data.sessionId,
    visitorId: parsed.data.visitorId,
    page,
    referrer: sanitizeReferrerPath(parsed.data.referrer),
    viewportW: Math.round(parsed.data.viewportW),
    viewportH: Math.round(parsed.data.viewportH),
    documentH: Math.round(parsed.data.documentH),
    device: parsed.data.device,
    events,
  };
}

export async function readJsonBody(request: Request): Promise<{ value: unknown; bytes: number }> {
  const text = await request.text();
  const bytes = new TextEncoder().encode(text).length;
  if (!text) return { value: null, bytes };

  try {
    return { value: JSON.parse(text) as unknown, bytes };
  } catch {
    return { value: null, bytes };
  }
}
