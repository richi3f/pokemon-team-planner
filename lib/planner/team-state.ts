export interface TeamSlotState {
  slug: string;
  tera: string;
  female: boolean;
  shiny: boolean;
}

export function emptySlot(): TeamSlotState {
  return { slug: "", tera: "", female: false, shiny: false };
}

export function createInitialTeam(size = 6): TeamSlotState[] {
  return Array.from({ length: size }, () => emptySlot());
}

export function teamSlugsFromSlots(slots: TeamSlotState[]): string[] {
  return slots.map((s) => s.slug).filter(Boolean);
}

export function slotsFromTeamParam(
  param: string[],
  size = 6,
): TeamSlotState[] {
  const slots = createInitialTeam(size);
  param.slice(0, size).forEach((slug, i) => {
    if (slug) slots[i] = { ...emptySlot(), slug };
  });
  return slots;
}
