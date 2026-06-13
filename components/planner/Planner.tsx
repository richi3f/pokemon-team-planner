"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Game } from "@/lib/types";
import { GameDataProvider } from "@/contexts/GameDataContext";
import {
  loadGameDataStore,
  prepareGameData,
  type GameDataStore,
} from "@/lib/data/load-game-data";
import { useTeamPlanner } from "@/hooks/useTeamPlanner";
import { getGameName } from "@/lib/utils/game";
import {
  gameLogoBackgroundStyle,
  gameLogoClass,
} from "@/lib/styles/game-logo";
import { TeamPanel } from "@/components/planner/TeamPanel";
import { DexPicker } from "@/components/planner/DexPicker";
import { PlannerSkeleton } from "@/components/planner/PlannerSkeleton";

const FilterPanel = dynamic(
  () =>
    import("@/components/planner/FilterPanel").then((m) => m.FilterPanel),
  { ssr: false },
);

interface PlannerProps {
  gameSlug: string;
  game: Game;
}

export function Planner({ gameSlug, game }: PlannerProps) {
  const [store, setStore] = useState<GameDataStore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGameDataStore()
      .then((data) => {
        if (cancelled) return;
        prepareGameData(gameSlug, data);
        setStore(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load game data.");
      });
    return () => {
      cancelled = true;
    };
  }, [gameSlug]);

  if (error) {
    return (
      <div className="head" role="alert">
        <header className="head__header">
          <p style={{ textAlign: "center", color: "#c00" }}>{error}</p>
        </header>
      </div>
    );
  }

  if (!store) {
    return (
      <PlannerSkeleton
        gameSlug={gameSlug}
        gameName={getGameName(game)}
      />
    );
  }

  return (
    <GameDataProvider store={store}>
      <PlannerContent gameSlug={gameSlug} game={game} />
    </GameDataProvider>
  );
}

function PlannerContent({ gameSlug, game }: PlannerProps) {
  const planner = useTeamPlanner(gameSlug, game);
  const headRef = useRef<HTMLDivElement>(null);
  const gameName = getGameName(game);

  useEffect(() => {
    const onScroll = () => {
      const head = headRef.current;
      if (!head) return;
      const picker = document.querySelector(".picker__pokedexes");
      const analysis = document.querySelector(".team__type-analysis");
      const activeFilters = document.querySelectorAll(".filter_active");
      const targetTop = picker?.getBoundingClientRect().top ?? 0;
      if (
        targetTop < 0 &&
        analysis?.classList.contains("type-analysis_hidden") &&
        activeFilters.length === 0
      ) {
        head.classList.add("head_sticky");
      } else {
        head.classList.remove("head_sticky");
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="head" ref={headRef}>
      <header className="head__header">
        <h1 className="head__heading head__game-button">
          <Link href="/">
            <span
              className={gameLogoClass(gameSlug)}
              style={gameLogoBackgroundStyle(gameSlug)}
            >
              {gameName}
            </span>{" "}
              Team Builder
          </Link>
        </h1>
        <p>
          Use this tool to plan your team for an in-game run. Click on a
          Pokémon below to add it to your team, and click on it again to remove
          it. Have fun and share with your friends and neighbors!
        </p>
      </header>
      <TeamPanel planner={planner} />
      <section>
        <h2 className="picker__heading">Your Options</h2>
        <div
          className={
            "picker__overlay" +
            (planner.filtersOpen ? "" : " picker__overlay_hidden")
          }
        >
          {planner.filtersOpen && (
            <FilterPanel
              game={game}
              gameSlug={gameSlug}
              filters={planner.filters}
              onChange={planner.setFilters}
              onClose={() => planner.setFiltersOpen(false)}
            />
          )}
        </div>
        <button
          type="button"
          className="picker__filter-button"
          onClick={() => planner.setFiltersOpen(!planner.filtersOpen)}
        >
          Filters
        </button>
        <DexPicker
          sections={planner.dexSections}
          pickedSlugs={planner.pickedSlugs}
          onPick={planner.addToTeam}
        />
      </section>
    </div>
  );
}
