"use client";

import dynamic from "next/dynamic";
import type { Game } from "@/lib/types";
import { PlannerSkeleton } from "@/components/planner/PlannerSkeleton";

const Planner = dynamic(
  () => import("@/components/planner/Planner").then((m) => m.Planner),
  { loading: () => <PlannerSkeleton /> },
);

interface PlannerDynamicProps {
  gameSlug: string;
  game: Game;
}

export function PlannerDynamic({ gameSlug, game }: PlannerDynamicProps) {
  return <Planner gameSlug={gameSlug} game={game} />;
}
