import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { Send, X, MessageCircle } from 'lucide-react';

export default function ChatModal({ deal, currentUserRole, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${deal.id}`);
      setMessages(res.data);
    } catch (e) {
      console.error('Error fetching messages', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 4 seconds for new messages
    pollRef.current = setInterval(fetchMessages, 4000);
    return () => clearInterval(pollRef.current);
  }, [deal.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/messages/${deal.id}/send`, { content: input.trim() });
      setInput('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const otherPartyName = currentUserRole === 'CLIENT' ? deal.lawyerName : deal.clientName;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-card animate-pop-in"
        style={{
          width: '100%',
          maxWidth: 560,
          height: '85vh',
          maxHeight: 640,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--primary), #7B68EE)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, color: 'white',
              }}
            >
              {(otherPartyName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                {otherPartyName || 'Chat'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
                <MessageCircle size={11} style={{ display: 'inline', marginRight: 4 }} />
                Deal Chat • ACCEPTED
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            background: 'var(--background)',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
              <p style={{ fontSize: '0.9rem' }}>
                No messages yet. Say hello to {otherPartyName}!
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderRole === currentUserRole;
              const showDate =
                i === 0 ||
                formatDate(messages[i - 1]?.timestamp) !== formatDate(msg.timestamp);

              return (
                <div key={msg.id || i}>
                  {showDate && (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        margin: '0.5rem 0',
                      }}
                    >
                      {formatDate(msg.timestamp)}
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '72%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: isMe
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                        background: isMe
                          ? 'linear-gradient(135deg, var(--primary), #7B68EE)'
                          : 'var(--surface)',
                        color: isMe ? 'white' : 'var(--text-main)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        border: isMe ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {!isMe && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            marginBottom: '0.2rem',
                          }}
                        >
                          {msg.senderName}
                        </div>
                      )}
                      <div>{msg.content}</div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          marginTop: '0.25rem',
                          textAlign: 'right',
                          color: isMe ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)',
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.5rem',
            background: 'var(--surface)',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, borderRadius: '2rem', padding: '0.6rem 1rem' }}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              borderRadius: '50%',
              width: 44, height: 44,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            disabled={sending || !input.trim()}
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
