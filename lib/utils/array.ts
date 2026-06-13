import type { PokemonId } from "@/lib/types";

export function sortIds(a: PokemonId, b: PokemonId): number {
  return a[0] - b[0] || a[1] - b[1];
}

export function unique<T>(array: T[]): T[] {
  const result = array.concat();
  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      if (result[i] === result[j]) {
        result.splice(j--, 1);
      }
    }
  }
  return result;
}

export function difference<T>(a: T[], b: T[]): T[] {
  return a.filter((x) => b.indexOf(x) < 0);
}

export function union<T>(a: T[], b: T[]): T[] {
  return unique(a.concat(b));
}
