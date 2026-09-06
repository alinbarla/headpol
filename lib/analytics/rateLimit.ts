import {
  INGEST_RATE_LIMIT,
  INGEST_RATE_WINDOW_MS,
} from "@/lib/analytics/constants";

type Bucket = {
  timestamps: number[];
};

const hits = new Map<string, Bucket>();

function prune(bucket: Bucket, now: number): void {
  bucket.timestamps = bucket.timestamps.filter(
    (stamp) => now - stamp < INGEST_RATE_WINDOW_MS
  );
}

export function ingestAllowed(ip: string | null): boolean {
  const key = ip?.trim() || "unknown";
  const now = Date.now();
  const bucket = hits.get(key) ?? { timestamps: [] };
  prune(bucket, now);

  if (bucket.timestamps.length >= INGEST_RATE_LIMIT) {
    hits.set(key, bucket);
    return false;
  }

  bucket.timestamps.push(now);
  hits.set(key, bucket);

  if (hits.size > 5_000) {
    for (const [entryKey, entry] of hits) {
      prune(entry, now);
      if (entry.timestamps.length === 0) hits.delete(entryKey);
    }
  }

  return true;
}

export function clientIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}
