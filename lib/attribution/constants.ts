/** localStorage key for last non-direct marketing touch. */
export const ATTRIBUTION_STORAGE_KEY = "booking_attribution_v1";

/** How long a stored non-direct touch stays valid. */
export const ATTRIBUTION_TTL_DAYS = 30;

export const MAX_UTM_LENGTH = 200;
export const MAX_GCLID_LENGTH = 200;
export const MAX_LANDING_PATH_LENGTH = 400;
export const MAX_REFERRER_HOST_LENGTH = 200;

/** Common referral hosts offered when creating a manual booking. */
export const MANUAL_REFERRAL_PRESETS = [
  { value: "chatgpt.com", label: "ChatGPT" },
  { value: "gemini.google.com", label: "Gemini" },
  { value: "perplexity.ai", label: "Perplexity" },
  { value: "facebook.com", label: "Facebook" },
  { value: "instagram.com", label: "Instagram" },
  { value: "tiktok.com", label: "TikTok" },
] as const;

export const MANUAL_REFERRAL_OTHER = "__other__";
