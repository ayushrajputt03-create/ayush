'use client';

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useStudentData } from '@/hooks/useStudentData';
import { useFees } from '@/hooks/useFees';
import { useMarks } from '@/hooks/useMarks';
import { useNotices } from '@/hooks/useNotices';
import { useAttendance } from '@/hooks/useAttendance';
import ParentTopbar from './ParentTopbar';
import ParentSidebar from './ParentSidebar';
import KPICards from './KPICards';
import AttendanceCalendar from './AttendanceCalendar';
import FeeWidget from './FeeWidget';
import SubjectProgress from './SubjectProgress';
import NoticesFeed from './NoticesFeed';
import QuickActions from './QuickActions';
import '@/styles/parent.css';

const MOBILE_NAV_ITEMS = [
  { key: 'dashboard', label: 'Home', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { key: 'attendance', label: 'Attendance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
  { key: 'fees', label: 'Fees', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { key: 'notices', label: 'Notices', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
];

export default function ParentDashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [calYear, setCalYear] = useState(now.getFullYear());

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const studentIds = useMemo(() => {
    if (!user) return [];
    const claims = user.reloadUserInfo?.customAttributes
      ? JSON.parse(user.reloadUserInfo.customAttributes)
      : {};
    return claims.studentIds || [];
  }, [user]);

  useEffect(() => {
    if (studentIds.length > 0 && !selectedStudentId) {
      setSelectedStudentId(studentIds[0]);
    }
  }, [studentIds, selectedStudentId]);

  const { data: studentData } = useStudentData(selectedStudentId);
  const { data: fees } = useFees(selectedStudentId);
  const { data: marks } = useMarks(selectedStudentId);
  const { data: notices } = useNotices(studentData?.classId);
  const { data: attendanceData } = useAttendance(selectedStudentId, calMonth, calYear);

  const students = useMemo(() => {
    return studentIds.map((id) => ({
      id,
      name: id === selectedStudentId && studentData ? studentData.name : id,
      className: id === selectedStudentId && studentData ? studentData.className : '',
      section: id === selectedStudentId && studentData ? studentData.section : '',
    }));
  }, [studentIds, selectedStudentId, studentData]);

  const attendancePct = useMemo(() => {
    const vals = Object.values(attendanceData || {});
    if (vals.length === 0) return 0;
    const present = vals.filter((v) => v === 'present' || v === 'late').length;
    return Math.round((present / vals.length) * 100);
  }, [attendanceData]);

  const totalDue = useMemo(() => {
    return (fees || [])
      .filter((f) => f.status === 'unpaid' || f.status === 'partial')
      .reduce((s, f) => s + (f.amount || 0), 0);
  }, [fees]);

  const examAvg = useMemo(() => {
    if (!marks || marks.length === 0) return 0;
    return Math.round(
      marks.reduce((s, m) => s + ((m.scored || 0) / (m.total || 100)) * 100, 0) / marks.length
    );
  }, [marks]);

  const badges = useMemo(() => ({
    fees: (fees || []).filter((f) => f.status !== 'paid').length,
    notices: (notices || []).filter((n) => !n.read).length,
  }), [fees, notices]);

  function handleSignOut() {
    auth?.signOut();
  }

  if (authLoading) {
    return (
      <div className="parent-root">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/parent/login';
    }
    return null;
  }

  return (
    <div className="parent-root">
      <ParentSidebar
        activeKey={activeView}
        onNavigate={setActiveView}
        badges={badges}
        students={students}
        currentStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
      />

      <div className="parent-main">
        <ParentTopbar
          parentName={user.displayName || user.email?.split('@')[0]}
          notices={notices}
          onSignOut={handleSignOut}
        />

        <div className="parent-content">
          <KPICards
            attendance={attendancePct}
            feesDue={totalDue}
            lastExamAvg={examAvg}
            homeworkPending={0}
            pendingSubjects=""
          />

          <div className="dashboard-grid">
            <div className="dashboard-col-left">
              <AttendanceCalendar
                studentId={selectedStudentId}
                month={calMonth}
                year={calYear}
                onMonthChange={(m, y) => { setCalMonth(m); setCalYear(y); }}
              />
              <SubjectProgress studentId={selectedStudentId} />
            </div>
            <div className="dashboard-col-right">
              <FeeWidget studentId={selectedStudentId} />
              <NoticesFeed classId={studentData?.classId} />
              <QuickActions onAction={(key) => setActiveView(key)} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {MOBILE_NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`mobile-nav-btn ${activeView === item.key ? 'active' : ''}`}
            onClick={() => setActiveView(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
