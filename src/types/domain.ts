export type Role = "patient" | "doctor" | "hospital_admin" | "super_admin" | "emergency_staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospitalId?: string;
  patientId?: string;
}

export interface Hospital {
  _id?: string;
  id: string;
  name: string;
  status: "pending" | "approved" | "suspended";
  city: string;
  state: string;
  specialties: string[];
  address?: string;
  contactEmail?: string;
  connectedPatients?: number;
  connectedPatientIds?: string[];
}

export interface PatientProfile {
  _id?: string;
  id: string;
  fullName: string;
  dateOfBirth?: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: string | { name?: string; relationship?: string; phone?: string };
  connectedHospitalIds: string[];
  hospitalIds?: Hospital[];
  emergencyCode: string;
  emergencyAccessEnabled: boolean;
}

export interface MedicalRecord {
  _id?: string;
  id: string;
  type: "visit" | "diagnosis" | "lab" | "prescription" | "emergency" | "document";
  title: string;
  hospitalId: string;
  date: string;
  recordDate?: string;
  summary: string;
  critical?: boolean;
}

export interface LabResult {
  _id: string;
  testName: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  status: "normal" | "abnormal" | "critical";
  collectedAt: string;
}

export interface Prescription {
  _id: string;
  medication: string;
  dosage: string;
  frequency: string;
  active: boolean;
  startDate?: string;
}

export interface Appointment {
  _id: string;
  reason: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface ConsentShare {
  _id?: string;
  id: string;
  toHospitalId: string;
  scopes: string[];
  status: "active" | "revoked" | "expired";
  expiresAt?: string;
}

export interface AuditLog {
  _id?: string;
  id: string;
  actor?: string;
  actorRole?: Role | "system";
  role: Role | "system";
  action: string;
  date: string;
  createdAt?: string;
  emergency?: boolean;
}

export interface Upload {
  _id: string;
  fileName: string;
  mimeType: string;
  size: number;
  provider: "cloudinary" | "local";
  secureUrl?: string;
  category: string;
  createdAt: string;
}

export interface PatientDashboardPayload {
  profile: PatientProfile;
  records: MedicalRecord[];
  labResults: LabResult[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  shares: ConsentShare[];
  auditLogs: AuditLog[];
  uploads: Upload[];
}
