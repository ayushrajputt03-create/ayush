'use client';

import { useState, useRef, useEffect } from 'react';

const AVATAR_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ChildSwitcher({ students, currentId, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!students || students.length === 0) return null;

  const current = students.find((s) => s.id === currentId) || students[0];
  const isSingle = students.length === 1;

  function getColor(index) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  function initials(name) {
    return (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="child-switcher"
        onClick={() => !isSingle && setOpen(!open)}
        style={{ cursor: isSingle ? 'default' : 'pointer' }}
      >
        <div
          className="child-avatar"
          style={{ background: getColor(students.indexOf(current)), color: '#fff' }}
        >
          {initials(current.name)}
        </div>
        <div className="child-info">
          <div className="child-name">{current.name}</div>
          <div className="child-class">Class {current.className}-{current.section}</div>
        </div>
        {!isSingle && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </div>

      {open && (
        <div className="child-dropdown">
          {students.map((s, i) => (
            <button
              key={s.id}
              className={`child-dropdown-item ${s.id === currentId ? 'active' : ''}`}
              onClick={() => { onChange(s.id); setOpen(false); }}
            >
              <div
                className="child-avatar"
                style={{ background: getColor(i), color: '#fff' }}
              >
                {initials(s.name)}
              </div>
              <div className="child-info">
                <div className="child-name">{s.name}</div>
                <div className="child-class">Class {s.className}-{s.section}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
