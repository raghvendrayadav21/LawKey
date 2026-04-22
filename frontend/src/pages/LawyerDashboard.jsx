import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, User, DollarSign, Wand2, BookOpen, AlertCircle, MessageCircle } from 'lucide-react';
import ChatModal from '../components/ChatModal';

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

  useEffect(() => { fetchDeals(); }, []);

  const fetchDeals = async () => {
    try {
      const res = await api.get('/deals/lawyer');
      setDeals(res.data);
    } catch (e) { console.error('Error fetching deals', e); }
  };

  const handleDownloadInvoice = async (dealId) => {
    try {
      const response = await api.get(`/deals/${dealId}/invoice`, {
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
              className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              🤖 AI Case Analysis
            </button>
          </div>
        </div>

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
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>
              My Deals &amp; Proposals
            </h2>

            {deals.length > 0 ? (
              <div
                className="grid"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}
              >
                {deals.map((d, i) => (
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
                <h3 style={{ color: 'var(--text-sub)', marginBottom: '0.5rem' }}>No Deal Proposals Yet</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  When clients send you deal proposals, they will appear here.
                </p>
              </div>
            )}
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
