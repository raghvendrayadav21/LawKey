import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, User, Briefcase, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('CLIENT');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      const expectedRole = `ROLE_${selectedRole}`;
      if (user?.role !== expectedRole) {
        logout();
        setError(`Access Denied! You are not registered as a ${selectedRole === 'CLIENT' ? 'Client' : 'Lawyer'}.`);
        return;
      }
      if (user?.role === 'ROLE_LAWYER') navigate('/lawyer');
      else if (user?.role === 'ROLE_CLIENT') navigate('/client');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Image Panel ── */}
      <div className="auth-panel-image">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
          alt="Legal professional"
        />
        <div className="auth-panel-image-overlay" />

        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute', top: '10%', right: '5%',
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '30%', left: '5%',
            width: 150, height: 150,
            background: 'radial-gradient(circle, rgba(0,200,150,0.2), transparent)',
            borderRadius: '50%',
          }}
        />

        <div className="auth-panel-image-content animate-slide-up">
          {/* Brand */}
          <div className="flex items-center gap-2" style={{ marginBottom: '2.5rem' }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Scale size={22} color="white" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>LawKey</span>
          </div>

          <h2 style={{ fontSize: '2.25rem', lineHeight: 1.2, marginBottom: '1rem' }}>
            Your Trusted<br />Legal Partner
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Connect with top-tier legal professionals who understand your needs
            and guide you through every step of the legal process.
          </p>

          {/* Stat chips */}
          <div className="flex gap-3 flex-wrap">
            {[
              { val: '5K+', label: 'Lawyers' },
              { val: '98%', label: 'Success' },
              { val: '$10M+', label: 'Deals' },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 12,
                  padding: '0.75rem 1.25rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{s.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-panel-form animate-fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              marginBottom: '0.5rem',
            }}
          >
            Welcome back 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Sign in to your LawKey account to continue.
          </p>
        </div>

        {/* Role Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--background-alt)',
            borderRadius: 'var(--radius-full)',
            padding: '0.3rem',
            marginBottom: '1.75rem',
            border: '1px solid var(--border)',
          }}
        >
          {[
            { role: 'CLIENT', label: 'Client', icon: <User size={15} /> },
            { role: 'LAWYER', label: 'Lawyer', icon: <Briefcase size={15} /> },
          ].map(({ role, label, icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => { setSelectedRole(role); setError(''); }}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background:
                  selectedRole === role
                    ? 'linear-gradient(135deg, var(--primary), #7B68EE)'
                    : 'transparent',
                color: selectedRole === role ? 'white' : 'var(--text-muted)',
                boxShadow:
                  selectedRole === role ? '0 4px 12px var(--primary-glow)' : 'none',
              }}
            >
              {icon} Login as {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="form-alert-error flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {loading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            ) : (
              `Login as ${selectedRole === 'CLIENT' ? 'Client' : 'Lawyer'}`
            )}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign up free →
          </Link>
        </p>
      </div>
    </div>
  );
}
