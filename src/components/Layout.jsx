import { Link, Outlet, useLocation } from 'react-router-dom'
import '../App.css'

export default function Layout() {
  const location = useLocation()

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark main-nav">
        <Link to="/" className="navbar-brand fw-bold">SwingTrade</Link>
        <div className="d-flex gap-4">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active text-white' : 'text-secondary'}`}>Home</Link>
          <Link to="/signals/" className={`nav-link ${location.pathname === '/signals/' ? 'active text-white' : 'text-secondary'}`}>Signals</Link>
          <Link to="/watchlist/" className={`nav-link ${location.pathname === '/watchlist/' ? 'active text-white' : 'text-secondary'}`}>Watchlist</Link>
          <Link to="/about/" className={`nav-link ${location.pathname === '/about/' ? 'active text-white' : 'text-secondary'}`}>About</Link>
        </div>
      </nav>

      {location.pathname !== '/about/' && (
        <div className="disclaimer-bar">
          ⚠️ This site is for informational purposes only and is not financial advice. Always do your own research.{' '}
          <Link to="/about/" className="disclaimer-link">Learn more</Link>
        </div>
      )}

      <main className="p-4">
        <Outlet />
      </main>
      <footer className="site-footer">
        © 2026 Jacob Hennemann · SwingTrade is for informational purposes only and does not constitute financial advice.
      </footer>
    </div>
  )
}