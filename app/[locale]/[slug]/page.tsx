import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ClusterPage } from "@/components/content/ClusterPage";
import { CLUSTER_SLUGS, getClusterPage } from "@/lib/content/pages";
import { buildPageMetadata } from "@/lib/seo";
import { buildClusterStructuredData } from "@/lib/structuredData";

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
