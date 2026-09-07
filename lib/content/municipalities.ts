/**
 * Canonical service-area tree for Stockholms län local SEO.
 * Includes every municipality we serve (all except Norrtälje) plus Tumba
 * as a locality page kept alongside Botkyrka.
 */

export type MunicipalityEntry = {
  /** Display name used in chips, schema City, and UI. */
  name: string;
  /** Public URL slug under /{slug}. */
  slug: string;
  /** Geographic neighbors for internal linking (other entry names). */
  neighbors: string[];
  /** True for non-kommun localities we still keep as landing pages. */
  locality?: boolean;
};

export const MUNICIPALITIES: MunicipalityEntry[] = [
  {
    name: "Stockholm",
    slug: "stralkastarpolering-stockholm",
    neighbors: [
      "Solna",
      "Sundbyberg",
      "Nacka",
      "Lidingö",
      "Huddinge",
      "Tyresö",
    ],
  },
  {
    name: "Solna",
    slug: "stralkastarpolering-solna",
    neighbors: ["Stockholm", "Sundbyberg", "Danderyd", "Lidingö"],
  },
  {
    name: "Sundbyberg",
    slug: "stralkastarpolering-sundbyberg",
    neighbors: ["Solna", "Stockholm", "Järfälla", "Sollentuna"],
  },
  {
    name: "Nacka",
    slug: "stralkastarpolering-nacka",
    neighbors: ["Stockholm", "Tyresö", "Värmdö", "Lidingö"],
  },
  {
    name: "Täby",
    slug: "stralkastarpolering-taby",
    neighbors: ["Danderyd", "Sollentuna", "Österåker", "Vallentuna", "Stockholm"],
  },
  {
    name: "Lidingö",
    slug: "stralkastarpolering-lidingo",
    neighbors: ["Stockholm", "Nacka", "Danderyd", "Vaxholm"],
  },
  {
    name: "Huddinge",
    slug: "stralkastarpolering-huddinge",
    neighbors: ["Stockholm", "Botkyrka", "Tumba", "Haninge", "Salem"],
  },
  {
    name: "Tumba",
    slug: "stralkastarpolering-tumba",
    neighbors: ["Botkyrka", "Huddinge", "Salem", "Södertälje"],
    locality: true,
  },
  {
    name: "Botkyrka",
    slug: "stralkastarpolering-botkyrka",
    neighbors: ["Tumba", "Huddinge", "Salem", "Södertälje", "Ekerö"],
  },
  {
    name: "Södertälje",
    slug: "stralkastarpolering-sodertalje",
    neighbors: ["Botkyrka", "Tumba", "Nykvarn", "Salem", "Stockholm"],
  },
  {
    name: "Haninge",
    slug: "stralkastarpolering-haninge",
    neighbors: ["Huddinge", "Tyresö", "Nynäshamn", "Nacka", "Stockholm"],
  },
  {
    name: "Järfälla",
    slug: "stralkastarpolering-jarfalla",
    neighbors: ["Sundbyberg", "Sollentuna", "Upplands-Bro", "Stockholm"],
  },
  {
    name: "Sollentuna",
    slug: "stralkastarpolering-sollentuna",
    neighbors: ["Täby", "Järfälla", "Upplands Väsby", "Danderyd", "Stockholm"],
  },
  {
    name: "Danderyd",
    slug: "stralkastarpolering-danderyd",
    neighbors: ["Täby", "Solna", "Lidingö", "Stockholm", "Sollentuna"],
  },
  {
    name: "Ekerö",
    slug: "stralkastarpolering-ekero",
    neighbors: ["Stockholm", "Botkyrka", "Salem"],
  },
  {
    name: "Nykvarn",
    slug: "stralkastarpolering-nykvarn",
    neighbors: ["Södertälje", "Salem", "Botkyrka"],
  },
  {
    name: "Nynäshamn",
    slug: "stralkastarpolering-nynashamn",
    neighbors: ["Haninge", "Stockholm"],
  },
  {
    name: "Salem",
    slug: "stralkastarpolering-salem",
    neighbors: ["Botkyrka", "Tumba", "Huddinge", "Södertälje", "Nykvarn"],
  },
  {
    name: "Sigtuna",
    slug: "stralkastarpolering-sigtuna",
    neighbors: ["Upplands Väsby", "Vallentuna", "Upplands-Bro", "Stockholm"],
  },
  {
    name: "Tyresö",
    slug: "stralkastarpolering-tyreso",
    neighbors: ["Nacka", "Haninge", "Stockholm"],
  },
  {
    name: "Upplands Väsby",
    slug: "stralkastarpolering-upplands-vasby",
    neighbors: ["Sollentuna", "Sigtuna", "Täby", "Stockholm"],
  },
  {
    name: "Upplands-Bro",
    slug: "stralkastarpolering-upplands-bro",
    neighbors: ["Järfälla", "Sigtuna", "Stockholm"],
  },
  {
    name: "Vallentuna",
    slug: "stralkastarpolering-vallentuna",
    neighbors: ["Täby", "Österåker", "Sigtuna", "Stockholm"],
  },
  {
    name: "Vaxholm",
    slug: "stralkastarpolering-vaxholm",
    neighbors: ["Österåker", "Värmdö", "Lidingö", "Stockholm"],
  },
  {
    name: "Värmdö",
    slug: "stralkastarpolering-varmdo",
    neighbors: ["Nacka", "Vaxholm", "Stockholm"],
  },
  {
    name: "Österåker",
    slug: "stralkastarpolering-osteraker",
    neighbors: ["Täby", "Vaxholm", "Vallentuna", "Stockholm"],
  },
];

export const MUNICIPALITY_BY_NAME = Object.fromEntries(
  MUNICIPALITIES.map((entry) => [entry.name, entry])
) as Record<string, MunicipalityEntry>;

export const MUNICIPALITY_BY_SLUG = Object.fromEntries(
  MUNICIPALITIES.map((entry) => [entry.slug, entry])
) as Record<string, MunicipalityEntry>;

/** Display names for chips + schema areaServed. */
export const MUNICIPALITY_NAMES = MUNICIPALITIES.map((entry) => entry.name);

/** name → cluster slug for homepage / footer links. */
export const MUNICIPALITY_PAGE_SLUGS: Record<string, string> =
  Object.fromEntries(MUNICIPALITIES.map((entry) => [entry.name, entry.slug]));

/** All location cluster slugs in stable registry order. */
export const LOCATION_SLUGS = MUNICIPALITIES.map((entry) => entry.slug);

export function relatedForMunicipality(
  name: string,
  extras: Array<{ slug: string; label: string }> = [
    { slug: "stralkastarpolering", label: "Polera strålkastare" },
    { slug: "priser", label: "Priser" },
  ]
): Array<{ slug: string; label: string }> {
  const entry = MUNICIPALITY_BY_NAME[name];
  const neighborLinks = (entry?.neighbors ?? [])
    .map((neighbor) => MUNICIPALITY_BY_NAME[neighbor])
    .filter(Boolean)
    .map((neighbor) => ({ slug: neighbor.slug, label: neighbor.name }));

  const seen = new Set<string>();
  const links: Array<{ slug: string; label: string }> = [];
  for (const link of [...neighborLinks, ...extras]) {
    if (seen.has(link.slug) || link.slug === entry?.slug) continue;
    seen.add(link.slug);
    links.push(link);
  }
  return links;
}
