"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, setSchoolData } from "@/lib/db";
import { LoadingSpinner } from "@/components/ui/loading";

const CLASSES = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = ["1", "2", "3", "4", "5", "6", "7", "8"];

type TimetableData = Record<string, Record<string, string>>;

export default function TimetablePage() {
  const { schoolId } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!schoolId) { setLoading(false); return; }
    if (!selectedClass) { setLoading(false); return; }
    setLoading(true);
    setSaved(false);
    return subscribeSchoolData<TimetableData>(schoolId, `timetable/${selectedClass}`, (d) => {
      setTimetable(d || {});
      setLoading(false);
    });
  }, [schoolId, selectedClass]);

  function updateCell(day: string, period: string, value: string) {
    setSaved(false);
    setTimetable((prev) => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [period]: value },
    }));
  }

  async function handleSave() {
    if (!schoolId || !selectedClass) return;
    setSaving(true);
    try {
      await setSchoolData(schoolId, `timetable/${selectedClass}`, timetable);
      setSaved(true);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
        <option value="">Select Class</option>
        {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
      </select>

      {!selectedClass ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Select a class to manage timetable.</div>
      ) : loading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground w-28">Day / Period</th>
                  {PERIODS.map((p) => <th key={p} className="px-2 py-3 text-center font-medium text-muted-foreground">{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium text-card-foreground">{day}</td>
                    {PERIODS.map((p) => (
                      <td key={p} className="px-1 py-1">
                        <input
                          type="text"
                          value={timetable[day]?.[p] || ""}
                          onChange={(e) => updateCell(day, p, e.target.value)}
                          placeholder="—"
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-center text-xs text-foreground outline-none focus:border-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{saving ? "Saving..." : "Save Timetable"}</button>
            {saved && <span className="text-sm font-medium text-success">Saved!</span>}
          </div>
        </>
      )}
    </div>
  );
}
