export type HeatmapEventType = "click" | "move" | "scroll" | "attention" | "input";

export type HeatmapDevice = "mobile" | "tablet" | "desktop";

export type HeatmapMode = Exclude<HeatmapEventType, "input">;

export type HeatmapRange = "24h" | "7d" | "30d";

export type UserEvent =
  | {
      type: "click";
      x: number;
      y: number;
      scrollY: number;
      timestamp: number;
    }
  | {
      type: "move";
      x: number;
      y: number;
      scrollY: number;
      timestamp: number;
    }
  | {
      type: "scroll";
      scrollY: number;
      timestamp: number;
    }
  | {
      type: "attention";
      x: number;
      y: number;
      scrollY: number;
      dwellMs: number;
      timestamp: number;
    }
  | {
      type: "input";
      field: string;
      value: string;
      timestamp: number;
    };

export type AnalyticsSettings = {
  enabled: boolean;
  sampleRate: number;
  retentionDays: number;
};

export type AnalyticsConfig = {
  enabled: boolean;
  sampleRate: number;
};

export type AnalyticsSession = {
  id: string;
  visitor_id: string;
  page: string;
  referrer: string | null;
  viewport_w: number;
  viewport_h: number;
  document_h: number;
  device: HeatmapDevice;
  ip: string | null;
  started_at: string;
  ended_at: string;
  event_count: number;
  max_scroll_pct: number;
};

export type AnalyticsEventRow = {
  id: number;
  session_id: string;
  type: HeatmapEventType;
  x: number | null;
  y: number | null;
  scroll_y: number;
  viewport_w: number;
  viewport_h: number;
  document_h: number;
  page: string;
  ts: string;
  dwell_ms: number | null;
  field: string | null;
  value: string | null;
};

export type GridCell = {
  gx: number;
  gy: number;
  count: number;
};

export type HeatmapGrid = {
  cells: GridCell[];
  maxCount: number;
  documentH: number;
  viewportW: number;
  eventCount: number;
};

export type ScrollDepthBin = {
  depth: 25 | 50 | 75 | 100;
  reachedPct: number;
};

export type DroppedVisitor = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  session_id: string | null;
  visitor_id: string | null;
  page: string | null;
  last_seen_at: string;
  created_at: string;
  dismissed_at: string | null;
};

export type HeatmapFilters = {
  page: string;
  range: HeatmapRange;
  device: HeatmapDevice | "all";
  mode: HeatmapMode;
};
