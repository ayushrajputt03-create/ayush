"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { PageLoading } from "@/components/ui/loading";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return <PageLoading />;
}
