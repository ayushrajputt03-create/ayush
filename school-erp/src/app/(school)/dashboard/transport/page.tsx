"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, pushSchoolData, removeSchoolData } from "@/lib/db";
import { LoadingSpinner } from "@/components/ui/loading";

interface Route { id: string; routeName: string; busNumber: string; driverName: string; driverPhone: string; stops: string; monthlyFee: number; }

export default function TransportPage() {
  const { schoolId } = useAuth();
  const [routes, setRoutes] = useState<Record<string, Route> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ routeName: "", busNumber: "", driverName: "", driverPhone: "", stops: "", monthlyFee: "" });

  useEffect(() => {
    if (!schoolId) return;
    return subscribeSchoolData<Record<string, Route>>(schoolId, "transport", (d) => { setRoutes(d); setLoading(false); });
  }, [schoolId]);

  const list = useMemo(() => routes ? Object.entries(routes).map(([id, r]) => ({ ...r, _id: id })).sort((a, b) => a.routeName.localeCompare(b.routeName)) : [], [routes]);

  async function handleSave() {
    if (!schoolId || !form.routeName) return;
    setSaving(true);
    try {
      await pushSchoolData(schoolId, "transport", { ...form, id: "", monthlyFee: Number(form.monthlyFee) || 0 });
      setShowForm(false);
      setForm({ routeName: "", busNumber: "", driverName: "", driverPhone: "", stops: "", monthlyFee: "" });
    } finally { setSaving(false); }
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Transport</h1>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">+ Add Route</button>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No routes added.</div>
      ) : (
        <div className="grid gap-4">
          {list.map((r) => (
            <div key={r._id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">{r.routeName}</h3>
                  <p className="text-sm text-muted-foreground">Bus: {r.busNumber} | Driver: {r.driverName} ({r.driverPhone})</p>
                  <p className="text-sm text-muted-foreground">Stops: {r.stops}</p>
                  <p className="text-sm font-medium text-blue-500">₹{r.monthlyFee.toLocaleString("en-IN")}/month</p>
                </div>
                <button onClick={() => schoolId && confirm("Delete?") && removeSchoolData(schoolId, `transport/${r._id}`)} className="text-xs text-destructive hover:text-destructive/80">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-card-foreground">Add Route</h2>
            <div className="space-y-4">
              {[{ id: "routeName", label: "Route Name" }, { id: "busNumber", label: "Bus Number" }, { id: "driverName", label: "Driver Name" }, { id: "driverPhone", label: "Driver Phone" }, { id: "monthlyFee", label: "Monthly Fee (₹)", type: "number" }].map((f) => (
                <div key={f.id}><label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                  <input type={f.type || "text"} value={form[f.id as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" /></div>
              ))}
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Stops (comma separated)</label>
                <textarea value={form.stops} onChange={(e) => setForm((p) => ({ ...p, stops: e.target.value }))} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{saving ? "Saving..." : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
