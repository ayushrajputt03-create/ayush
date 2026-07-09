"use client";

export default function ParentLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-card-foreground">Parent Portal</h1>
        <p className="mb-8 text-sm text-muted-foreground">View your child&apos;s school information</p>
        <div className="rounded-xl border border-border bg-muted p-8 text-center text-muted-foreground">
          Parent login will be implemented here.
        </div>
      </div>
    </div>
  );
}
