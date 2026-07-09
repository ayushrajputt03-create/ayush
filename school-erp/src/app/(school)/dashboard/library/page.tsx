"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData, pushSchoolData, updateSchoolData, removeSchoolData } from "@/lib/db";
import { LoadingSpinner } from "@/components/ui/loading";

interface Book { id: string; title: string; author: string; isbn: string; category: string; totalCopies: number; availableCopies: number; issuedTo?: string; issuedDate?: string; }

export default function LibraryPage() {
  const { schoolId } = useAuth();
  const [books, setBooks] = useState<Record<string, Book> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", author: "", isbn: "", category: "General", totalCopies: "1" });

  useEffect(() => {
    if (!schoolId) return;
    return subscribeSchoolData<Record<string, Book>>(schoolId, "library", (d) => { setBooks(d); setLoading(false); });
  }, [schoolId]);

  const list = useMemo(() => {
    if (!books) return [];
    return Object.entries(books)
      .map(([id, b]) => ({ ...b, _id: id }))
      .filter((b) => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, search]);

  async function handleSave() {
    if (!schoolId || !form.title) return;
    setSaving(true);
    try {
      const copies = Number(form.totalCopies) || 1;
      await pushSchoolData(schoolId, "library", { ...form, id: "", totalCopies: copies, availableCopies: copies });
      setShowForm(false);
      setForm({ title: "", author: "", isbn: "", category: "General", totalCopies: "1" });
    } finally { setSaving(false); }
  }

  async function toggleIssue(bookId: string, book: Book) {
    if (!schoolId) return;
    if (book.issuedTo) {
      await updateSchoolData(schoolId, `library/${bookId}`, { issuedTo: null, issuedDate: null, availableCopies: book.availableCopies + 1 });
    } else {
      const name = prompt("Issue to (student/teacher name):");
      if (!name) return;
      await updateSchoolData(schoolId, `library/${bookId}`, { issuedTo: name, issuedDate: new Date().toISOString().split("T")[0], availableCopies: Math.max(0, book.availableCopies - 1) });
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Library ({list.length} books)</h1>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">+ Add Book</button>
      </div>
      <input type="text" placeholder="Search by title or author..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-blue-500" />
      {list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No books in library.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Author</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Available</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issued To</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {list.map((b) => (
                <tr key={b._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-card-foreground">{b.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.author}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.availableCopies}/{b.totalCopies}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.issuedTo || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleIssue(b._id, b)} className="mr-2 text-blue-500 hover:text-blue-400">{b.issuedTo ? "Return" : "Issue"}</button>
                    <button onClick={() => schoolId && confirm("Delete?") && removeSchoolData(schoolId, `library/${b._id}`)} className="text-destructive hover:text-destructive/80">Delete</button>
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
            <h2 className="mb-6 text-xl font-bold text-card-foreground">Add Book</h2>
            <div className="space-y-4">
              {[{ id: "title", label: "Title", req: true }, { id: "author", label: "Author" }, { id: "isbn", label: "ISBN" }, { id: "category", label: "Category" }, { id: "totalCopies", label: "Total Copies", type: "number" }].map((f) => (
                <div key={f.id}><label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                  <input type={f.type || "text"} value={form[f.id as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500" /></div>
              ))}
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
