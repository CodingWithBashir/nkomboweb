/**
 * Renders structured data as a JSON-LD script tag.
 * Server component — keep it out of client trees where possible.
 */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      // Structured data is generated from trusted, static data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
