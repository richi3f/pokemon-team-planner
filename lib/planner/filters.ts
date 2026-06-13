import type { Game } from "@/lib/types";
import { COLORS, EXPERIENCE_GROUPS, SHAPE_COUNT } from "@/lib/constants";
import {
  getTypeNames,
  getTypeChartForGeneration,
} from "@/lib/utils/type-chart";
import types from "@/lib/data/types";
import { capitalize, capitalizeSnakeCase, toRoman } from "@/lib/utils/string";

export interface FilterState {
  search: string;
  type: string[];
  excludeType: string[];
  evolution: string[];
  gen: string[];
  version: string[];
  tag: string[];
  color: string[];
  experience: string[];
  shape: string[];
  hm: string[];
}

export function createDefaultFiltersForGame(
  game: Game,
  gameSlug: string,
): FilterState {
  const typeChart = getTypeChartForGeneration(types, game.gen);
  const allTypes = getTypeNames(typeChart);

  return {
    search: "",
    type: [...allTypes],
    excludeType: [],
    evolution: ["nfe", "fe", ...(game.mega ? ["mega"] : [])],
    gen: Array.from({ length: game.gen }, (_, i) => String(i + 1)),
    version: game.versions
      ? [
          "both",
          ...game.versions.map((v) => v.slug),
          ...(game.transfer ? ["transfer_" + gameSlug] : []),
        ]
      : [],
    tag: [
      "is_nonlegendary",
      "is_sublegendary",
      "is_legendary",
      "is_mythical",
      "is_not_misc_form",
    ],
    color: [...COLORS],
    experience: [...EXPERIENCE_GROUPS],
    shape: Array.from({ length: SHAPE_COUNT }, (_, i) => String(i + 1)),
    hm: [],
  };
}

export function filterLabelOptions(game: Game) {
  const typeChart = getTypeChartForGeneration(types, game.gen);
  return {
    types: getTypeNames(typeChart),
    generations: Array.from({ length: game.gen }, (_, i) => ({
      value: String(i + 1),
      label: "Generation " + toRoman(i + 1),
    })),
    colors: COLORS.map((c) => ({ value: c, label: capitalize(c) })),
    experience: EXPERIENCE_GROUPS.map((e) => ({ value: e, label: e })),
    shapes: Array.from({ length: SHAPE_COUNT }, (_, i) => String(i + 1)),
    hms:
      game.hm?.map((m) => ({
        value: m,
        label: capitalizeSnakeCase(m),
      })) ?? [],
    versions: game.versions ?? [],
  };
}

export function filtersToSelection(state: FilterState) {
  return {
    generations: state.gen,
    tags: state.tag,
    types: state.type,
    excludeTypes: state.excludeType,
    evolutions: state.evolution,
    versions: state.version,
    colors: state.color,
    experienceGroups: state.experience,
    shapes: state.shape,
    hms: state.hm,
    searchQuery: state.search,
  };
}

export function toggleFilterValues(
  current: string[],
  value: string,
  checked: boolean,
  allValues: string[],
): string[] {
  if (value === "all") {
    return checked ? [...allValues] : [];
  }

  let next = checked
    ? [...new Set([...current, value])]
    : current.filter((v) => v !== value);

  if (allValues.length > 0 && next.length === allValues.length) {
    return [...allValues];
  }
  return next;
}
