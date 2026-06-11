import { apiClient } from "./api";
import type {
  Appointment,
  AuditLog,
  ConsentShare,
  Hospital,
  LabResult,
  MedicalRecord,
  PatientDashboardPayload,
  PatientProfile,
  Prescription,
  Role,
  Upload,
  User
} from "../types/domain";

type RawHospital = Omit<Hospital, "id"> & { _id: string; connectedPatientIds?: string[] };
type RawPatient = Omit<PatientProfile, "id" | "connectedHospitalIds"> & { _id: string; hospitalIds?: RawHospital[] | string[] };
type RawRecord = Omit<MedicalRecord, "id" | "date"> & { _id: string; recordDate?: string; createdAt?: string };
type RawShare = Omit<ConsentShare, "id"> & { _id: string; toHospitalId: string | RawHospital };
type RawAuditLog = Omit<AuditLog, "id" | "role" | "date"> & { _id: string; actorRole: Role | "system"; createdAt: string };

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
      appointments: Appointment[];
      shares: RawShare[];
      auditLogs: RawAuditLog[];
      uploads: Upload[];
    }>("/patients/me/dashboard", {}, token);

    return {
      profile: normalizePatient(data.profile),
      records: data.records.map(normalizeRecord),
      labResults: data.labResults,
      prescriptions: data.prescriptions,
      appointments: data.appointments,
      shares: data.shares.map(normalizeShare),
      auditLogs: data.auditLogs.map(normalizeAudit),
      uploads: data.uploads
    };
  },

  getHospitalPatients: async (hospitalId: string, token: string) =>
    apiClient.request<RawPatient[]>(`/hospitals/${hospitalId}/patients`, {}, token).then((patients) => patients.map(normalizePatient)),

  getHospitals: async (token: string) => apiClient.request<RawHospital[]>("/hospitals", {}, token).then((hospitals) => hospitals.map(normalizeHospital)),

  getUsers: async (token: string) => apiClient.request<User[]>("/users", {}, token),

  getDoctors: async (token: string) => apiClient.request<unknown[]>("/doctors", {}, token),

  approveHospital: async (token: string, hospitalId: string) =>
    apiClient.request<RawHospital>(`/hospitals/${hospitalId}/approve`, { method: "PATCH" }, token).then(normalizeHospital),

  getRecords: async (token: string, patientId?: string) =>
    apiClient.request<RawRecord[]>(`/medical-records${patientId ? `?patientId=${patientId}` : ""}`, {}, token).then((records) => records.map(normalizeRecord)),

  getLabResults: async (token: string, patientId?: string) =>
    apiClient.request<LabResult[]>(`/lab-results${patientId ? `?patientId=${patientId}` : ""}`, {}, token),

  getPrescriptions: async (token: string, patientId?: string) =>
    apiClient.request<Prescription[]>(`/prescriptions${patientId ? `?patientId=${patientId}` : ""}`, {}, token),

  getAppointments: async (token: string, patientId?: string) =>
    apiClient.request<Appointment[]>(`/appointments${patientId ? `?patientId=${patientId}` : ""}`, {}, token),

  createRecord: async (token: string, payload: { patientId: string; hospitalId?: string; type: string; title: string; summary: string; critical?: boolean }) =>
    apiClient.request<RawRecord>("/medical-records", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeRecord),

  createPrescription: async (token: string, payload: { patientId: string; hospitalId?: string; medication: string; dosage: string; frequency: string; active?: boolean }) =>
    apiClient.request<Prescription>("/prescriptions", { method: "POST", body: JSON.stringify(payload) }, token),

  getShares: async (token: string) => apiClient.request<RawShare[]>("/consent-sharing", {}, token).then((shares) => shares.map(normalizeShare)),

  createShare: async (token: string, payload: { toHospitalId: string; scopes: string[]; expiresAt?: string }) =>
    apiClient.request<RawShare>("/consent-sharing", { method: "POST", body: JSON.stringify(payload) }, token).then(normalizeShare),

  revokeShare: async (token: string, shareId: string) =>
    apiClient.request<RawShare>(`/consent-sharing/${shareId}/revoke`, { method: "PATCH" }, token).then(normalizeShare),

  updateProfile: async (token: string, payload: Partial<Pick<PatientProfile, "bloodGroup" | "allergies" | "chronicConditions" | "currentMedications" | "emergencyContact">>) =>
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
      staff: unknown[];
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
