import { Link } from 'react-router-dom';
import { CategoryBadges } from './CategoryBadge.jsx';

/** Table of politicians; `countOf` lets category pages show a category-specific count. */
export default function PoliticianTable({ politicians, countOf, countLabel = 'Charges', newsCounts = {} }) {
  if (!politicians.length) return <p className="muted">No politicians match.</p>;
  return (
    <div className="table-scroll">
      <table className="ptable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Party</th>
            <th>Constituency</th>
            <th className="num">Pending cases</th>
            <th className="num">{countLabel}</th>
            <th>Top categories</th>
          </tr>
        </thead>
        <tbody>
          {politicians.map((p) => (
            <tr key={p.id}>
              <td>
                <Link to={`/politician/${p.id}`} className="pname">{p.name}</Link>
                {p.convictedCases > 0 && <span className="tag danger">Convicted</span>}
                {newsCounts[p.id] > 0 && <span className="tag">{newsCounts[p.id]} news</span>}
              </td>
              <td>{p.party}</td>
              <td>{p.constituency}{p.state && <span className="muted">, {p.state}</span>}</td>
              <td className="num strong">{p.pendingCases}</td>
              <td className="num">{countOf ? countOf(p) : p.totalCharges}</td>
              <td><CategoryBadges categories={p.categories} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
