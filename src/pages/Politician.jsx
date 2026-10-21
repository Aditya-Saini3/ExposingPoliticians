import { Link, useParams } from 'react-router-dom';
import { CATEGORIES } from '../../shared/categories.js';
import { useNews, usePoliticians } from '../hooks/useData.js';
import { formatDate } from '../lib/stats.js';
import Status from '../components/Status.jsx';
import StatCard, { StatGrid } from '../components/StatCard.jsx';
import Section from '../components/Section.jsx';
import BarList from '../components/BarList.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import NewsList from '../components/NewsList.jsx';

const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function Politician() {
  const { id } = useParams();
  const { data, loading, error } = usePoliticians();
  const news = useNews(id);
  const p = data?.politicians.find((x) => x.id === id);
  if (!loading && !error && data && !p) return <Status error="Politician not found." />;

  return (
    <Status loading={loading} error={error}>
      {p && (
        <>
          <p className="crumbs"><Link to="/politicians">Politicians</Link> / {p.name}</p>
          <div className="profile card">
            <div className="avatar" aria-hidden>{initials(p.name)}</div>
            <div>
              <h1>{p.name}</h1>
              <p className="profile-meta">
                <Link to={`/politicians?party=${encodeURIComponent(p.party)}`}>{p.party}</Link> · {p.constituency}
                {p.state && `, ${p.state}`} · {p.house} ({p.election})
              </p>
              <p className="muted">
                {p.age && `Age ${p.age} · `}{p.education && `${p.education} · `}{p.assets && `Declared assets ${p.assets}`}
              </p>
            </div>
          </div>

          <StatGrid>
            <StatCard label="Pending criminal cases" value={p.pendingCases} tone={p.pendingCases ? 'warn' : ''} />
            <StatCard label="Charges (IPC / BNS sections)" value={p.totalCharges} />
            <StatCard label="Serious charges" value={p.seriousCharges} tone={p.seriousCharges ? 'danger' : ''} />
            <StatCard label="Declared convictions" value={p.convictedCases} tone={p.convictedCases ? 'danger' : ''} />
          </StatGrid>

          {p.charges.length > 0 ? (
            <div className="grid-2">
              <Section title="Charges by category">
                <BarList
                  items={Object.entries(p.categories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, n]) => ({ key: k, label: CATEGORIES[k].label, value: n, color: CATEGORIES[k].color, to: `/category/${k}` }))}
                />
              </Section>
              <Section title="Declared charges">
                <div className="table-scroll">
                  <table className="ptable compact">
                    <thead><tr><th className="num">Count</th><th>Charge</th><th>Section</th><th>Category</th></tr></thead>
                    <tbody>
                      {p.charges.map((c) => (
                        <tr key={`${c.code}-${c.section}-${c.description}`}>
                          <td className="num strong">{c.count}</td>
                          <td>{c.description}</td>
                          <td className="nowrap">{c.code} {c.section}</td>
                          <td><CategoryBadge category={c.category} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </div>
          ) : (
            <Section><p>No criminal charges declared in the affidavit.</p></Section>
          )}

          <Section
            title="News coverage"
            action={news.data?.updatedAt && <span className="muted">Updated {formatDate(news.data.updatedAt)}</span>}
          >
            <p className="muted small">
              Headlines from established outlets that mention {p.name} together with legal terms. Matching is automatic and
              may include unrelated stories or people with the same name — read the article before drawing conclusions.
            </p>
            <Status loading={news.loading}>
              <NewsList items={news.data?.items} />
            </Status>
          </Section>

          <Section title="Primary source">
            <p>
              Self-sworn affidavit submitted to the Election Commission of India, compiled by ADR:{' '}
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">view on MyNeta</a>. Pending cases are allegations;
              charges may not have been framed by a court. Check the affidavit for case numbers, courts and current status.
            </p>
          </Section>
        </>
      )}
    </Status>
  );
}
