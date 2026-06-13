import { getGameName } from "@/lib/utils/game";
import games from "@/lib/data/games";
import { SITE_TAGLINE } from "@/lib/seo/site";

export const MAIN_NAV = [
  { label: "Home", href: "/" },
  { label: "All Games", href: "/#games" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const FOOTER_POPULAR_GAMES = [
  "sv",
  "swsh",
  "oras",
  "bdsp",
  "rse",
  "sm",
] as const;

export function getPopularGameLinks() {
  return FOOTER_POPULAR_GAMES.map((slug) => {
    const game = games[slug];
    return {
      slug,
      href: `/plan/${slug}/`,
      name: game ? getGameName(game) : slug,
    };
  });
}

export const SUPPORT_LINKS = {
  github:
    "https://github.com/geekskai/pokemon-team-planner/issues/new/choose",
  donate:
    "https://www.paypal.com/donate/?hosted_button_id=33DEFPRGZM57Y&lc=US",
  email: "richi3f@gmail.com",
} as const;

export { SITE_TAGLINE };

export function getGameNavFromPath(pathname: string) {
  const match = pathname.match(/^\/plan\/([^/]+)\/?$/);
  if (!match) return null;

  const slug = match[1];
  const game = games[slug];
  if (!game || game.disabled) return null;

  return {
    slug,
    name: getGameName(game),
    href: `/plan/${slug}/`,
  };
}
