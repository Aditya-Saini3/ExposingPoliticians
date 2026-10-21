import { Link } from 'react-router-dom';
import { useHeadlines, usePoliticians } from '../hooks/useData.js';
import { categoryTotals, pct, tally, toBars, withCases } from '../lib/stats.js';
import Status from '../components/Status.jsx';
import StatCard, { StatGrid } from '../components/StatCard.jsx';
import Section from '../components/Section.jsx';
import BarList from '../components/BarList.jsx';
import PoliticianTable from '../components/PoliticianTable.jsx';
import NewsList from '../components/NewsList.jsx';

export default function Home() {
  const { data, loading, error } = usePoliticians();
  const { data: headlines } = useHeadlines();
  const all = data?.politicians ?? [];
  const accused = withCases(all);
  const serious = all.filter((p) => p.seriousCharges > 0);
  const convicted = all.filter((p) => p.convictedCases > 0);
  const byParty = tally(accused, (p) => p.party);

  return (
    <Status loading={loading} error={error} empty={!all.length}>
      <div className="hero">
        <h1>Who represents you, and what cases do they face?</h1>
        <p>
          Every candidate must declare pending criminal cases in a sworn affidavit to the Election Commission of India.
          This site collects those declarations, sorts them by offence, and links news coverage from credible outlets —
          updated automatically.
        </p>
      </div>

      <StatGrid>
        <StatCard label="Politicians tracked" value={all.length} />
        <StatCard label="Have declared criminal cases" value={accused.length} hint={`${pct(accused.length, all.length)} of all`} tone="warn" />
        <StatCard label="Face serious charges" value={serious.length} hint="murder, crimes against women, corruption…" tone="danger" />
        <StatCard label="Declared convictions" value={convicted.length} tone="danger" />
      </StatGrid>

      <div className="grid-2">
        <Section title="Politicians by offence category" action={<Link to="/categories">All categories →</Link>}>
          <BarList
            items={categoryTotals(all).map((c) => ({ key: c.key, label: c.label, value: c.politicians, color: c.color, to: `/category/${c.key}`, note: `${c.charges} charges` }))}
            limit={8}
          />
        </Section>
        <Section title="Politicians with cases, by party">
          <BarList
            items={toBars(byParty, (party) => ({ to: `/politicians?party=${encodeURIComponent(party)}`, note: pct(byParty[party], all.filter((p) => p.party === party).length) }))}
            limit={8}
          />
        </Section>
      </div>

      <Section title="Most declared cases" action={<Link to="/politicians">See everyone →</Link>}>
        <PoliticianTable politicians={accused.slice(0, 10)} newsCounts={headlines?.counts} />
      </Section>

      <Section title="Latest headlines">
        <NewsList items={headlines?.items?.slice(0, 15)} showPolitician />
      </Section>
    </Status>
  );
}
