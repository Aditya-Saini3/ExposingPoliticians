import { Link } from 'react-router-dom';
import { formatDate } from '../lib/stats.js';

const safe = (url) => (/^https?:\/\//.test(url) ? url : undefined);

export default function NewsList({ items = [], showPolitician = false, empty = 'No matching headlines from credible outlets yet.' }) {
  if (!items.length) return <p className="muted">{empty}</p>;
  return (
    <ul className="news">
      {items.map((n) => (
        <li key={n.link}>
          <a href={safe(n.link)} target="_blank" rel="noopener noreferrer nofollow">{n.title}</a>
          <div className="news-meta">
            <span className="source">{n.source}</span>
            <span>{formatDate(n.pubDate)}</span>
            {showPolitician && n.politicianId && <Link to={`/politician/${n.politicianId}`}>{n.politicianName}</Link>}
            {n.tags?.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        </li>
      ))}
    </ul>
  );
}
