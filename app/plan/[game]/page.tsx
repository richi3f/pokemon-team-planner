import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameJsonLd } from "@/components/GameJsonLd";
import { PlannerDynamic } from "@/components/planner/PlannerDynamic";
import games from "@/lib/data/games";
import { listPlayableGames } from "@/lib/data/games-helpers";
import { getGameName } from "@/lib/utils/game";
import { buildGameMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ game: string }>;
};

export function generateStaticParams() {
  return listPlayableGames().map(([game]) => ({ game }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { game: gameSlug } = await params;
  const game = games[gameSlug];

  if (!game) {
    return { title: "Not Found" };
  }

  return buildGameMetadata(gameSlug, getGameName(game));
}

export default async function PlanPage({ params }: PageProps) {
  const { game: gameSlug } = await params;
  const game = games[gameSlug];

  if (!game || game.disabled) {
    notFound();
  }

  const gameName = getGameName(game);

  return (
    <article className="team-planner">
      <GameJsonLd gameSlug={gameSlug} gameName={gameName} />
      <PlannerDynamic gameSlug={gameSlug} game={game} />
    </article>
  );
}
