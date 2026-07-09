"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageLoading } from "@/components/ui/loading";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <PageLoading />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col ml-[var(--sidebar-width)]">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
