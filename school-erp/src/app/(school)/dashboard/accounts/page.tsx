"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData } from "@/lib/db";
import type { Fee } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

interface Expense { amount: number; category: string; date: string; title: string; }

export default function AccountsPage() {
  const { schoolId } = useAuth();
  const [fees, setFees] = useState<Record<string, Fee> | null>(null);
  const [expenses, setExpenses] = useState<Record<string, Expense> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;
    const unsubs: (() => void)[] = [];
    let c = 0;
    function check() { if (++c >= 2) setLoading(false); }
    unsubs.push(subscribeSchoolData<Record<string, Fee>>(schoolId, "fees", (d) => { setFees(d); check(); }));
    unsubs.push(subscribeSchoolData<Record<string, Expense>>(schoolId, "expenses", (d) => { setExpenses(d); check(); }));
    return () => unsubs.forEach((u) => u());
  }, [schoolId]);

  const summary = useMemo(() => {
    const feeList = fees ? Object.values(fees) : [];
    const expList = expenses ? Object.values(expenses) : [];
    const income = feeList.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
    const pending = feeList.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);
    const totalExpense = expList.reduce((s, e) => s + e.amount, 0);
    const balance = income - totalExpense;

    const expByCategory: Record<string, number> = {};
    expList.forEach((e) => { expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount; });

    return { income, pending, totalExpense, balance, expByCategory };
  }, [fees, expenses]);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Accounts Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold text-success">₹{summary.income.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">Pending Fees</p>
          <p className="text-2xl font-bold text-warning">₹{summary.pending.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-destructive">₹{summary.totalExpense.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">Balance</p>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? "text-success" : "text-destructive"}`}>₹{summary.balance.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">Expenses by Category</h2>
        {Object.keys(summary.expByCategory).length === 0 ? (
          <p className="text-sm text-muted-foreground">No expense data yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(summary.expByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => {
                const pct = summary.totalExpense > 0 ? (amount / summary.totalExpense) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-card-foreground">{cat}</span>
                      <span className="text-muted-foreground">₹{amount.toLocaleString("en-IN")} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
