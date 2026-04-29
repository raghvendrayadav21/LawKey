import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Scale, LogOut, Home, Info, Briefcase, LayoutDashboard } from 'lucide-react';
import NotificationBell from './NotificationBell';

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('lawkey-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('lawkey-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      className={`theme-toggle ${dark ? 'dark' : ''}`}
      onClick={() => setDark(d => !d)}
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark mode"
    >
      <div className="theme-toggle-knob">
        {dark ? '🌙' : '☀️'}
      </div>
    </button>
  );
}

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lawkey-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <nav
      className="navbar"
      style={{
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        background: scrolled
          ? 'rgba(var(--surface-rgb, 255,255,255), 0.82)'
          : 'var(--surface)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div className="container navbar-content">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <Scale size={20} color="white" />
          </div>
          <span>LawKey</span>
        </Link>

        {/* Nav Links */}
        <div className="navbar-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {isHome && (
            <>
              <a href="#how-it-works" className="nav-link">How it Works</a>
              <a href="#features" className="nav-link">Features</a>
            </>
          )}
          {user && (
            <Link
              to={user.role === 'ROLE_CLIENT' ? '/client' : '/lawyer'}
              className="nav-link"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="navbar-divider" />

          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up Free
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <div
                className="flex items-center gap-2"
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>
                  {user.role === 'ROLE_LAWYER' ? '⚖️' : '👤'}
                </span>
                <span className="hide-mobile">
                  {user.role === 'ROLE_LAWYER' ? 'Lawyer' : 'Client'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <LogOut size={14} />
                <span className="hide-mobile">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
