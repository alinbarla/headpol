export const CLUSTER_SLUGS = [
  "stralkastarpolering",
  "stralkastarrenovering",
  "stralkastarpolering-stockholm",
  "stralkastarpolering-huddinge",
  "stralkastarpolering-tumba",
  "stralkastarpolering-sodertalje",
  "stralkastarpolering-haninge",
  "stralkastarpolering-nacka",
  "stralkastarpolering-solna",
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
