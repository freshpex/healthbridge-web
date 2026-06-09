const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const apiClient = {
  async request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(payload.message ?? "Request failed", response.status);
    return payload.data as T;
  }
};
