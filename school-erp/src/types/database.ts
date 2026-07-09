import type { Student, Employee, Fee, AttendanceRecord, LeaveRequest, School } from ".";

export interface SchoolData {
  profile: School;
  students: Record<string, Student>;
  employees: Record<string, Employee>;
  attendance: Record<string, Record<string, AttendanceRecord>>;
  fees: Record<string, Fee>;
  leave: Record<string, LeaveRequest>;
  certificates: Record<string, unknown>;
  reportCards: Record<string, unknown>;
  homework: Record<string, unknown>;
  transport: Record<string, unknown>;
  expenses: Record<string, unknown>;
  library: Record<string, unknown>;
  accounts: Record<string, unknown>;
  parents: Record<string, unknown>;
  parentNotifications: Record<string, unknown>;
  certificateRequests: Record<string, unknown>;
}

export interface SuperAdminData {
  plans: Record<string, unknown>;
  payments: Record<string, unknown>;
  activityLog: Record<string, unknown>;
  notifications: Record<string, unknown>;
}

export interface DatabaseSchema {
  schools: Record<string, SchoolData>;
  superAdmin: SuperAdminData;
}
