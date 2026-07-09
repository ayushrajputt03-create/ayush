'use client';

import { useState, useRef, useEffect } from 'react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - (timestamp.seconds ? timestamp.seconds * 1000 : timestamp)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ParentTopbar({ parentName, notices, onSignOut }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const notifRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowAvatar(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const unreadCount = (notices || []).length;
  const initials = (parentName || 'P').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="parent-topbar">
      <div className="topbar-left">
        <h1>{getGreeting()}, {parentName || 'Parent'}</h1>
        <p>{formatDate()}</p>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <button className="topbar-icon-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="topbar-icon-btn" onClick={() => { setShowNotif(!showNotif); setShowAvatar(false); }} aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="topbar-dot" />}
          </button>
          {showNotif && (
            <div className="topbar-dropdown" style={{ width: 320 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>
                Notifications
              </div>
              {(notices || []).slice(0, 5).map((n) => (
                <div key={n.id} className="topbar-dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</span>
                </div>
              ))}
              {unreadCount === 0 && (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={avatarRef} style={{ position: 'relative' }}>
          <div className="topbar-avatar" onClick={() => { setShowAvatar(!showAvatar); setShowNotif(false); }}>
            {initials}
          </div>
          {showAvatar && (
            <div className="topbar-dropdown">
              <button className="topbar-dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profile
              </button>
              <button className="topbar-dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                Settings
              </button>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item" onClick={onSignOut} style={{ color: 'var(--danger)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
