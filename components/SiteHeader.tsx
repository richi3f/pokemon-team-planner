"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getGameNavFromPath, MAIN_NAV } from "@/lib/nav/site-nav";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const game = getGameNavFromPath(pathname);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" className="site-header__brand">
          <span className="site-header__brand-mark" aria-hidden="true">
            PT
          </span>
          <span className="site-header__brand-text">
            <span className="site-header__brand-pokemon">Pokémon</span> Team
            Picker
          </span>
        </Link>

        <button
          type="button"
          className="site-header__menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-primary-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">
            {menuOpen ? "Close menu" : "Open menu"}
          </span>
          <span className="site-header__menu-icon" aria-hidden="true" />
        </button>

        <nav
          id="site-primary-nav"
          className={
            "site-header__nav" + (menuOpen ? " site-header__nav_open" : "")
          }
          aria-label="Main navigation"
        >
          <ul className="site-header__nav-list">
            {MAIN_NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === "/" && item.href.startsWith("/#");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      "site-header__nav-link" +
                      (active ? " site-header__nav-link_active" : "")
                    }
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {game && (
        <nav
          className="site-header__breadcrumb"
          aria-label="Breadcrumb"
        >
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-current="page">{game.name} Team Builder</li>
          </ol>
        </nav>
      )}
    </header>
  );
}
