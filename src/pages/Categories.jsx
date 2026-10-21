import { usePoliticians } from '../hooks/useData.js';
import { categoryTotals } from '../lib/stats.js';
import Status from '../components/Status.jsx';
import Section from '../components/Section.jsx';
import BarList from '../components/BarList.jsx';

export default function Categories() {
  const { data, loading, error } = usePoliticians();
  const totals = categoryTotals(data?.politicians ?? []);
  const bars = (list) => list.map((c) => ({ key: c.key, label: c.label, value: c.politicians, color: c.color, to: `/category/${c.key}`, note: `${c.charges} charges` }));

  return (
    <Status loading={loading} error={error} empty={!data?.politicians.length}>
      <h1>Offence categories</h1>
      <p className="muted">
        Charges are grouped by the IPC / BNS section cited in the affidavit. Bars show how many politicians face at least one
        charge in each category.
      </p>
      <div className="grid-2">
        <Section title="Serious offences"><BarList items={bars(totals.filter((c) => c.serious))} /></Section>
        <Section title="Other offences"><BarList items={bars(totals.filter((c) => !c.serious))} /></Section>
      </div>
    </Status>
  );
}
