import { CATEGORIES } from '../../shared/categories.js';

export const withCases = (list) => list.filter((p) => p.pendingCases > 0 || p.convictedCases > 0);

/** Counts things per key; `valueOf` returns a number (or an object of key -> number). */
export function tally(list, keyOf, valueOf = () => 1) {
  const out = {};
  for (const item of list) {
    const key = keyOf(item);
    if (key) out[key] = (out[key] || 0) + valueOf(item);
  }
  return out;
}

export function categoryTotals(list) {
  const totals = {};
  for (const p of list) {
    for (const [cat, n] of Object.entries(p.categories || {})) {
      totals[cat] ??= { charges: 0, politicians: 0 };
      totals[cat].charges += n;
      totals[cat].politicians += 1;
    }
  }
  return Object.keys(CATEGORIES)
    .filter((k) => totals[k])
    .map((k) => ({ key: k, ...CATEGORIES[k], ...totals[k] }))
    .sort((a, b) => b.politicians - a.politicians);
}

export const toBars = (counts, extra = () => ({})) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ key: label, label, value, ...extra(label) }));

export const unique = (list, key) => [...new Set(list.map((p) => p[key]).filter(Boolean))].sort();

export const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '—');

export const formatDate = (iso, opts = { dateStyle: 'medium' }) =>
  iso ? new Intl.DateTimeFormat('en-IN', opts).format(new Date(iso)) : '—';
