export interface GameVersion {
  slug: string;
  name: string;
}

export interface Game {
  name?: string;
  gen: number;
  dex_slugs: string[];
  versions?: GameVersion[];
  hm?: string[];
  transfer?: boolean;
  mega?: boolean;
  gmax?: boolean;
  tera?: boolean;
  disabled?: boolean;
}

export type GameSlug = string;
export type Games = Record<GameSlug, Game>;

export type PokemonId = [number, number];

export interface PastType {
  generation: number;
  pokemon_type: string[];
}

export interface Pokemon {
  base_id: number;
  form_id: number;
  name: string;
  pokemon_type: string[];
  egg_group?: string[];
  gender: string[];
  gender_ratio?: number;
  shape?: number;
  color?: string;
  experience_group?: string;
  generation: number;
  evolution_ids?: PokemonId[];
  hidden_moves?: Record<string, number[]>;
  past_type?: PastType;
  form_name?: string;
  has_gigantamax?: boolean;
  is_cosmetic?: boolean;
  is_mega?: boolean;
  is_battle_only?: boolean;
  is_sublegendary?: boolean;
  is_legendary?: boolean;
  is_mythical?: boolean;
  is_ub?: boolean;
  is_baby?: boolean;
  /** Populated at runtime by completePokemonData */
  weaknesses?: string[];
  resistances?: string[];
  immunities?: string[];
  coverage?: string[];
  fully_evolved?: boolean;
  version?: string[];
  is_nonlegendary?: boolean;
  is_misc_form?: boolean;
  is_not_misc_form?: boolean;
  [key: string]: unknown;
}

export type PokemonRecord = Record<string, Pokemon>;

export interface DexEntry {
  name: string;
  order: Record<string, PokemonId[]>;
}

export type DexRecord = Record<string, DexEntry>;

export interface TypeMatchup {
  immune2?: string[];
  resists: string[];
  weak2: string[];
  weakens?: string[];
}

export type TypeChart = Record<string, TypeMatchup>;

export interface TypeChartEntry {
  generation: number;
  type_data: TypeChart;
}

export type VersionRecord = Record<string, PokemonId[]>;

export interface TeamMember {
  slug: string;
  tera: string;
}

export interface TypeAnalysisCounts {
  weak: string[];
  resist: string[];
  coverage: string[];
}

export type TypeAnalysisResult = Record<string, TypeAnalysisCounts>;
