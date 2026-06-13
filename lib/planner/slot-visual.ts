import type { Pokemon } from "@/lib/types";
import { IMG } from "@/lib/constants";
import { getPokemonRenderUrl } from "@/lib/utils/pokemon";

export interface SlotVisualOptions {
  gmax?: boolean;
  female?: boolean;
  shiny?: boolean;
}

export function getSlotImageUrl(
  pokemon: Pokemon,
  { gmax = false, female = false, shiny = false }: SlotVisualOptions = {},
): string {
  let url = getPokemonRenderUrl(pokemon, gmax);

  if (female) {
    url = url.replace(/[fm]d/g, (m) => ({ md: "fd", fd: "md" }[m] as string));
  }

  if (shiny) {
    const parts = url.split("/");
    parts[parts.length - 2] = "shiny-pokemon";
    url = parts.join("/");
  }

  return url;
}

export const EMPTY_SLOT_IMAGE = IMG.unknown;

export const OGERPON_TERA: Record<string, string> = {
  ogerpon: "grass",
  "ogerpon-wellspring": "water",
  "ogerpon-hearthflame": "fire",
  "ogerpon-cornerstone": "rock",
};

export function baseSlug(slug: string): string {
  return slug.endsWith("-gmax") ? slug.slice(0, -5) : slug;
}

export function isGmaxSlug(slug: string): boolean {
  return slug.endsWith("-gmax");
}
