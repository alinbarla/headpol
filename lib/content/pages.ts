import { HUB_PAGES } from "@/lib/content/hubs";
import { LOCATION_PAGES } from "@/lib/content/locations";
import { CLUSTER_SLUGS, isClusterSlug, type ClusterSlug } from "@/lib/content/slugs";
import type { ClusterDoc } from "@/lib/content/types";

export { CLUSTER_SLUGS, isClusterSlug, type ClusterSlug };
export type { ClusterDoc };

const PAGES: ClusterDoc[] = [...HUB_PAGES, ...LOCATION_PAGES];

const BY_SLUG = new Map(PAGES.map((page) => [page.slug, page]));

export function getClusterPage(slug: string): ClusterDoc | undefined {
  return BY_SLUG.get(slug);
}

export function allClusterPages(): ClusterDoc[] {
  return PAGES;
}
