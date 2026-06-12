const FALLBACK_API_URL = "https://healthbridge-backend-wroj.onrender.com/api/v1";
const API_URL = import.meta.env.VITE_API_URL ?? FALLBACK_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const apiClient = {
  async request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const hasBody = options.body !== undefined;
    const isFormData = hasBody && typeof FormData !== "undefined" && options.body instanceof FormData;
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(!isFormData && hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(payload.message ?? payload.error ?? "Request failed", response.status);
    return payload.data as T;
  }
};

export { API_URL };
