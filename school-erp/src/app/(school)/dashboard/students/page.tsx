"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, pushSchoolData, updateSchoolData, removeSchoolData } from "@/lib/db";
import { uploadSchoolFile } from "@/lib/storage";
import type { Student } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

const CLASSES = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C", "D"];

const emptyStudent: Omit<Student, "id"> = {
  name: "", class: "", section: "", rollNumber: "", admissionNumber: "",
  fatherName: "", motherName: "", phone: "", email: "", address: "",
  dateOfBirth: "", gender: "male", photo: "", status: "active", admissionDate: "",
};

export default function StudentsPage() {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState<Record<string, Student> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStudent);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [viewingStudent, setViewingStudent] = useState<(Student & { _id: string }) | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    return subscribeSchoolData<Record<string, Student>>(schoolId, "students", (data) => {
      setStudents(data);
      setLoading(false);
    });
  }, [schoolId]);

  const studentList = useMemo(() => {
    if (!students) return [];
    return Object.entries(students)
      .map(([id, s]) => ({ ...s, _id: id }))
      .filter((s) => {
        if (filterClass && s.class !== filterClass) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.admissionNumber.toLowerCase().includes(q) ||
            s.fatherName.toLowerCase().includes(q) ||
            s.phone.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchQuery, filterClass]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyStudent);
    setPhotoFile(null);
    setShowForm(true);
  }

  function openEdit(id: string, student: Student) {
    setEditingId(id);
    setForm({ ...student });
    setPhotoFile(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!schoolId || !form.name.trim()) return;
    setSaving(true);
    try {
      let photo = form.photo || "";
      if (photoFile) {
        photo = await uploadSchoolFile(schoolId, "students", photoFile);
      }
      const data = { ...form, photo, name: form.name.trim() };

      if (editingId) {
        await updateSchoolData(schoolId, `students/${editingId}`, data as unknown as Record<string, unknown>);
      } else {
        await pushSchoolData(schoolId, "students", { ...data, id: "" });
      }
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!schoolId || !confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    await removeSchoolData(schoolId, `students/${id}`);
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  if (viewingStudent) {
    const s = viewingStudent;
    return (
      <div className="space-y-6">
        <button onClick={() => setViewingStudent(null)} className="text-sm text-blue-500 hover:text-blue-400">&larr; Back to Students</button>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex gap-6">
            {s.photo ? (
              <img src={s.photo} alt={s.name} className="h-28 w-24 rounded-lg object-cover border border-border" />
            ) : (
              <div className="flex h-28 w-24 items-center justify-center rounded-lg bg-muted text-2xl font-bold text-muted-foreground">
                {s.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold text-card-foreground">{s.name}</h2>
              <p className="text-sm text-muted-foreground">Class {s.class} - Section {s.section} | Roll #{s.rollNumber}</p>
              <p className="text-sm text-muted-foreground">Adm. No: {s.admissionNumber}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["Father's Name", s.fatherName],
              ["Mother's Name", s.motherName],
              ["Phone", s.phone],
              ["Email", s.email],
              ["Address", s.address],
              ["Date of Birth", s.dateOfBirth],
              ["Gender", s.gender],
              ["Admission Date", s.admissionDate],
              ["Status", s.status],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-sm text-card-foreground">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Students ({studentList.length})</h1>
        <button onClick={openAdd} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">
          + Add Student
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, admission no, father's name, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[250px] rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-blue-500"
        />
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="">All Classes</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
      </div>

      {studentList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          {searchQuery || filterClass ? "No students match your search." : "No students added yet. Click \"+ Add Student\" to get started."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Adm. No</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Father&apos;s Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((s) => (
                <tr key={s._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <button onClick={() => setViewingStudent(s)} className="flex items-center gap-3 text-left hover:text-blue-500">
                      {s.photo ? (
                        <img src={s.photo} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">{s.name.charAt(0)}</div>
                      )}
                      <span className="font-medium text-card-foreground">{s.name}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.class}-{s.section}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.admissionNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.fatherName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(s._id, s)} className="mr-2 text-blue-500 hover:text-blue-400">Edit</button>
                    <button onClick={() => handleDelete(s._id, s.name)} className="text-destructive hover:text-destructive/80">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-card-foreground">
              {editingId ? "Edit Student" : "Add Student"}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { id: "name", label: "Full Name", required: true },
                { id: "admissionNumber", label: "Admission Number", required: true },
                { id: "fatherName", label: "Father's Name" },
                { id: "motherName", label: "Mother's Name" },
                { id: "phone", label: "Phone", required: true },
                { id: "email", label: "Email" },
                { id: "rollNumber", label: "Roll Number" },
                { id: "dateOfBirth", label: "Date of Birth", type: "date" },
                { id: "admissionDate", label: "Admission Date", type: "date" },
              ].map((f) => (
                <div key={f.id}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {f.label} {f.required && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    type={f.type || "text"}
                    value={form[f.id as keyof typeof form] as string}
                    onChange={(e) => updateField(f.id, e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Class <span className="text-destructive">*</span></label>
                <select value={form.class} onChange={(e) => updateField("class", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Select</option>
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Section</label>
                <select value={form.section} onChange={(e) => updateField("section", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Select</option>
                  {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Gender</label>
                <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
