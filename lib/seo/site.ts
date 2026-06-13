export const DEFAULT_SITE_URL = "https://pokemonteampicker.com";

/** Brand name — matches the domain */
export const SITE_NAME = "Pokémon Team Picker";

/** Primary SEO keywords (Semrush/Ahrefs research) */
export const SEO_KEYWORDS = [
  "pokemon team builder",
  "pokemon team maker",
  "pokemon team planner",
  "team builder pokemon",
  "pokemon team picker",
  "in-game pokemon team",
  "pokemon type coverage",
] as const;

export const SITE_TAGLINE =
  "Free team builder, maker & planner for every mainline Pokémon game";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function gameOgImage(gameSlug: string): string {
  return absoluteUrl(`/img/game/${gameSlug}.png`);
}

export function gamePlanPath(gameSlug: string): string {
  return `/plan/${gameSlug}/`;
}
