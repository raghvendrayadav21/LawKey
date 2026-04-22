import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, AlertCircle, User, Briefcase, MapPin, DollarSign, Star, CheckCircle } from 'lucide-react';

export default function Signup() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'CLIENT', name: '',
    specialization: '', experience: '', location: '', fees: '', barCouncilNumber: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await register({
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        fees: formData.fees ? parseFloat(formData.fees) : 0
      });
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object' && !err.response.data.message) {
          setFieldErrors(err.response.data);
        } else {
          setError(err.response.data.message || 'Error occurred during registration (Ensure MongoDB is running)');
        }
      } else {
        setError('Network Error: The backend server might be off or unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (fieldErrors[field]) {
      return (
        <div className="form-error">
          <AlertCircle size={13} />
          {fieldErrors[field]}
        </div>
      );
    }
    return null;
  };

  const isLawyer = formData.role === 'LAWYER';

  return (
    <div className="auth-layout">
      {/* ── Image Panel ── */}
      <div className="auth-panel-image">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
          alt="Legal team collaborating"
        />
        <div className="auth-panel-image-overlay" />

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
            Join the Legal<br />Revolution Today
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Whether you're seeking legal help or offering your expertise, LawKey is
            the platform that brings clients and lawyers seamlessly together.
          </p>

          {/* Benefit list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Free to join, no hidden fees',
              'Smart lawyer-client matching',
              'Secure deal management system',
              'AI-powered legal case analysis',
            ].map(b => (
              <div key={b} className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                <CheckCircle size={16} color="#00E5A8" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-panel-form animate-fade-in" style={{ maxWidth: 520 }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              marginBottom: '0.5rem',
            }}
          >
            Create an Account ✨
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Join thousands of users on LawKey today.
          </p>
        </div>

        {/* Role Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--background-alt)',
            borderRadius: 'var(--radius-full)',
            padding: '0.3rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)',
          }}
        >
          {[
            { val: 'CLIENT', label: 'I need a Lawyer', icon: <User size={15} /> },
            { val: 'LAWYER', label: 'I am a Lawyer', icon: <Briefcase size={15} /> },
          ].map(({ val, label, icon }) => (
            <button
              key={val}
              type="button"
              onClick={() => setFormData({ ...formData, role: val })}
              style={{
                flex: 1,
                padding: '0.6rem 0.75rem',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background: formData.role === val
                  ? 'linear-gradient(135deg, var(--primary), #7B68EE)'
                  : 'transparent',
                color: formData.role === val ? 'white' : 'var(--text-muted)',
                boxShadow: formData.role === val ? '0 4px 12px var(--primary-glow)' : 'none',
              }}
            >
              {icon} {label}
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
          <div className="grid grid-cols-2" style={{ gap: '0 1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="e.g. John Doe"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              {renderError('name')}
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                placeholder="Min 3 characters"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
              {renderError('username')}
              {renderError('general')}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="example@email.com"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            {renderError('email')}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Min 6 characters"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            {renderError('password')}
          </div>

          {/* Lawyer-specific fields */}
          {isLawyer && (
            <div
              style={{
                padding: '1.25rem',
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                marginBottom: '1.25rem',
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ marginBottom: '1rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}
              >
                <Briefcase size={15} />
                Professional Details
              </div>

              <div className="form-group">
                <label className="form-label">Bar Council Number (KYC)</label>
                <input
                  className="form-input"
                  placeholder="e.g. MAH/1234/2021"
                  required={isLawyer}
                  value={formData.barCouncilNumber}
                  onChange={e => setFormData({ ...formData, barCouncilNumber: e.target.value })}
                />
                {renderError('barCouncilNumber')}
              </div>

              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input
                  className="form-input"
                  placeholder="e.g. Corporate, Criminal, Family..."
                  required={isLawyer}
                  value={formData.specialization}
                  onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                />
                {renderError('specialization')}
              </div>

              <div className="grid grid-cols-2" style={{ gap: '0 1rem' }}>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    required={isLawyer}
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  />
                  {renderError('experience')}
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="form-input"
                    placeholder="e.g. New York"
                    required={isLawyer}
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                  {renderError('location')}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Consultation Fees ($)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="e.g. 200"
                  required={isLawyer}
                  value={formData.fees}
                  onChange={e => setFormData({ ...formData, fees: e.target.value })}
                />
                {renderError('fees')}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
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
              `Create ${formData.role === 'CLIENT' ? 'Client' : 'Lawyer'} Account →`
            )}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
