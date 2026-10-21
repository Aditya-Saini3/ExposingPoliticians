import { Link, useParams } from 'react-router-dom';
import { CATEGORIES } from '../../shared/categories.js';
import { useHeadlines, usePoliticians } from '../hooks/useData.js';
import Status from '../components/Status.jsx';
import PoliticianTable from '../components/PoliticianTable.jsx';

export default function Category() {
  const { key } = useParams();
  const { data, loading, error } = usePoliticians();
  const { data: headlines } = useHeadlines();
  const cat = CATEGORIES[key];
  if (!cat) return <Status error="Unknown category." />;
  const list = (data?.politicians ?? [])
    .filter((p) => p.categories?.[key])
    .sort((a, b) => b.categories[key] - a.categories[key] || b.pendingCases - a.pendingCases);

  return (
    <Status loading={loading} error={error}>
      <p className="crumbs"><Link to="/categories">Categories</Link> / {cat.label}</p>
      <h1 style={{ color: cat.color }}>{cat.label}</h1>
      <p className="muted">{list.length} politicians have declared at least one charge in this category.</p>
      <PoliticianTable politicians={list} countOf={(p) => p.categories[key]} countLabel={`${cat.label} charges`} newsCounts={headlines?.counts} />
      <p className="muted small">
        <Link to={`/politicians?category=${key}`}>Filter this list further →</Link>
      </p>
    </Status>
  );
}
