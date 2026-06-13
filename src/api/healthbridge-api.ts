import apiClient, { unwrap } from "./client";
import type {
  AccountProfilePayload,
  AdminOperations,
  Appointment,
  AuthSession,
  ConsentShare,
  EmergencyCase,
  Hospital,
  LabRequest,
  LabResult,
  MedicalRecord,
  Message,
  NotificationItem,
  PatientDashboard,
  PatientProfile,
  Prescription,
  Role,
  User,
  WorkspacePayload
} from "../types/domain";

export const healthbridgeApi = {
  login: (email: string, password: string) => unwrap<AuthSession>(apiClient.post("/auth/login", { email, password })),
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    role: Role;
    hospitalIds?: string[];
    hospital?: Record<string, unknown>;
    hospitalId?: string;
    labName?: string;
    certificationNumber?: string;
    department?: string;
    testCapabilities?: string[];
  }) => unwrap<AuthSession>(apiClient.post("/auth/signup", payload)),
  emergencyStaffRequest: (payload: Record<string, unknown>) => unwrap(apiClient.post("/auth/emergency-staff/requests", payload)),
  logout: () => apiClient.post("/auth/logout"),
  me: () => unwrap<User>(apiClient.get("/auth/me")),
  account: () => unwrap<AccountProfilePayload>(apiClient.get("/users/me")),
  updateAccount: (payload: Record<string, unknown>) => unwrap<AccountProfilePayload>(apiClient.patch("/users/me", payload)),
  changePassword: (currentPassword: string, newPassword: string) => apiClient.post("/users/me/change-password", { currentPassword, newPassword }),
  workspace: () => unwrap<WorkspacePayload>(apiClient.get("/users/me/workspace")),
  users: () => unwrap<User[]>(apiClient.get("/users")),
  notifications: () => unwrap<NotificationItem[]>(apiClient.get("/notifications")),
  markNotificationRead: (id: string) => unwrap<NotificationItem>(apiClient.patch(`/notifications/${id}/read`)),
  hospitals: () => unwrap<Hospital[]>(apiClient.get("/hospitals")),
  createHospital: (payload: Record<string, unknown>) => unwrap<Hospital>(apiClient.post("/hospitals", payload)),
  approveHospital: (id: string) => unwrap<Hospital>(apiClient.patch(`/hospitals/${id}/approve`)),
  createStaff: (hospitalId: string, payload: Record<string, unknown>) => unwrap<User>(apiClient.post(`/hospitals/${hospitalId}/staff`, payload)),
  doctors: () => unwrap(apiClient.get("/doctors")),
  createDoctor: (payload: Record<string, unknown>) => unwrap(apiClient.post("/doctors", payload)),
  patientDashboard: () => unwrap<PatientDashboard>(apiClient.get("/patients/me/dashboard")),
  updatePatient: (payload: Record<string, unknown>) => unwrap<PatientProfile>(apiClient.patch("/patients/me", payload)),
  connectHospitals: (hospitalIds: string[]) => unwrap(apiClient.post("/patients/me/connect-hospitals", { hospitalIds })),
  syncRequests: (payload: Record<string, unknown>) => unwrap(apiClient.post("/patients/me/sync-requests", payload)),
  records: (patientId?: string) => unwrap<MedicalRecord[]>(apiClient.get("/medical-records", { params: { patientId } })),
  createRecord: (payload: Record<string, unknown>) => unwrap<MedicalRecord>(apiClient.post("/medical-records", payload)),
  prescriptions: (patientId?: string) => unwrap<Prescription[]>(apiClient.get("/prescriptions", { params: { patientId } })),
  createPrescription: (payload: Record<string, unknown>) => unwrap<Prescription>(apiClient.post("/prescriptions", payload)),
  appointments: (patientId?: string) => unwrap<Appointment[]>(apiClient.get("/appointments", { params: { patientId } })),
  createAppointment: (payload: Record<string, unknown>) => unwrap<Appointment>(apiClient.post("/appointments", payload)),
  updateAppointment: (id: string, payload: Record<string, unknown>) => unwrap<Appointment>(apiClient.patch(`/appointments/${id}`, payload)),
  labRequests: (patientId?: string) => unwrap<LabRequest[]>(apiClient.get("/lab-results/requests", { params: { patientId } })),
  assignedLabRequests: () => unwrap<LabRequest[]>(apiClient.get("/lab-requests/assigned")),
  updateLabRequest: (id: string, payload: Record<string, unknown>) => unwrap<LabRequest>(apiClient.patch(`/lab-results/requests/${id}/status`, payload)),
  acceptLabRequest: (id: string) => unwrap<LabRequest>(apiClient.patch(`/lab-requests/${id}/accept`)),
  rejectLabRequest: (id: string, rejectionReason?: string) => unwrap<LabRequest>(apiClient.patch(`/lab-requests/${id}/reject`, { rejectionReason })),
  labResults: (filters: Record<string, string> = {}) => unwrap<LabResult[]>(apiClient.get("/lab-results", { params: filters })),
  createLabResult: (payload: Record<string, unknown>) => unwrap<LabResult>(apiClient.post("/lab-results", payload)),
  createShare: (payload: { toHospitalId: string; scopes: string[]; expiresAt?: string }) => unwrap<ConsentShare>(apiClient.post("/consent-sharing", payload)),
  revokeShare: (id: string) => unwrap<ConsentShare>(apiClient.patch(`/consent-sharing/${id}/revoke`)),
  emergencyCases: (filters: Record<string, string> = {}) => unwrap<EmergencyCase[]>(apiClient.get("/emergency-cases", { params: filters })),
  assignedEmergencyCases: () => unwrap<EmergencyCase[]>(apiClient.get("/emergency-cases/assigned")),
  createEmergencyCase: (payload: Record<string, unknown>) => unwrap<EmergencyCase>(apiClient.post("/emergency-cases", payload)),
  updateEmergencyCase: (id: string, payload: Record<string, unknown>) => unwrap<EmergencyCase>(apiClient.patch(`/emergency-cases/${id}`, payload)),
  enableEmergency: () => unwrap<{ code: string }>(apiClient.post("/emergency-access/enable")),
  resolveEmergency: (code: string, reason: string) => unwrap<Record<string, unknown>>(apiClient.post("/emergency-access/resolve", { code, reason })),
  emergencyQr: () => unwrap<{ code: string; qrCodeUrl: string; shortCode: string; instructions: string }>(apiClient.get("/qrcode/emergency")),
  profileQr: () => unwrap<{ link: string; qrCodeUrl: string; instructions: string }>(apiClient.get("/qrcode/profile")),
  hospitalSearch: (query: string, specialty?: string, city?: string) => unwrap<Hospital[]>(apiClient.get("/hospital-finder/search", { params: { query, specialty, city } })),
  symptomAssess: (symptoms: string[], notes?: string) => unwrap<Record<string, unknown>>(apiClient.post("/symptoms/assess", { symptoms, notes })),
  messages: () => unwrap<Message[]>(apiClient.get("/messages")),
  messageContacts: () => unwrap<User[]>(apiClient.get("/messages/contacts")),
  sendMessage: (payload: { recipientUserId: string; patientId?: string; body: string }) => unwrap<Message>(apiClient.post("/messages", payload)),
  auditLogs: (patientId?: string) => unwrap(apiClient.get("/audit-logs", { params: { patientId } })),
  adminOperations: () => unwrap<AdminOperations>(apiClient.get("/workspace/admin/operations"))
};
