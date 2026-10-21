import { describe, expect, it } from 'vitest';
import { categorize } from '../../shared/categories.js';
import { parseCandidateList, parseCandidatePage, parseCharges, summarizeCharges, titleCase } from '../lib/myneta.mjs';
import { isCredible, matchedKeywords, mentionsName, mergeItems, parseFeed } from '../lib/rss.mjs';
import { CREDIBLE_SOURCES, LEGAL_KEYWORDS } from '../config.mjs';

describe('categorize', () => {
  it.each([
    ['IPC', '302', 'murder'], ['IPC', '307', 'attempt_murder'], ['IPC', '376', 'women'],
    ['IPC', '354A', 'women'], ['IPC', '498A', 'women'], ['IPC', '363', 'kidnapping'],
    ['IPC', '153A', 'hate'], ['IPC', '153', 'rioting'], ['IPC', '420', 'corruption'],
    ['IPC', '171E', 'election'], ['IPC', '323', 'hurt'], ['IPC', '506', 'intimidation'],
    ['IPC', '188', 'public_order'], ['IPC', '304B', 'women'], ['IPC', '9999', 'other'],
    ['BNS', '103(1)', 'murder'], ['BNS', '109', 'attempt_murder'], ['BNS', '115(2)', 'hurt'],
    ['BNS', '318(4)', 'corruption'], ['BNS', '196', 'hate'],
  ])('%s %s -> %s', (code, section, expected) => {
    expect(categorize(code, section)).toBe(expected);
  });
});

const LIST_HTML = `<html><body><table><tr><td>menu</td></tr></table>
<table>
<tr><th>Sno</th><th>Candidate</th><th>Constituency</th><th>Party</th><th>Criminal Case</th><th>Education</th><th>Total Assets</th><th>Liabilities</th></tr>
<tr><td>1</td><td><a href="candidate.php?candidate_id=101">JOHN DOE</a></td><td>SAMPLE NORTH</td><td>ABC</td><td><span>3</span></td><td>Graduate</td><td>Rs 1,00,00,000 ~ 1 Crore+</td><td>Rs 0</td></tr>
<tr><td>2</td><td><a href="candidate.php?candidate_id=102">Jane Roe</a></td><td>SAMPLE SOUTH</td><td>XYZ</td><td>0</td><td>Post Graduate</td><td>Rs 5,00,000 ~ 5 Lacs+</td><td>Rs 0</td></tr>
</table></body></html>`;

const CANDIDATE_HTML = `<html><body>
<h2>JOHN DOE</h2><h5>SAMPLE NORTH (UTTAR PRADESH)</h5>
<div>Party: ABC</div><div>Age: 52</div>
<h3>Crime-O-Meter</h3>
<div>Cases where Pending</div>
<table><tr><th>Serial No.</th><th>FIR No.</th><th>IPC Sections</th></tr>
<tr><td>1</td><td>12/2019</td><td>302, 323</td></tr>
<tr><td>2</td><td>44/2021</td><td>420</td></tr>
<tr><td>3</td><td>5/2023</td><td>506</td></tr></table>
<div>Cases where convicted</div>
<table><tr><td>No Cases</td></tr></table>
<h3>Brief Details of IPC</h3>
<ul><li>1 charges related to Punishment for murder (IPC Section-302)</li>
<li>2 charges related to Punishment for voluntarily causing hurt (IPC Section-323)</li>
<li>1 charges related to Cheating and dishonestly inducing delivery of property (IPC Section-420)</li>
<li>1 charges related to Punishment for criminal intimidation (BNS Section-351(2))</li></ul>
</body></html>`;

describe('MyNeta parsers', () => {
  it('parses the winners list by header names', () => {
    const rows = parseCandidateList(LIST_HTML);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      candidateId: '101', name: 'John Doe', constituency: 'Sample North', party: 'ABC', pendingCases: 3, assets: 'Rs 1,00,00,000',
    });
    expect(rows[1]).toMatchObject({ name: 'Jane Roe', pendingCases: 0 });
  });

  it('parses a candidate page', () => {
    const page = parseCandidatePage(CANDIDATE_HTML);
    expect(page).toMatchObject({ state: 'Uttar Pradesh', age: 52, convicted: 0, pending: 3 });
    expect(page.charges.map((c) => [c.count, c.code, c.section, c.category])).toEqual([
      [1, 'IPC', '302', 'murder'], [2, 'IPC', '323', 'hurt'], [1, 'IPC', '420', 'corruption'], [1, 'BNS', '351(2)', 'intimidation'],
    ]);
    expect(summarizeCharges(page.charges)).toEqual({
      categories: { murder: 1, hurt: 2, corruption: 1, intimidation: 1 }, seriousCharges: 2, totalCharges: 5,
    });
  });

  it('dedupes repeated charge summaries', () => {
    const line = '1 charges related to Theft (IPC Section-379) ';
    expect(parseCharges(line + line)).toHaveLength(1);
  });

  it('title-cases only all-caps names', () => {
    expect(titleCase('RAM KUMAR SINGH')).toBe('Ram Kumar Singh');
    expect(titleCase('Dr. McLeod')).toBe('Dr. McLeod');
  });
});

const RSS = `<?xml version="1.0"?><rss><channel><title>Google News</title>
<item><title>FIR filed against John Doe in land case - The Hindu</title><link>https://news.example/a</link>
<pubDate>Mon, 01 Jan 2024 10:00:00 GMT</pubDate><source url="https://thehindu.com">The Hindu</source></item>
<item><title>John Doe inaugurates bridge - Random Blog</title><link>https://news.example/b</link>
<pubDate>Tue, 02 Jan 2024 10:00:00 GMT</pubDate><source url="https://x">Random Blog</source></item>
</channel></rss>`;

describe('RSS helpers', () => {
  it('parses Google News items and strips the source suffix', () => {
    const items = parseFeed(RSS);
    expect(items[0]).toEqual({
      title: 'FIR filed against John Doe in land case', link: 'https://news.example/a', source: 'The Hindu', pubDate: '2024-01-01T10:00:00.000Z',
    });
  });

  it('keeps only credible outlets', () => {
    expect(isCredible('The Hindu', CREDIBLE_SOURCES)).toBe(true);
    expect(isCredible('NDTV Profit', CREDIBLE_SOURCES)).toBe(true);
    expect(isCredible('Random Blog', CREDIBLE_SOURCES)).toBe(false);
    expect(isCredible('Organiser', CREDIBLE_SOURCES)).toBe(false);
  });

  it('matches legal keywords as whole words', () => {
    expect(matchedKeywords('FIR filed against MP in land case', LEGAL_KEYWORDS)).toEqual(['case', 'fir']);
    expect(matchedKeywords('MP visits first school, booked a hall', LEGAL_KEYWORDS)).toEqual(['booked']);
    expect(matchedKeywords('Minister launched scheme', LEGAL_KEYWORDS)).toEqual([]);
    expect(matchedKeywords('ED raids premises', LEGAL_KEYWORDS)).toEqual(['ed', 'raid']);
  });

  it('matches names', () => {
    expect(mentionsName('Court summons John Doe', 'John Doe')).toBe(true);
    expect(mentionsName('Court summons John K. Doe', 'John Kumar Doe')).toBe(true);
    expect(mentionsName('Court summons John Smith', 'John Doe')).toBe(false);
  });

  it('merges, dedupes and sorts newest first', () => {
    const a = { title: 'A', link: 'https://x/a', pubDate: '2024-01-01' };
    const b = { title: 'B', link: 'https://x/b', pubDate: '2024-02-01' };
    expect(mergeItems([a], [b, a], 10)).toEqual([b, a]);
  });
});
