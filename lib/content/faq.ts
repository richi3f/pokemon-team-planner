export const FAQ_ITEMS = [
  {
    question: "What is a Pokémon team builder?",
    answer:
      "A Pokémon team builder helps you choose six Pokémon for an in-game playthrough and analyze their type matchups. Our tool works as a free team maker, planner, and picker for every mainline Pokémon game.",
  },
  {
    question: "Are all Pokémon forms included?",
    answer:
      "Almost every Pokémon form is included in the planner. Some cosmetic and transient forms are hidden unless you select the Misc. Forms filter. Forms of the following Pokémon are not in the planner: Pikachu, Genesect, Pumpkaboo, Gourgeist, Xerneas, Mimikyu, Cramorant, Sinistea, Polteageist, Zarude, Poltchageist, and Sinistcha.",
  },
  {
    question: 'What are "Misc. Forms"?',
    answer:
      "This category encompasses most cosmetic forms, forms of Arceus and Silvally, and battle-only forms. These forms are initially hidden but can be selected by activating the corresponding filter.",
  },
  {
    question: "Why are some gender differences not toggable?",
    answer:
      "Meowstic, Indeedee, and Basculegion have forms with different movepools, abilities, and/or stats. They are treated as distinct Pokémon rather than cosmetic gender differences.",
  },
  {
    question: "How is the team analysis calculated?",
    answer:
      "Only type is used to calculate weaknesses, resistances, and coverage. Abilities and movepools are not factored in.",
  },
  {
    question: "Is this a Pokémon Showdown team builder?",
    answer:
      "No. This is an in-game team planner for mainline Pokémon games, not a competitive battle simulator. It focuses on type coverage and matchups for story playthroughs.",
  },
] as const;
