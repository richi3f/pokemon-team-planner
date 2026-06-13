"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Game } from "@/lib/types";
import { useGameData } from "@/contexts/GameDataContext";
import { getTypeChartForGame } from "@/lib/data/load-game-data";
import { TEAM_SIZE } from "@/lib/constants";
import { buildDexList, type DexListEntry } from "@/lib/planner/dex-list";
import {
  createDefaultFiltersForGame,
  filtersToSelection,
  type FilterState,
} from "@/lib/planner/filters";
import {
  createInitialTeam,
  emptySlot,
  slotsFromTeamParam,
  teamSlugsFromSlots,
  type TeamSlotState,
} from "@/lib/planner/team-state";
import { OGERPON_TERA, baseSlug, isGmaxSlug } from "@/lib/planner/slot-visual";
import { isInDex, formatTeamParam, parseTeamParam } from "@/lib/utils/pokemon";
import { pokemonMatchesFilters } from "@/lib/utils/pokemon-filters";
import { getGameVersionSlugs } from "@/lib/utils/game";
import { normalize, randomInt } from "@/lib/utils/string";
import { analyzeTeam } from "@/lib/utils/team-analysis";
import type { TeamMember } from "@/lib/types";

export function useTeamPlanner(gameSlug: string, game: Game) {
  const data = useGameData();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [slots, setSlots] = useState<TeamSlotState[]>(() => createInitialTeam());
  const [filters, setFilters] = useState<FilterState>(() =>
    createDefaultFiltersForGame(game, gameSlug),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [activeTeraSlot, setActiveTeraSlot] = useState<number | null>(null);

  const dexList = useMemo(
    () => buildDexList(game, data),
    [game, data],
  );
  const typeChart = useMemo(
    () => getTypeChartForGame(gameSlug, data),
    [gameSlug, data],
  );
  const versionSlugs = useMemo(() => getGameVersionSlugs(game), [game]);
  const syncingFromUrl = useRef(false);

  useEffect(() => {
    const team = parseTeamParam(searchParams.get("team") ?? undefined);
    syncingFromUrl.current = true;
    setSlots((prev) => {
      const prevParam = formatTeamParam(teamSlugsFromSlots(prev));
      const nextParam = formatTeamParam(team);
      if (prevParam === nextParam) return prev;
      return slotsFromTeamParam(team);
    });
  }, [searchParams]);

  useEffect(() => {
    if (syncingFromUrl.current) {
      syncingFromUrl.current = false;
      return;
    }

    const slugs = teamSlugsFromSlots(slots);
    const nextParam = slugs.length ? formatTeamParam(slugs) : "";
    const currentParam = searchParams.get("team") ?? "";
    if (nextParam === currentParam) return;

    const params = new URLSearchParams(searchParams.toString());
    if (slugs.length) {
      params.set("team", nextParam);
    } else {
      params.delete("team");
    }
    const qs = params.toString();
    const path = qs ? `/plan/${gameSlug}/?${qs}` : `/plan/${gameSlug}/`;
    router.replace(path, { scroll: false });
  }, [slots, gameSlug, router, searchParams]);

  const addToTeam = useCallback(
    (slug: string) => {
      const base = baseSlug(slug);
      const gmax = isGmaxSlug(slug);
      const mon = data.pokemon[base];
      if (!mon) return;
      if (!isInDex(mon.base_id, mon.form_id, game, data.dexes)) return;
      if (gmax && !mon.has_gigantamax) return;

      setSlots((prev) => {
        if (prev.some((s) => s.slug === slug)) return prev;

        const next = [...prev];
        let idx = next.findIndex((s) => !s.slug);
        if (idx === -1) {
          next[0] = emptySlot();
          idx = 0;
        }

        next[idx] = {
          slug,
          tera: OGERPON_TERA[slug] ?? "",
          female: false,
          shiny: false,
        };
        return next;
      });
    },
    [data, game],
  );

  const removeFromTeam = useCallback(
    (index: number) => {
      setSlots((prev) => {
        const next = [...prev];
        next.splice(index, 1);
        next.push(emptySlot());
        return next;
      });
    },
    [],
  );

  const updateSlot = useCallback(
    (index: number, patch: Partial<TeamSlotState>) => {
      setSlots((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const randomizeTeam = useCallback(() => {
    setFilters((f) => ({ ...f, search: "" }));

    const available = dexList
      .filter((entry) => {
        const sel = filtersToSelection(filters);
        sel.searchQuery = "";
        return pokemonMatchesFilters(
          entry.slug,
          entry.pokemon,
          entry.isGmax,
          game,
          gameSlug,
          versionSlugs,
          sel,
        );
      })
      .map((e) => e.slug);

    const pool = [...available];
    const count = Math.min(TEAM_SIZE, pool.length);
    const picked: TeamSlotState[] = [];

    for (let i = 0; i < count; i++) {
      const idx = randomInt(pool.length);
      const slug = pool.splice(idx, 1)[0];
      picked.push({
        slug,
        tera: OGERPON_TERA[slug] ?? "",
        female: false,
        shiny: false,
      });
    }

    while (picked.length < TEAM_SIZE) {
      picked.push(emptySlot());
    }

    setSlots(picked);
  }, [dexList, filters, game, gameSlug, versionSlugs]);

  const pickedSlugs = useMemo(
    () => new Set(slots.map((s) => s.slug).filter(Boolean)),
    [slots],
  );

  const filterSelection = useMemo(() => {
    const sel = filtersToSelection(filters);
    sel.searchQuery = normalize(filters.search);
    return sel;
  }, [filters]);

  const dexSections = useMemo(() => {
    const map = new Map<string, DexListEntry[]>();
    game.dex_slugs.forEach((dexSlug) => {
      if (data.dexes[dexSlug]) map.set(dexSlug, []);
    });

    dexList.forEach((entry) => {
      if (
        pokemonMatchesFilters(
          entry.slug,
          entry.pokemon,
          entry.isGmax,
          game,
          gameSlug,
          versionSlugs,
          filterSelection,
        )
      ) {
        map.get(entry.dexSlug)?.push(entry);
      }
    });

    return Array.from(map.entries())
      .map(([slug, entries]) => ({
        slug,
        name: data.dexes[slug]?.name ?? slug,
        entries,
      }))
      .filter((s) => s.entries.length > 0);
  }, [dexList, data.dexes, game, gameSlug, versionSlugs, filterSelection]);

  const teamAnalysis = useMemo(() => {
    const members: TeamMember[] = slots
      .filter((s) => s.slug)
      .map((s) => ({ slug: s.slug, tera: s.tera }));
    return analyzeTeam(members, data.pokemon, typeChart);
  }, [slots, typeChart, data.pokemon]);

  return {
    game,
    gameSlug,
    slots,
    filters,
    setFilters,
    filtersOpen,
    setFiltersOpen,
    analysisOpen,
    setAnalysisOpen,
    activeTeraSlot,
    setActiveTeraSlot,
    typeChart,
    versionSlugs,
    dexSections,
    pickedSlugs,
    addToTeam,
    removeFromTeam,
    updateSlot,
    randomizeTeam,
    teamAnalysis,
  };
}

export type TeamPlannerState = ReturnType<typeof useTeamPlanner>;
