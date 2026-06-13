import Link from "next/link";
import { listPlayableGames } from "@/lib/data/games-helpers";
import { getGameName } from "@/lib/utils/game";
import { GAME_PICKER_TEXT } from "@/lib/constants";
import {
  gamePickerLogoClass,
  gamePickerLogoSrc,
} from "@/lib/styles/game-logo";

export function GamePicker() {
  const games = listPlayableGames();

  return (
    <section className="head__game-picker" id="games">
      <h2>Pick a Game</h2>
      <p>{GAME_PICKER_TEXT}</p>
      <ol className="game-picker">
        {games.map(([slug, game]) => {
          const name = getGameName(game);
          const label = `${name} Pokémon team builder`;
          return (
            <li key={slug} className="game-picker__game">
              <Link
                href={`/plan/${slug}/`}
                className="game-picker__button"
                title={label}
                aria-label={label}
              >
                <img
                  className={gamePickerLogoClass(slug)}
                  src={gamePickerLogoSrc(slug)}
                  alt={label}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
