# Neta Records — Exposing Politicians

A self-updating React site that lists the criminal cases Indian politicians have declared in their sworn election
affidavits, groups the charges by offence category, and links news coverage from credible outlets as supporting evidence.
Every politician gets their own page.

## Data sources

| What | Source | Refresh |
| --- | --- | --- |
| Pending cases, charges (IPC/BNS sections), convictions, party, constituency, assets | Form 26 affidavits filed with the Election Commission of India, digitised by ADR on [myneta.info](https://myneta.info) | Weekly |
| News headlines | Google News RSS (per politician, filtered to an allowlist of established outlets) plus LiveLaw, Bar & Bench, The Hindu and Indian Express RSS feeds | Daily |

Headlines accumulate across runs (up to 60 per politician), so older coverage stays on record.

## How it works

```
scripts/fetch-affidavits.mjs  ─┐                         ┌─> public/data/politicians.json
scripts/fetch-news.mjs        ─┴─ GitHub Action (cron) ──┼─> public/data/news/<id>.json
                                                         └─> public/data/headlines.json
                                   → commit → vite build → GitHub Pages
```

The React app fetches the JSON at runtime, so a data refresh needs no code change. Failed requests keep the previous data
instead of wiping it.

- `shared/categories.js` — IPC/BNS section → category mapping (murder, crimes against women, corruption, hate speech, …), used by both the scripts and the UI.
- `scripts/config.mjs` — which elections to track, the credible-outlet allowlist, legal keywords and RSS feeds.
- `src/components/` — small reusable pieces (`BarList`, `StatCard`, `PoliticianTable`, `NewsList`, `CategoryBadge`, `Section`, `Status`).
- `src/pages/` — Overview, Politicians (search + filters), Politician detail, Categories, Category detail, Sources & method.

## Running locally

```bash
npm install
npm run update-data   # scrape MyNeta + RSS feeds (takes several minutes)
npm run dev
npm test              # parser and categorisation tests
```

## Deploying

1. Push to `main`.
2. In **Settings → Pages**, set *Source* to **GitHub Actions**.
3. The *Update data & deploy* workflow fetches data on first run, then refreshes news daily and affidavits weekly. Run it
   manually from the **Actions** tab any time.

To track state assemblies, add their MyNeta slug (e.g. `Maharashtra2024`) to `ELECTIONS` in `scripts/config.mjs`.

## Responsible use

Pending cases are allegations, not convictions, and many relate to protests or are politically motivated. Data is
self-declared and may be outdated. News matching is automated and can pick up people with the same name. The site says
this on every page; keep it that way. Corrections: open an issue with a link to the correcting source.
