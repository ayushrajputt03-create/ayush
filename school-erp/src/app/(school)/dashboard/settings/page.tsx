"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, setSchoolData } from "@/lib/db";
import { uploadSchoolFile } from "@/lib/storage";
import type { School } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

export default function SettingsPage() {
  const { schoolId } = useAuth();
  const [profile, setProfile] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    return subscribeSchoolData<School>(schoolId, "profile", (d) => { setProfile(d); setLoading(false); });
  }, [schoolId]);

  function updateField(field: string, value: string) {
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!schoolId || !profile) return;
    setSaving(true);
    try {
      let logo = profile.logo || "";
      if (logoFile) {
        logo = await uploadSchoolFile(schoolId, "profile", logoFile);
      }
      await setSchoolData(schoolId, "profile", { ...profile, logo });
      setSaved(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally { setSaving(false); }
  }

  if (loading || !profile) return <LoadingSpinner className="py-20" />;

  const fields = [
    { id: "name", label: "School Name" },
    { id: "address", label: "Address" },
    { id: "phone", label: "Phone" },
    { id: "email", label: "Email" },
    { id: "principal", label: "Principal Name" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">School Profile</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.id}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                <input
                  type="text"
                  value={(profile as unknown as Record<string, string>)[f.id] || ""}
                  onChange={(e) => updateField(f.id, e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">School Logo</label>
              <input type="file" accept="image/*" onChange={(e) => { setLogoFile(e.target.files?.[0] || null); setSaved(false); }} className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" />
              {profile.logo && <img src={profile.logo} alt="Logo" className="mt-2 h-16 w-16 rounded-lg object-contain border border-border" />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-sm font-medium text-success">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
