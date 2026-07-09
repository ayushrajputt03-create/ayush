"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Students", href: "/dashboard/students", icon: "🎓" },
  { label: "Employees", href: "/dashboard/employees", icon: "👥" },
  { label: "Attendance", href: "/dashboard/attendance", icon: "📋" },
  { label: "Fee Management", href: "/dashboard/fees", icon: "💰" },
  { label: "Admissions", href: "/dashboard/admissions", icon: "📝" },
  { label: "Certificates", href: "/dashboard/certificates", icon: "📜" },
  { label: "Report Cards", href: "/dashboard/report-cards", icon: "📄" },
  { label: "ID Cards", href: "/dashboard/id-cards", icon: "🪪" },
  { label: "Homework", href: "/dashboard/homework", icon: "📚" },
  { label: "Timetable", href: "/dashboard/timetable", icon: "🕐" },
  { label: "Transport", href: "/dashboard/transport", icon: "🚌" },
  { label: "Library", href: "/dashboard/library", icon: "📖" },
  { label: "Expenses", href: "/dashboard/expenses", icon: "💳" },
  { label: "Accounts", href: "/dashboard/accounts", icon: "🏦" },
  { label: "Leave", href: "/dashboard/leave", icon: "🏖️" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print fixed left-0 top-0 z-40 flex h-full w-[var(--sidebar-width)] flex-col bg-navy-900 text-white">
      <div className="flex h-[var(--header-height)] items-center px-6 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">NXT</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-500/20 text-blue-200"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
