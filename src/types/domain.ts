export type Role = "patient" | "doctor" | "hospital_admin" | "super_admin" | "emergency_staff" | "laboratory";

export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  clinicalAlerts?: boolean;
  appointmentReminders?: boolean;
  appointments?: boolean;
  labResults?: boolean;
  emergencyAlerts?: boolean;
  marketing?: boolean;
}

export interface EmergencyProfile {
  organizationName?: string;
  serviceArea?: string;
  certificationNumber?: string;
  dispatchContact?: string;
}

export interface DoctorRoleProfile {
  specialty?: string;
  licenseNumber?: string;
  department?: string;
  availability?: string;
  acceptingAppointments?: boolean;
  hospitalAffiliation?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  hospitalId?: string;
  patientId?: string;
  phone?: string;
  avatarUrl?: string;
  notificationPreferences?: NotificationPreferences;
  emergencyProfile?: EmergencyProfile;
  doctorProfile?: DoctorRoleProfile;
  labProfile?: Laboratory;
  hospitalProfile?: Hospital;
  patientProfile?: PatientProfile;
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
  distance?: number;
}

export interface Laboratory {
  _id?: string;
  id: string;
  labName: string;
  status: "pending" | "approved" | "suspended";
  certificationNumber: string;
  department: string;
  hospitalId?: string;
  hospitalName?: string;
  testCapabilities: string[];
  isActive: boolean;
  isStandalone: boolean;
}

export interface PatientProfile {
  _id?: string;
  id: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
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

export type LabRequestStatus = "requested" | "accepted" | "in_progress" | "completed" | "rejected";

export interface LabRequest {
  _id: string;
  patientId: string;
  hospitalId: string;
  laboratoryId?: string;
  testName: string;
  priority: "routine" | "urgent" | "stat";
  clinicalNotes?: string;
  status: LabRequestStatus;
  rejectionReason?: string;
  createdAt?: string;
}

export interface LabResult {
  _id: string;
  requestId?: string;
  patientId?: string;
  hospitalId?: string;
  laboratoryId?: string;
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

export type AppointmentStatus = "requested" | "scheduled" | "accepted" | "completed" | "cancelled" | "rejected" | "reschedule_requested";

export interface Appointment {
  _id: string;
  id?: string;
  reason: string;
  scheduledAt: string;
  status: AppointmentStatus;
  patientId?: string;
  hospitalId?: string;
  doctorId?: string;
  notes?: string;
}

export interface ConsentShare {
  _id?: string;
  id: string;
  toHospitalId: string;
  scopes: string[];
  status: "active" | "revoked" | "expired";
  expiresAt?: string;
}

export interface EmergencyCase {
  _id?: string;
  id: string;
  patientId: string | { _id?: string; id?: string; fullName?: string; bloodGroup?: string; emergencyContact?: PatientProfile["emergencyContact"] };
  status: "requested" | "triaged" | "assigned" | "in_progress" | "dispatched" | "en_route" | "arrived" | "resolved" | "cancelled" | "active";
  priority?: "low" | "medium" | "high" | "critical";
  severity?: "low" | "medium" | "high" | "critical";
  location?: string;
  reason?: string;
  chiefComplaint?: string;
  hospitalId?: string | { _id?: string; id?: string; name?: string; city?: string; state?: string };
  assignedUserId?: string | { _id?: string; id?: string; name?: string; email?: string; role?: Role };
  assignedServiceId?: string | { _id?: string; id?: string; name?: string; city?: string; state?: string };
  assignedResponderId?: string | { _id?: string; id?: string; name?: string; email?: string; role?: Role };
  assignedStaffUserIds?: Array<string | { _id?: string; id?: string; name?: string; email?: string; role?: Role }>;
  notes?: string;
  dispatchStatus?: "unassigned" | "assigned" | "dispatched" | "arrived" | "cleared";
  dispatchNotes?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface NotificationItem { _id: string; title: string; body: string; type: string; readAt?: string; createdAt: string; }
export interface MessageItem { _id: string; body: string; senderUserId: string; createdAt: string; }
export interface DoctorProfile { _id?: string; userId: string; hospitalId?: string; specialty: string; licenseNumber: string; department: string; acceptingAppointments?: boolean; availability?: Array<{ day: string; start: string; end: string }>; availabilityText?: string; hospitalAffiliation?: string; }

export interface AccountProfilePayload {
  account?: User;
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
  labProfile?: Laboratory;
  hospitalProfile?: Hospital;
}

export interface WorkspacePayload {
  profile: AccountProfilePayload;
  patients: PatientProfile[];
  staff: User[];
  doctors: DoctorProfile[];
  appointments: Appointment[];
  records: MedicalRecord[];
  labResults: LabResult[];
  prescriptions: Prescription[];
  notifications: NotificationItem[];
  messages: MessageItem[];
  hospitals: Hospital[];
  laboratories: Laboratory[];
}
