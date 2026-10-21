import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../shared/categories.js';

export default function CategoryBadge({ category, count }) {
  const c = CATEGORIES[category] ?? CATEGORIES.other;
  return (
    <Link to={`/category/${category}`} className="badge" style={{ '--c': c.color }} title={c.serious ? 'Serious offence' : ''}>
      {c.label}{count ? ` · ${count}` : ''}
    </Link>
  );
}

export const CategoryBadges = ({ categories = {}, limit = 3 }) => {
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  return (
    <span className="badges">
      {entries.slice(0, limit).map(([k, n]) => <CategoryBadge key={k} category={k} count={n} />)}
      {entries.length > limit && <span className="muted">+{entries.length - limit}</span>}
    </span>
  );
};
