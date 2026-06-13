import type { Metadata } from "next";
import Link from "next/link";
import { buildNotFoundMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...buildNotFoundMetadata(),
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <article className="team-planner">
      <div className="head">
        <header className="head__header">
          <h1 className="head__heading">
            <span className="head__game-name">Pokémon</span> Team Builder
          </h1>
          <p>
            <strong>404</strong> Ooops! It looks like you&apos;ve reached a URL
            that doesn&apos;t (or no longer) exists.
          </p>
          <p>
            Please{" "}
            <Link href="/">return to the Pokémon team builder</Link> to pick a
            game and plan your team.
          </p>
        </header>
      </div>
    </article>
  );
}
