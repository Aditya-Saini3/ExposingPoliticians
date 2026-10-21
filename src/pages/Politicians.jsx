import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../../shared/categories.js';
import { useHeadlines, usePoliticians } from '../hooks/useData.js';
import { unique } from '../lib/stats.js';
import Status from '../components/Status.jsx';
import Section from '../components/Section.jsx';
import PoliticianTable from '../components/PoliticianTable.jsx';

const SORTS = {
  cases: (a, b) => b.pendingCases - a.pendingCases,
  serious: (a, b) => b.seriousCharges - a.seriousCharges,
  charges: (a, b) => b.totalCharges - a.totalCharges,
  name: (a, b) => a.name.localeCompare(b.name),
};

export default function Politicians() {
  const { data, loading, error } = usePoliticians();
  const { data: headlines } = useHeadlines();
  const [params, setParams] = useSearchParams();
  const all = data?.politicians ?? [];
  const f = Object.fromEntries(['q', 'party', 'state', 'house', 'category', 'only', 'sort'].map((k) => [k, params.get(k) ?? '']));
  const set = (key) => (e) => {
    const next = new URLSearchParams(params);
    const v = e.target.type === 'checkbox' ? (e.target.checked ? '1' : '') : e.target.value;
    v ? next.set(key, v) : next.delete(key);
    setParams(next, { replace: true });
  };

  const options = useMemo(() => ({ party: unique(all, 'party'), state: unique(all, 'state'), house: unique(all, 'house') }), [all]);
  const list = useMemo(() => {
    const q = f.q.toLowerCase();
    return all
      .filter((p) => !q || `${p.name} ${p.constituency} ${p.party}`.toLowerCase().includes(q))
      .filter((p) => (!f.party || p.party === f.party) && (!f.state || p.state === f.state) && (!f.house || p.house === f.house))
      .filter((p) => !f.category || p.categories?.[f.category])
      .filter((p) => !f.only || p.pendingCases > 0 || p.convictedCases > 0)
      .sort(SORTS[f.sort] || SORTS.cases);
  }, [all, f.q, f.party, f.state, f.house, f.category, f.only, f.sort]);

  const select = (key, label, values, labelOf = (v) => v) => (
    <label>
      {label}
      <select value={f[key]} onChange={set(key)}>
        <option value="">All</option>
        {values.map((v) => <option key={v} value={v}>{labelOf(v)}</option>)}
      </select>
    </label>
  );

  return (
    <Status loading={loading} error={error} empty={!all.length}>
      <h1>Politicians</h1>
      <Section className="filters">
        <label className="grow">
          Search
          <input type="search" placeholder="Name, constituency or party" value={f.q} onChange={set('q')} />
        </label>
        {select('party', 'Party', options.party)}
        {select('state', 'State', options.state)}
        {options.house.length > 1 && select('house', 'House', options.house)}
        {select('category', 'Offence', Object.keys(CATEGORIES), (k) => CATEGORIES[k].label)}
        <label>
          Sort by
          <select value={f.sort} onChange={set('sort')}>
            <option value="cases">Pending cases</option>
            <option value="serious">Serious charges</option>
            <option value="charges">Total charges</option>
            <option value="name">Name</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={!!f.only} onChange={set('only')} /> Only with cases
        </label>
      </Section>
      <p className="muted">{list.length} of {all.length} shown</p>
      <PoliticianTable politicians={list} newsCounts={headlines?.counts} />
    </Status>
  );
}
