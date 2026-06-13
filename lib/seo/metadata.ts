import type { Metadata } from "next";
import {
  SEO_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  gameOgImage,
  gamePlanPath,
} from "@/lib/seo/site";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article";
  /** Use for homepage — avoids duplicating the site name in the title tag */
  titleAbsolute?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  ogImage,
  ogType = "website",
  titleAbsolute = false,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const image = ogImage ?? absoluteUrl("/img/game/sv.png");
  const canonical = path.endsWith("/") ? path : `${path}/`;
  const ogTitle = titleAbsolute ? title : `${title} | ${SITE_NAME}`;

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    keywords: [...SEO_KEYWORDS],
    alternates: {
      canonical,
    },
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      url,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [image],
    },
  };
}

export function buildGameMetadata(gameSlug: string, gameName: string): Metadata {
  const title = `${gameName} Pokémon Team Builder`;
  const description = `Build and plan your ${gameName} in-game team with our free Pokémon team maker. Pick six Pokémon, analyze type matchups, weaknesses, and coverage for your playthrough.`;

  return buildPageMetadata({
    title,
    description,
    path: gamePlanPath(gameSlug),
    ogImage: gameOgImage(gameSlug),
  });
}

export function buildHomeMetadata(): Metadata {
  return buildPageMetadata({
    title: "Pokémon Team Builder & Maker – Free Team Planner",
    description:
      "Free Pokémon team builder for every mainline game. Pick, plan, and build your perfect in-game team with type coverage analysis. Team maker for Scarlet & Violet, Sword & Shield, and more.",
    path: "/",
    ogImage: absoluteUrl("/img/game/sv.png"),
    titleAbsolute: true,
  });
}

export function buildNotFoundMetadata(): Metadata {
  return buildPageMetadata({
    title: "Page Not Found",
    description:
      "This page does not exist. Return to the Pokémon team builder and pick a game to plan your team.",
    path: "/404",
  });
}
