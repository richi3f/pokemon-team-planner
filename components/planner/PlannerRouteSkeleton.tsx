"use client";

import { useParams } from "next/navigation";
import games from "@/lib/data/games";
import { getGameName } from "@/lib/utils/game";
import { PlannerSkeleton } from "@/components/planner/PlannerSkeleton";

export function PlannerRouteSkeleton() {
  const params = useParams();
  const gameSlug = typeof params?.game === "string" ? params.game : undefined;
  const game = gameSlug ? games[gameSlug] : undefined;
  const gameName =
    game && !game.disabled ? getGameName(game) : undefined;

  return <PlannerSkeleton gameSlug={gameSlug} gameName={gameName} />;
}
