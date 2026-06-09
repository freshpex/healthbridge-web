import { createContext } from "react";
import type { User } from "../../../types/domain";
import type { SignupPayload } from "../services/auth-service";

export interface AuthContextValue {
  user?: User;
  token?: string;
  booting: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
