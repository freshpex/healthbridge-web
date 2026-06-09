import type { AuditLog, ConsentShare, Hospital, MedicalRecord, PatientProfile, User } from "../types/domain";

export const demoPassword = "Password123!";

export const demoUsers: User[] = [
  { id: "u-super", name: "Avery Platform", email: "superadmin@healthbridge.test", role: "super_admin" },
  { id: "u-admin", name: "Morgan Hayes", email: "admin@mercy.test", role: "hospital_admin", hospitalId: "h-mercy" },
  { id: "u-doctor", name: "Dr. Priya Nair", email: "doctor@mercy.test", role: "doctor", hospitalId: "h-mercy" },
  { id: "u-patient", name: "Elena Brooks", email: "patient@healthbridge.test", role: "patient", patientId: "p-elena" },
  { id: "u-emt", name: "Sam Rivera EMT", email: "emt@healthbridge.test", role: "emergency_staff" }
];

export const hospitals: Hospital[] = [
  { id: "h-mercy", name: "Mercy General Hospital", status: "approved", city: "Boston", state: "MA", specialties: ["Emergency", "Pulmonology", "Cardiology"], connectedPatients: 12840 },
  { id: "h-city", name: "CityCare Medical Center", status: "approved", city: "New York", state: "NY", specialties: ["Labs", "Imaging", "Neurology"], connectedPatients: 18420 },
  { id: "h-lake", name: "Lakeview Children's Hospital", status: "pending", city: "Chicago", state: "IL", specialties: ["Pediatrics", "Urgent Care"], connectedPatients: 0 }
];

export const patientProfile: PatientProfile = {
  id: "p-elena",
  fullName: "Elena Brooks",
  bloodGroup: "A+",
  allergies: ["Penicillin", "Latex"],
  chronicConditions: ["Asthma"],
  currentMedications: ["Albuterol inhaler", "Cetirizine 10mg"],
  emergencyContact: "Jordan Brooks, spouse, +1 555 0134",
  connectedHospitalIds: ["h-mercy"],
  emergencyCode: "HB-DEMO01",
  emergencyAccessEnabled: true
};

export const records: MedicalRecord[] = [
  { id: "r-1", type: "diagnosis", title: "Asthma care plan", hospitalId: "h-mercy", date: "2026-03-12", summary: "Controlled persistent asthma. Continue rescue inhaler and annual pulmonary review.", critical: true },
  { id: "r-2", type: "visit", title: "Annual wellness visit", hospitalId: "h-mercy", date: "2026-05-20", summary: "Vitals stable, updated allergy profile, no acute concerns." },
  { id: "r-3", type: "lab", title: "CBC Panel", hospitalId: "h-mercy", date: "2026-05-21", summary: "Within normal reference range." },
  { id: "r-4", type: "prescription", title: "Albuterol 90 mcg", hospitalId: "h-mercy", date: "2026-05-22", summary: "Two puffs as needed for wheezing or shortness of breath.", critical: true }
];

export const shares: ConsentShare[] = [
  { id: "s-1", toHospitalId: "h-city", scopes: ["profile", "records", "labs"], status: "active", expiresAt: "2026-12-31" }
];

export const auditLogs: AuditLog[] = [
  { id: "a-1", actor: "Dr. Priya Nair", role: "doctor", action: "Viewed medical records", date: "2026-06-02 09:42" },
  { id: "a-2", actor: "Sam Rivera EMT", role: "emergency_staff", action: "Emergency access resolved", date: "2026-05-28 18:10", emergency: true },
  { id: "a-3", actor: "Elena Brooks", role: "patient", action: "Shared records with CityCare", date: "2026-05-23 14:31" }
];
