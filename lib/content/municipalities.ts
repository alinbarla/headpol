/**
 * Canonical service-area tree for Stockholms län local SEO.
 * Includes every municipality we serve (all except Norrtälje and Sigtuna) plus
 * high-search localities kept alongside their parent kommun (Tumba pattern).
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
      "Arenastaden",
      "Sundbyberg",
      "Nacka",
      "Sickla",
      "Lidingö",
      "Huddinge",
      "Tyresö",
    ],
  },
  {
    name: "Solna",
    slug: "stralkastarpolering-solna",
    neighbors: ["Arenastaden", "Stockholm", "Sundbyberg", "Danderyd", "Lidingö"],
  },
  {
    name: "Arenastaden",
    slug: "stralkastarpolering-arenastaden",
    neighbors: ["Solna", "Sundbyberg", "Stockholm"],
    locality: true,
  },
  {
    name: "Sundbyberg",
    slug: "stralkastarpolering-sundbyberg",
    neighbors: ["Solna", "Arenastaden", "Stockholm", "Järfälla", "Sollentuna"],
  },
  {
    name: "Nacka",
    slug: "stralkastarpolering-nacka",
    neighbors: [
      "Sickla",
      "Älta",
      "Saltsjöbaden",
      "Stockholm",
      "Tyresö",
      "Värmdö",
      "Lidingö",
    ],
  },
  {
    name: "Sickla",
    slug: "stralkastarpolering-sickla",
    neighbors: ["Nacka", "Älta", "Stockholm", "Saltsjöbaden"],
    locality: true,
  },
  {
    name: "Älta",
    slug: "stralkastarpolering-alta",
    neighbors: ["Nacka", "Sickla", "Tyresö", "Saltsjöbaden"],
    locality: true,
  },
  {
    name: "Saltsjöbaden",
    slug: "stralkastarpolering-saltsjobaden",
    neighbors: ["Nacka", "Sickla", "Älta", "Värmdö"],
    locality: true,
  },
  {
    name: "Täby",
    slug: "stralkastarpolering-taby",
    neighbors: [
      "Danderyd",
      "Djursholm",
      "Sollentuna",
      "Tureberg",
      "Österåker",
      "Åkersberga",
      "Vallentuna",
      "Stockholm",
    ],
  },
  {
    name: "Lidingö",
    slug: "stralkastarpolering-lidingo",
    neighbors: ["Stockholm", "Nacka", "Danderyd", "Vaxholm"],
  },
  {
    name: "Huddinge",
    slug: "stralkastarpolering-huddinge",
    neighbors: [
      "Flemingsberg",
      "Stockholm",
      "Botkyrka",
      "Tumba",
      "Tullinge",
      "Haninge",
      "Salem",
    ],
  },
  {
    name: "Flemingsberg",
    slug: "stralkastarpolering-flemingsberg",
    neighbors: ["Huddinge", "Tumba", "Tullinge", "Botkyrka", "Stockholm"],
    locality: true,
  },
  {
    name: "Tumba",
    slug: "stralkastarpolering-tumba",
    neighbors: ["Botkyrka", "Tullinge", "Huddinge", "Flemingsberg", "Salem", "Södertälje"],
    locality: true,
  },
  {
    name: "Tullinge",
    slug: "stralkastarpolering-tullinge",
    neighbors: ["Botkyrka", "Tumba", "Huddinge", "Flemingsberg", "Salem"],
    locality: true,
  },
  {
    name: "Botkyrka",
    slug: "stralkastarpolering-botkyrka",
    neighbors: ["Tumba", "Tullinge", "Huddinge", "Flemingsberg", "Salem", "Södertälje", "Ekerö"],
  },
  {
    name: "Södertälje",
    slug: "stralkastarpolering-sodertalje",
    neighbors: ["Botkyrka", "Tumba", "Nykvarn", "Salem", "Stockholm"],
  },
  {
    name: "Haninge",
    slug: "stralkastarpolering-haninge",
    neighbors: ["Handen", "Huddinge", "Tyresö", "Nynäshamn", "Nacka", "Stockholm"],
  },
  {
    name: "Handen",
    slug: "stralkastarpolering-handen",
    neighbors: ["Haninge", "Tyresö", "Nynäshamn", "Stockholm"],
    locality: true,
  },
  {
    name: "Järfälla",
    slug: "stralkastarpolering-jarfalla",
    neighbors: ["Barkarby", "Sundbyberg", "Sollentuna", "Tureberg", "Upplands-Bro", "Stockholm"],
  },
  {
    name: "Barkarby",
    slug: "stralkastarpolering-barkarby",
    neighbors: ["Järfälla", "Sollentuna", "Tureberg", "Sundbyberg", "Stockholm"],
    locality: true,
  },
  {
    name: "Sollentuna",
    slug: "stralkastarpolering-sollentuna",
    neighbors: [
      "Tureberg",
      "Täby",
      "Järfälla",
      "Barkarby",
      "Upplands Väsby",
      "Danderyd",
      "Stockholm",
    ],
  },
  {
    name: "Tureberg",
    slug: "stralkastarpolering-tureberg",
    neighbors: ["Sollentuna", "Täby", "Järfälla", "Barkarby", "Upplands Väsby", "Stockholm"],
    locality: true,
  },
  {
    name: "Danderyd",
    slug: "stralkastarpolering-danderyd",
    neighbors: ["Djursholm", "Täby", "Solna", "Lidingö", "Stockholm", "Sollentuna"],
  },
  {
    name: "Djursholm",
    slug: "stralkastarpolering-djursholm",
    neighbors: ["Danderyd", "Täby", "Solna", "Stockholm", "Lidingö"],
    locality: true,
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
    neighbors: ["Haninge", "Handen", "Stockholm"],
  },
  {
    name: "Salem",
    slug: "stralkastarpolering-salem",
    neighbors: ["Botkyrka", "Tumba", "Tullinge", "Huddinge", "Södertälje", "Nykvarn"],
  },
  {
    name: "Tyresö",
    slug: "stralkastarpolering-tyreso",
    neighbors: ["Nacka", "Älta", "Haninge", "Handen", "Stockholm"],
  },
  {
    name: "Upplands Väsby",
    slug: "stralkastarpolering-upplands-vasby",
    neighbors: ["Sollentuna", "Tureberg", "Täby", "Stockholm"],
  },
  {
    name: "Upplands-Bro",
    slug: "stralkastarpolering-upplands-bro",
    neighbors: ["Järfälla", "Barkarby", "Stockholm"],
  },
  {
    name: "Vallentuna",
    slug: "stralkastarpolering-vallentuna",
    neighbors: ["Täby", "Österåker", "Åkersberga", "Stockholm"],
  },
  {
    name: "Vaxholm",
    slug: "stralkastarpolering-vaxholm",
    neighbors: ["Österåker", "Åkersberga", "Värmdö", "Gustavsberg", "Lidingö", "Stockholm"],
  },
  {
    name: "Värmdö",
    slug: "stralkastarpolering-varmdo",
    neighbors: ["Gustavsberg", "Nacka", "Saltsjöbaden", "Vaxholm", "Stockholm"],
  },
  {
    name: "Gustavsberg",
    slug: "stralkastarpolering-gustavsberg",
    neighbors: ["Värmdö", "Nacka", "Saltsjöbaden", "Vaxholm", "Stockholm"],
    locality: true,
  },
  {
    name: "Österåker",
    slug: "stralkastarpolering-osteraker",
    neighbors: ["Åkersberga", "Täby", "Vaxholm", "Vallentuna", "Stockholm"],
  },
  {
    name: "Åkersberga",
    slug: "stralkastarpolering-akersberga",
    neighbors: ["Österåker", "Täby", "Vaxholm", "Vallentuna", "Stockholm"],
    locality: true,
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
    { slug: "priser", label: "Priser" },
  ]
): Array<{ slug: string; label: string }> {
  const entry = MUNICIPALITY_BY_NAME[name];
  const neighborLinks = (entry?.neighbors ?? [])
    .map((neighbor) => MUNICIPALITY_BY_NAME[neighbor])
    .filter(Boolean)
    .map((neighbor) => ({ slug: neighbor.slug, label: neighbor.name }));

  // Always surface the money-page keyword anchor, even when callers pass custom extras.
  const moneyPage = {
    slug: "stralkastarpolering",
    label: "Polera strålkastare",
  };

  const seen = new Set<string>();
  const links: Array<{ slug: string; label: string }> = [];
  for (const link of [...neighborLinks, moneyPage, ...extras]) {
    if (seen.has(link.slug) || link.slug === entry?.slug) continue;
    seen.add(link.slug);
    links.push(link);
  }
  return links;
}
