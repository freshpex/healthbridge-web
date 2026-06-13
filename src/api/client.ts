import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getStoredSession, saveStoredSession } from "../store/session-store";
import type { AuthSession } from "../types/domain";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiEnvelope<T> {
  data: T;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" }
});

let refreshPromise: Promise<AuthSession> | null = null;

const refreshSession = async () => {
  const session = getStoredSession();
  if (!session?.refreshToken) throw new Error("Session expired. Please sign in again.");
  refreshPromise ??= axios
    .post<ApiEnvelope<AuthSession>>(`${API_BASE_URL}/auth/refresh`, { refreshToken: session.refreshToken })
    .then((response) => {
      saveStoredSession(response.data.data);
      return response.data.data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredSession()?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes("/auth/login")) {
      original._retry = true;
      try {
        const session = await refreshSession();
        original.headers.Authorization = `Bearer ${session.accessToken}`;
        return apiClient(original);
      } catch {
        saveStoredSession(null);
      }
    }
    const message = error.response?.data?.message ?? (error.message === "Network Error" ? "Unable to reach the HealthBridge server." : error.message);
    return Promise.reject(new Error(message));
  }
);

export const unwrap = async <T>(promise: Promise<{ data: ApiEnvelope<T> }>) => (await promise).data.data;
export default apiClient;
