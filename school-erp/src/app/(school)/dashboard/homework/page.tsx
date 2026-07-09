"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, pushSchoolData, removeSchoolData } from "@/lib/db";
import { LoadingSpinner } from "@/components/ui/loading";

interface Homework { id: string; class: string; section: string; subject: string; description: string; dueDate: string; assignedDate: string; }

const CLASSES = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SUBJECTS = ["English", "Hindi", "Mathematics", "Science", "Social Studies", "Computer", "Art", "Physical Education", "Other"];

export default function HomeworkPage() {
  const { schoolId } = useAuth();
  const [homework, setHomework] = useState<Record<string, Homework> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [form, setForm] = useState({ class: "", section: "A", subject: "English", description: "", dueDate: "", assignedDate: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    if (!schoolId) return;
    return subscribeSchoolData<Record<string, Homework>>(schoolId, "homework", (d) => { setHomework(d); setLoading(false); });
  }, [schoolId]);

  const list = useMemo(() => {
    if (!homework) return [];
    return Object.entries(homework)
      .map(([id, h]) => ({ ...h, _id: id }))
      .filter((h) => !filterClass || h.class === filterClass)
      .sort((a, b) => b.assignedDate.localeCompare(a.assignedDate));
  }, [homework, filterClass]);

  async function handleSave() {
    if (!schoolId || !form.class || !form.description) return;
    setSaving(true);
    try {
      await pushSchoolData(schoolId, "homework", { ...form, id: "" });
      setShowForm(false);
      setForm({ class: "", section: "A", subject: "English", description: "", dueDate: "", assignedDate: new Date().toISOString().split("T")[0] });
    } finally { setSaving(false); }
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Homework</h1>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">+ Assign Homework</button>
      </div>
      <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
        <option value="">All Classes</option>
        {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
      </select>
      {list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No homework assigned yet.</div>
      ) : (
        <div className="grid gap-4">
          {list.map((h) => (
            <div key={h._id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">Class {h.class}-{h.section}</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{h.subject}</span>
                  </div>
                  <p className="text-sm text-card-foreground">{h.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Assigned: {h.assignedDate} {h.dueDate && `| Due: ${h.dueDate}`}</p>
                </div>
                <button onClick={() => schoolId && confirm("Delete?") && removeSchoolData(schoolId, `homework/${h._id}`)} className="text-xs text-destructive hover:text-destructive/80">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-card-foreground">Assign Homework</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Class</label>
                  <select value={form.class} onChange={(e) => setForm((p) => ({ ...p, class: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                    <option value="">Select</option>{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Section</label>
                  <select value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                    {["A","B","C","D"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
                <select value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Assigned Date</label>
                  <input type="date" value={form.assignedDate} onChange={(e) => setForm((p) => ({ ...p, assignedDate: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></div>
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{saving ? "Saving..." : "Assign"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
