"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { setSchoolData } from "@/lib/db";
import { PageLoading } from "@/components/ui/loading";

export default function SchoolSetupPage() {
  const { user, schoolId, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    principal: "",
    board: "",
    establishedYear: "",
  });

  if (authLoading) return <PageLoading />;
  if (!user || !schoolId) {
    router.replace("/login");
    return <PageLoading />;
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("School name and phone are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await setSchoolData(schoolId!, "profile", {
        id: schoolId,
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: user?.email || "",
        principal: form.principal.trim(),
        board: form.board.trim(),
        establishedYear: form.establishedYear.trim(),
        createdAt: Date.now(),
      });
      router.replace("/dashboard");
    } catch {
      setError("Failed to save school profile");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { id: "name", label: "School Name", placeholder: "Northstar Public School", required: true },
    { id: "address", label: "Address", placeholder: "123 Main Street, City" },
    { id: "phone", label: "Phone Number", placeholder: "+91 98765 43210", required: true },
    { id: "principal", label: "Principal Name", placeholder: "Dr. Sharma" },
    { id: "board", label: "Board / Affiliation", placeholder: "CBSE / ICSE / State Board" },
    { id: "establishedYear", label: "Established Year", placeholder: "2005" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-card-foreground">School Setup</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Set up your school profile to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="mb-1.5 block text-sm font-medium text-card-foreground">
                {f.label} {f.required && <span className="text-destructive">*</span>}
              </label>
              <input
                id={f.id}
                type="text"
                required={f.required}
                value={form[f.id as keyof typeof form]}
                onChange={(e) => updateField(f.id, e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
