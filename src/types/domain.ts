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
  id: string;
  name: string;
  status: "pending" | "approved" | "suspended";
  city: string;
  state: string;
  specialties: string[];
  connectedPatients: number;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: string;
  connectedHospitalIds: string[];
  emergencyCode: string;
  emergencyAccessEnabled: boolean;
}

export interface MedicalRecord {
  id: string;
  type: "visit" | "diagnosis" | "lab" | "prescription" | "emergency" | "document";
  title: string;
  hospitalId: string;
  date: string;
  summary: string;
  critical?: boolean;
}

export interface ConsentShare {
  id: string;
  toHospitalId: string;
  scopes: string[];
  status: "active" | "revoked";
  expiresAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  role: Role | "system";
  action: string;
  date: string;
  emergency?: boolean;
}
