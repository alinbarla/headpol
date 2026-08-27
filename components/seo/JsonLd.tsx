type JsonLdProps = {
  data: Record<string, unknown>;
  id?: string;
};

/**
 * Renders a JSON-LD structured data block. Server-rendered so it is present
 * in the initial HTML for crawlers (no client JS required).
 */
export function JsonLd({ data, id = "structured-data" }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // Structured data is trusted, static content built on the server.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
