// Fetches winners' self-declared criminal records from MyNeta (ADR) and writes
// public/data/politicians.json. Previously fetched records are kept when a
// request fails, so a flaky run never wipes data.
import { readFile, writeFile } from 'node:fs/promises';
import { ELECTIONS, MYNETA_BASE, REQUEST_DELAY_MS } from './config.mjs';
import { fetchText, mapLimit } from './lib/http.mjs';
import { parseCandidateList, parseCandidatePage, summarizeCharges } from './lib/myneta.mjs';

const OUT = new URL('../public/data/politicians.json', import.meta.url);

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    return { politicians: [] };
  }
}

async function fetchElection(election, previous) {
  const base = `${MYNETA_BASE}/${election.slug}`;
  const listUrl = `${base}/index.php?action=show_winners&sort=default`;
  const rows = parseCandidateList(await fetchText(listUrl));
  if (!rows.length) throw new Error(`no candidates parsed from ${listUrl}`);
  console.log(`${election.label}: ${rows.length} winners, ${rows.filter((r) => r.pendingCases).length} with cases`);

  return mapLimit(rows, 3, REQUEST_DELAY_MS, async (row) => {
    const id = `${election.slug}-${row.candidateId}`;
    const sourceUrl = `${base}/candidate.php?candidate_id=${row.candidateId}`;
    const old = previous.get(id);
    const record = {
      id,
      name: row.name,
      party: row.party,
      constituency: row.constituency,
      state: old?.state || '',
      house: election.house,
      election: election.label,
      education: row.education,
      assets: row.assets,
      age: old?.age ?? null,
      pendingCases: row.pendingCases,
      convictedCases: old?.convictedCases ?? 0,
      charges: old?.charges ?? [],
      sourceUrl,
    };
    // Profile pages are only fetched when there is something to read, or the state is still unknown.
    if (row.pendingCases > 0 || !record.state) {
      try {
        const page = parseCandidatePage(await fetchText(sourceUrl));
        Object.assign(record, {
          state: page.state || record.state,
          age: page.age ?? record.age,
          convictedCases: page.convicted,
          charges: page.charges,
        });
      } catch (err) {
        console.warn(`  ! ${row.name}: ${err.message} (keeping previous data)`);
      }
    }
    return { ...record, ...summarizeCharges(record.charges) };
  });
}

const existing = await readExisting();
const previous = new Map(existing.politicians.map((p) => [p.id, p]));
const politicians = [];
const sources = [];

for (const election of ELECTIONS) {
  try {
    politicians.push(...(await fetchElection(election, previous)));
    sources.push({ name: `MyNeta / ADR — ${election.label}`, url: `${MYNETA_BASE}/${election.slug}/` });
  } catch (err) {
    console.error(`${election.label} failed: ${err.message}. Keeping previous records.`);
    politicians.push(...existing.politicians.filter((p) => p.election === election.label));
  }
}

if (!politicians.length) {
  console.error('No data fetched and none cached; leaving file untouched.');
  process.exit(existing.politicians.length ? 0 : 1);
}

politicians.sort((a, b) => b.pendingCases - a.pendingCases || a.name.localeCompare(b.name));
await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), sources, politicians }, null, 1));
console.log(`Wrote ${politicians.length} politicians.`);
