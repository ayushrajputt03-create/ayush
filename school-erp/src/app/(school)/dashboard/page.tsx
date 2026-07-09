"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData } from "@/lib/db";
import type { Student, Employee, Fee } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

interface DashboardStats {
  totalStudents: number;
  totalEmployees: number;
  feeCollected: number;
  pendingFees: number;
  presentToday: number;
  totalClasses: number;
}

export default function DashboardPage() {
  const { user, schoolId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!schoolId) return;

    const unsubs: (() => void)[] = [];

    const current: {
      students: Record<string, Student> | null;
      employees: Record<string, Employee> | null;
      fees: Record<string, Fee> | null;
    } = { students: null, employees: null, fees: null };

    function recalc() {
      const students = current.students ? Object.values(current.students) : [];
      const employees = current.employees ? Object.values(current.employees) : [];
      const fees = current.fees ? Object.values(current.fees) : [];

      const activeStudents = students.filter((s) => s.status === "active");
      const activeEmployees = employees.filter((e) => e.status === "active");
      const feeCollected = fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0);
      const pendingFees = fees.filter((f) => f.status === "unpaid" || f.status === "partial").reduce((sum, f) => sum + f.amount, 0);
      const classes = new Set(activeStudents.map((s) => s.class));

      setStats({
        totalStudents: activeStudents.length,
        totalEmployees: activeEmployees.length,
        feeCollected,
        pendingFees,
        presentToday: 0,
        totalClasses: classes.size,
      });
    }

    unsubs.push(
      subscribeSchoolData<Record<string, Student>>(schoolId, "students", (data) => {
        current.students = data;
        recalc();
      })
    );
    unsubs.push(
      subscribeSchoolData<Record<string, Employee>>(schoolId, "employees", (data) => {
        current.employees = data;
        recalc();
      })
    );
    unsubs.push(
      subscribeSchoolData<Record<string, Fee>>(schoolId, "fees", (data) => {
        current.fees = data;
        recalc();
      })
    );

    return () => unsubs.forEach((u) => u());
  }, [schoolId]);

  const cards = stats
    ? [
        { label: "Total Students", value: stats.totalStudents.toString(), color: "bg-blue-500" },
        { label: "Total Employees", value: stats.totalEmployees.toString(), color: "bg-navy-800" },
        { label: "Fee Collected", value: `₹${stats.feeCollected.toLocaleString("en-IN")}`, color: "bg-success" },
        { label: "Pending Fees", value: `₹${stats.pendingFees.toLocaleString("en-IN")}`, color: "bg-warning" },
        { label: "Classes", value: stats.totalClasses.toString(), color: "bg-blue-400" },
        { label: "Present Today", value: stats.presentToday.toString(), color: "bg-navy-600" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.displayName || user?.email}
        </p>
      </div>

      {!stats ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className={`mb-3 inline-block rounded-lg ${card.color} px-2.5 py-1`}>
                <span className="text-xs font-semibold text-white">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-card-foreground">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
