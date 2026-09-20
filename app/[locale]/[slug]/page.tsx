import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ClusterPage } from "@/components/content/ClusterPage";
import { CLUSTER_SLUGS, getClusterPage } from "@/lib/content/pages";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { buildClusterStructuredData } from "@/lib/structuredData";
import { PPF_YOUTUBE } from "@/lib/youtube";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return CLUSTER_SLUGS.map((slug) => ({ locale: "sv", slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getClusterPage(slug);
  if (locale !== "sv" || !page) {
    return { robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    locale: "sv",
    path: page.slug,
    title: page.title,
    description: page.description,
    absoluteTitle: true,
    video:
      page.kind === "service-ppf"
        ? {
            embedUrl: PPF_YOUTUBE.embedUrl,
            thumbnailUrl: `${SITE_URL.replace(/\/$/, "")}${PPF_YOUTUBE.posterSrc}`,
            width: PPF_YOUTUBE.width,
            height: PPF_YOUTUBE.height,
          }
        : undefined,
  });
}

export default async function ClusterSlugPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (locale !== "sv") notFound();

  const page = getClusterPage(slug);
  if (!page) notFound();

  setRequestLocale("sv");

  return (
    <ClusterPage page={page} jsonLd={buildClusterStructuredData(page)} />
  );
}
