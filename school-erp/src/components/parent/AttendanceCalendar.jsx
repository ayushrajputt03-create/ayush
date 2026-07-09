'use client';

import { useMemo } from 'react';
import { useAttendance } from '@/hooks/useAttendance';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Skeleton() {
  return (
    <div className="widget-card">
      <div className="skeleton" style={{ height: 20, width: 160, marginBottom: 20 }} />
      <div className="cal-grid">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-circle" style={{ width: 32, height: 32, margin: '2px auto' }} />
        ))}
      </div>
    </div>
  );
}

export default function AttendanceCalendar({ studentId, month, year, onMonthChange }) {
  const { data, loading, error } = useAttendance(studentId, month, year);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const { days, summary } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push({ day: null, status: 'empty' });

    let present = 0, absent = 0, late = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      const isSunday = dayOfWeek === 0;
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;

      let status = 'holiday';
      if (data[dateStr]) {
        status = data[dateStr];
      } else if (isFuture) {
        status = 'future';
      } else if (isSunday) {
        status = 'holiday';
      }

      if (isToday && !isFuture) status = 'today';
      if (data[dateStr] === 'present') present++;
      if (data[dateStr] === 'absent') absent++;
      if (data[dateStr] === 'late') late++;

      cells.push({ day: d, status, isToday });
    }

    const total = present + absent + late;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { days: cells, summary: { present, absent, late, rate } };
  }, [data, month, year, todayStr]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="widget-card">
        <div className="error-state">
          Failed to load attendance
          <button className="error-retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-card">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={() => onMonthChange(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span className="cal-nav-title">{MONTH_NAMES[month - 1]} {year}</span>
        <button className="cal-nav-btn" onClick={() => onMonthChange(1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <div className="cal-grid">
        {DAYS.map((d) => <div key={d} className="cal-header">{d}</div>)}
        {days.map((cell, i) => (
          <div key={i} className={`cal-day ${cell.status}`}>
            {cell.day}
          </div>
        ))}
      </div>

      <div className="cal-summary">
        <div className="cal-summary-item">
          <span className="cal-summary-dot" style={{ background: 'var(--success)' }} />
          Present {summary.present}
        </div>
        <div className="cal-summary-item">
          <span className="cal-summary-dot" style={{ background: 'var(--danger)' }} />
          Absent {summary.absent}
        </div>
        <div className="cal-summary-item">
          <span className="cal-summary-dot" style={{ background: 'var(--warning)' }} />
          Late {summary.late}
        </div>
        <div className="cal-summary-item">
          <span className="cal-summary-dot" style={{ background: 'var(--accent)' }} />
          Rate {summary.rate}%
        </div>
      </div>
    </div>
  );
}
