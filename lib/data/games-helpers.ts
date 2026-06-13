import type { Game } from "@/lib/types";
import games from "@/lib/data/games";

export function listPlayableGames(): [string, Game][] {
  return Object.entries(games).filter(([, game]) => !game.disabled);
}

export function getGame(slug: string): Game | undefined {
  return games[slug];
}

export function getDexEntriesForGame(gameSlug: string) {
  const game = games[gameSlug];
  if (!game) return [];
  return game.dex_slugs;
}
