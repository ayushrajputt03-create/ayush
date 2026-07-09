'use client';

const ACTIONS = [
  {
    key: 'id-card',
    label: 'Download ID Card',
    sub: 'Student identity card PDF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    key: 'message',
    label: 'Message Class Teacher',
    sub: 'Send a quick message',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: 'receipts',
    label: 'Download Fee Receipts',
    sub: 'All payment receipts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    key: 'calendar',
    label: 'School Calendar',
    sub: 'Holidays & events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export default function QuickActions({ onAction }) {
  return (
    <div className="widget-card">
      <div className="widget-card-header">
        <span className="widget-card-title">Quick Actions</span>
      </div>
      <div className="quick-actions-grid">
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            className="quick-action-btn"
            onClick={() => onAction?.(action.key)}
          >
            <div className="quick-action-icon">{action.icon}</div>
            <div className="quick-action-text">
              <div className="quick-action-label">{action.label}</div>
              <div className="quick-action-sub">{action.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
