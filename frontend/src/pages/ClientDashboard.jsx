import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, Briefcase, DollarSign, Star, Clock, Users, Mail, MessageCircle, Calendar, CheckCircle, FolderLock, History } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import DocumentAnalyser from '../components/DocumentAnalyser';
import CaseTimeline from '../components/CaseTimeline';
import DocumentVault from '../components/DocumentVault';

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
      <div className="lawyer-card-banner">
        <div className="lawyer-card-avatar" style={{ background: avatarColor(lawyer.name) }}>
          {initial}
        </div>
      </div>
      <div className="lawyer-card-body">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {lawyer.name}
          {lawyer.isVerified && (
            <CheckCircle size={16} fill="#1D9BF0" color="white" title="Verified Lawyer (Bar Council Verified)" />
          )}
        </h3>
        
        {lawyer.totalReviews > 0 && (
          <div className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            <Star size={12} fill="var(--gold)" color="var(--gold)" />
            <strong style={{ color: 'var(--text-main)' }}>{lawyer.averageRating?.toFixed(1)}</strong>
            <span>({lawyer.totalReviews} reviews)</span>
          </div>
        )}

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

function DealCard({ deal, delay = 0, onOpenChat, onReview, onDownloadInvoice, onOpenVault, onOpenTimeline }) {
  const statusMap = {
    ACCEPTED: { cls: 'badge-success', emoji: '✅' },
    COMPLETED: { cls: 'badge-success', emoji: '🏆' },
    REJECTED: { cls: 'badge-error', emoji: '❌' },
    PENDING: { cls: 'badge-pending', emoji: '⏳' },
  };
  const s = statusMap[deal.dealStatus] || statusMap.PENDING;

  return (
    <div 
      className={`card animate-slide-up delay-${delay}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
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

      {deal.appointmentDate && (
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <Calendar size={14} color="var(--primary)" />
          <span>Requested Appt: <strong>{new Date(deal.appointmentDate).toLocaleString()}</strong></span>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <div
          className="flex items-center justify-between"
          style={{
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
            marginBottom: (deal.dealStatus === 'ACCEPTED' || deal.dealStatus === 'COMPLETED') ? '0.75rem' : 0,
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
            ₹{deal.amount}
          </div>
        </div>

        {deal.dealStatus === 'ACCEPTED' && (
          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            onClick={() => onOpenChat(deal)}
          >
            <MessageCircle size={15} /> Chat with Lawyer
          </button>
        )}

        {deal.dealStatus === 'COMPLETED' && (
          <div className="flex flex-col gap-2">
            <button
              className="btn btn-outline btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              onClick={() => onDownloadInvoice(deal.id)}
            >
              📄 Download Invoice
            </button>
            {!deal.rating && (
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                onClick={() => onReview(deal)}
              >
                ⭐ Leave a Review
              </button>
            )}
            {deal.rating && (
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700 }}>
                {Array(deal.rating).fill('⭐').join('')}
              </div>
            )}
          </div>
        )}

        {/* Vault & Timeline Buttons */}
        <div className="flex gap-2" style={{ marginTop: '0.75rem' }}>
          {(deal.dealStatus === 'ACCEPTED' || deal.dealStatus === 'COMPLETED') && (
            <button
              className="btn btn-outline btn-sm"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              onClick={() => onOpenVault(deal)}
            >
              <FolderLock size={14} /> Vault
            </button>
          )}
          <button
            className="btn btn-outline btn-sm"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            onClick={() => onOpenTimeline(deal)}
          >
            <History size={14} /> Timeline
          </button>
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
  const [reviewForm, setReviewForm] = useState(null);
  const [chatDeal, setChatDeal] = useState(null);
  const [activeTab, setActiveTab] = useState('lawyers');
  const [showDocAnalyser, setShowDocAnalyser] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [vaultDeal, setVaultDeal] = useState(null);
  const [timelineDeal, setTimelineDeal] = useState(null);

  useEffect(() => { 
    fetchDeals(); 
    fetchLawyers(); 
    if (user?.id) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/clients/${user.id}`);
      setProfileData(res.data);
      setProfileForm(res.data);
    } catch (e) { console.error('Error fetching profile', e); }
  };

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
        appointmentDate: hireForm.appointmentDate,
      });
      setHireForm(null);
      fetchDeals();
      alert('Deal proposed successfully!');
    } catch (e) { alert('Error proposing deal'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/deals/${reviewForm.dealId}/review`, {
        rating: reviewForm.rating,
        review: reviewForm.review,
      });
      setReviewForm(null);
      fetchDeals();
      fetchLawyers(); // Refresh lawyer average ratings
      alert('Review submitted successfully!');
    } catch (e) { alert('Error submitting review'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/clients/${user.id}`, profileForm);
      setProfileData(res.data);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (e) {
      alert('Failed to update profile');
    }
  };

  const handleDownloadInvoice = async (dealId) => {
    try {
      const response = await api.get(`/deals/${dealId}/invoice?t=${new Date().getTime()}`, {
        responseType: 'blob'
      });
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice_${dealId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error downloading invoice');
    }
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
              <button
                className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('profile')}
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginLeft: '0.5rem'
                }}
              >
                👤 My Profile
              </button>
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

        <div className="grid grid-cols-2" style={{ alignItems: 'start', display: activeTab === 'profile' ? 'none' : 'grid' }}>
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
                  <DealCard 
                    key={d.id} 
                    deal={d} 
                    delay={Math.min((i + 1) * 100, 600)} 
                    onOpenChat={setChatDeal} 
                    onReview={(deal) => setReviewForm({ dealId: deal.id, rating: 5, review: '' })}
                    onDownloadInvoice={handleDownloadInvoice}
                    onOpenVault={setVaultDeal}
                    onOpenTimeline={setTimelineDeal}
                  />
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

        {/* ── My Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="animate-slide-right delay-75">
            <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>👤 My Profile</h2>
                {!isEditingProfile && (
                  <button className="btn btn-outline btn-sm" onClick={() => setIsEditingProfile(true)}>
                    ✏️ Edit
                  </button>
                )}
              </div>
              
              {profileData ? (
                isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" type="text" value={profileForm.name || ''} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <button type="button" className="btn btn-ghost" onClick={() => { setIsEditingProfile(false); setProfileForm(profileData); }}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Name</span>
                      <strong>{profileData.name}</strong>
                    </div>
                    <div className="flex justify-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Email</span>
                      <strong>{profileData.email}</strong>
                    </div>
                    <div className="flex justify-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Username</span>
                      <strong>{profileData.username}</strong>
                    </div>
                  </div>
                )
              ) : (
                <p>Loading profile...</p>
              )}
            </div>
          </div>
        )}
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
                <label className="form-label">Preferred Appointment Date & Time</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  required
                  value={hireForm.appointmentDate || ''}
                  onChange={e => setHireForm({ ...hireForm, appointmentDate: e.target.value })}
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

      {/* ── Review Modal ── */}
      {reviewForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReviewForm(null)}>
          <div className="modal-card animate-pop-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>⭐ Rate & Review</h2>
              <button
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}
                onClick={() => setReviewForm(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      {star <= reviewForm.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Review Description</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="How was your experience working with this lawyer?"
                  required
                  value={reviewForm.review}
                  onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setReviewForm(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Analyser Floating Button (above chatbot) */}
      {!showDocAnalyser && (
        <button
          className="chatbot-launcher animate-fade-in"
          onClick={() => setShowDocAnalyser(true)}
          title="AI Document Analyser"
          style={{
            bottom: '6.5rem',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            boxShadow: '0 8px 28px rgba(245, 158, 11, 0.4)',
          }}
        >
          <span style={{fontSize:'1.8rem'}}>📄</span>
        </button>
      )}

      {/* Document Analyser Modal */}
      {showDocAnalyser && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowDocAnalyser(false)}
        >
          <div
            className="modal-card animate-pop-in"
            style={{
              width: '100%',
              maxWidth: 700,
              maxHeight: '85vh',
              overflow: 'auto',
              padding: '1.5rem',
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>📄 AI Document Analyser</h2>
              <button
                onClick={() => setShowDocAnalyser(false)}
                style={{
                  background: 'var(--background-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  width: 34, height: 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem',
                }}
              >
                ✕
              </button>
            </div>
            <DocumentAnalyser />
          </div>
        </div>
      )}

      {chatDeal && (
        <ChatModal
          deal={chatDeal}
          currentUserRole="CLIENT"
          onClose={() => setChatDeal(null)}
        />
      )}

      {/* ── Vault Modal ── */}
      {vaultDeal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setVaultDeal(null)}>
          <div className="modal-card animate-pop-in" style={{ width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'auto', padding: '1.5rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderLock size={20} color="var(--primary)" /> Document Vault
              </h2>
              <button className="btn btn-ghost btn-sm" style={{ borderRadius: '50%', width: 34, height: 34, padding: 0 }} onClick={() => setVaultDeal(null)}>✕</button>
            </div>
            <DocumentVault deal={vaultDeal} currentUserRole="CLIENT" />
          </div>
        </div>
      )}

      {/* ── Timeline Modal ── */}
      {timelineDeal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setTimelineDeal(null)}>
          <div className="modal-card animate-pop-in" style={{ width: '100%', maxWidth: 500, padding: '1.5rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} color="var(--primary)" /> Case Timeline
              </h2>
              <button className="btn btn-ghost btn-sm" style={{ borderRadius: '50%', width: 34, height: 34, padding: 0 }} onClick={() => setTimelineDeal(null)}>✕</button>
            </div>
            <CaseTimeline statusHistory={timelineDeal.statusHistory} />
          </div>
        </div>
      )}
    </div>
  );
}
