import type { TypeChart, TypeChartEntry } from "@/lib/types";

export function getTypeChartForGeneration(
  entries: TypeChartEntry[],
  generation: number,
): TypeChart {
  const entry = entries
    .filter((data) => data.generation <= generation)
    .sort((a, b) => b.generation - a.generation)[0];

  if (!entry) {
    throw new Error(`No type chart found for generation ${generation}`);
  }

  return entry.type_data;
}

/** Mutates the chart to add `weakens` (types each attacking type is super effective against). */
export function enrichTypeChart(typeChart: TypeChart): void {
  Object.keys(typeChart).forEach((attackingType) => {
    typeChart[attackingType].weakens = [];
    Object.keys(typeChart).forEach((defendingType) => {
      if (typeChart[defendingType].weak2?.includes(attackingType)) {
        typeChart[attackingType].weakens!.push(defendingType);
      }
    });
  });
}

export function getTypeNames(typeChart: TypeChart): string[] {
  return Object.keys(typeChart);
}
