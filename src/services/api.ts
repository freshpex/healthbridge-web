const FALLBACK_API_URL = "https://healthbridge-backend-wroj.onrender.com/api/v1";
const API_URL = import.meta.env.VITE_API_URL ?? FALLBACK_API_URL;

const friendlyApiMessage = (message: string, status: number) => {
  const lower = message.toLowerCase();
  if (status === 401 || lower.includes("credential")) return "Invalid email or password.";
  if (lower.includes("failed to fetch") || lower.includes("network")) return "Unable to reach the HealthBridge server. Please wait 30 seconds and try again.";
  if (lower === "request failed") return "Please check your internet connection and try again.";
  return message;
};

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
    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(!isFormData && hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
      });
    } catch {
      throw new ApiError(friendlyApiMessage("network", 0), 0);
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(friendlyApiMessage(payload.message ?? payload.error ?? "Request failed", response.status), response.status);
    return payload.data as T;
  }
};

export { API_URL };
