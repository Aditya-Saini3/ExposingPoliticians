import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { usePoliticians } from '../hooks/useData.js';
import { formatDate } from '../lib/stats.js';

const NAV = [
  ['/', 'Overview'],
  ['/politicians', 'Politicians'],
  ['/categories', 'Categories'],
  ['/about', 'Sources & method'],
];

export default function Layout() {
  const { data } = usePoliticians();
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <NavLink to="/" className="brand">Neta<span>Records</span></NavLink>
          <nav>
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="wrap">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <p>
            Case data comes from sworn affidavits filed with the Election Commission of India, as compiled by{' '}
            <a href="https://myneta.info" target="_blank" rel="noopener noreferrer">ADR / MyNeta</a>. Pending cases are
            allegations, not convictions; every person is presumed innocent until proven guilty.
          </p>
          <p className="muted">Data last updated: {formatDate(data?.generatedAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </footer>
    </>
  );
}
