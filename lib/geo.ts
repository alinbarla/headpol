export type VisitorGeo = {
  city: string | null;
  region: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
};

/** ISO 3166-2:SE region codes → Swedish län names. */
const SWEDISH_LAN: Record<string, string> = {
  AB: "Stockholm",
  C: "Uppsala",
  D: "Södermanland",
  E: "Östergötland",
  F: "Jönköping",
  G: "Kronoberg",
  H: "Kalmar",
  I: "Gotland",
  K: "Blekinge",
  M: "Skåne",
  N: "Halland",
  O: "Västra Götaland",
  S: "Värmland",
  T: "Örebro",
  U: "Västmanland",
  W: "Dalarna",
  X: "Gävleborg",
  Y: "Västernorrland",
  Z: "Jämtland",
  AC: "Västerbotten",
  BD: "Norrbotten",
};

function headerValue(headers: Headers, name: string): string | null {
  const raw = headers.get(name);
  if (raw == null) return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

function decodeCity(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function parseCoord(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Read Vercel request geo headers. All fields are null on localhost —
 * headers are absent there; that is expected, not an error.
 */
export function visitorGeo(headers: Headers): VisitorGeo {
  return {
    city: decodeCity(headerValue(headers, "x-vercel-ip-city")),
    region: headerValue(headers, "x-vercel-ip-country-region"),
    country: headerValue(headers, "x-vercel-ip-country"),
    postal_code: headerValue(headers, "x-vercel-ip-postal-code"),
    latitude: parseCoord(headerValue(headers, "x-vercel-ip-latitude")),
    longitude: parseCoord(headerValue(headers, "x-vercel-ip-longitude")),
  };
}

function formatPostal(postal: string | null): string | null {
  if (!postal) return null;
  const digits = postal.replace(/\s+/g, "");
  if (/^\d{5}$/.test(digits)) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return postal;
}

/**
 * Human-readable location for admin UI. Returns null when nothing is known.
 * Swedish: "City 123 45" (or län name when city is missing).
 * Foreign: "City, CC".
 */
export function describeLocation(
  geo: Pick<VisitorGeo, "city" | "region" | "country" | "postal_code">
): string | null {
  const country = geo.country?.toUpperCase() ?? null;
  const postal = formatPostal(geo.postal_code);
  const city = geo.city;

  const place =
    city ??
    (country === "SE" && geo.region
      ? (SWEDISH_LAN[geo.region.toUpperCase()] ?? null)
      : null);

  if (country === "SE") {
    if (place && postal) return `${place} ${postal}`;
    if (place) return place;
    if (postal) return postal;
    return null;
  }

  if (place && country) return `${place}, ${country}`;
  if (place) return place;
  if (country) return country;
  return null;
}
