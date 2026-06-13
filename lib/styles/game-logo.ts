import type { CSSProperties } from "react";
import { IMG } from "@/lib/constants";

/** BEM class for per-game logo sizing in globals.css */
export function gameLogoClass(slug: string): string {
  return `head__game-logo head__game-logo_${slug}`;
}

export function gameLogoBackgroundStyle(slug: string): CSSProperties {
  return {
    backgroundImage: `url('${IMG.game}${slug}.png')`,
  };
}

export function gamePickerLogoClass(slug: string): string {
  return `game-picker__game-logo game-picker__game-logo_${slug}`;
}

export function gamePickerLogoSrc(slug: string): string {
  return `${IMG.game}${slug}.png`;
}
