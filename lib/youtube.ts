/** Canonical PPF application video (https://youtu.be/CxQUaPKlOfc). */
export const PPF_YOUTUBE_ID = "CxQUaPKlOfc";

export const PPF_YOUTUBE = {
  id: PPF_YOUTUBE_ID,
  title: "PPF folie på strålkastare: före & efter | Stockholm",
  description:
    "Så här polerar och skyddar vi bilens strålkastare med PPF (paint protection film), från gulnad och matt plast till klar och skyddad lampa. Mobil service i Stockholm.",
  watchUrl: `https://www.youtube.com/watch?v=${PPF_YOUTUBE_ID}`,
  shortUrl: `https://youtu.be/${PPF_YOUTUBE_ID}`,
  embedUrl: `https://www.youtube-nocookie.com/embed/${PPF_YOUTUBE_ID}`,
  /** Same-origin poster — faster LCP than a hotlinked ytimg request. */
  posterSrc: "/images/ppf/ppf-folie-stralkastare.jpg",
  thumbnailUrl: `https://i.ytimg.com/vi/${PPF_YOUTUBE_ID}/maxresdefault.jpg`,
  hqThumbnailUrl: `https://i.ytimg.com/vi/${PPF_YOUTUBE_ID}/hqdefault.jpg`,
  uploadDate: "2026-09-20T00:39:53-07:00",
  duration: "PT1M34S",
  width: 1280,
  height: 720,
  channelUrl: "https://www.youtube.com/@Strålkastarpolering",
  channelName: "Strålkastarpolering",
} as const;

export type YoutubeEmbedOptions = {
  autoplay?: boolean;
  mute?: boolean;
  origin?: string;
};

/** Privacy-enhanced embed URL. Mute is required for autoplay in modern browsers. */
export function youtubeEmbedSrc({
  autoplay = true,
  mute = true,
  origin,
}: YoutubeEmbedOptions = {}): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    fs: "1",
    disablekb: "0",
    autoplay: autoplay ? "1" : "0",
    mute: mute ? "1" : "0",
  });
  if (origin) params.set("origin", origin);
  return `${PPF_YOUTUBE.embedUrl}?${params.toString()}`;
}
