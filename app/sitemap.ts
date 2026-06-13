import type { MetadataRoute } from "next";
import { listPlayableGames } from "@/lib/data/games-helpers";
import { getSiteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

/** Higher-traffic games get a slight priority boost in the sitemap */
const HIGH_PRIORITY_GAMES = new Set(["sv", "swsh", "sm", "oras", "xy", "rse"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...listPlayableGames().map(([game]) => ({
      url: `${base}/plan/${game}/`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: HIGH_PRIORITY_GAMES.has(game) ? 0.9 : 0.8,
    })),
  ];
}
