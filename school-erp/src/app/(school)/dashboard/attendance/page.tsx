"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, setSchoolData, getSchoolData } from "@/lib/db";
import type { Student } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

const CLASSES = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

type Status = "present" | "absent" | "late" | "half-day";

interface AttendanceEntry {
  studentId: string;
  status: Status;
}

export default function AttendancePage() {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState<Record<string, Student> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!schoolId) return;
    return subscribeSchoolData<Record<string, Student>>(schoolId, "students", (data) => {
      setStudents(data);
      setLoading(false);
    });
  }, [schoolId]);

  const classStudents = useMemo(() => {
    if (!students || !selectedClass) return [];
    return Object.entries(students)
      .filter(([, s]) => s.class === selectedClass && s.status === "active")
      .map(([id, s]) => ({ ...s, _id: id }))
      .sort((a, b) => {
        const ra = parseInt(a.rollNumber) || 0;
        const rb = parseInt(b.rollNumber) || 0;
        return ra - rb || a.name.localeCompare(b.name);
      });
  }, [students, selectedClass]);

  useEffect(() => {
    if (!schoolId || !selectedClass || !selectedDate) return;
    setSaved(false);
    const key = `${selectedDate}_${selectedClass}`;
    getSchoolData<Record<string, AttendanceEntry>>(schoolId, `attendance/${key}`).then((data) => {
      if (data) {
        const map: Record<string, Status> = {};
        Object.values(data).forEach((e) => { map[e.studentId] = e.status; });
        setAttendance(map);
      } else {
        const map: Record<string, Status> = {};
        classStudents.forEach((s) => { map[s._id] = "present"; });
        setAttendance(map);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, selectedClass, selectedDate, classStudents.length]);

  function toggleStatus(studentId: string) {
    setSaved(false);
    const order: Status[] = ["present", "absent", "late", "half-day"];
    setAttendance((prev) => {
      const current = prev[studentId] || "present";
      const next = order[(order.indexOf(current) + 1) % order.length];
      return { ...prev, [studentId]: next };
    });
  }

  async function handleSave() {
    if (!schoolId || !selectedClass || !selectedDate) return;
    setSaving(true);
    try {
      const key = `${selectedDate}_${selectedClass}`;
      const entries: Record<string, AttendanceEntry> = {};
      classStudents.forEach((s) => {
        entries[s._id] = { studentId: s._id, status: attendance[s._id] || "present" };
      });
      await setSchoolData(schoolId, `attendance/${key}`, entries);
      setSaved(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const statusColors: Record<Status, string> = {
    present: "bg-success text-white",
    absent: "bg-destructive text-white",
    late: "bg-warning text-white",
    "half-day": "bg-blue-500 text-white",
  };

  const counts = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
    "half-day": Object.values(attendance).filter((s) => s === "half-day").length,
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Attendance</h1>

      <div className="flex flex-wrap gap-3">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
          <option value="">Select Class</option>
          {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
      </div>

      {!selectedClass ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Select a class to mark attendance.
        </div>
      ) : classStudents.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          No active students in Class {selectedClass}.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-lg bg-success/10 px-3 py-1 text-xs font-medium text-success">Present: {counts.present}</span>
            <span className="rounded-lg bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">Absent: {counts.absent}</span>
            <span className="rounded-lg bg-warning/10 px-3 py-1 text-xs font-medium text-warning">Late: {counts.late}</span>
            <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">Half-Day: {counts["half-day"]}</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Roll</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Section</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status (click to toggle)</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s) => (
                  <tr key={s._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-muted-foreground">{s.rollNumber || "—"}</td>
                    <td className="px-4 py-3 font-medium text-card-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.section}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(s._id)}
                        className={`inline-block min-w-[80px] rounded-full px-3 py-1 text-xs font-semibold ${statusColors[attendance[s._id] || "present"]}`}
                      >
                        {(attendance[s._id] || "present").toUpperCase()}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">
              {saving ? "Saving..." : "Save Attendance"}
            </button>
            {saved && <span className="text-sm font-medium text-success">Saved successfully!</span>}
          </div>
        </>
      )}
    </div>
  );
}
