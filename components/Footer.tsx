import Link from "next/link";
import {
  getPopularGameLinks,
  MAIN_NAV,
  SITE_TAGLINE,
  SUPPORT_LINKS,
} from "@/lib/nav/site-nav";
import { SITE_NAME } from "@/lib/seo/site";

export function Footer() {
  const popularGames = getPopularGameLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__section" aria-labelledby="footer-brand">
            <h2 id="footer-brand" className="site-footer__heading">
              {SITE_NAME}
            </h2>
            <p className="site-footer__text">{SITE_TAGLINE}</p>
            <p className="site-footer__text site-footer__text_muted">
              A free in-game Pokémon team builder, maker, and planner for
              mainline games. Not affiliated with Nintendo or The Pokémon
              Company.
            </p>
          </section>

          <section className="site-footer__section" aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="site-footer__heading">
              Explore
            </h2>
            <ul className="site-footer__links">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="site-footer__section"
            aria-labelledby="footer-popular-games"
          >
            <h2 id="footer-popular-games" className="site-footer__heading">
              Popular Games
            </h2>
            <ul className="site-footer__links">
              {popularGames.map((game) => (
                <li key={game.slug}>
                  <Link href={game.href}>{game.name} Team Builder</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="site-footer__section" aria-labelledby="footer-support">
            <h2 id="footer-support" className="site-footer__heading">
              Support
            </h2>
            <ul className="site-footer__links">
              <li>
                <a href={SUPPORT_LINKS.github}>Report a Bug</a>
              </li>
              {/* <li>
                <a href={SUPPORT_LINKS.donate}>Donate via PayPal</a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_LINKS.email}`}>
                  {SUPPORT_LINKS.email}
                </a>
              </li> */}
            </ul>
          </section>
        </div>

        <div className="site-footer__bottom">
          <p>
            ©{" "}
            <a href="https://github.com/richi3f/pokemon-team-planner">richi3f</a>,{" "}
            2016–{year}
          </p>
          <p>
            Pokémon and Nintendo character names are trademarks of Nintendo.
            Pokémon is © Nintendo, 1995–{year}.
          </p>
        </div>
      </div>
    </footer>
  );
}
