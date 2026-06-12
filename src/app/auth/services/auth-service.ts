import type { Role, User } from "../../../types/domain";
import { apiClient } from "../../../services/api";

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: "patient" | "hospital_admin" | "laboratory";
  hospitalIds?: string[];
  hospitalId?: string;
  hospital?: {
    name: string;
    address: string;
    city: string;
    state: string;
    contactEmail: string;
    specialties: string[];
  };
  labName?: string;
  certificationNumber?: string;
  department?: string;
  testCapabilities?: string[];
}

export interface HospitalSignupPayload {
  hospitalName: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
  specialties: string[];
}

export interface LabSignupPayload {
  labName: string;
  certificationNumber: string;
  department: string;
  email: string;
  password: string;
  testCapabilities: string[];
  hospitalId?: string;
}

export interface DoctorInvitePayload {
  name: string;
  email: string;
  password: string;
  specialty: string;
  licenseNumber: string;
  department: string;
  hospitalId?: string;
}

export interface EmergencyStaffRequestPayload {
  fullName: string;
  organizationName: string;
  emergencyRole: string;
  certificationNumber: string;
  email: string;
  password: string;
  phone: string;
}

export interface EmergencyStaffRequest {
  id: string;
  fullName: string;
  organizationName: string;
  emergencyRole: string;
  certificationNumber: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
}

export const authService = {
  login: (email: string, password: string) =>
    apiClient.request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  signup: (payload: SignupPayload) =>
    apiClient.request<AuthSession>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  signupHospital: (payload: HospitalSignupPayload) =>
    authService.signup({
      name: `${payload.hospitalName} Admin`,
      email: payload.email,
      password: payload.password,
      role: "hospital_admin",
      hospital: {
        name: payload.hospitalName,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        contactEmail: payload.email,
        specialties: payload.specialties
      }
    }),

  signupLaboratory: (payload: LabSignupPayload) =>
    authService.signup({
      name: payload.labName,
      email: payload.email,
      password: payload.password,
      role: "laboratory",
      labName: payload.labName,
      certificationNumber: payload.certificationNumber,
      department: payload.department,
      testCapabilities: payload.testCapabilities,
      hospitalId: payload.hospitalId
    }),

  requestEmergencyStaffInvite: (payload: EmergencyStaffRequestPayload) =>
    apiClient.request<EmergencyStaffRequest>("/auth/emergency-staff/requests", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  inviteDoctor: (payload: DoctorInvitePayload, token: string) =>
    apiClient.request<unknown>("/doctors", {
      method: "POST",
      body: JSON.stringify(payload)
    }, token),

  refresh: (refreshToken: string) =>
    apiClient.request<AuthSession>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    }),

  me: (token: string) => apiClient.request<User>("/auth/me", {}, token),

  landingForRole: (role: Role) => ({
    patient: "/patient",
    doctor: "/doctor",
    hospital_admin: "/hospital",
    super_admin: "/admin",
    emergency_staff: "/emergency",
    laboratory: "/laboratory"
  })[role]
};
