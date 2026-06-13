import { getWebApplicationJsonLd, getWebSiteJsonLd } from "@/lib/seo/json-ld";

export function JsonLd() {
  const schemas = [getWebSiteJsonLd(), getWebApplicationJsonLd()];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
