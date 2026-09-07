import type { AnalyticsSettings, HeatmapRange } from "@/lib/analytics/types";

export const ANALYTICS_SETTINGS_KEY = "analytics_settings";

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  enabled: false,
  sampleRate: 1,
  retentionDays: 30,
};

export const GRID_SIZE_PX = 50;
export const BATCH_SIZE = 40;
export const FLUSH_INTERVAL_MS = 2000;
export const MOVE_SAMPLE_MS = 100;
export const INPUT_SAMPLE_MS = 80;
export const ATTENTION_MIN_DWELL_MS = 300;
export const MAX_EVENTS_PER_BATCH = 50;
export const MAX_BATCH_BYTES = 32_000;
export const MAX_INPUT_VALUE_LENGTH = 500;
export const MAX_INPUT_FIELD_LENGTH = 80;
export const MAX_IP_LENGTH = 45;
export const MAX_EVENTS_PER_SESSION = 2_000;
export const MAX_PAGE_LENGTH = 200;
export const INGEST_RATE_LIMIT = 60;
export const INGEST_RATE_WINDOW_MS = 5 * 60 * 1000;
export const CONFIG_CACHE_MS = 30_000;

export const HEATMAP_PREVIEW_PARAM = "heatmapPreview";

/** Canonical replay frame sizes so CSS breakpoints match the recorded device class. */
export const REPLAY_FRAME = {
  mobile: { w: 390, h: 844 },
  tablet: { w: 820, h: 1180 },
  desktop: { w: 1280, h: 800 },
} as const;

export const RANGE_MS: Record<HeatmapRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export const VISITOR_STORAGE_KEY = "hp_vid";
export const SESSION_STORAGE_KEY = "hp_sid";
export const SAMPLE_STORAGE_KEY = "hp_sample";
