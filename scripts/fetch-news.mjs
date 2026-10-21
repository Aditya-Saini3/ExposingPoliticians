// Collects news headlines about legal proceedings against each tracked
// politician from Google News RSS and general legal/news feeds. Only credible
// outlets are kept, and headlines accumulate across runs so older coverage is
// preserved as a record.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import {
  CREDIBLE_SOURCES, GENERAL_FEEDS, LEGAL_KEYWORDS, MAX_NEWS_PER_POLITICIAN, REQUEST_DELAY_MS, googleNewsUrl,
} from './config.mjs';
import { fetchText, mapLimit } from './lib/http.mjs';
import { isCredible, matchedKeywords, mentionsName, mergeItems, parseFeed } from './lib/rss.mjs';

const DATA = new URL('../public/data/', import.meta.url);
const NEWS = new URL('news/', DATA);
const readJson = async (url, fallback) => JSON.parse(await readFile(url, 'utf8').catch(() => JSON.stringify(fallback)));

const { politicians } = await readJson(new URL('politicians.json', DATA), { politicians: [] });
if (!politicians.length) {
  console.log('No politicians yet — run fetch:affidavits first.');
  process.exit(0);
}
await mkdir(NEWS, { recursive: true });

const relevant = (item, name) =>
  mentionsName(item.title, name) && matchedKeywords(item.title, LEGAL_KEYWORDS).length > 0;
const tag = (item) => ({ ...item, tags: matchedKeywords(item.title, LEGAL_KEYWORDS).slice(0, 4) });

// General feeds are fetched once and scanned for every name.
const general = (
  await Promise.all(GENERAL_FEEDS.map((u) => fetchText(u).then((x) => parseFeed(x, new URL(u).hostname)).catch((e) => {
    console.warn(`feed failed: ${e.message}`);
    return [];
  })))
).flat();
console.log(`General feeds: ${general.length} items`);

// Google News is queried per politician with declared cases (others are only matched against general feeds).
const targets = politicians.filter((p) => p.pendingCases > 0 || p.convictedCases > 0);
const counts = {};
const latest = [];

await mapLimit(politicians, 2, 0, async (p) => {
  let found = general.filter((it) => relevant(it, p.name));
  if (targets.includes(p)) {
    try {
      const items = parseFeed(await fetchText(googleNewsUrl(p.name)));
      found = found.concat(items.filter((it) => isCredible(it.source, CREDIBLE_SOURCES) && relevant(it, p.name)));
    } catch (err) {
      console.warn(`  ! ${p.name}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
  }
  const file = new URL(`${p.id}.json`, NEWS);
  const old = await readJson(file, { items: [] });
  const items = mergeItems(old.items, found.map(tag), MAX_NEWS_PER_POLITICIAN);
  if (!items.length) return;
  await writeFile(file, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 1));
  counts[p.id] = items.length;
  latest.push(...items.slice(0, 3).map((it) => ({ ...it, politicianId: p.id, politicianName: p.name })));
});

const headlines = mergeItems([], latest, 80);
await writeFile(new URL('headlines.json', DATA), JSON.stringify({ updatedAt: new Date().toISOString(), counts, items: headlines }, null, 1));
console.log(`News saved for ${Object.keys(counts).length} politicians.`);
