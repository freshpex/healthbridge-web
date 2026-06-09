import { createContext } from "react";
import type { User } from "../../../types/domain";

export interface AuthContextValue {
  user?: User;
  token?: string;
  login: (email: string, password: string) => Promise<void>;
  selectPersona: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
