"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, pushSchoolData, removeSchoolData } from "@/lib/db";
import { LoadingSpinner } from "@/components/ui/loading";

interface Expense { id: string; title: string; category: string; amount: number; date: string; paidTo: string; note: string; }

const CATEGORIES = ["Salary", "Rent", "Utilities", "Supplies", "Maintenance", "Transport", "Events", "Printing", "Food", "Other"];

export default function ExpensesPage() {
  const { schoolId } = useAuth();
  const [expenses, setExpenses] = useState<Record<string, Expense> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm] = useState({ title: "", category: "Other", amount: "", date: new Date().toISOString().split("T")[0], paidTo: "", note: "" });

  useEffect(() => {
    if (!schoolId) return;
    return subscribeSchoolData<Record<string, Expense>>(schoolId, "expenses", (d) => { setExpenses(d); setLoading(false); });
  }, [schoolId]);

  const list = useMemo(() => {
    if (!expenses) return [];
    return Object.entries(expenses)
      .map(([id, e]) => ({ ...e, _id: id }))
      .filter((e) => !filterCat || e.category === filterCat)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filterCat]);

  const total = list.reduce((s, e) => s + e.amount, 0);

  async function handleSave() {
    if (!schoolId || !form.title || !form.amount) return;
    setSaving(true);
    try {
      await pushSchoolData(schoolId, "expenses", { ...form, id: "", amount: Number(form.amount) });
      setShowForm(false);
      setForm({ title: "", category: "Other", amount: "", date: new Date().toISOString().split("T")[0], paidTo: "", note: "" });
    } finally { setSaving(false); }
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">+ Add Expense</button>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
        <p className="text-2xl font-bold text-destructive">₹{total.toLocaleString("en-IN")}</p>
      </div>
      <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      {list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No expenses recorded.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Paid To</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {list.map((e) => (
                <tr key={e._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-card-foreground">{e.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">₹{e.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.paidTo || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => schoolId && confirm("Delete?") && removeSchoolData(schoolId, `expenses/${e._id}`)} className="text-destructive hover:text-destructive/80">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-card-foreground">Add Expense</h2>
            <div className="space-y-4">
              {[{ id: "title", label: "Title", required: true }, { id: "amount", label: "Amount (₹)", type: "number", required: true }, { id: "paidTo", label: "Paid To" }, { id: "date", label: "Date", type: "date" }].map((f) => (
                <div key={f.id}><label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                  <input type={f.type || "text"} value={form[f.id as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" /></div>
              ))}
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Note</label>
                <textarea value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
