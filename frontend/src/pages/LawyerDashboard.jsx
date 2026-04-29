import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, User, DollarSign, Wand2, BookOpen, AlertCircle, MessageCircle, Calendar, BarChart2 } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import DocumentAnalyser from '../components/DocumentAnalyser';

function DealCard({ deal, onUpdate, delay = 0, onOpenChat, onDownloadInvoice }) {
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
      <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Client
          </div>
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #7B68EE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {(deal.clientName || deal.clientId || 'C').charAt(0).toUpperCase()}
            </div>
            <strong style={{ fontSize: '0.95rem' }}>
              {deal.clientName || deal.clientId}
            </strong>
          </div>
        </div>
        <span className={`badge ${s.cls}`}>
          {s.emoji} {deal.dealStatus}
        </span>
      </div>

      {deal.description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
            lineHeight: 1.6,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {deal.description}
        </p>
      )}

      {deal.appointmentDate && (
        <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>
          <Calendar size={14} />
          <span>Requested Appt: {new Date(deal.appointmentDate).toLocaleString()}</span>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <div
          className="flex items-center justify-between"
          style={{
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
            marginBottom: (deal.dealStatus === 'PENDING' || deal.dealStatus === 'ACCEPTED' || deal.dealStatus === 'COMPLETED') ? '1rem' : 0,
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deal Amount</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
            ₹{deal.amount}
          </div>
        </div>

        {deal.dealStatus === 'PENDING' && (
          <div className="flex gap-2">
            <button
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => onUpdate(deal.id, 'ACCEPTED')}
            >
              ✅ Accept
            </button>
            <button
              className="btn btn-danger"
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => onUpdate(deal.id, 'REJECTED')}
            >
              ❌ Decline
            </button>
          </div>
        )}
        {deal.dealStatus === 'ACCEPTED' && (
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => onUpdate(deal.id, 'COMPLETED')}
            >
              🏆 Mark Completed
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              onClick={() => onOpenChat(deal)}
            >
              <MessageCircle size={15} /> Chat
            </button>
          </div>
        )}
        {deal.dealStatus === 'COMPLETED' && (
          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
            onClick={() => onDownloadInvoice(deal.id)}
          >
            📄 Download Invoice
          </button>
        )}
      </div>
    </div>
  );
}

export default function LawyerDashboard() {
  const { user } = useContext(AuthContext);
  const [deals, setDeals] = useState([]);
  const [chatDeal, setChatDeal] = useState(null);
  const [activeTab, setActiveTab] = useState('deals');
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dealSubTab, setDealSubTab] = useState('new');

  useEffect(() => { 
    fetchDeals(); 
    fetchAnalytics();
    if (user?.id) fetchProfile();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/lawyer');
      setAnalyticsData(res.data);
    } catch (e) { console.error('Error fetching analytics', e); }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/lawyers/${user.id}`);
      setProfileData(res.data);
      setProfileForm(res.data);
    } catch (e) { console.error('Error fetching profile', e); }
  };

  const fetchDeals = async () => {
    try {
      const res = await api.get('/deals/lawyer');
      setDeals(res.data);
    } catch (e) { console.error('Error fetching deals', e); }
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

  const handleUpdateStatus = async (dealId, status) => {
    try {
      await api.put(`/deals/${dealId}/status`, { dealStatus: status });
      fetchDeals();
    } catch (e) { alert('Failed to update status'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/lawyers/${user.id}`, profileForm);
      setProfileData(res.data);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (e) {
      alert('Failed to update profile');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!analysisQuery.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await api.post('/analysis/predict', { query: analysisQuery });
      setAnalysisData(res.data);
    } catch (err) {
      alert('Error fetching analysis: ' + (err.response?.data || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pending = deals.filter(d => d.dealStatus === 'PENDING').length;
  const accepted = deals.filter(d => d.dealStatus === 'ACCEPTED').length;

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="section-label" style={{ margin: 0, marginBottom: '0.5rem' }}>
                Lawyer Portal
              </div>
              <h1 style={{ margin: 0 }}>Lawyer Dashboard</h1>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Welcome back, <strong style={{ color: 'var(--text-sub)' }}>{user?.name || user?.username}</strong> 👋
              </p>
            </div>

            {/* Summary chips */}
            <div className="flex gap-3 flex-wrap">
              {[
                { color: 'var(--primary)', icon: <Briefcase size={14} />, label: `${deals.length} Total Deals` },
                { color: '#D97706', icon: '⏳', label: `${pending} Pending` },
                { color: 'var(--secondary-hover)', icon: '✅', label: `${accepted} Active` },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-sub)',
                  }}
                >
                  <span style={{ color: c.color }}>{c.icon}</span>
                  {c.label}
                </div>
              ))}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-6 animate-slide-up">
          <div className="tab-bar" style={{ width: 'fit-content' }}>
            <button
              className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
              onClick={() => setActiveTab('deals')}
            >
              📋 My Deals
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
            <button
              className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              🤖 AI Case Analysis
            </button>
            <button
              className={`tab-btn ${activeTab === 'document' ? 'active' : ''}`}
              onClick={() => setActiveTab('document')}
            >
              📄 Document Analyser
            </button>
          </div>
        </div>

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && (
          <div className="animate-slide-right delay-75">
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>
              Lawyer Analytics Dashboard
            </h2>

            {analyticsData ? (
              <>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex items-center gap-2 mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                      <Briefcase size={16} /> Total Deals
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{analyticsData.totalDeals}</div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex items-center gap-2 mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                      <DollarSign size={16} color="var(--gold)" /> Total Earnings
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold)' }}>
                      ₹{analyticsData.totalEarnings}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex items-center gap-2 mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                      <BarChart2 size={16} color="var(--primary)" /> Win Rate
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {analyticsData.winRate}%
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex items-center gap-2 mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                      <span>⭐</span> Average Rating
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                      {analyticsData.averageRating.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({analyticsData.totalReviews})</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Monthly Earnings</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: '1rem', paddingTop: '1rem' }}>
                      {Object.entries(analyticsData.monthlyEarnings).map(([month, amount]) => {
                        const maxAmount = Math.max(...Object.values(analyticsData.monthlyEarnings), 1000);
                        const heightPct = (amount / maxAmount) * 100;
                        return (
                          <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>₹{amount}</div>
                            <div style={{ width: '100%', height: 160, background: 'var(--surface-hover)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${heightPct}%`, background: 'var(--primary)', transition: 'height 1s ease' }}></div>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>{month.split(' ')[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Deal Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="flex justify-between items-center p-3" style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius)' }}>
                        <div className="flex items-center gap-2"><span style={{ color: '#D97706' }}>⏳</span> Pending</div>
                        <strong>{analyticsData.pendingDeals}</strong>
                      </div>
                      <div className="flex justify-between items-center p-3" style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius)' }}>
                        <div className="flex items-center gap-2"><span style={{ color: 'var(--secondary-hover)' }}>✅</span> Active (Accepted)</div>
                        <strong>{analyticsData.acceptedDeals}</strong>
                      </div>
                      <div className="flex justify-between items-center p-3" style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius)' }}>
                        <div className="flex items-center gap-2"><span style={{ color: 'var(--success)' }}>🏆</span> Completed</div>
                        <strong>{analyticsData.completedDeals}</strong>
                      </div>
                      <div className="flex justify-between items-center p-3" style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius)' }}>
                        <div className="flex items-center gap-2"><span style={{ color: '#EF4444' }}>❌</span> Rejected</div>
                        <strong>{analyticsData.rejectedDeals}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p>Loading analytics...</p>
            )}
          </div>
        )}

        {/* ── AI Case Analysis Tab ── */}
        {activeTab === 'analysis' && (
          <div className="animate-slide-right delay-75">
            <div className="ai-card" style={{ marginBottom: '2rem' }}>
              {/* Shimmer effect top border */}
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, var(--primary), #A855F7, var(--secondary), var(--primary))',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s linear infinite',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                }}
              />

              <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 'var(--radius)',
                    background: 'linear-gradient(135deg, var(--primary), #7B68EE)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  🤖
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem' }}>AI Legal Case Analysis</h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Powered by historical case data &amp; AI
                  </p>
                </div>
              </div>

              <form onSubmit={handleAnalyze} className="flex gap-3" style={{ marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Enter crime details (e.g. Fraud of 5 lakhs, Hit and run)..."
                  value={analysisQuery}
                  onChange={e => setAnalysisQuery(e.target.value)}
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                  disabled={isAnalyzing || !analysisQuery.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 16, height: 16,
                          border: '2px solid rgba(255,255,255,0.4)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }}
                      />
                      Analyzing...
                    </>
                  ) : (
                    <><Wand2 size={15} /> Analyze Case</>
                  )}
                </button>
              </form>

              <p className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                <AlertCircle size={12} />
                <em>Disclaimer: AI suggestions are based on historical data. Actual outcomes depend on court judgment.</em>
              </p>
            </div>

            {/* Analysis Results */}
            {analysisData && (
              <div className="flex gap-6 flex-wrap animate-slide-up">
                {/* AI Insight Card */}
                <div className="ai-insight-card flex-1" style={{ minWidth: 300 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🤖</span>
                    <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>AI Insight</h3>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.925rem', color: 'var(--text-sub)' }}>
                    {analysisData.aiPrediction}
                  </div>
                </div>

                {/* Historical Precedents */}
                <div style={{ flex: '1 1 300px', minWidth: 300 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                    <BookOpen size={18} color="var(--secondary-hover)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Historical Precedents</h3>
                  </div>
                  {analysisData.historicalCases && analysisData.historicalCases.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {analysisData.historicalCases.map(c => (
                        <div
                          key={c.id}
                          className="card"
                          style={{
                            padding: '1rem',
                            borderLeft: '4px solid var(--secondary)',
                          }}
                        >
                          <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem' }}>{c.crimeType}</strong>
                            <span className="badge">{c.year}</span>
                          </div>
                          {c.description && (
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                              {c.description}
                            </p>
                          )}
                          <div style={{ fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span><strong>Section:</strong> {c.legalSection}</span>
                            <span><strong>Punishment:</strong> {c.punishment}</span>
                            <span>
                              <strong>Decision:</strong>{' '}
                              <span style={{ color: c.courtDecision === 'Convicted' ? '#EF4444' : 'var(--secondary-hover)', fontWeight: 600 }}>
                                {c.courtDecision}
                              </span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state card-flat">
                      <div className="empty-state-icon">📚</div>
                      <p>No historical cases found in the database.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── My Deals Tab ── */}
        {activeTab === 'deals' && (
          <div className="animate-slide-right delay-75">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                My Deals &amp; Proposals
              </h2>
              
              <div className="tab-bar" style={{ width: 'fit-content', padding: '0.2rem', background: 'var(--surface)' }}>
                <button
                  className={`tab-btn ${dealSubTab === 'new' ? 'active' : ''}`}
                  onClick={() => setDealSubTab('new')}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  New Requests
                </button>
                <button
                  className={`tab-btn ${dealSubTab === 'active' ? 'active' : ''}`}
                  onClick={() => setDealSubTab('active')}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  Current Clients
                </button>
                <button
                  className={`tab-btn ${dealSubTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setDealSubTab('completed')}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  Completed
                </button>
              </div>
            </div>

            {(() => {
              const pendingDeals = deals.filter(d => d.dealStatus === 'PENDING');
              const activeDeals = deals.filter(d => d.dealStatus === 'ACCEPTED');
              const completedDeals = deals.filter(d => d.dealStatus === 'COMPLETED' || d.dealStatus === 'REJECTED');
              
              const displayedDeals = 
                dealSubTab === 'new' ? pendingDeals : 
                dealSubTab === 'active' ? activeDeals : 
                completedDeals;

              return displayedDeals.length > 0 ? (
                <div
                  className="grid"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}
                >
                  {displayedDeals.map((d, i) => (
                    <DealCard
                      key={d.id}
                      deal={d}
                      onUpdate={handleUpdateStatus}
                      onOpenChat={setChatDeal}
                      onDownloadInvoice={handleDownloadInvoice}
                      delay={Math.min((i + 1) * 100, 600)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state card-flat">
                  <div className="empty-state-icon">📋</div>
                  <h3 style={{ color: 'var(--text-sub)', marginBottom: '0.5rem' }}>No Deals Found</h3>
                  <p style={{ fontSize: '0.9rem' }}>
                    {dealSubTab === 'new' ? 'You have no new deal requests at the moment.' : 
                     dealSubTab === 'active' ? 'You have no active current clients.' : 
                     'You have no completed or rejected deals.'}
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Document Analyser Tab ── */}
        {activeTab === 'document' && (
          <div className="animate-slide-right delay-75">
            <DocumentAnalyser />
          </div>
        )}

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
                    <div className="form-group">
                      <label className="form-label">Specialization</label>
                      <input className="form-input" type="text" value={profileForm.specialization || ''} onChange={e => setProfileForm({...profileForm, specialization: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Experience (Years)</label>
                        <input className="form-input" type="number" value={profileForm.experience || ''} onChange={e => setProfileForm({...profileForm, experience: parseInt(e.target.value)})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Consultation Fees (₹)</label>
                        <input className="form-input" type="number" value={profileForm.fees || ''} onChange={e => setProfileForm({...profileForm, fees: parseFloat(e.target.value)})} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" type="text" value={profileForm.location || ''} onChange={e => setProfileForm({...profileForm, location: e.target.value})} required />
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
                      <span style={{ color: 'var(--text-muted)' }}>Specialization</span>
                      <strong>{profileData.specialization}</strong>
                    </div>
                    <div className="flex justify-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                      <strong>{profileData.experience} Years</strong>
                    </div>
                    <div className="flex justify-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Fees</span>
                      <strong>₹{profileData.fees}</strong>
                    </div>
                    <div className="flex justify-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Location</span>
                      <strong>{profileData.location}</strong>
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

      {chatDeal && (
        <ChatModal
          deal={chatDeal}
          currentUserRole="LAWYER"
          onClose={() => setChatDeal(null)}
        />
      )}
    </div>
  );
}
