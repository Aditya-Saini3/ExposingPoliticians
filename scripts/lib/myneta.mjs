// Parsers for myneta.info (Association for Democratic Reforms), which publishes
// the sworn affidavits candidates file with the Election Commission of India.
// Parsing relies on link patterns and text, not CSS classes, to survive
// layout changes.
import * as cheerio from 'cheerio';
import { categorize, isSerious } from '../../shared/categories.js';

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const toNumber = (s) => {
  const n = parseInt(String(s).replace(/[^\d]/g, ''), 10);
  return Number.isNaN(n) ? 0 : n;
};

export function titleCase(name) {
  const s = clean(name);
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s.(-])([a-z])/g, (_, p, c) => p + c.toUpperCase());
}

/**
 * Parses a winners/candidates list page. Finds the table whose rows link to
 * candidate.php and reads columns by header name.
 */
export function parseCandidateList(html) {
  const $ = cheerio.load(html);
  const table = $('table')
    .filter((_, t) => $(t).find('a[href*="candidate.php?candidate_id="]').length > 0)
    .last();
  if (!table.length) return [];

  const headers = table.find('tr').first().find('th,td').map((_, c) => clean($(c).text()).toLowerCase()).get();
  const col = (re) => headers.findIndex((h) => re.test(h));
  const idx = {
    constituency: col(/constituency/),
    party: col(/party/),
    cases: col(/criminal/),
    education: col(/education/),
    assets: col(/total assets|assets/),
  };

  const rows = [];
  table.find('tr').each((_, tr) => {
    const link = $(tr).find('a[href*="candidate.php?candidate_id="]').first();
    if (!link.length) return;
    const cells = $(tr).find('td');
    const cell = (i) => (i >= 0 ? clean(cells.eq(i).text()) : '');
    const id = (link.attr('href').match(/candidate_id=(\d+)/) || [])[1];
    rows.push({
      candidateId: id,
      name: titleCase(link.text()),
      constituency: titleCase(cell(idx.constituency)),
      party: cell(idx.party),
      pendingCases: toNumber(cell(idx.cases)),
      education: cell(idx.education),
      assets: cell(idx.assets).replace(/~.*$/, '').trim(),
    });
  });
  return rows;
}

const CHARGE_RE = /(\d+)\s+charges?\s+related\s+to\s+(.+?)\s*\(\s*(IPC|BNS)\s*Section[-\s]*([0-9]+[A-Z]*(?:\(\d+\))?)\s*\)/gi;

/** Parses "Brief Details of IPC/BNS" style lines out of a candidate page. */
export function parseCharges(text) {
  const byKey = new Map();
  for (const m of clean(text).matchAll(CHARGE_RE)) {
    const [, count, description, code, section] = m;
    const category = categorize(code, section);
    const key = `${code}-${section}-${description}`.toUpperCase();
    // The same summary can appear more than once on a page; keep the largest count.
    if (byKey.has(key) && byKey.get(key).count >= parseInt(count, 10)) continue;
    byKey.set(key, {
      count: parseInt(count, 10),
      description: clean(description),
      code: code.toUpperCase(),
      section: section.toUpperCase(),
      category,
      serious: isSerious(category),
    });
  }
  return [...byKey.values()];
}

/**
 * Finds the first table after a heading matching `re` (in document order) and
 * counts rows whose first cell is a serial number. Returns null if not found.
 */
function countCaseRows($, re) {
  const nodes = $('body *').toArray();
  const start = nodes.findIndex((el) => {
    const own = clean($(el).contents().filter((_, n) => n.type === 'text').text());
    return re.test(own);
  });
  if (start < 0) return null;
  const table = nodes.slice(start + 1).find((el) => el.tagName === 'table');
  if (!table || /no cases/i.test(clean($(table).text()).slice(0, 300))) return 0;
  return $(table).find('tr').filter((_, tr) => /^\d+$/.test(clean($(tr).find('td').first().text()))).length;
}

/** Parses a candidate.php page into profile details and charges. */
export function parseCandidatePage(html) {
  const $ = cheerio.load(html);
  $('script,style').remove();
  const text = clean($('body').text());

  const heading = clean($('h5').first().text()); // e.g. "BIJNOR (UTTAR PRADESH)"
  const state = titleCase((heading.match(/\(([^)]+)\)\s*$/) || [])[1] || '');
  const age = toNumber((text.match(/Age\s*:\s*(\d{2,3})/i) || [])[1] || '') || null;

  const convicted = countCaseRows($, /cases where convicted/i) ?? 0;
  const pending = countCaseRows($, /cases where pending|cases where accused/i);

  return { state, age, convicted, pending, charges: parseCharges(text) };
}

export function summarizeCharges(charges) {
  const categories = {};
  let seriousCharges = 0;
  let totalCharges = 0;
  for (const c of charges) {
    categories[c.category] = (categories[c.category] || 0) + c.count;
    totalCharges += c.count;
    if (c.serious) seriousCharges += c.count;
  }
  return { categories, seriousCharges, totalCharges };
}
