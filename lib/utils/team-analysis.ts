import type {
  PokemonRecord,
  TeamMember,
  TypeAnalysisResult,
  TypeChart,
} from "@/lib/types";

export function analyzeTeam(
  members: TeamMember[],
  pokemonData: PokemonRecord,
  typeChart: TypeChart,
): TypeAnalysisResult {
  const result: TypeAnalysisResult = {};

  Object.keys(typeChart).forEach((type) => {
    const weak: string[] = [];
    const resist: string[] = [];
    const coverage: string[] = [];

    members.forEach(({ slug, tera }) => {
      let dataSlug = slug;
      if (slug.endsWith("-gmax")) {
        dataSlug = slug.substring(0, slug.length - 5);
      }

      const pokemon = pokemonData[dataSlug];
      if (!pokemon) return;

      const isWeak =
        (!tera && pokemon.weaknesses?.includes(type)) ||
        (tera != null && tera !== "" && typeChart[tera]?.weak2?.includes(type));

      const isResist =
        (!tera &&
          (pokemon.resistances?.includes(type) ||
            pokemon.immunities?.includes(type))) ||
        (tera != null &&
          tera !== "" &&
          (typeChart[tera]?.resists.includes(type) ||
            typeChart[tera]?.immune2?.includes(type)));

      if (isWeak) weak.push(slug);
      if (isResist) resist.push(slug);

      if (
        pokemon.coverage?.includes(type) ||
        (tera != null && tera !== "" && typeChart[tera]?.weakens?.includes(type))
      ) {
        coverage.push(slug);
      }
    });

    result[type] = { weak, resist, coverage };
  });

  return result;
}

export function getDefenseScore(counts: {
  weak: string[];
  resist: string[];
}): number {
  return counts.resist.length - counts.weak.length;
}

export function getCoverageScore(counts: { coverage: string[] }): number {
  return counts.coverage.length;
}
