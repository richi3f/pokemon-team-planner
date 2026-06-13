import type { Game } from "@/lib/types";

export function getGameName(game: Game): string {
  if (game.name == null && game.versions) {
    const versions = game.versions.map((ver) => "Pokémon " + ver.name);
    if (versions.length > 2) {
      versions[versions.length - 1] = "and " + versions[versions.length - 1];
      return versions.join(", ");
    }
    return versions.join(" and ");
  }
  return game.name ?? "Pokémon";
}

export function getGameVersionSlugs(game: Game): string[] {
  return game.versions ? game.versions.map((ver) => ver.slug) : [];
}
