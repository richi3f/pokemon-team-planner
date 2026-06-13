import type { Game, Pokemon, PokemonRecord } from "@/lib/types";
import { difference } from "@/lib/utils/array";
import { getPokemonType } from "@/lib/utils/pokemon";

export function pokemonIsInVersion(
  pokemon: Pokemon,
  versions: string[],
  currentVersions: string[],
  currentGame: string,
): boolean {
  const pokemonVersion = pokemon.version || [];
  return (
    currentVersions.length === 0 ||
    (versions.length > 0 &&
      ((versions.includes("both") &&
        (pokemonVersion.length === 0 ||
          (currentVersions.every(
            (version) => !pokemonVersion.includes(version),
          ) &&
            !pokemonVersion.includes("transfer_" + currentGame)))) ||
        versions.some((version) => pokemonVersion.includes(version))))
  );
}

export function pokemonTypeIsSelected(
  type: string[],
  selection: string[],
): boolean {
  return (
    selection.length > 0 &&
    (selection.includes("all") ||
      selection.includes(type[0]) ||
      (type[1] != null && selection.includes(type[1])))
  );
}

export function pokemonIsInGeneration(
  pokemon: Pokemon,
  isGigantamax: boolean,
  generations: string[],
): boolean {
  return (
    generations.length > 0 &&
    (generations.includes("all") ||
      (isGigantamax && generations.includes("8")) ||
      (!isGigantamax &&
        generations.includes(pokemon.generation.toString())))
  );
}

export function pokemonIsEvolutionaryStage(
  pokemon: Pokemon,
  stages: string[],
): boolean {
  return (
    stages.length > 0 &&
    (stages.includes("all") ||
      (stages.includes("nfe") && pokemon.fully_evolved === false) ||
      (stages.includes("fe") &&
        pokemon.fully_evolved === true &&
        !pokemon.is_mega) ||
      (stages.includes("mega") && !!pokemon.is_mega))
  );
}

export function pokemonIsTagged(
  pokemon: Pokemon,
  isGigantamax: boolean,
  tags: string[],
): boolean {
  if (tags.length === 0) return false;
  if (tags.includes("all")) return true;

  const tagGroupA = tags.filter((tag) => !tag.includes("misc_form"));
  if (tagGroupA.length === 0) return false;

  const tagGroupB = difference(tags, tagGroupA);
  return isGigantamax
    ? tagGroupA.includes("gmax")
    : tagGroupA.some((tag) => tag in pokemon) &&
        tagGroupB.some((tag) => tag in pokemon);
}

export function pokemonIsColor(pokemon: Pokemon, colors: string[]): boolean {
  return (
    colors.length > 0 &&
    (colors.includes("all") || colors.includes(pokemon.color ?? ""))
  );
}

export function pokemonIsInExperienceGroup(
  pokemon: Pokemon,
  groups: string[],
): boolean {
  return (
    groups.length > 0 &&
    (groups.includes("all") ||
      groups.includes(pokemon.experience_group ?? ""))
  );
}

export function pokemonIsShaped(pokemon: Pokemon, shapes: string[]): boolean {
  return (
    shapes.length > 0 &&
    (shapes.includes("all") ||
      (pokemon.shape !== undefined &&
        shapes.includes(pokemon.shape.toString())))
  );
}

export function pokemonCanLearnHms(
  pokemon: Pokemon,
  moves: string[],
  currentGen: number,
): boolean {
  return (
    moves.length === 0 ||
    (pokemon.hidden_moves != null &&
      moves.every(
        (move) =>
          move === "all" ||
          (pokemon.hidden_moves![move] != null &&
            pokemon.hidden_moves![move].includes(currentGen)),
      ))
  );
}

export interface FilterSelections {
  generations: string[];
  tags: string[];
  types: string[];
  excludeTypes: string[];
  evolutions: string[];
  versions: string[];
  colors: string[];
  experienceGroups: string[];
  shapes: string[];
  hms: string[];
  /** Already normalized search query */
  searchQuery: string;
}

export function pokemonMatchesFilters(
  slug: string,
  pokemon: Pokemon,
  isGigantamax: boolean,
  game: Game,
  gameSlug: string,
  currentVersions: string[],
  filters: FilterSelections,
): boolean {
  const type = getPokemonType(pokemon, game);
  const {
    generations,
    tags,
    types,
    excludeTypes,
    evolutions,
    versions,
    colors,
    experienceGroups,
    shapes,
    hms,
    searchQuery,
  } = filters;

  if (
    !pokemonIsInGeneration(pokemon, isGigantamax, generations) ||
    !pokemonIsTagged(pokemon, isGigantamax, tags) ||
    !pokemonTypeIsSelected(type, types) ||
    pokemonTypeIsSelected(type, excludeTypes) ||
    !pokemonIsEvolutionaryStage(pokemon, evolutions) ||
    !pokemonIsInVersion(pokemon, versions, currentVersions, gameSlug) ||
    !pokemonIsColor(pokemon, colors) ||
    !pokemonIsInExperienceGroup(pokemon, experienceGroups) ||
    !pokemonIsShaped(pokemon, shapes) ||
    !pokemonCanLearnHms(pokemon, hms, game.gen)
  ) {
    return false;
  }

  if (searchQuery) {
    if (!slug.includes(searchQuery)) {
      return false;
    }
  }

  return true;
}
