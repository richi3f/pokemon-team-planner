import type { Metadata } from "next";
import { GamePicker } from "@/components/GamePicker";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { buildHomeMetadata } from "@/lib/seo/metadata";
import { SITE_TAGLINE } from "@/lib/seo/site";

export const metadata: Metadata = buildHomeMetadata();

export default function HomePage() {
  return (
    <article className="team-planner">
      <JsonLd />
      <div className="head">
        <header className="head__header">
          <h1 className="head__heading">
            <span className="head__game-name">Pokémon</span> Team Builder
          </h1>
          <p className="head__tagline">{SITE_TAGLINE}</p>
          <p className="head__intro">
            Build, plan, and pick your ideal in-game team with our free{" "}
            <strong>Pokémon team builder</strong>. Use it as a team maker to
            balance type coverage or as a team planner for your next playthrough
            — select a game below to get started.
          </p>
        </header>
        <GamePicker />
        <section className="head__faq" id="faq">
          <h2>
            <abbr title="Frequently Asked Questions">FAQ</abbr>
          </h2>
          <dl>
            {FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>
                  <p>{item.answer}</p>
                </dd>
              </div>
            ))}
            <dt>Additional credits</dt>
            <dd>
              <p>
                The images shown in this website were extracted from Pokémon HOME
                by Matt. Additionally, artwork from Bulbapedia is also used.
              </p>
              <p>
                The Pokémon data was compiled and sourced from text dumps
                extracted by Kurt (
                <a href="http://twitter.com/Kaphotics">@Kaphotics</a>).
              </p>
            </dd>
          </dl>
        </section>
      </div>
    </article>
  );
}
