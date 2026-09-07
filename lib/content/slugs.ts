import { LOCATION_SLUGS } from "@/lib/content/municipalities";

export const CLUSTER_SLUGS = [
  "stralkastarpolering",
  "stralkastarrenovering",
  ...LOCATION_SLUGS,
  "priser",
  "foretagskunder",
  "fore-bilder",
  "faq",
  "om-oss",
] as const;

export type ClusterSlug = (typeof CLUSTER_SLUGS)[number];

export function isClusterSlug(value: string): value is ClusterSlug {
  return (CLUSTER_SLUGS as readonly string[]).includes(value);
}
