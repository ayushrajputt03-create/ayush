"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { subscribeSchoolData } from "@/lib/db";
import type { Student, School } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading";

const CERT_TYPES = ["Transfer Certificate", "Character Certificate", "Bonafide Certificate", "Study Certificate"];

export default function CertificatesPage() {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState<Record<string, Student> | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [certType, setCertType] = useState(CERT_TYPES[0]);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!schoolId) return;
    const unsubs: (() => void)[] = [];
    let c = 0;
    function check() { if (++c >= 2) setLoading(false); }
    unsubs.push(subscribeSchoolData<Record<string, Student>>(schoolId, "students", (d) => { setStudents(d); check(); }));
    unsubs.push(subscribeSchoolData<School>(schoolId, "profile", (d) => { setSchool(d); check(); }));
    return () => unsubs.forEach((u) => u());
  }, [schoolId]);

  const student = selectedStudent && students ? students[selectedStudent] : null;
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
      <div className="flex flex-wrap gap-3">
        <select value={selectedStudent} onChange={(e) => { setSelectedStudent(e.target.value); setShowPreview(false); }} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
          <option value="">Select Student</option>
          {students && Object.entries(students).map(([id, s]) => <option key={id} value={id}>{s.name} — {s.class}-{s.section}</option>)}
        </select>
        <select value={certType} onChange={(e) => setCertType(e.target.value)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground">
          {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button disabled={!student} onClick={() => setShowPreview(true)} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">Generate</button>
        {showPreview && <button onClick={() => window.print()} className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600">Print</button>}
      </div>

      {showPreview && student && school && (
        <div ref={printRef} className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-10 text-black">
          <div className="text-center mb-6">
            {school.logo && <img src={school.logo} alt="" className="mx-auto mb-2 h-16 w-16 object-contain" />}
            <h2 className="text-xl font-bold uppercase">{school.name || "School Name"}</h2>
            <p className="text-sm text-gray-500">{school.address} | {school.phone}</p>
            <div className="mt-4 border-b-2 border-black pb-2">
              <h3 className="text-lg font-bold uppercase">{certType}</h3>
            </div>
          </div>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>This is to certify that <strong>{student.name}</strong>, {student.gender === "male" ? "son" : student.gender === "female" ? "daughter" : "child"} of <strong>{student.fatherName || "—"}</strong>, is/was a bonafide student of this institution.</p>
            <p>Admission Number: <strong>{student.admissionNumber}</strong></p>
            <p>Class: <strong>{student.class}-{student.section}</strong></p>
            <p>Date of Birth: <strong>{student.dateOfBirth || "—"}</strong></p>
            {certType === "Transfer Certificate" && <p>The student is leaving this school on their own accord. Their character and conduct have been good during their stay.</p>}
            {certType === "Character Certificate" && <p>During the stay in this institution, the student has been found to be of good moral character and conduct.</p>}
            <p className="mt-6">Date: {today}</p>
          </div>
          <div className="mt-12 flex justify-between text-sm">
            <div className="text-center"><div className="border-t border-black pt-1">Class Teacher</div></div>
            <div className="text-center"><div className="border-t border-black pt-1">Principal</div></div>
          </div>
        </div>
      )}

      {!showPreview && (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Select a student and certificate type, then click Generate.
        </div>
      )}
    </div>
  );
}
