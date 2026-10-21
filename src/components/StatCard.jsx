export default function StatCard({ label, value, hint, tone }) {
  return (
    <div className={`stat card ${tone || ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

export const StatGrid = ({ children }) => <div className="stat-grid">{children}</div>;
