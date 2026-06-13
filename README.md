# Pokémon Team Picker

Free **Pokémon team builder**, maker, and planner for every mainline game.  
Live at **[pokemonteampicker.com](https://pokemonteampicker.com)**.

Built with **Next.js 15** and statically exported for Cloudflare Pages.

## Development

```bash
cp .env.example .env.local   # optional — defaults to pokemonteampicker.com
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Static files are written to `out/`. Preview locally:

```bash
npx serve out
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for sitemap, Open Graph, and JSON-LD (default: `https://pokemonteampicker.com`) |

## Deploy (Cloudflare Pages)

1. Connect the GitHub repo in Cloudflare Pages.
2. **Build command:** `npm run build`
3. **Output directory:** `out`
4. **Environment variable:** `NEXT_PUBLIC_SITE_URL` = `https://pokemonteampicker.com`
5. Add custom domain **pokemonteampicker.com** in Pages → Custom domains.

## SEO

Target keywords: *pokemon team builder*, *pokemon team maker*, *pokemon team planner*.

- Per-page titles, descriptions, and canonical URLs
- Open Graph & Twitter cards
- JSON-LD: WebSite, WebApplication, BreadcrumbList (FAQ shown in HTML only; no FAQPage schema)
- `sitemap.xml` and `robots.txt` generated at build time

## Project structure

```
app/              Next.js App Router pages
components/       UI components (planner, game picker, …)
hooks/            Client hooks (team state, URL sync)
lib/data/         Game & Pokémon data (TypeScript)
lib/seo/          Metadata, JSON-LD, site config
lib/planner/      Planner-specific logic
public/img/       Static assets (sprites, logos, type icons)
styles/           Global CSS
```

## Contribute

Please [open an issue](https://github.com/geekskai/pokemon-team-planner/issues/new/choose) to report a bug or leave feedback.

Pokémon is © Nintendo, 1995–2026.
