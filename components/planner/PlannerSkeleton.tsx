import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { TEAM_SIZE } from "@/lib/constants";
import {
  gameLogoBackgroundStyle,
  gameLogoClass,
} from "@/lib/styles/game-logo";

const DEX_PLACEHOLDER_COUNT = 24;

interface PlannerSkeletonProps {
  gameSlug?: string;
  gameName?: string;
}

export function PlannerSkeleton({ gameSlug, gameName }: PlannerSkeletonProps) {
  const showGameHeader = Boolean(gameSlug && gameName);

  return (
    <div
      className="head head_skeleton"
      aria-busy="true"
      role="status"
      aria-label="Loading planner"
    >
      <span className="sr-only">Loading planner…</span>
      <header className="head__header">
        <h1 className="head__heading head__game-button">
          {showGameHeader ? (
            <Link href="/">
              <span
                className={gameLogoClass(gameSlug!)}
                style={gameLogoBackgroundStyle(gameSlug!)}
              >
                {gameName}
              </span>{" "}
              Team Builder
            </Link>
          ) : (
            <>
              <Skeleton
                width="12em"
                height="1.25em"
                className="skeleton_inline-block"
              />{" "}
              Team Builder
            </>
          )}
        </h1>
        {!showGameHeader && (
          <>
            <Skeleton
              width="70%"
              height="0.875em"
              className="skeleton_center skeleton_mt-sm"
            />
            <Skeleton
              width="50%"
              height="0.875em"
              className="skeleton_center skeleton_mt-sm"
            />
          </>
        )}
        {showGameHeader && (
          <p className="head__header-skeleton-note">Loading game data…</p>
        )}
      </header>

      <div className="head__team">
        <section className="team">
          <h2 className="team__heading">Your Team</h2>
          <ul className="team__slots">
            {Array.from({ length: TEAM_SIZE }, (_, index) => (
              <li key={index} className="slot slot_skeleton">
                <Skeleton
                  width="10em"
                  height="10em"
                  circle
                  className="slot__skeleton-render"
                />
                <Skeleton width="11em" height="5em" className="slot__skeleton-info" />
              </li>
            ))}
          </ul>
          <div className="team__buttons">
            <Skeleton width="12em" height="2.25em" />
            <Skeleton width="12em" height="2.25em" />
          </div>
        </section>
      </div>

      <section>
        <h2 className="picker__heading">Your Options</h2>
        <Skeleton width="5.5em" height="2.25em" className="skeleton_mb" />
        <div className="picker__skeleton-grid" aria-hidden="true">
          {Array.from({ length: DEX_PLACEHOLDER_COUNT }, (_, index) => (
            <Skeleton key={index} width="5em" height="5em" />
          ))}
        </div>
      </section>
    </div>
  );
}
