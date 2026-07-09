'use client';

import { useState, useEffect, useRef } from 'react';

function useAnimatedValue(target, duration = 800) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target == null) return;
    const start = performance.now();
    const from = 0;
    const to = typeof target === 'number' ? target : 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return val;
}

function KPICard({ icon, iconBg, iconColor, label, value, displayValue, sub, subColor, subBg }) {
  const animated = useAnimatedValue(value);

  return (
    <div className="kpi-card">
      <div className="kpi-card-icon" style={{ background: iconBg }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value" style={{ color: subColor || 'var(--text-primary)' }}>
        {displayValue ? displayValue(animated) : animated}
      </div>
      {sub && (
        <div className="kpi-card-sub" style={{ background: subBg || 'var(--bg)', color: subColor || 'var(--text-secondary)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default function KPICards({ attendance, feesDue, lastExamAvg, homeworkPending, homeworkSubjects }) {
  const attColor = attendance >= 85 ? 'var(--success)' : attendance >= 75 ? 'var(--warning)' : 'var(--danger)';
  const attBg = attendance >= 85 ? 'var(--success-light)' : attendance >= 75 ? 'var(--warning-light)' : 'var(--danger-light)';
  const feeColor = feesDue > 0 ? 'var(--danger)' : 'var(--success)';
  const feeBg = feesDue > 0 ? 'var(--danger-light)' : 'var(--success-light)';

  return (
    <div className="kpi-row">
      <KPICard
        icon={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
        iconBg={attBg}
        iconColor={attColor}
        label="Attendance"
        value={attendance || 0}
        displayValue={(v) => `${v}%`}
        sub={attendance >= 85 ? 'On track' : attendance >= 75 ? 'Needs improvement' : 'Below minimum'}
        subColor={attColor}
        subBg={attBg}
      />
      <KPICard
        icon={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>}
        iconBg={feeBg}
        iconColor={feeColor}
        label="Fees Due"
        value={feesDue || 0}
        displayValue={(v) => `₹${v.toLocaleString('en-IN')}`}
        sub={feesDue > 0 ? 'Payment pending' : 'All clear'}
        subColor={feeColor}
        subBg={feeBg}
      />
      <KPICard
        icon={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
        iconBg="var(--accent-light)"
        iconColor="var(--accent)"
        label="Last Exam Avg"
        value={lastExamAvg || 0}
        displayValue={(v) => `${v}/100`}
        sub={lastExamAvg >= 75 ? 'Good performance' : lastExamAvg >= 50 ? 'Average' : 'Needs attention'}
        subColor={lastExamAvg >= 75 ? 'var(--success)' : lastExamAvg >= 50 ? 'var(--warning)' : 'var(--danger)'}
        subBg={lastExamAvg >= 75 ? 'var(--success-light)' : lastExamAvg >= 50 ? 'var(--warning-light)' : 'var(--danger-light)'}
      />
      <KPICard
        icon={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>}
        iconBg="var(--info-light)"
        iconColor="var(--info)"
        label="Homework Pending"
        value={homeworkPending || 0}
        sub={homeworkSubjects || 'No pending homework'}
        subColor="var(--info)"
        subBg="var(--info-light)"
      />
    </div>
  );
}
