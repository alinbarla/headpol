export type ClusterFaq = {
  question: string;
  answer: string;
};

export type ClusterSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ClusterImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ClusterRelated = {
  slug: string;
  label: string;
};

export type ClusterKind =
  | "service-polering"
  | "service-renovering"
  | "location"
  | "faq"
  | "other";

export type ClusterDoc = {
  slug: string;
  kind: ClusterKind;
  title: string;
  description: string;
  h1: string;
  lead: string;
  locationName?: string;
  sections: ClusterSection[];
  faqs?: ClusterFaq[];
  images?: ClusterImage[];
  related: ClusterRelated[];
};
