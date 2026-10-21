export default function Section({ title, action, children, className = '' }) {
  return (
    <section className={`card section ${className}`}>
      {(title || action) && (
        <div className="section-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
