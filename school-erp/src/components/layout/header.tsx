"use client";

import { useAuth } from "@/context/auth-context";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="no-print sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-border bg-card px-6">
      <div className="text-lg font-semibold text-card-foreground">
        School ERP
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <button
            onClick={() => signOut()}
            className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-600"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
