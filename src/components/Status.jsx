import { Link } from 'react-router-dom';

/** Loading / error / empty states, shared by every page. */
export default function Status({ loading, error, empty, children }) {
  if (loading) return <p className="status">Loading…</p>;
  if (error) return <p className="status error">{error} <Link to="/">Back to overview</Link></p>;
  if (empty) {
    return (
      <div className="status card">
        <h2>No data yet</h2>
        <p>
          The data files are filled by the scheduled GitHub Action. Run <code>npm run update-data</code> locally, or
          trigger the <em>Update data &amp; deploy</em> workflow from the Actions tab.
        </p>
      </div>
    );
  }
  return children ?? null;
}
