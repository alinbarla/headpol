/**
 * Public bookable SKUs. Homepage, /priser, JSON-LD Offers, Stripe amounts
 * and the booking picker all read this catalog. Never trust a client price.
 */

export const PRODUCT_IDS = ["polering", "ppf", "polering-ppf"] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

export type CatalogProduct = {
  id: ProductId;
  slug: string;
  priceOre: number;
  listPriceOre: number;
  /** Compact UI label, e.g. "899kr". */
  priceLabel: string;
  listPriceLabel: string;
  unit: "par";
  nameSv: string;
  nameEn: string;
  shortSv: string;
  shortEn: string;
  schemaFragment: string;
};

function kr(ore: number): string {
  return `${Math.round(ore / 100)}kr`;
}

export const PRODUCTS: Record<ProductId, CatalogProduct> = {
  polering: {
    id: "polering",
    slug: "stralkastarpolering",
    priceOre: 89900,
    listPriceOre: 149900,
    priceLabel: kr(89900),
    listPriceLabel: kr(149900),
    unit: "par",
    nameSv: "Polering",
    nameEn: "Polishing",
    shortSv: "Slipning, polering och UV-keramiskt skydd",
    shortEn: "Sanding, polishing and UV ceramic protection",
    schemaFragment: "service-polering",
  },
  ppf: {
    id: "ppf",
    slug: "ppf",
    priceOre: 189900,
    listPriceOre: 249900,
    priceLabel: kr(189900),
    listPriceLabel: kr(249900),
    unit: "par",
    nameSv: "PPF-folie",
    nameEn: "PPF film",
    shortSv: "Skyddsfolie på båda strålkastarna",
    shortEn: "Protection film on both headlights",
    schemaFragment: "service-ppf",
  },
  "polering-ppf": {
    id: "polering-ppf",
    slug: "polering-ppf",
    priceOre: 259900,
    listPriceOre: 349900,
    priceLabel: kr(259900),
    listPriceLabel: kr(349900),
    unit: "par",
    nameSv: "Polering + PPF",
    nameEn: "Polishing + PPF",
    shortSv: "Polering och PPF-folie samma besök",
    shortEn: "Polishing and PPF film in the same visit",
    schemaFragment: "service-combo",
  },
};

export const PRODUCT_LIST: CatalogProduct[] = PRODUCT_IDS.map(
  (id) => PRODUCTS[id]
);

export const DEFAULT_PRODUCT_ID: ProductId = "polering";

export function isProductId(value: unknown): value is ProductId {
  return (
    typeof value === "string" &&
    (PRODUCT_IDS as readonly string[]).includes(value)
  );
}

export function getProduct(id: string | null | undefined): CatalogProduct {
  return isProductId(id) ? PRODUCTS[id] : PRODUCTS[DEFAULT_PRODUCT_ID];
}

export function productName(
  id: string | null | undefined,
  locale: string
): string {
  const product = getProduct(id);
  return locale === "en" ? product.nameEn : product.nameSv;
}

export function bookingUrl(id: ProductId = DEFAULT_PRODUCT_ID): string {
  return `/?service=${id}#booking`;
}

export function productPagePath(id: ProductId): string {
  return `/${PRODUCTS[id].slug}`;
}

/** Combo vs buying polering and PPF separately (öre). */
export const COMBO_SAVINGS_ORE =
  PRODUCTS.polering.priceOre + PRODUCTS.ppf.priceOre - PRODUCTS["polering-ppf"].priceOre;
