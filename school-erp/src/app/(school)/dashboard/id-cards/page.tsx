"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData } from "@/lib/db";
import type { Student, School } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

const CLASSES = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function IDCardsPage() {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState<Record<string, Student> | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!schoolId) return;
    const unsubs: (() => void)[] = [];
    let c = 0;
    function check() { if (++c >= 2) setLoading(false); }
    unsubs.push(subscribeSchoolData<Record<string, Student>>(schoolId, "students", (d) => { setStudents(d); check(); }));
    unsubs.push(subscribeSchoolData<School>(schoolId, "profile", (d) => { setSchool(d); check(); }));
    return () => unsubs.forEach((u) => u());
  }, [schoolId]);

  const filtered = students
    ? Object.entries(students)
        .filter(([, s]) => s.status === "active" && (!filterClass || s.class === filterClass))
        .map(([id, s]) => ({ ...s, _id: id }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  function toggleSelect(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s._id)));
  }

  const cardsToShow = filtered.filter((s) => selected.has(s._id));

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">ID Cards</h1>
        {cardsToShow.length > 0 && (
          <button onClick={() => window.print()} className="no-print rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600">Print Selected ({cardsToShow.length})</button>
        )}
      </div>

      <div className="no-print flex flex-wrap gap-3 items-center">
        <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setSelected(new Set()); }} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
          <option value="">All Classes</option>
          {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <button onClick={selectAll} className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
          {selected.size === filtered.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No students found.</div>
      ) : (
        <>
          <div className="no-print overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left"><input type="checkbox" checked={selected.size === filtered.length} onChange={selectAll} /></th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Adm No</th>
              </tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.has(s._id)} onChange={() => toggleSelect(s._id)} /></td>
                    <td className="px-4 py-3 font-medium text-card-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.class}-{s.section}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.admissionNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cardsToShow.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cardsToShow.map((s) => (
                <div key={s._id} className="rounded-xl border-2 border-navy-800 bg-white p-5 text-black" style={{ width: "340px", minHeight: "200px" }}>
                  <div className="flex items-center gap-2 border-b border-navy-800 pb-2 mb-3">
                    {school?.logo && <img src={school.logo} alt="" className="h-10 w-10 object-contain" />}
                    <div>
                      <p className="font-bold text-sm text-navy-900 uppercase">{school?.name || "School"}</p>
                      <p className="text-[10px] text-gray-500">{school?.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {s.photo ? (
                      <img src={s.photo} alt="" className="h-20 w-16 rounded object-cover border border-gray-300" />
                    ) : (
                      <div className="flex h-20 w-16 items-center justify-center rounded bg-gray-100 text-xl font-bold text-gray-400">{s.name.charAt(0)}</div>
                    )}
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-sm">{s.name}</p>
                      <p>Class: {s.class}-{s.section}</p>
                      <p>Roll: {s.rollNumber || "—"}</p>
                      <p>Adm: {s.admissionNumber}</p>
                      <p>DOB: {s.dateOfBirth || "—"}</p>
                      <p>Ph: {s.phone}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-gray-300 pt-2 text-right text-[10px] text-gray-500">
                    {school?.principal && <p>Principal: {school.principal}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
