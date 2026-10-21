import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
const text = (v) => (typeof v === 'object' && v !== null ? v['#text'] ?? '' : v ?? '');
const clean = (s) => String(s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/** Parses RSS 2.0 or Atom into [{ title, link, source, pubDate }]. */
export function parseFeed(xml, fallbackSource = '') {
  const doc = parser.parse(xml);
  const channel = doc.rss?.channel;
  const raw = channel ? channel.item : doc.feed?.entry;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const feedTitle = clean(text(channel?.title ?? doc.feed?.title ?? fallbackSource));

  return items
    .map((it) => {
      let title = clean(text(it.title));
      let source = clean(text(it.source)) || feedTitle;
      // Google News appends " - Source Name" to titles.
      if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
      const link = typeof it.link === 'object' ? it.link.href : text(it.link);
      const date = new Date(text(it.pubDate ?? it.published ?? it.updated));
      return {
        title,
        link: String(link).trim(),
        source,
        pubDate: Number.isNaN(date.getTime()) ? null : date.toISOString(),
      };
    })
    .filter((it) => it.title && /^https?:\/\//.test(it.link));
}

const normSource = (s) => s.toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Source must equal an allowlisted outlet or start with it ("NDTV" covers "NDTV Profit"). */
export const isCredible = (source, allowlist) => {
  const s = normSource(source);
  return allowlist.some((a) => {
    const n = normSource(a);
    return s === n || s.startsWith(`${n} `);
  });
};

const keywordRe = (k) => {
  const esc = k.replace(/\*$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Short acronyms such as "ED" are only meaningful in capitals.
  const flags = /^[A-Z]{2,4}$/.test(k) ? '' : 'i';
  return new RegExp(k.endsWith('*') ? `\\b${esc}` : `\\b${esc}s?\\b`, flags);
};

export const matchedKeywords = (title, keywords) =>
  keywords.filter((k) => keywordRe(k).test(title)).map((k) => k.replace(/\*$/, '').toLowerCase());

/** True when the title mentions the full name, or first + last name tokens. */
export function mentionsName(title, name) {
  const t = title.toLowerCase();
  const n = name.toLowerCase().replace(/^(dr|adv|shri|smt)\.?\s+/, '');
  if (t.includes(n)) return true;
  const parts = n.split(/\s+/).filter((p) => p.length > 2);
  return parts.length >= 2 && t.includes(parts[0]) && t.includes(parts[parts.length - 1]);
}

/** Merges new items into old ones, dedupes by link/title, newest first. */
export function mergeItems(oldItems, newItems, max) {
  const seen = new Set();
  return [...newItems, ...oldItems]
    .filter((it) => {
      const key = it.link || it.title.toLowerCase();
      const tkey = it.title.toLowerCase();
      if (seen.has(key) || seen.has(tkey)) return false;
      seen.add(key);
      seen.add(tkey);
      return true;
    })
    .sort((a, b) => (b.pubDate || '').localeCompare(a.pubDate || ''))
    .slice(0, max);
}
