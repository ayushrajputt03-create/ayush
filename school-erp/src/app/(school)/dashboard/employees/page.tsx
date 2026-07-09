"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, pushSchoolData, updateSchoolData, removeSchoolData } from "@/lib/db";
import { uploadSchoolFile } from "@/lib/storage";
import type { Employee } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

const DEPARTMENTS = ["Teaching", "Administration", "Accounts", "Transport", "Housekeeping", "Security", "Library", "Lab", "Sports", "Other"];
const DESIGNATIONS = ["Principal", "Vice Principal", "Teacher", "Senior Teacher", "Clerk", "Accountant", "Driver", "Conductor", "Peon", "Guard", "Librarian", "Lab Assistant", "Sports Coach", "Other"];

const emptyEmployee: Omit<Employee, "id"> = {
  name: "", designation: "", department: "", phone: "", email: "",
  photo: "", joiningDate: "", salary: 0, status: "active",
};

export default function EmployeesPage() {
  const { schoolId } = useAuth();
  const [employees, setEmployees] = useState<Record<string, Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEmployee);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    return subscribeSchoolData<Record<string, Employee>>(schoolId, "employees", (data) => {
      setEmployees(data);
      setLoading(false);
    });
  }, [schoolId]);

  const employeeList = useMemo(() => {
    if (!employees) return [];
    return Object.entries(employees)
      .map(([id, e]) => ({ ...e, _id: id }))
      .filter((e) => {
        if (filterDept && e.department !== filterDept) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return e.name.toLowerCase().includes(q) || e.phone.includes(q) || e.designation.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, searchQuery, filterDept]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyEmployee);
    setPhotoFile(null);
    setShowForm(true);
  }

  function openEdit(id: string, emp: Employee) {
    setEditingId(id);
    setForm({ ...emp });
    setPhotoFile(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!schoolId || !form.name.trim()) return;
    setSaving(true);
    try {
      let photo = form.photo || "";
      if (photoFile) {
        photo = await uploadSchoolFile(schoolId, "employees", photoFile);
      }
      const data = { ...form, photo, name: form.name.trim(), salary: Number(form.salary) || 0 };

      if (editingId) {
        await updateSchoolData(schoolId, `employees/${editingId}`, data as unknown as Record<string, unknown>);
      } else {
        await pushSchoolData(schoolId, "employees", { ...data, id: "" });
      }
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!schoolId || !confirm(`Delete employee "${name}"?`)) return;
    await removeSchoolData(schoolId, `employees/${id}`);
  }

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Employees ({employeeList.length})</h1>
        <button onClick={openAdd} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">+ Add Employee</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, phone, designation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[250px] rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-blue-500"
        />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {employeeList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          {searchQuery || filterDept ? "No employees match." : "No employees added yet."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Designation</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Department</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Salary</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeList.map((e) => (
                <tr key={e._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {e.photo ? (
                        <img src={e.photo} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">{e.name.charAt(0)}</div>
                      )}
                      <span className="font-medium text-card-foreground">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.designation}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.department}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">₹{e.salary.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${e.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(e._id, e)} className="mr-2 text-blue-500 hover:text-blue-400">Edit</button>
                    <button onClick={() => handleDelete(e._id, e.name)} className="text-destructive hover:text-destructive/80">Delete</button>
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
            <h2 className="mb-6 text-xl font-bold text-card-foreground">{editingId ? "Edit Employee" : "Add Employee"}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name <span className="text-destructive">*</span></label>
                <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Designation</label>
                <select value={form.designation} onChange={(e) => updateField("designation", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Select</option>
                  {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Department</label>
                <select value={form.department} onChange={(e) => updateField("department", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="">Select</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Salary (₹)</label>
                <input type="number" value={form.salary || ""} onChange={(e) => updateField("salary", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Joining Date</label>
                <input type="date" value={form.joiningDate} onChange={(e) => updateField("joiningDate", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update" : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
