"use client";

export default function SuperAdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-card-foreground">Super Admin</h1>
        <p className="mb-8 text-sm text-muted-foreground">Owner console login</p>
        <div className="rounded-xl border border-border bg-muted p-8 text-center text-muted-foreground">
          Super admin authentication will be implemented here.
        </div>
      </div>
    </div>
  );
}
