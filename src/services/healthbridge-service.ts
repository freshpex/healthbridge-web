import { apiClient } from "./api";
import type {
  Appointment,
  AuditLog,
  ConsentShare,
  EmergencyCase,
  Hospital,
  Laboratory,
  LabRequest,
  LabResult,
  MedicalRecord,
  PatientDashboardPayload,
  PatientProfile,
  Prescription,
  Role,
  Upload,
  User,
  WorkspacePayload,
  AccountProfilePayload
} from "../types/domain";

type RawHospital = Omit<Hospital, "id"> & { _id: string; connectedPatientIds?: string[] };
type RawLaboratory = Omit<Laboratory, "id" | "status"> & { _id: string; isActive: boolean; status?: Laboratory["status"] };
type RawPatient = Omit<PatientProfile, "id" | "connectedHospitalIds"> & { _id: string; hospitalIds?: RawHospital[] | string[] };
type RawRecord = Omit<MedicalRecord, "id" | "date"> & { _id: string; recordDate?: string; createdAt?: string };
type RawShare = Omit<ConsentShare, "id"> & { _id: string; toHospitalId: string | RawHospital };
type RawEmergencyCase = Omit<EmergencyCase, "id"> & { _id: string };
type RawAuditLog = Omit<AuditLog, "id" | "role" | "date"> & { _id: string; actorRole: Role | "system"; createdAt: string };
type RawAppointment = Omit<Appointment, "id" | "hospitalId" | "doctorId"> & { _id: string; hospitalId?: string | RawHospital; doctorId?: string | { _id?: string; id?: string; name?: string } };

const idOf = (value: { _id?: string; id?: string } | string | undefined) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id ?? value._id ?? "";
};

export const normalizeHospital = (hospital: RawHospital | Hospital): Hospital => ({
  ...hospital,
  id: idOf(hospital),
  connectedPatients: hospital.connectedPatients ?? hospital.connectedPatientIds?.length ?? 0
});

export const normalizeLaboratory = (laboratory: RawLaboratory | Laboratory): Laboratory => ({
  ...laboratory,
  id: idOf(laboratory),
  status: laboratory.status ?? (laboratory.isActive ? "approved" : "pending")
});

export const normalizePatient = (patient: RawPatient): PatientProfile => ({
  ...patient,
  id: idOf(patient),
  connectedHospitalIds: ((patient.hospitalIds ?? []) as Array<RawHospital | string>).map((hospital) => idOf(hospital)),
  hospitalIds: ((patient.hospitalIds ?? []) as Array<RawHospital | string>)
    .filter((hospital) => typeof hospital !== "string")
    .map((hospital) => normalizeHospital(hospital))
});

const normalizeRecord = (record: RawRecord): MedicalRecord => ({
  ...record,
  id: idOf(record),
  hospitalId: idOf(record.hospitalId as unknown as RawHospital | string),
  date: record.recordDate ?? record.createdAt ?? ""
});

const normalizeShare = (share: RawShare): ConsentShare => ({
  ...share,
  id: idOf(share),
  toHospitalId: idOf(share.toHospitalId as RawHospital | string),
  expiresAt: share.expiresAt ?? ""
});

const normalizeAudit = (log: RawAuditLog): AuditLog => ({
  ...log,
  id: idOf(log),
  role: log.actorRole,
  date: log.createdAt
});

const normalizeEmergencyCase = (emergencyCase: RawEmergencyCase): EmergencyCase => ({
  ...emergencyCase,
  id: idOf(emergencyCase)
});

const normalizeAppointment = (appointment: RawAppointment | Appointment): Appointment => ({
  ...appointment,
  id: idOf(appointment),
  hospitalId: idOf(appointment.hospitalId as RawHospital | string | undefined),
  doctorId: idOf(appointment.doctorId as { _id?: string; id?: string } | string | undefined)
});

export const healthbridgeService = {
  listHospitals: async () => {
    const hospitals = await apiClient.request<RawHospital[]>("/hospitals");
    return hospitals.map(normalizeHospital);
  },

  getPatientDashboard: async (token: string): Promise<PatientDashboardPayload> => {
    const data = await apiClient.request<{
      profile: RawPatient;
      records: RawRecord[];
      labResults: LabResult[];
      prescriptions: Prescription[];
      appointments: RawAppointment[];
      shares: RawShare[];
      auditLogs: RawAuditLog[];
      uploads: Upload[];
    }>("/patients/me/dashboard", {}, token);

    return {
      profile: normalizePatient(data.profile),
      records: data.records.map(normalizeRecord),
      labResults: data.labResults,
      prescriptions: data.prescriptions,
      appointments: data.appointments.map(normalizeAppointment),
      shares: data.shares.map(normalizeShare),
      auditLogs: data.auditLogs.map(normalizeAudit),
      uploads: data.uploads
    };
  },

  getHospitalPatients: async (hospitalId: string, token: string) =>
    apiClient.request<RawPatient[]>(`/hospitals/${hospitalId}/patients`, {}, token).then((patients) => patients.map(normalizePatient)),

  verifyPatientConnection: async (token: string, hospitalId: string, patientId: string) =>
    apiClient.request<{ verified: boolean }>(`/hospitals/${hospitalId}/verify-patient/${patientId}`, { method: "POST" }, token),

  getHospitalStaff: async (token: string, hospitalId: string) =>
    apiClient.request<User[]>(`/hospitals/${hospitalId}/staff`, {}, token),

  createHospitalPersonnel: async (token: string, hospitalId: string, payload: { name: string; email: string; password: string; role: "doctor" | "hospital_admin"; phone?: string; specialty?: string; licenseNumber?: string; department?: string }) =>
    apiClient.request<User>(`/hospitals/${hospitalId}/staff`, { method: "POST", body: JSON.stringify(payload) }, token),

  updateHospitalPersonnel: async (token: string, hospitalId: string, staffId: string, payload: { name?: string; phone?: string; isActive?: boolean; specialty?: string; department?: string; acceptingAppointments?: boolean }) =>
    apiClient.request<User>(`/hospitals/${hospitalId}/staff/${staffId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),

  getHospitals: async (token: string) => apiClient.request<RawHospital[]>("/hospitals", {}, token).then((hospitals) => hospitals.map(normalizeHospital)),

  listLaboratories: async (token: string, status?: "active" | "inactive") =>
    apiClient.request<{ data: RawLaboratory[]; meta: { page: number; limit: number; total: number } }>(
      `/laboratories${status ? `?status=${status}` : ""}`,
      {},
      token
    ).then((payload) => payload.data.map(normalizeLaboratory)),

  approveLaboratory: async (token: string, laboratoryId: string) =>
    apiClient.request<RawLaboratory>(`/laboratories/${laboratoryId}/approve`, { method: "PATCH" }, token).then(normalizeLaboratory),

  getOperationalDashboard: async (token: string, hospitalId?: string) => {
    const [hospitals, users, doctors, laboratories, hospitalPatients, hospitalStaff] = await Promise.all([
      healthbridgeService.getHospitals(token),
      healthbridgeService.getUsers(token).catch(() => [] as User[]),
      healthbridgeService.getDoctors(token).catch(() => [] as unknown[]),
      healthbridgeService.listLaboratories(token).catch(() => [] as Laboratory[]),
      hospitalId ? healthbridgeService.getHospitalPatients(hospitalId, token).catch(() => [] as PatientProfile[]) : Promise.resolve([] as PatientProfile[]),
      hospitalId ? healthbridgeService.getHospitalStaff(token, hospitalId).catch(() => [] as User[]) : Promise.resolve([] as User[])
    ]);

    return { hospitals, users, doctors, laboratories, hospitalPatients, hospitalStaff };
  },

  getUsers: async (token: string) => apiClient.request<User[]>("/users", {}, token),

  getWorkspace: async (token: string) => apiClient.request<WorkspacePayload>("/users/me/workspace", {}, token),

  getAccountProfile: async (token: string) => apiClient.request<AccountProfilePayload>("/users/me", {}, token),

  updateAccountProfile: async (token: string, payload: Record<string, unknown>) =>
    apiClient.request<AccountProfilePayload>("/users/me", { method: "PATCH", body: JSON.stringify(payload) }, token),

  changePassword: async (token: string, currentPassword: string, newPassword: string) =>
    apiClient.request<void>("/users/me/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }, token),

  getDoctors: async (token: string) => apiClient.request<unknown[]>("/doctors", {}, token),

  approveHospital: async (token: string, hospitalId: string) =>
    apiClient.request<RawHospital>(`/hospitals/${hospitalId}/approve`, { method: "PATCH" }, token).then(normalizeHospital),

  getRecords: async (token: string, patientId?: string) =>
    apiClient.request<RawRecord[]>(`/medical-records${patientId ? `?patientId=${patientId}` : ""}`, {}, token).then((records) => records.map(normalizeRecord)),

  getLabResults: async (token: string, patientId?: string, filters?: { status?: LabResult["status"]; search?: string; hospitalId?: string; laboratoryId?: string; dateFrom?: string; dateTo?: string }) => {
    const query = new URLSearchParams();
    if (patientId) query.set("patientId", patientId);
    if (filters?.status) query.set("status", filters.status);
    if (filters?.search) query.set("search", filters.search);
    if (filters?.hospitalId) query.set("hospitalId", filters.hospitalId);
    if (filters?.laboratoryId) query.set("laboratoryId", filters.laboratoryId);
    if (filters?.dateFrom) query.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) query.set("dateTo", filters.dateTo);
    const suffix = query.toString();
    return apiClient.request<LabResult[]>(`/lab-results${suffix ? `?${suffix}` : ""}`, {}, token);
  },

  getLabRequests: async (token: string, patientId?: string) =>
    apiClient.request<LabRequest[]>(`/lab-results/requests${patientId ? `?patientId=${patientId}` : ""}`, {}, token),

  createLabRequest: async (token: string, payload: { patientId: string; hospitalId?: string; laboratoryId?: string; testName: string; priority?: "routine" | "urgent" | "stat"; clinicalNotes?: string }) =>
    apiClient.request<LabRequest>("/lab-results/requests", { method: "POST", body: JSON.stringify(payload) }, token),

  updateLabRequestStatus: async (token: string, requestId: string, payload: { status: LabRequest["status"]; rejectionReason?: string; clinicalNotes?: string }) =>
    apiClient.request<LabRequest>(`/lab-results/requests/${requestId}/status`, { method: "PATCH", body: JSON.stringify(payload) }, token),

  getPrescriptions: async (token: string, patientId?: string) =>
    apiClient.request<Prescription[]>(`/prescriptions${patientId ? `?patientId=${patientId}` : ""}`, {}, token),

  getAppointments: async (token: string, patientId?: string) =>
    apiClient.request<RawAppointment[]>(`/appointments${patientId ? `?patientId=${patientId}` : ""}`, {}, token).then((appointments) => appointments.map(normalizeAppointment)),

  createAppointment: async (token: string, payload: { patientId?: string; hospitalId?: string; doctorId?: string; reason: string; scheduledAt: string; status?: Appointment["status"] }) =>
    apiClient.request<RawAppointment>("/appointments", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeAppointment),

  updateAppointment: async (token: string, appointmentId: string, payload: { status?: "cancelled" | "reschedule_requested"; scheduledAt?: string; reason?: string }) =>
    apiClient.request<RawAppointment>(`/appointments/${appointmentId}`, { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizeAppointment),

  createLabResult: async (token: string, payload: { patientId: string; hospitalId?: string; testName: string; result: string; unit?: string; referenceRange?: string; status?: LabResult["status"]; collectedAt?: string }) =>
    apiClient.request<LabResult>("/lab-results", { method: "POST", body: JSON.stringify(payload) }, token),

  uploadLabResult: async (token: string, payload: { requestId?: string; patientId?: string; hospitalId?: string; laboratoryId?: string; testName?: string; result: string; unit?: string; referenceRange?: string; status?: "normal" | "abnormal" | "critical"; notes?: string; collectedAt?: string }) =>
    apiClient.request<LabResult>("/lab-results", { method: "POST", body: JSON.stringify(payload) }, token),

  updateLabResult: async (token: string, resultId: string, payload: Partial<Pick<LabResult, "result" | "unit" | "referenceRange" | "status" | "collectedAt">> & { notes?: string }) =>
    apiClient.request<LabResult>(`/lab-results/${resultId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),

  createRecord: async (token: string, payload: { patientId: string; hospitalId?: string; type: string; title: string; summary: string; critical?: boolean }) =>
    apiClient.request<RawRecord>("/medical-records", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeRecord),

  createPrescription: async (token: string, payload: { patientId: string; hospitalId?: string; medication: string; dosage: string; frequency: string; active?: boolean }) =>
    apiClient.request<Prescription>("/prescriptions", { method: "POST", body: JSON.stringify(payload) }, token),

  getShares: async (token: string) => apiClient.request<RawShare[]>("/consent-sharing", {}, token).then((shares) => shares.map(normalizeShare)),

  createShare: async (token: string, payload: { toHospitalId: string; scopes: string[]; expiresAt?: string }) =>
    apiClient.request<RawShare>("/consent-sharing", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeShare),

  revokeShare: async (token: string, shareId: string) =>
    apiClient.request<RawShare>(`/consent-sharing/${shareId}/revoke`, { method: "PATCH" }, token).then(normalizeShare),

  updateProfile: async (token: string, payload: Partial<Pick<PatientProfile, "fullName" | "dateOfBirth" | "gender" | "address" | "bloodGroup" | "allergies" | "chronicConditions" | "currentMedications" | "emergencyContact">> & { avatarUrl?: string; notificationPreferences?: User["notificationPreferences"] }) =>
    apiClient.request<RawPatient>("/patients/me", { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizePatient),

  requestSync: async (token: string, payload: { hospitalId: string; notes?: string }) =>
    apiClient.request<{ _id: string; status: string }>("/patients/me/sync-requests", { method: "POST", body: JSON.stringify(payload) }, token),

  uploadDocument: async (token: string, payload: { file: File; patientId?: string; category?: string }) => {
    const form = new FormData();
    form.append("file", payload.file);
    if (payload.patientId) form.append("patientId", payload.patientId);
    if (payload.category) form.append("category", payload.category);
    return apiClient.request<Upload>("/uploads", { method: "POST", body: form }, token);
  },

  enableEmergency: async (token: string) => apiClient.request<{ code: string }>("/emergency-access/enable", { method: "POST" }, token),

  resolveEmergency: async (token: string, code: string, reason: string) =>
    apiClient.request<{
      fullName: string;
      bloodGroup: string;
      allergies: string[];
      chronicConditions: string[];
      currentMedications: string[];
      emergencyContact: PatientProfile["emergencyContact"];
      recentCriticalRecords: MedicalRecord[];
    }>("/emergency-access/resolve", { method: "POST", body: JSON.stringify({ code, reason }) }, token),

  listEmergencyCases: async (token: string, params?: { status?: EmergencyCase["status"]; patientId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.patientId) query.set("patientId", params.patientId);
    const suffix = query.toString();
    return apiClient.request<RawEmergencyCase[]>(`/emergency-cases${suffix ? `?${suffix}` : ""}`, {}, token).then((cases) => cases.map(normalizeEmergencyCase));
  },

  createEmergencyCase: async (token: string, payload: { patientId?: string; priority?: EmergencyCase["priority"]; location: string; reason: string; notes?: string }) =>
    apiClient.request<RawEmergencyCase>("/emergency-cases", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeEmergencyCase),

  updateEmergencyCase: async (token: string, id: string, payload: Partial<Pick<EmergencyCase, "status" | "priority" | "location" | "reason" | "notes">>) =>
    apiClient.request<RawEmergencyCase>(`/emergency-cases/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizeEmergencyCase),

  assignEmergencyCase: async (token: string, id: string, payload: { assignedUserId?: string; assignedServiceId?: string; hospitalId?: string; notes?: string }) =>
    apiClient.request<RawEmergencyCase>(`/emergency-cases/${id}/assign`, { method: "PATCH", body: JSON.stringify(payload) }, token).then(normalizeEmergencyCase),

  assessSymptoms: async (token: string, symptoms: string[], notes?: string) =>
    apiClient.request<{
      symptoms: string[];
      assessment: {
        conditions: string[];
        urgency: "low" | "medium" | "high";
        recommendations: string[];
      };
      timestamp: string;
    }>("/symptoms/assess", { method: "POST", body: JSON.stringify({ symptoms, notes }) }, token),

  findNearbyHospitals: async (latitude: number, longitude: number, radius?: number, specialty?: string) =>
    apiClient.request<Array<{ id: string; name: string; city: string; state: string; address: string; specialties: string[]; distance: number; contactEmail: string }>>(
      `/hospital-finder/nearby?latitude=${latitude}&longitude=${longitude}${radius ? `&radius=${radius}` : ""}${specialty ? `&specialty=${specialty}` : ""}`
    ),

  searchHospitals: async (query: string, specialty?: string, city?: string) =>
    apiClient.request<Array<{ id: string; name: string; city: string; state: string; address: string; specialties: string[]; contactEmail: string }>>(
      `/hospital-finder/search?query=${encodeURIComponent(query)}${specialty ? `&specialty=${encodeURIComponent(specialty)}` : ""}${city ? `&city=${encodeURIComponent(city)}` : ""}`
    ),

  getHospitalDetails: async (hospitalId: string) =>
    apiClient.request<{
      id: string;
      name: string;
      city: string;
      state: string;
      address: string;
      specialties: string[];
      contactEmail: string;
      status: string;
      connectedPatients: number;
      staff: Array<{ _id?: string; id?: string; name: string; role: Role; email?: string }>;
    }>(`/hospital-finder/${hospitalId}/details`),

  getEmergencyQRCode: async (token: string) =>
    apiClient.request<{
      code: string;
      qrCodeUrl: string;
      shortCode: string;
      instructions: string;
      expiresAt: null;
    }>("/qrcode/emergency", {}, token),

  getProfileQRCode: async (token: string) =>
    apiClient.request<{
      link: string;
      qrCodeUrl: string;
      instructions: string;
    }>("/qrcode/profile", {}, token),

  aiChat: async (token: string, messages: { role: "user" | "assistant" | "system"; content: string }[]) =>
    apiClient.request<{ id: string; reply: string }>("/ai/chat", { method: "POST", body: JSON.stringify({ messages }) }, token),

  getAuditLogs: async (token: string, patientId?: string) =>
    apiClient.request<RawAuditLog[]>(`/audit-logs${patientId ? `?patientId=${patientId}` : ""}`, {}, token).then((logs) => logs.map(normalizeAudit))
};
