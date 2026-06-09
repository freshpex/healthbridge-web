import { demoPassword, demoUsers } from "../../../constants/mock-data";
import type { User } from "../../../types/domain";
import { apiClient } from "../../../services/api";

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; accessToken?: string }> {
    try {
      return await apiClient.request<{ user: User; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
    } catch {
      const user = demoUsers.find((candidate) => candidate.email === email);
      if (!user || password !== demoPassword) throw new Error("Invalid demo credentials");
      return { user };
    }
  }
};
