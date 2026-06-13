export type Role = "patient" | "doctor" | "hospital_admin" | "super_admin" | "emergency_staff" | "laboratory";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  hospitalId?: string;
  patientId?: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  notificationPreferences?: Record<string, boolean | undefined>;
}

export interface Hospital {
  id?: string;
  _id?: string;
  name: string;
  status: "approved" | "pending" | "suspended";
  city: string;
  state?: string;
  address?: string;
  contactEmail?: string;
  specialties?: string[];
}

export interface PatientProfile {
  id?: string;
  _id?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact?: string | { name?: string; relationship?: string; phone?: string };
  connectedHospitalIds?: string[];
  hospitalIds?: Hospital[];
  emergencyCode?: string;
  emergencyAccessEnabled: boolean;
}

export interface DoctorProfile {
  _id?: string;
  userId?: string;
  specialty?: string;
  licenseNumber?: string;
  department?: string;
  acceptingAppointments?: boolean;
  hospitalAffiliation?: string;
}

export interface Laboratory {
  id?: string;
  _id?: string;
  labName: string;
  status?: "approved" | "pending" | "suspended";
  certificationNumber?: string;
  department?: string;
  hospitalId?: string;
  hospitalName?: string;
  testCapabilities?: string[];
  isActive?: boolean;
  isStandalone?: boolean;
}

export interface MedicalRecord {
  id?: string;
  _id?: string;
  title: string;
  type: string;
  hospitalId?: string | Hospital;
  date?: string;
  recordDate?: string;
  createdAt?: string;
  summary: string;
  critical?: boolean;
}

export interface Appointment {
  id?: string;
  _id?: string;
  patientId?: string | PatientProfile;
  hospitalId?: string | Hospital;
  doctorId?: string | User;
  reason: string;
  scheduledAt: string;
  status: "requested" | "scheduled" | "accepted" | "completed" | "cancelled" | "rejected" | "reschedule_requested";
  notes?: string;
}

export interface ConsentShare {
  id?: string;
  _id?: string;
  toHospitalId: string | Hospital;
  scopes: string[];
  status: "active" | "revoked" | "expired";
  expiresAt?: string;
}

export interface LabRequest {
  id?: string;
  _id?: string;
  patientId: string | PatientProfile;
  hospitalId: string | Hospital;
  laboratoryId?: string | Laboratory;
  testName: string;
  priority: "routine" | "urgent" | "stat";
  clinicalNotes?: string;
  notes?: string;
  status: "requested" | "accepted" | "in_progress" | "completed" | "rejected" | "cancelled";
  rejectionReason?: string;
  resultSummary?: string;
  dueAt?: string;
  createdAt?: string;
}

export interface LabResult {
  id?: string;
  _id?: string;
  requestId?: string;
  patientId?: string | PatientProfile;
  hospitalId?: string | Hospital;
  laboratoryId?: string | Laboratory;
  testName: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  status: "normal" | "abnormal" | "critical";
  collectedAt?: string;
  createdAt?: string;
}

export interface Prescription {
  _id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface EmergencyCase {
  id?: string;
  _id?: string;
  patientId?: string | PatientProfile;
  hospitalId?: string | Hospital;
  assignedUserId?: string | User;
  reason?: string;
  chiefComplaint?: string;
  location?: string;
  priority?: "low" | "medium" | "high" | "critical";
  severity?: "low" | "medium" | "high" | "critical";
  status: string;
  dispatchStatus?: string;
  notes?: string;
  createdAt?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  type: string;
  readAt?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  body: string;
  senderUserId: string;
  recipientUserId?: string;
  patientId?: string;
  createdAt: string;
}

export interface AuditLog {
  id?: string;
  _id?: string;
  action: string;
  actor?: string;
  actorRole?: Role | "system";
  role?: string;
  target?: string;
  reason?: string;
  date?: string;
  createdAt?: string;
}

export interface PatientDashboard {
  profile: PatientProfile;
  records: MedicalRecord[];
  labResults: LabResult[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  shares: ConsentShare[];
  auditLogs: AuditLog[];
  uploads: Array<{ _id: string; fileName: string; provider: string; category: string }>;
}

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
  messages: Message[];
  hospitals: Hospital[];
  laboratories: Laboratory[];
  emergencyCases?: EmergencyCase[];
}

export interface AdminOperations {
  statistics: {
    totalUsers: number;
    activeUsers: number;
    hospitals: number;
    pendingApprovals: number;
    appointmentsByStatus: Array<{ _id: string; count: number }>;
    emergencyCasesByStatus: Array<{ _id: string; count: number }>;
    labRequestsByStatus: Array<{ _id: string; count: number }>;
  };
  pendingApprovals: { hospitals: Hospital[]; laboratories: Laboratory[] };
  users: User[];
  hospitals: Hospital[];
  appointments: Appointment[];
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}
