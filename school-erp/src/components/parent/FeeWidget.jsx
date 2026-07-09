'use client';

import { useState, useMemo } from 'react';
import { useFees } from '@/hooks/useFees';

function SkeletonFees() {
  return (
    <div className="widget-card">
      <div className="skeleton skeleton-text long" />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div><div className="skeleton skeleton-text medium" /><div className="skeleton skeleton-text short" /></div>
          <div className="skeleton" style={{ width: 60, height: 24 }} />
        </div>
      ))}
    </div>
  );
}

function PaymentModal({ amount, onClose }) {
  const options = [
    { label: 'UPI / Google Pay', sub: 'Instant transfer', icon: '📱' },
    { label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
    { label: 'Net Banking', sub: 'All major banks', icon: '🏦' },
    { label: 'Pay at School', sub: 'Cash or cheque', icon: '🏫' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Pay Fees</div>
        <div className="modal-sub">Total amount: ₹{amount.toLocaleString('en-IN')}</div>
        {options.map((opt) => (
          <button key={opt.label} className="modal-option">
            <span style={{ fontSize: 24 }}>{opt.icon}</span>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.sub}</div>
            </div>
          </button>
        ))}
        <button className="modal-close" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function FeeWidget({ studentId }) {
  const { data: fees, loading, error } = useFees(studentId);
  const [showPayment, setShowPayment] = useState(false);

  const totalDue = useMemo(() => {
    return fees
      .filter((f) => f.status === 'unpaid' || f.status === 'partial')
      .reduce((sum, f) => sum + (f.amount || 0), 0);
  }, [fees]);

  if (loading) return <SkeletonFees />;

  if (error) {
    return (
      <div className="widget-card">
        <div className="error-state">
          Failed to load fees
          <button className="error-retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const unpaidFees = fees.filter((f) => f.status !== 'paid');
  const recentPaid = fees.filter((f) => f.status === 'paid').slice(0, 2);
  const displayFees = [...unpaidFees, ...recentPaid];

  return (
    <div className="widget-card">
      <div className="widget-card-header">
        <span className="widget-card-title">Fees</span>
        <button className="widget-card-link">View all receipts</button>
      </div>

      {displayFees.length === 0 ? (
        <div className="fee-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>All fees paid ✓</div>
        </div>
      ) : (
        <>
          {displayFees.map((fee) => (
            <div key={fee.id} className="fee-item">
              <div className="fee-item-left">
                <div className="fee-item-title">{fee.title}</div>
                <div className="fee-item-due">
                  {fee.status === 'paid'
                    ? `Paid ${fee.paidAt || ''}`
                    : `Due ${fee.dueDate || ''}`}
                </div>
              </div>
              <span className="fee-item-amount" style={{ color: fee.status === 'paid' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                ₹{(fee.amount || 0).toLocaleString('en-IN')}
              </span>
              <span className={`fee-pill ${fee.status}`}>
                {fee.status === 'paid' ? 'Paid' : fee.status === 'partial' ? 'Partial' : 'Due'}
              </span>
            </div>
          ))}

          {totalDue > 0 && (
            <>
              <div className="fee-total">
                <span>Total Due</span>
                <span className="fee-total-amount">₹{totalDue.toLocaleString('en-IN')}</span>
              </div>
              <button className="fee-pay-btn" onClick={() => setShowPayment(true)}>
                Pay Now ₹{totalDue.toLocaleString('en-IN')}
              </button>
            </>
          )}
        </>
      )}

      {showPayment && <PaymentModal amount={totalDue} onClose={() => setShowPayment(false)} />}
    </div>
  );
}
