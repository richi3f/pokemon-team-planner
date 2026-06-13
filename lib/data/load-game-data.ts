import type {
  DexRecord,
  PokemonRecord,
  TypeChart,
  TypeChartEntry,
  VersionRecord,
} from "@/lib/types";
import games from "@/lib/data/games";
import { completePokemonData } from "@/lib/utils/pokemon";
import {
  enrichTypeChart,
  getTypeChartForGeneration,
} from "@/lib/utils/type-chart";

export interface GameDataStore {
  pokemon: PokemonRecord;
  dexes: DexRecord;
  types: TypeChartEntry[];
  versions: VersionRecord;
  idToSlug: Map<string, string>;
}

let store: GameDataStore | null = null;
let loadPromise: Promise<GameDataStore> | null = null;
const preparedGames = new Set<string>();

function buildIdIndex(pokemon: PokemonRecord): Map<string, string> {
  const map = new Map<string, string>();
  for (const [slug, mon] of Object.entries(pokemon)) {
    map.set(`${mon.base_id}-${mon.form_id}`, slug);
  }
  return map;
}

/** Lazy-load large data files into separate JS chunks. */
export async function loadGameDataStore(): Promise<GameDataStore> {
  if (store) return store;

  if (!loadPromise) {
    loadPromise = Promise.all([
      import("@/lib/data/pokemon"),
      import("@/lib/data/dexes"),
      import("@/lib/data/types"),
      import("@/lib/data/versions"),
    ]).then(([pokemonMod, dexesMod, typesMod, versionsMod]) => {
      const pokemon = pokemonMod.default;
      store = {
        pokemon,
        dexes: dexesMod.default,
        types: typesMod.default,
        versions: versionsMod.default,
        idToSlug: buildIdIndex(pokemon),
      };
      return store;
    });
  }

  return loadPromise;
}

export function getGameDataStore(): GameDataStore {
  if (!store) {
    throw new Error("Game data not loaded yet. Call loadGameDataStore() first.");
  }
  return store;
}

export function prepareGameData(gameSlug: string, data: GameDataStore): void {
  if (preparedGames.has(gameSlug)) return;

  const game = games[gameSlug];
  if (!game) return;

  completePokemonData({
    gameSlug,
    game,
    pokemonData: data.pokemon,
    dexData: data.dexes,
    typeChartEntries: data.types,
    versionData: data.versions,
  });

  preparedGames.add(gameSlug);
}

export function getTypeChartForGame(
  gameSlug: string,
  data: GameDataStore,
): TypeChart {
  const game = games[gameSlug];
  if (!game) {
    throw new Error(`Unknown game: ${gameSlug}`);
  }
  const chart = getTypeChartForGeneration(data.types, game.gen);
  enrichTypeChart(chart);
  return chart;
}
