import type { Metadata } from "next";
import "sanitize.css";
import "sanitize.css/typography.css";
import "@/styles/globals.css";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Pokémon Team Builder & Maker – Free Team Planner",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free Pokémon team builder, maker, and planner for every mainline game. Pick your team and analyze type matchups for in-game playthroughs.",
  applicationName: SITE_NAME,
  authors: [{ name: "richi3f", url: "https://github.com/richi3f/pokemon-team-planner" }],
  creator: "richi3f",
  publisher: SITE_NAME,
  category: "games",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: "Pokémon Team Builder & Maker – Free Team Planner",
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" className="site-main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
