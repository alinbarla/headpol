type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Renders a JSON-LD structured data block. Server-rendered so it is present
 * in the initial HTML for crawlers (no client JS required).
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      id="structured-data"
      // Structured data is trusted, static content built on the server.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
