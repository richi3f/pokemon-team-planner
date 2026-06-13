import {
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/seo/site";

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [
      "Pokemon Team Builder",
      "Pokemon Team Maker",
      "Pokemon Team Planner",
      "Pokemon Team Picker",
    ],
    url: getSiteUrl(),
    description: SITE_TAGLINE,
  };
}

export function getWebApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    alternateName: [
      "Pokémon Team Builder",
      "Pokémon Team Maker",
      "Pokémon Team Planner",
    ],
    url: getSiteUrl(),
    description: SITE_TAGLINE,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    featureList: [
      "Pokémon team builder",
      "Type coverage analysis",
      "In-game team planner",
      "Team sharing via URL",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function getGameBreadcrumbJsonLd(gameSlug: string, gameName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Pokémon Team Builder",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${gameName} Team Builder`,
        item: absoluteUrl(`/plan/${gameSlug}/`),
      },
    ],
  };
}

export function getGameWebApplicationJsonLd(
  gameSlug: string,
  gameName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${gameName} Pokémon Team Builder`,
    alternateName: [
      `${gameName} Team Maker`,
      `${gameName} Team Planner`,
    ],
    url: absoluteUrl(`/plan/${gameSlug}/`),
    description: `Free ${gameName} Pokémon team builder and team maker. Plan your in-game team with type coverage analysis.`,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    isPartOf: {
      "@type": "WebApplication",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

