// Maps IPC (Indian Penal Code) and BNS (Bharatiya Nyaya Sanhita, which replaced
// the IPC from 1 July 2024) sections to readable offence categories.
// Shared by the data scripts (Node) and the React app.

export const CATEGORIES = {
  murder: { label: 'Murder', serious: true, color: '#b91c1c' },
  attempt_murder: { label: 'Attempt to murder', serious: true, color: '#dc2626' },
  homicide: { label: 'Culpable homicide', serious: true, color: '#ef4444' },
  women: { label: 'Crimes against women', serious: true, color: '#be185d' },
  kidnapping: { label: 'Kidnapping & abduction', serious: true, color: '#9333ea' },
  robbery: { label: 'Theft, robbery & extortion', serious: true, color: '#7c3aed' },
  hate: { label: 'Hate speech & communal offences', serious: true, color: '#c2410c' },
  corruption: { label: 'Fraud, forgery & corruption', serious: true, color: '#b45309' },
  election: { label: 'Election offences', serious: false, color: '#0369a1' },
  hurt: { label: 'Hurt & assault', serious: false, color: '#ea580c' },
  rioting: { label: 'Rioting & unlawful assembly', serious: false, color: '#d97706' },
  intimidation: { label: 'Intimidation & defamation', serious: false, color: '#4d7c0f' },
  public_order: { label: 'Obstructing public servants', serious: false, color: '#0f766e' },
  other: { label: 'Other offences', serious: false, color: '#64748b' },
};

// [from, to, category] — inclusive numeric ranges, checked in order.
// Specific entries (e.g. "153A") are matched before ranges.
const IPC_EXACT = {
  '153A': 'hate', '153B': 'hate', '295A': 'hate', '298': 'hate', '505': 'hate',
  '304B': 'women', '498A': 'women', '366A': 'women', '366B': 'women',
  '171B': 'election', '171C': 'election', '171D': 'election', '171E': 'election',
  '171F': 'election', '171G': 'election', '171H': 'election', '171I': 'election',
  '307': 'attempt_murder', '308': 'homicide',
};
const IPC_RANGES = [
  [302, 303, 'murder'],
  [304, 304, 'homicide'],
  [354, 354, 'women'], [375, 377, 'women'], [509, 509, 'women'], [366, 366, 'women'],
  [359, 369, 'kidnapping'],
  [379, 382, 'robbery'], [383, 402, 'robbery'],
  [406, 409, 'corruption'], [415, 420, 'corruption'], [463, 477, 'corruption'],
  [141, 160, 'rioting'],
  [319, 338, 'hurt'],
  [499, 506, 'intimidation'],
  [186, 190, 'public_order'], [332, 333, 'hurt'], [353, 353, 'public_order'],
];

const BNS_RANGES = [
  [103, 104, 'murder'],
  [109, 109, 'attempt_murder'],
  [105, 106, 'homicide'], [110, 110, 'homicide'],
  [63, 99, 'women'],
  [137, 144, 'kidnapping'],
  [303, 313, 'robbery'],
  [316, 318, 'corruption'], [335, 344, 'corruption'],
  [169, 177, 'election'],
  [196, 197, 'hate'], [299, 299, 'hate'], [302, 302, 'hate'], [353, 353, 'hate'],
  [189, 195, 'rioting'],
  [114, 125, 'hurt'],
  [351, 357, 'intimidation'],
  [132, 132, 'public_order'], [221, 224, 'public_order'],
];

/** "354A" -> { num: 354, raw: "354A" }; "115(2)" -> { num: 115, raw: "115" } */
export function parseSection(section) {
  const raw = String(section).toUpperCase().replace(/\(.*$/, '').replace(/[^0-9A-Z]/g, '');
  const num = parseInt(raw, 10);
  return { raw, num: Number.isNaN(num) ? null : num };
}

export function categorize(code, section) {
  const { raw, num } = parseSection(section);
  if (num === null) return 'other';
  const isBns = /BNS/i.test(code);
  if (!isBns && IPC_EXACT[raw]) return IPC_EXACT[raw];
  const ranges = isBns ? BNS_RANGES : IPC_RANGES;
  const hit = ranges.find(([from, to]) => num >= from && num <= to);
  return hit ? hit[2] : 'other';
}

export const isSerious = (category) => Boolean(CATEGORIES[category]?.serious);
export const categoryLabel = (category) => CATEGORIES[category]?.label ?? 'Other offences';
