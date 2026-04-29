import { CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';

export default function CaseTimeline({ statusHistory }) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No timeline history available for this deal.
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING': return { icon: <Clock size={16} />, color: '#D97706', bg: 'rgba(217,119,6,0.1)' };
      case 'ACCEPTED': return { icon: <CheckCircle size={16} />, color: 'var(--secondary-hover)', bg: 'rgba(0,200,150,0.1)' };
      case 'COMPLETED': return { icon: <CheckCircle size={16} />, color: 'var(--primary)', bg: 'var(--primary-light)' };
      case 'REJECTED': return { icon: <XCircle size={16} />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
      default: return { icon: <ChevronRight size={16} />, color: 'var(--text-muted)', bg: 'var(--surface-hover)' };
    }
  };

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ position: 'relative', marginLeft: '1rem' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 15,
          width: 2, background: 'var(--border)', zIndex: 0
        }}></div>

        <div className="flex flex-col gap-4">
          {statusHistory.map((entry, index) => {
            const config = getStatusConfig(entry.status);
            return (
              <div key={index} className="flex gap-4 relative z-10">
                <div 
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: config.bg, color: config.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, border: '2px solid var(--surface)'
                  }}
                >
                  {config.icon}
                </div>
                <div style={{ paddingTop: '0.3rem', paddingBottom: '0.5rem' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <strong style={{ fontSize: '0.95rem', color: config.color }}>{entry.status}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(entry.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    {entry.note || `Status updated to ${entry.status}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
