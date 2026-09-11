import "server-only";

/**
 * Detect crawlers / bots from User-Agent. Used to keep heatmap, sessions and
 * visitors free of automated traffic. Prefer rejecting at ingest; queries also
 * exclude rows marked is_bot.
 */
const BOT_UA_PATTERN =
  /bot|spider|crawl|slurp|scrapy|curl\/|wget|python-requests|python-urllib|go-http-client|httpclient|java\/|libwww|okhttp|axios\/|node-fetch|undici|postman|insomnia|httpie|aiohttp|guzzle|phantom|headless|puppeteer|playwright|selenium|webdriver|chrome-lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake|site24x7|monitor|preview|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|embedly|quora link|redditbot|pinterest|applebot|bingpreview|yandex|baiduspider|duckduckbot|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|chatgpt|claudebot|anthropic|ccbot|amazonbot|ia_archiver|archive\.org|wayback|google-inspectiontool|adsbot-google|mediapartners-google|feedfetcher|bingbot|googlebot|storebot|dataforseo|screaming frog|lighthouse/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  const value = ua?.trim() ?? "";
  // Real browsers always send a UA; empty/missing is almost always a script.
  if (value.length < 12) return true;
  return BOT_UA_PATTERN.test(value);
}

/** Persist a short UA for debugging; never store full cookies-sized headers. */
export function truncateUserAgent(ua: string | null | undefined): string | null {
  const value = ua?.trim();
  if (!value) return null;
  return value.slice(0, 300);
}
