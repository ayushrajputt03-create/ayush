"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, pushSchoolData, updateSchoolData } from "@/lib/db";
import type { LeaveRequest, Employee } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

export default function LeavePage() {
  const { schoolId } = useAuth();
  const [leaves, setLeaves] = useState<Record<string, LeaveRequest> | null>(null);
  const [employees, setEmployees] = useState<Record<string, Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({ employeeId: "", type: "casual" as LeaveRequest["type"], fromDate: "", toDate: "", reason: "" });

  useEffect(() => {
    if (!schoolId) return;
    const unsubs: (() => void)[] = [];
    let loaded = 0;
    function check() { if (++loaded >= 2) setLoading(false); }
    unsubs.push(subscribeSchoolData<Record<string, LeaveRequest>>(schoolId, "leave", (d) => { setLeaves(d); check(); }));
    unsubs.push(subscribeSchoolData<Record<string, Employee>>(schoolId, "employees", (d) => { setEmployees(d); check(); }));
    return () => unsubs.forEach((u) => u());
  }, [schoolId]);

  const empName = (id: string) => employees?.[id]?.name || "Unknown";

  const leaveList = useMemo(() => {
    if (!leaves) return [];
    return Object.entries(leaves)
      .map(([id, l]) => ({ ...l, _id: id }))
      .filter((l) => !filterStatus || l.status === filterStatus)
      .sort((a, b) => (b.fromDate || "").localeCompare(a.fromDate || ""));
  }, [leaves, filterStatus]);

  async function handleSubmit() {
    if (!schoolId || !form.employeeId || !form.fromDate || !form.toDate) return;
    setSaving(true);
    try {
      await pushSchoolData(schoolId, "leave", { ...form, id: "", status: "pending" });
      setShowForm(false);
      setForm({ employeeId: "", type: "casual", fromDate: "", toDate: "", reason: "" });
    } finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    if (!schoolId) return;
    await updateSchoolData(schoolId, `leave/${id}`, { status });
  }

  const statusColors = { pending: "bg-warning/10 text-warning", approved: "bg-success/10 text-success", rejected: "bg-destructive/10 text-destructive" };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">+ Apply Leave</button>
      </div>
      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
        <option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
      </select>
      {leaveList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No leave requests.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">From</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">To</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reason</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {leaveList.map((l) => (
                <tr key={l._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-card-foreground">{empName(l.employeeId)}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{l.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.fromDate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.toDate}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{l.reason}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[l.status]}`}>{l.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {l.status === "pending" && (<>
                      <button onClick={() => updateStatus(l._id, "approved")} className="mr-2 text-success hover:text-success/80">Approve</button>
                      <button onClick={() => updateStatus(l._id, "rejected")} className="text-destructive hover:text-destructive/80">Reject</button>
                    </>)}
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
            <h2 className="mb-6 text-xl font-bold text-card-foreground">Apply Leave</h2>
            <div className="space-y-4">
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Employee</label>
                <select value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Select</option>
                  {employees && Object.entries(employees).map(([id, e]) => <option key={id} value={id}>{e.name}</option>)}
                </select></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Leave Type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as LeaveRequest["type"] }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="casual">Casual</option><option value="sick">Sick</option><option value="earned">Earned</option><option value="other">Other</option>
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
                  <input type="date" value={form.fromDate} onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></div>
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
                  <input type="date" value={form.toDate} onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Reason</label>
                <textarea value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{saving ? "Saving..." : "Submit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
