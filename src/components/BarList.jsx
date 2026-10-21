import { Link } from 'react-router-dom';

/** Horizontal bar chart. items: [{ key, label, value, color?, to?, note? }] */
export default function BarList({ items, limit, unit = '' }) {
  const shown = limit ? items.slice(0, limit) : items;
  const max = Math.max(1, ...shown.map((i) => i.value));
  return (
    <ul className="bars">
      {shown.map((i) => {
        const label = i.to ? <Link to={i.to}>{i.label}</Link> : i.label;
        return (
          <li key={i.key}>
            <div className="bar-head">
              <span>{label}</span>
              <span className="bar-value">{i.value}{unit}{i.note && <small> · {i.note}</small>}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(i.value / max) * 100}%`, background: i.color }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
