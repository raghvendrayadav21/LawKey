import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, Briefcase, DollarSign, Star, Clock, Users, Mail } from 'lucide-react';

// Generate consistent avatar color from string
function avatarColor(name = '') {
  const colors = [
    'linear-gradient(135deg, #5B4AE8, #7B68EE)',
    'linear-gradient(135deg, #00C896, #00B4D8)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
    'linear-gradient(135deg, #A855F7, #EC4899)',
    'linear-gradient(135deg, #14B8A6, #0EA5E9)',
  ];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
}

function LawyerCard({ lawyer, onHire, delay = 0 }) {
  const initial = (lawyer.name || 'L').charAt(0).toUpperCase();
  return (
    <div className={`lawyer-card animate-slide-up delay-${delay}`}>
      <div className="lawyer-card-banner" />
      <div className="lawyer-card-avatar" style={{ background: avatarColor(lawyer.name) }}>
        {initial}
      </div>
      <div className="lawyer-card-body">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {lawyer.name}
        </h3>

        <div className="flex items-center gap-1" style={{ marginBottom: '1rem' }}>
          <span className="badge badge-pill">
            <Briefcase size={10} /> {lawyer.specialization}
          </span>
        </div>

        <div className="flex flex-col gap-2" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Clock size={14} color="var(--primary)" />
            <span><strong style={{ color: 'var(--text-main)' }}>{lawyer.experience}</strong> years experience</span>
          </div>
          {lawyer.location && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <MapPin size={14} color="var(--secondary-hover)" />
              <span>{lawyer.location}</span>
            </div>
          )}
          {lawyer.email && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Mail size={14} color="var(--primary)" />
              <span>{lawyer.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <DollarSign size={14} color="var(--gold)" />
            <span>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>₹{lawyer.fees}</strong>
              <span style={{ fontSize: '0.8rem' }}> / consultation</span>
            </span>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.6rem' }}
          onClick={() => onHire({ lawyerId: lawyer.id, amount: lawyer.fees, description: '' })}
        >
          Hire Lawyer
        </button>
      </div>
    </div>
  );
}

function DealCard({ deal, delay = 0 }) {
  const statusMap = {
    ACCEPTED: { cls: 'badge-success', emoji: '✅' },
    COMPLETED: { cls: 'badge-success', emoji: '🏆' },
    REJECTED: { cls: 'badge-error', emoji: '❌' },
    PENDING: { cls: 'badge-pending', emoji: '⏳' },
  };
  const s = statusMap[deal.dealStatus] || statusMap.PENDING;

  return (
    <div className={`card animate-slide-up delay-${delay}`}>
      <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Deal with</div>
          <strong style={{ fontSize: '0.95rem' }}>{deal.lawyerName || deal.lawyerId}</strong>
        </div>
        <span className={`badge ${s.cls}`}>
          {s.emoji} {deal.dealStatus}
        </span>
      </div>

      {deal.description && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {deal.description}
        </p>
      )}

      <div
        className="flex items-center justify-between"
        style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
          ₹{deal.amount}
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const [lawyers, setLawyers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [search, setSearch] = useState('');
  const [hireForm, setHireForm] = useState(null);
  const [activeTab, setActiveTab] = useState('lawyers');

  useEffect(() => { fetchDeals(); fetchLawyers(); }, []);

  const fetchLawyers = async (q = '') => {
    try {
      const res = await api.get(`/lawyers${q ? '?specialization=' + q : ''}`);
      setLawyers(res.data);
    } catch (e) { console.error('Error fetching lawyers', e); }
  };

  const fetchDeals = async () => {
    try {
      const res = await api.get('/deals/client');
      setDeals(res.data);
    } catch (e) { console.error('Error fetching deals', e); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLawyers(search);
  };

  const handleHire = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/deals/hire/${hireForm.lawyerId}`, {
        amount: hireForm.amount,
        description: hireForm.description,
      });
      setHireForm(null);
      fetchDeals();
      alert('Deal proposed successfully!');
    } catch (e) { alert('Error proposing deal'); }
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="section-label" style={{ margin: 0, marginBottom: '0.5rem' }}>
                Client Portal
              </div>
              <h1 style={{ margin: 0 }}>Client Dashboard</h1>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Welcome back, <strong style={{ color: 'var(--text-sub)' }}>{user?.name || user?.username}</strong> 👋
              </p>
            </div>
            {/* Summary chips */}
            <div className="flex gap-3 flex-wrap">
              <div
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-sub)',
                }}
              >
                <Users size={15} color="var(--primary)" />
                {lawyers.length} Lawyers Available
              </div>
              <div
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-sub)',
                }}
              >
                <Briefcase size={15} color="var(--secondary-hover)" />
                {deals.length} My Deals
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
        {/* Mobile Tab Bar */}
        <div className="tab-bar mb-6" style={{ display: 'none' }} id="mobile-tabs">
          <button
            className={`tab-btn ${activeTab === 'lawyers' ? 'active' : ''}`}
            onClick={() => setActiveTab('lawyers')}
          >
            🔍 Find Lawyers
          </button>
          <button
            className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
            onClick={() => setActiveTab('deals')}
          >
            📋 My Deals
          </button>
        </div>

        <div className="grid grid-cols-2" style={{ alignItems: 'start' }}>
          {/* === Find Lawyers Column === */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Find a Lawyer</h2>
            </div>

            <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
              <div
                className="flex gap-2"
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border)',
                  padding: '0.3rem 0.3rem 0.3rem 1rem',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onFocus={() => {}}
              >
                <Search size={18} color="var(--text-muted)" style={{ alignSelf: 'center', flexShrink: 0 }} />
                <input
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit',
                  }}
                  placeholder="Search by specialization (e.g. Criminal)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                  Search
                </button>
              </div>
            </form>

            {/* Lawyer Cards */}
            {lawyers.length > 0 ? (
              <div className="grid grid-auto" style={{ gap: '1.25rem' }}>
                {lawyers.map((l, i) => (
                  <LawyerCard
                    key={l.id}
                    lawyer={l}
                    onHire={setHireForm}
                    delay={Math.min((i + 1) * 100, 600)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state card-flat">
                <div className="empty-state-icon">⚖️</div>
                <h3 style={{ color: 'var(--text-sub)', marginBottom: '0.5rem' }}>No Lawyers Found</h3>
                <p style={{ fontSize: '0.9rem' }}>Try adjusting your search term or clear the filter.</p>
              </div>
            )}
          </div>

          {/* === My Deals Column === */}
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>My Deals</h2>

            {deals.length > 0 ? (
              <div className="grid" style={{ gap: '1.25rem' }}>
                {deals.map((d, i) => (
                  <DealCard key={d.id} deal={d} delay={Math.min((i + 1) * 100, 600)} />
                ))}
              </div>
            ) : (
              <div className="empty-state card-flat">
                <div className="empty-state-icon">📋</div>
                <h3 style={{ color: 'var(--text-sub)', marginBottom: '0.5rem' }}>No Deals Yet</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  Find a lawyer and click "Hire Lawyer" to propose your first deal.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hire Modal ── */}
      {hireForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setHireForm(null)}>
          <div className="modal-card animate-pop-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>🤝 Propose a Deal</h2>
              <button
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}
                onClick={() => setHireForm(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleHire}>
              <div className="form-group">
                <label className="form-label">Offered Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  required
                  value={hireForm.amount}
                  onChange={e => setHireForm({ ...hireForm, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Case Description</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Describe your legal situation in detail..."
                  required
                  value={hireForm.description}
                  onChange={e => setHireForm({ ...hireForm, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setHireForm(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Propose Deal →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
