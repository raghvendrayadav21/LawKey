import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { Bell, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      // Filter to only show unread notifications in the box
      setNotifications(notifsRes.data.filter(n => !n.read));
      setUnreadCount(countRes.data);
    } catch (e) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Remove the notification from the list immediately
      setNotifications(notifications.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      // Clear all notifications from the UI box
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all read');
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    // Append 'Z' if missing to ensure proper UTC parsing, which prevents timezone shifting issues
    const d = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="btn btn-ghost"
        style={{ position: 'relative', padding: '0.4rem' }}
        title="Notifications"
      >
        <Bell size={20} color="var(--text-main)" />
        {unreadCount > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: 2, right: 2,
              background: '#EF4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              minWidth: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="card animate-pop-in"
          style={{
            position: 'absolute',
            top: '120%', right: 0,
            width: 320,
            maxHeight: 400,
            overflowY: 'auto',
            padding: 0,
            zIndex: 100,
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
          }}
        >
          <div className="flex justify-between items-center" style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--primary)' }}
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--border)',
                    background: n.read ? 'transparent' : 'var(--primary-light)',
                    cursor: n.read ? 'default' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <strong style={{ fontSize: '0.85rem', color: n.read ? 'var(--text-main)' : 'var(--primary)' }}>
                      {n.type.replace('_', ' ')}
                    </strong>
                    {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: '0 0 0.4rem', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatTime(n.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
