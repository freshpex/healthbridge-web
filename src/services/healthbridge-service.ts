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
    }>("/emergency-access/resolve", { method: "POST", body: JSON.stringify({ code, reason }) }, token)
};
