"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, pushSchoolData, updateSchoolData } from "@/lib/db";
import type { Fee, Student } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

const FEE_TYPES = ["Tuition Fee", "Admission Fee", "Exam Fee", "Transport Fee", "Lab Fee", "Library Fee", "Sports Fee", "Other"];

export default function FeesPage() {
  const { schoolId } = useAuth();
  const [fees, setFees] = useState<Record<string, Fee> | null>(null);
  const [students, setStudents] = useState<Record<string, Student> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptFee, setReceiptFee] = useState<(Fee & { _id: string; studentName: string }) | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({ studentId: "", amount: "", type: "Tuition Fee", dueDate: "", status: "unpaid" as Fee["status"] });

  useEffect(() => {
    if (!schoolId) return;
    const unsubs: (() => void)[] = [];
    let loaded = 0;
    function check() { if (++loaded >= 2) setLoading(false); }
    unsubs.push(subscribeSchoolData<Record<string, Fee>>(schoolId, "fees", (d) => { setFees(d); check(); }));
    unsubs.push(subscribeSchoolData<Record<string, Student>>(schoolId, "students", (d) => { setStudents(d); check(); }));
    return () => unsubs.forEach((u) => u());
  }, [schoolId]);

  const studentName = (id: string) => students?.[id]?.name || "Unknown";

  const feeList = useMemo(() => {
    if (!fees) return [];
    return Object.entries(fees)
      .map(([id, f]) => ({ ...f, _id: id, studentName: studentName(f.studentId) }))
      .filter((f) => {
        if (filterStatus && f.status !== filterStatus) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return f.studentName.toLowerCase().includes(q) || f.receiptNumber?.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => (b.dueDate || "").localeCompare(a.dueDate || ""));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fees, students, filterStatus, searchQuery]);

  const totalCollected = feeList.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const totalPending = feeList.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);

  async function handleCollect() {
    if (!schoolId || !form.studentId || !form.amount) return;
    setSaving(true);
    try {
      const receiptNumber = `REC-${Date.now().toString(36).toUpperCase()}`;
      await pushSchoolData(schoolId, "fees", {
        id: "",
        studentId: form.studentId,
        amount: Number(form.amount),
        type: form.type,
        status: form.status,
        dueDate: form.dueDate,
        paidDate: form.status === "paid" ? new Date().toISOString().split("T")[0] : undefined,
        receiptNumber,
      });
      setShowForm(false);
      setForm({ studentId: "", amount: "", type: "Tuition Fee", dueDate: "", status: "unpaid" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(feeId: string) {
    if (!schoolId) return;
    await updateSchoolData(schoolId, `fees/${feeId}`, {
      status: "paid",
      paidDate: new Date().toISOString().split("T")[0],
    });
  }

  function printReceipt() {
    window.print();
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  if (receiptFee) {
    return (
      <div className="space-y-4">
        <div className="no-print flex gap-3">
          <button onClick={() => setReceiptFee(null)} className="text-sm text-blue-500 hover:text-blue-400">&larr; Back</button>
          <button onClick={printReceipt} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">Print Receipt</button>
        </div>
        <div ref={receiptRef} className="mx-auto max-w-md rounded-xl border border-border bg-white p-8 text-black">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold">FEE RECEIPT</h2>
            <p className="text-sm text-gray-500">Receipt No: {receiptFee.receiptNumber}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Student:</span><span className="font-medium">{receiptFee.studentName}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Fee Type:</span><span>{receiptFee.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span className="font-bold text-lg">₹{receiptFee.amount.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className="font-medium">{receiptFee.status.toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Due Date:</span><span>{receiptFee.dueDate || "—"}</span></div>
            {receiptFee.paidDate && <div className="flex justify-between"><span className="text-gray-600">Paid Date:</span><span>{receiptFee.paidDate}</span></div>}
          </div>
          <div className="mt-8 border-t pt-4 text-center text-xs text-gray-400">This is a computer-generated receipt.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">+ Collect Fee</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Collected</p>
          <p className="text-2xl font-bold text-success">₹{totalCollected.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Pending</p>
          <p className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search by student, receipt no, type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 min-w-[250px] rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      {feeList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No fee records yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeList.map((f) => (
                <tr key={f._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-card-foreground">{f.studentName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">₹{f.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.dueDate || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      f.status === "paid" ? "bg-success/10 text-success" : f.status === "partial" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    }`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {f.status !== "paid" && (
                      <button onClick={() => markPaid(f._id)} className="mr-2 text-success hover:text-success/80">Mark Paid</button>
                    )}
                    <button onClick={() => setReceiptFee(f)} className="text-blue-500 hover:text-blue-400">Receipt</button>
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
            <h2 className="mb-6 text-xl font-bold text-card-foreground">Collect Fee</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Student <span className="text-destructive">*</span></label>
                <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Select Student</option>
                  {students && Object.entries(students).map(([id, s]) => (
                    <option key={id} value={id}>{s.name} — {s.class}-{s.section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Fee Type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  {FEE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount (₹) <span className="text-destructive">*</span></label>
                <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Payment Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Fee["status"] }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleCollect} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">
                {saving ? "Saving..." : "Save Fee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
