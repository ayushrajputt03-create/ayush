"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { pushSchoolData } from "@/lib/db";

const CLASSES = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function AdmissionsPage() {
  const { schoolId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "", class: "", section: "A", admissionNumber: "", fatherName: "", motherName: "",
    phone: "", email: "", address: "", dateOfBirth: "", gender: "male",
    admissionDate: new Date().toISOString().split("T")[0],
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit() {
    if (!schoolId || !form.name || !form.class || !form.admissionNumber || !form.phone) {
      alert("Name, Class, Admission Number, and Phone are required");
      return;
    }
    setSaving(true);
    try {
      await pushSchoolData(schoolId, "students", {
        ...form, id: "", rollNumber: "", photo: "", status: "active",
      });
      setSaved(true);
      setForm({ name: "", class: "", section: "A", admissionNumber: "", fatherName: "", motherName: "", phone: "", email: "", address: "", dateOfBirth: "", gender: "male", admissionDate: new Date().toISOString().split("T")[0] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">New Admission</h1>
      <div className="max-w-2xl rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { id: "name", label: "Student Name", req: true },
            { id: "admissionNumber", label: "Admission Number", req: true },
            { id: "fatherName", label: "Father's Name" },
            { id: "motherName", label: "Mother's Name" },
            { id: "phone", label: "Phone", req: true },
            { id: "email", label: "Email" },
            { id: "dateOfBirth", label: "Date of Birth", type: "date" },
            { id: "admissionDate", label: "Admission Date", type: "date" },
          ].map((f) => (
            <div key={f.id}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label} {f.req && <span className="text-destructive">*</span>}</label>
              <input type={f.type || "text"} value={form[f.id as keyof typeof form]} onChange={(e) => updateField(f.id, e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
            </div>
          ))}
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Class <span className="text-destructive">*</span></label>
            <select value={form.class} onChange={(e) => updateField("class", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
              <option value="">Select</option>{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Section</label>
            <select value={form.section} onChange={(e) => updateField("section", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
              {["A","B","C","D"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Gender</label>
            <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-muted-foreground">Address</label>
            <textarea value={form.address} onChange={(e) => updateField("address", e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" /></div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{saving ? "Saving..." : "Admit Student"}</button>
          {saved && <span className="text-sm font-medium text-success">Student admitted!</span>}
        </div>
      </div>
    </div>
  );
}
