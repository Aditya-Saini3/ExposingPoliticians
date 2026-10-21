// Data sources for the update scripts. Add more MyNeta elections (state
// assemblies, Rajya Sabha) by appending to ELECTIONS — the slug is the path
// segment on myneta.info, e.g. https://myneta.info/Maharashtra2024/
export const ELECTIONS = [
  { slug: 'LokSabha2024', house: 'Lok Sabha', label: 'Lok Sabha 2024' },
  // { slug: 'Maharashtra2024', house: 'Maharashtra Vidhan Sabha', label: 'Maharashtra 2024' },
  // { slug: 'Delhi2025', house: 'Delhi Vidhan Sabha', label: 'Delhi 2025' },
];

export const MYNETA_BASE = 'https://myneta.info';

// Only headlines from these outlets are kept as evidence. Matched
// case-insensitively against the <source> name Google News reports.
export const CREDIBLE_SOURCES = [
  'The Hindu', 'The Indian Express', 'Indian Express', 'Hindustan Times', 'The Times of India',
  'Times of India', 'NDTV', 'India Today', 'Deccan Herald', 'The Economic Times', 'Economic Times',
  'Mint', 'Livemint', 'Business Standard', 'Scroll.in', 'Scroll', 'The Wire', 'The Print', 'ThePrint',
  'LiveLaw', 'Live Law', 'Bar & Bench', 'Bar and Bench', 'PTI', 'Press Trust of India', 'ANI',
  'The Quint', 'News18', 'Frontline', 'The Telegraph', 'Deccan Chronicle', 'The Tribune',
  'The New Indian Express', 'New Indian Express', 'Newslaundry', 'Reuters', 'BBC', 'Outlook',
  'Firstpost', 'The Statesman', 'Moneycontrol', 'Free Press Journal', 'The Federal', 'Down To Earth',
];

// Legal / criminal-justice terms. A headline must contain at least one.
// Matched as whole words (plural "s" allowed); a trailing * matches a stem.
export const LEGAL_KEYWORDS = [
  'case', 'fir', 'chargesheet', 'charge sheet', 'court', 'arrest*', 'bail', 'accused', 'convict*',
  'acquit*', 'sentenc*', 'jail*', 'ED', 'CBI', 'raid*', 'probe*', 'scam', 'police', 'summon*',
  'high court', 'supreme court', 'verdict', 'warrant', 'custody', 'money laundering', 'PMLA',
  'corruption', 'brib*', 'murder*', 'assault*', 'complaint', 'booked', 'investigat*', 'trial',
  'Lokayukta', 'vigilance', 'disproportionate assets',
];

// General legal/political feeds scanned for any tracked politician's name.
export const GENERAL_FEEDS = [
  'https://www.livelaw.in/category/top-stories/google_feeds.xml',
  'https://www.barandbench.com/feed',
  'https://www.thehindu.com/news/national/feeder/default.rss',
  'https://indianexpress.com/section/india/politics/feed/',
];

export const googleNewsUrl = (name) => {
  const q = `"${name}" (FIR OR case OR court OR chargesheet OR arrested OR ED OR CBI OR bail)`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
};

export const MAX_NEWS_PER_POLITICIAN = 60;
export const REQUEST_DELAY_MS = 1200;
