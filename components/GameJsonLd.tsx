import {
  getGameBreadcrumbJsonLd,
  getGameWebApplicationJsonLd,
} from "@/lib/seo/json-ld";

interface GameJsonLdProps {
  gameSlug: string;
  gameName: string;
}

export function GameJsonLd({ gameSlug, gameName }: GameJsonLdProps) {
  const schemas = [
    getGameBreadcrumbJsonLd(gameSlug, gameName),
    getGameWebApplicationJsonLd(gameSlug, gameName),
  ];

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
