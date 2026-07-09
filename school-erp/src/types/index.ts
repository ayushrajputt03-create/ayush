export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  principal?: string;
  seal?: string;
  signature?: string;
  createdAt: number;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email?: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  photo?: string;
  status: "active" | "inactive" | "alumni";
  admissionDate: string;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  photo?: string;
  joiningDate: string;
  salary: number;
  status: "active" | "inactive";
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  type: string;
  status: "paid" | "unpaid" | "partial";
  dueDate: string;
  paidDate?: string;
  receiptNumber?: string;
}

export interface AttendanceRecord {
  date: string;
  studentId: string;
  status: "present" | "absent" | "late" | "half-day";
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "casual" | "sick" | "earned" | "other";
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: FirebaseUser | null;
  schoolId: string | null;
  loading: boolean;
}
