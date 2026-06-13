export const COLORS = [
  "red",
  "blue",
  "yellow",
  "green",
  "black",
  "brown",
  "purple",
  "gray",
  "white",
  "pink",
] as const;

export const EXPERIENCE_GROUPS = [
  "Erratic",
  "Fast",
  "Medium Fast",
  "Medium Slow",
  "Slow",
  "Fluctuating",
] as const;

export const SHAPE_COUNT = 14;

export const TEAM_SIZE = 6;

export const GAME_PICKER_TEXT =
  "Select a game to open the team builder and start planning your in-game Pokémon team.";

export const IMG = {
  game: "/img/game/",
  pokemon: "/img/pokemon/",
  svPokemon: "/img/sv-pokemon/",
  shinyPokemon: "/img/shiny-pokemon/",
  type: "/img/type/",
  shape: "/img/shape/",
  unknown: "/img/pokemon/0000_000_uk_n.png",
  svUnknown: "/img/sv-pokemon/0000_000.png",
} as const;
