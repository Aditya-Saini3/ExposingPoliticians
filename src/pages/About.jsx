import { usePoliticians } from '../hooks/useData.js';
import { formatDate } from '../lib/stats.js';
import Section from '../components/Section.jsx';
import { CATEGORIES } from '../../shared/categories.js';

export default function About() {
  const { data } = usePoliticians();
  return (
    <>
      <h1>Sources &amp; method</h1>
      <Section title="Where the data comes from">
        <ul>
          <li>
            <strong>Criminal cases</strong> — the self-sworn affidavits (Form 26) every candidate files with the{' '}
            <a href="https://affidavit.eci.gov.in" target="_blank" rel="noopener noreferrer">Election Commission of India</a>,
            as digitised by the <a href="https://adrindia.org" target="_blank" rel="noopener noreferrer">Association for Democratic Reforms</a> on{' '}
            <a href="https://myneta.info" target="_blank" rel="noopener noreferrer">MyNeta</a>.
          </li>
          <li>
            <strong>News coverage</strong> — Google News RSS searches for each politician with declared cases, plus the RSS feeds
            of LiveLaw, Bar &amp; Bench, The Hindu and The Indian Express. Only headlines from an allowlist of established outlets
            that mention the politician's name and a legal term are kept.
          </li>
        </ul>
        {data?.sources?.length > 0 && (
          <p className="muted">
            Last run {formatDate(data.generatedAt, { dateStyle: 'medium', timeStyle: 'short' })}:{' '}
            {data.sources.map((s, i) => <span key={s.url}>{i > 0 && ', '}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></span>)}
          </p>
        )}
      </Section>
      <Section title="How it updates">
        <p>
          A scheduled GitHub Action re-reads the affidavit data weekly and the news feeds daily, commits the refreshed JSON and
          redeploys the site. Headlines accumulate over time, so older coverage stays on each politician's page.
        </p>
      </Section>
      <Section title="Categories">
        <p>
          Each charge is mapped from its IPC section (or BNS section, for cases registered after 1 July 2024) to one category.
          Categories marked serious (murder, attempt to murder, culpable homicide, crimes against women, kidnapping,
          theft/robbery/extortion, hate speech, fraud and corruption) broadly follow ADR's idea of serious offences, but the
          mapping is section-based, so counts can differ from ADR's published figures.
        </p>
        <p>{Object.values(CATEGORIES).map((c) => c.label).join(' · ')}</p>
      </Section>
      <Section title="Read this before sharing">
        <ul>
          <li>A pending case is an allegation. Many are politically motivated or relate to protests. Nobody is guilty until a court says so.</li>
          <li>Data is self-declared and may be outdated; cases may have been closed, quashed or added since the affidavit was filed.</li>
          <li>News matching is automated and may show stories about a different person with the same name.</li>
          <li>Spotted an error? Open an issue on the project's GitHub repository with a link to the correcting source.</li>
        </ul>
      </Section>
    </>
  );
}
