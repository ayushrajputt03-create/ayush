'use client';

import { useState } from 'react';
import { useNotices } from '@/hooks/useNotices';

const CATEGORY_ICONS = {
  exam: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  event: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  urgent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  general: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const CATEGORY_COLORS = {
  exam: { bg: '#EFF6FF', color: '#3B82F6' },
  event: { bg: '#ECFDF5', color: '#10B981' },
  urgent: { bg: '#FEF2F2', color: '#EF4444' },
  general: { bg: '#F3F4F6', color: '#6B7280' },
};

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const ms = timestamp.seconds ? timestamp.seconds * 1000 : timestamp;
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function SkeletonNotices() {
  return (
    <div className="widget-card">
      <div className="skeleton skeleton-text long" />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
          <div className="skeleton skeleton-circle" style={{ width: 36, height: 36 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text medium" />
            <div className="skeleton skeleton-text short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NoticesFeed({ classId }) {
  const { data: notices, loading, error } = useNotices(classId);
  const [expandedId, setExpandedId] = useState(null);

  if (loading) return <SkeletonNotices />;

  if (error) {
    return (
      <div className="widget-card">
        <div className="error-state">
          Failed to load notices
          <button className="error-retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-card">
      <div className="widget-card-header">
        <span className="widget-card-title">Notices</span>
        <button className="widget-card-link">View all</button>
      </div>

      {notices.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No notices yet
        </div>
      ) : (
        <div className="notices-list">
          {notices.map((notice) => {
            const cat = notice.category || 'general';
            const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;
            const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.general;
            const isExpanded = expandedId === notice.id;
            const isUnread = !notice.read;

            return (
              <div
                key={notice.id}
                className={`notice-item ${isExpanded ? 'expanded' : ''} ${isUnread ? 'unread' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : notice.id)}
              >
                <div className="notice-icon" style={{ background: colors.bg, color: colors.color }}>
                  {icon}
                </div>
                <div className="notice-content">
                  <div className="notice-title">{notice.title}</div>
                  <div className="notice-meta">
                    <span className="notice-category" style={{ color: colors.color }}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </span>
                    <span className="notice-time">{timeAgo(notice.createdAt)}</span>
                  </div>
                  {isExpanded && notice.body && (
                    <div className="notice-body">{notice.body}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
