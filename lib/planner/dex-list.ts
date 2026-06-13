import type { Game, Pokemon, PokemonRecord } from "@/lib/types";
import type { GameDataStore } from "@/lib/data/load-game-data";
import { sortIds } from "@/lib/utils/array";

export interface DexListEntry {
  slug: string;
  pokemon: Pokemon;
  isGmax: boolean;
  dexSlug: string;
}

export function buildDexList(
  game: Game,
  { pokemon, dexes, idToSlug }: Pick<GameDataStore, "pokemon" | "dexes" | "idToSlug">,
): DexListEntry[] {
  const entries: DexListEntry[] = [];

  game.dex_slugs.forEach((dexSlug) => {
    const dex = dexes[dexSlug];
    if (!dex) return;

    const order = Object.keys(dex.order).sort(
      (a, b) => Number(a) - Number(b),
    );

    order.forEach((num) => {
      const ids = [...dex.order[num]].sort(sortIds);
      ids.forEach(([baseId, formId]) => {
        const slug = idToSlug.get(`${baseId}-${formId}`);
        if (!slug) return;

        const mon = pokemon[slug];
        if (!mon) return;

        entries.push({ slug, pokemon: mon, isGmax: false, dexSlug });

        if (game.gmax && mon.has_gigantamax && !mon.is_cosmetic) {
          entries.push({
            slug: slug + "-gmax",
            pokemon: mon,
            isGmax: true,
            dexSlug,
          });
        }
      });
    });
  });

  return entries;
}

export function findPokemonEntry(
  slug: string,
  pokemon: PokemonRecord,
): Pokemon | undefined {
  const base = slug.endsWith("-gmax") ? slug.slice(0, -5) : slug;
  return pokemon[base];
}
