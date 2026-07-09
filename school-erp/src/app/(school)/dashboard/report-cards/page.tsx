"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, setSchoolData, getSchoolData } from "@/lib/db";
import type { Student, School } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

const SUBJECTS = ["English", "Hindi", "Mathematics", "Science", "Social Studies", "Computer", "Art", "Physical Education"];

interface Marks { [subject: string]: { marks: number; total: number } }

export default function ReportCardsPage() {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState<Record<string, Student> | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [exam, setExam] = useState("Final");
  const [marks, setMarks] = useState<Marks>({});
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!schoolId) return;
    const unsubs: (() => void)[] = [];
    let c = 0;
    function check() { if (++c >= 2) setLoading(false); }
    unsubs.push(subscribeSchoolData<Record<string, Student>>(schoolId, "students", (d) => { setStudents(d); check(); }));
    unsubs.push(subscribeSchoolData<School>(schoolId, "profile", (d) => { setSchool(d); check(); }));
    return () => unsubs.forEach((u) => u());
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId || !selectedStudent || !exam) return;
    getSchoolData<Marks>(schoolId, `reportCards/${selectedStudent}/${exam}`).then((d) => {
      if (d) setMarks(d);
      else {
        const empty: Marks = {};
        SUBJECTS.forEach((s) => { empty[s] = { marks: 0, total: 100 }; });
        setMarks(empty);
      }
    });
  }, [schoolId, selectedStudent, exam]);

  function updateMark(subject: string, value: number) {
    setMarks((prev) => ({ ...prev, [subject]: { ...prev[subject], marks: value } }));
  }

  async function handleSave() {
    if (!schoolId || !selectedStudent) return;
    setSaving(true);
    try {
      await setSchoolData(schoolId, `reportCards/${selectedStudent}/${exam}`, marks);
      setShowReport(true);
    } finally { setSaving(false); }
  }

  const student = selectedStudent && students ? students[selectedStudent] : null;
  const totalMarks = Object.values(marks).reduce((s, m) => s + m.marks, 0);
  const totalMax = Object.values(marks).reduce((s, m) => s + m.total, 0);
  const percentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : "0";

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Report Cards</h1>
      <div className="flex flex-wrap gap-3">
        <select value={selectedStudent} onChange={(e) => { setSelectedStudent(e.target.value); setShowReport(false); }} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
          <option value="">Select Student</option>
          {students && Object.entries(students).map(([id, s]) => <option key={id} value={id}>{s.name} — {s.class}-{s.section}</option>)}
        </select>
        <select value={exam} onChange={(e) => { setExam(e.target.value); setShowReport(false); }} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
          {["Unit Test 1", "Unit Test 2", "Half Yearly", "Final"].map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {!selectedStudent ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Select a student to manage report card.</div>
      ) : showReport && student && school ? (
        <div className="space-y-4">
          <button onClick={() => window.print()} className="no-print rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600">Print</button>
          <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-8 text-black">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold uppercase">{school.name || "School"}</h2>
              <p className="text-sm text-gray-500">{exam} Examination — Report Card</p>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <p>Name: <strong>{student.name}</strong></p>
              <p>Class: <strong>{student.class}-{student.section}</strong></p>
              <p>Roll No: <strong>{student.rollNumber || "—"}</strong></p>
              <p>Adm No: <strong>{student.admissionNumber}</strong></p>
            </div>
            <table className="w-full text-sm border border-gray-300">
              <thead><tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Subject</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Marks</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Total</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Grade</th>
              </tr></thead>
              <tbody>
                {Object.entries(marks).map(([subject, m]) => {
                  const pct = m.total > 0 ? (m.marks / m.total) * 100 : 0;
                  const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : pct >= 50 ? "C" : pct >= 33 ? "D" : "F";
                  return (
                    <tr key={subject}>
                      <td className="border border-gray-300 px-3 py-1.5">{subject}</td>
                      <td className="border border-gray-300 px-3 py-1.5 text-center">{m.marks}</td>
                      <td className="border border-gray-300 px-3 py-1.5 text-center">{m.total}</td>
                      <td className="border border-gray-300 px-3 py-1.5 text-center font-medium">{grade}</td>
                    </tr>
                  );
                })}
                <tr className="font-bold bg-gray-50">
                  <td className="border border-gray-300 px-3 py-1.5">Total</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-center">{totalMarks}</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-center">{totalMax}</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-center">{percentage}%</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-8 flex justify-between text-sm"><div className="border-t border-black pt-1 text-center">Class Teacher</div><div className="border-t border-black pt-1 text-center">Principal</div></div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Enter Marks — {exam}</h2>
          <div className="space-y-3">
            {SUBJECTS.map((s) => (
              <div key={s} className="flex items-center gap-4">
                <span className="w-40 text-sm text-card-foreground">{s}</span>
                <input type="number" min="0" max={marks[s]?.total || 100} value={marks[s]?.marks || 0} onChange={(e) => updateMark(s, Number(e.target.value))} className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-center text-sm text-foreground outline-none focus:border-blue-500" />
                <span className="text-sm text-muted-foreground">/ {marks[s]?.total || 100}</span>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="mt-6 rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{saving ? "Saving..." : "Save & Preview"}</button>
        </div>
      )}
    </div>
  );
}
