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
  role: "patient" | "hospital_admin";
  hospitalIds?: string[];
  hospital?: {
    name: string;
    address: string;
    city: string;
    state: string;
    contactEmail: string;
    specialties: string[];
  };
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
