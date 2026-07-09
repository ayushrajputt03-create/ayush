'use client';

import { useEffect, useRef } from 'react';
import { useMarks } from '@/hooks/useMarks';

function getBarColor(score) {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#3B82F6';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function getGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function BarRow({ subject, score, maxScore }) {
  const barRef = useRef(null);
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    el.style.width = '0%';
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.width = `${pct}%`;
      });
    });
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="subject-row">
      <div className="subject-row-header">
        <span className="subject-name">{subject}</span>
        <span className="subject-score">
          {score}/{maxScore}
          <span className="subject-grade" style={{ color: getBarColor(pct) }}>
            {getGrade(pct)}
          </span>
        </span>
      </div>
      <div className="subject-bar-track">
        <div
          ref={barRef}
          className="subject-bar-fill"
          style={{
            background: `linear-gradient(90deg, ${getBarColor(pct)}, ${getBarColor(pct)}cc)`,
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}

function SkeletonSubjects() {
  return (
    <div className="widget-card">
      <div className="skeleton skeleton-text long" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div className="skeleton skeleton-text medium" />
          <div className="skeleton" style={{ height: 8, borderRadius: 4, marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

export default function SubjectProgress({ studentId }) {
  const { data: subjects, loading, error } = useMarks(studentId);

  if (loading) return <SkeletonSubjects />;

  if (error) {
    return (
      <div className="widget-card">
        <div className="error-state">
          Failed to load marks
          <button className="error-retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const avg = subjects.length > 0
    ? Math.round(subjects.reduce((s, sub) => s + ((sub.scored || 0) / (sub.total || 100)) * 100, 0) / subjects.length)
    : 0;

  return (
    <div className="widget-card">
      <div className="widget-card-header">
        <span className="widget-card-title">Subject Progress</span>
        <span className="widget-card-link">Avg: {avg}%</span>
      </div>

      {subjects.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No marks available yet
        </div>
      ) : (
        <div className="subject-list">
          {subjects.map((sub) => (
            <BarRow
              key={sub.id}
              subject={sub.subjectName || sub.id}
              score={sub.scored || 0}
              maxScore={sub.total || 100}
            />
          ))}
        </div>
      )}
    </div>
  );
}
