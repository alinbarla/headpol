import { YoutubeAutoplayEmbed } from "@/components/media/YoutubeAutoplayEmbed";

type PpfYoutubeEmbedProps = {
  autoPlay?: boolean;
  priority?: boolean;
  className?: string;
  title?: string;
  caption?: string;
  watchLabel?: string;
  mutedLabel?: string;
  id?: string;
};

/**
 * Server wrapper so crawlers get preconnect hints in the initial HTML.
 * The player itself is a client island that swaps the poster for a muted
 * autoplay iframe once it is near the viewport.
 */
export function PpfYoutubeEmbed(props: PpfYoutubeEmbedProps) {
  return (
    <>
      <link rel="preconnect" href="https://www.youtube-nocookie.com" />
      <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
      <YoutubeAutoplayEmbed {...props} />
    </>
  );
}
