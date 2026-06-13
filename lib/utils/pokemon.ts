import { IMG } from "@/lib/constants";
import type {
  DexRecord,
  Game,
  Pokemon,
  PokemonId,
  PokemonRecord,
  TypeChartEntry,
  VersionRecord,
} from "@/lib/types";
import { difference, union, sortIds } from "@/lib/utils/array";
import { enrichTypeChart, getTypeChartForGeneration } from "@/lib/utils/type-chart";

export function getPokemonType(pokemon: Pokemon, game: Game): string[] {
  if (
    pokemon.past_type == null ||
    game.gen >= pokemon.past_type.generation
  ) {
    return pokemon.pokemon_type;
  }
  return pokemon.past_type.pokemon_type;
}

export function getPokemonRenderUrl(
  pokemon: Pokemon,
  gmax = false,
): string {
  return (
    IMG.pokemon +
    [
      String(pokemon.base_id).padStart(4, "0"),
      String(pokemon.form_id).padStart(3, "0"),
      gmax && pokemon.gender.length > 1 ? "mf" : pokemon.gender[0],
      gmax ? "g" : "n",
    ].join("_") +
    ".png"
  );
}

export function idToSlug(
  idsOrSlugs: string[],
  pokemonData: PokemonRecord,
): string[] {
  const slugs: string[] = [];
  idsOrSlugs.forEach((idOrSlug) => {
    if (isNaN(Number(idOrSlug))) {
      slugs.push(idOrSlug);
      return;
    }
    const baseId = parseInt(idOrSlug, 10);
    for (const slug in pokemonData) {
      if (pokemonData[slug].base_id === baseId) {
        slugs.push(slug);
        break;
      }
    }
  });
  return slugs;
}

export function isInDex(
  baseId: number,
  formId: number,
  game: Game,
  dexData: DexRecord,
): boolean {
  for (const slug of game.dex_slugs) {
    const dex = dexData[slug];
    if (!dex) continue;
    for (const ids of Object.values(dex.order)) {
      for (const id of ids) {
        if (id[0] === baseId && id[1] === formId) {
          return true;
        }
      }
    }
  }
  return false;
}

export interface CompletePokemonDataOptions {
  gameSlug: string;
  game: Game;
  pokemonData: PokemonRecord;
  dexData: DexRecord;
  typeChartEntries: TypeChartEntry[];
  versionData: VersionRecord;
}

/**
 * Enriches in-dex Pokémon with type matchups, tags, and version exclusivity.
 * Mutates pokemon entries in place (same behavior as original main.js).
 */
export function completePokemonData({
  gameSlug,
  game,
  pokemonData,
  dexData,
  typeChartEntries,
  versionData,
}: CompletePokemonDataOptions): void {
  const typeData = getTypeChartForGeneration(typeChartEntries, game.gen);
  enrichTypeChart(typeData);
  const pokemonEntries = Object.entries(pokemonData);

  const inDex = (baseId: number, formId: number) =>
    isInDex(baseId, formId, game, dexData);

  Object.values(pokemonData)
    .filter((pokemon) => inDex(pokemon.base_id, pokemon.form_id))
    .forEach((pokemon) => {
      const type = getPokemonType(pokemon, game);
      const type1 = type[0];
      const type2 = type.length === 1 ? null : type[1];

      if (type2 == null) {
        pokemon.weaknesses = typeData[type1].weak2 || [];
        pokemon.immunities = typeData[type1].immune2 || [];
        pokemon.resistances = typeData[type1].resists || [];
        pokemon.coverage = typeData[type1].weakens || [];
      } else {
        pokemon.immunities = union(
          typeData[type1].immune2 || [],
          typeData[type2].immune2 || [],
        );
        pokemon.resistances = union(
          difference(typeData[type1].resists, typeData[type2].weak2 || []),
          difference(typeData[type2].resists, typeData[type1].weak2 || []),
        );
        pokemon.weaknesses = difference(
          union(
            difference(typeData[type1].weak2 || [], typeData[type2].resists),
            difference(typeData[type2].weak2 || [], typeData[type1].resists),
          ),
          pokemon.immunities,
        );
        pokemon.coverage = union(
          typeData[type1].weakens || [],
          typeData[type2].weakens || [],
        );
      }

      pokemon.fully_evolved = true;
      if (pokemon.evolution_ids) {
        pokemon.fully_evolved = !pokemon.evolution_ids.some(([baseId, formId]) =>
          inDex(baseId, formId),
        );
      }

      if (game.gen < 9 && pokemon.is_ub) {
        pokemon.is_sublegendary = true;
      }
      if (
        !(pokemon.is_sublegendary || pokemon.is_legendary || pokemon.is_mythical)
      ) {
        pokemon.is_nonlegendary = true;
      }

      if (
        (pokemon.is_battle_only && !pokemon.is_mega) ||
        pokemon.is_cosmetic ||
        (pokemon.form_id > 0 &&
          (pokemon.name === "Arceus" || pokemon.name === "Silvally"))
      ) {
        pokemon.is_misc_form = true;
      }

      if (pokemon.name === "Vivillon") {
        if (gameSlug === "sv") {
          pokemon.is_misc_form = pokemon.form_name != "Fancy Pattern";
        } else if (gameSlug === "champions") {
          pokemon.is_misc_form = pokemon.form_name != "High Plains Pattern";
        }
      }

      if ((pokemon.is_mega && !pokemon.is_cosmetic) || !pokemon.is_misc_form) {
        pokemon.is_not_misc_form = true;
      }
    });

  Object.entries(versionData).forEach(([version, ids]) => {
    ids.forEach(([baseId, formId]) => {
      const entry = pokemonEntries.find(
        ([, p]) => p.base_id === baseId && p.form_id === formId,
      );
      if (!entry) return;
      const pokemon = entry[1];
      if (pokemon.version == null) {
        pokemon.version = [];
      }
      pokemon.version.push(version);
    });
  });
}

export function parseTeamParam(team: string | null | undefined): string[] {
  if (!team) return [];
  return team.split("+").filter(Boolean);
}

export function formatTeamParam(slugs: string[]): string {
  return slugs.filter(Boolean).join("+");
}

export function findPokemonByIds(
  pokemonData: PokemonRecord,
  baseId: number,
  formId: number,
): [string, Pokemon] | undefined {
  const entry = Object.entries(pokemonData).find(
    ([, p]) => p.base_id === baseId && p.form_id === formId,
  );
  return entry;
}

export function getDexPokemonSlugs(
  dexOrder: Record<string, PokemonId[]>,
  pokemonData: PokemonRecord,
): string[] {
  const slugs: string[] = [];
  const order = Object.keys(dexOrder).sort((a, b) => Number(a) - Number(b));

  order.forEach((num) => {
    const ids = [...dexOrder[num]].sort(sortIds);
    ids.forEach(([baseId, formId]) => {
      const entry = findPokemonByIds(pokemonData, baseId, formId);
      if (entry) slugs.push(entry[0]);
    });
  });

  return slugs;
}
