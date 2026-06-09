import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { User } from "../../../types/domain";
import { authService } from "../services/auth-service";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(() => {
    const raw = localStorage.getItem("healthbridge-user");
    return raw ? (JSON.parse(raw) as User) : undefined;
  });
  const [token, setToken] = useState<string | undefined>(() => localStorage.getItem("healthbridge-token") ?? undefined);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login(email, password);
    setUser(session.user);
    setToken(session.accessToken);
    localStorage.setItem("healthbridge-user", JSON.stringify(session.user));
    if (session.accessToken) localStorage.setItem("healthbridge-token", session.accessToken);
  }, []);

  const selectPersona = useCallback((nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem("healthbridge-user", JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    setUser(undefined);
    setToken(undefined);
    localStorage.removeItem("healthbridge-user");
    localStorage.removeItem("healthbridge-token");
  }, []);

  const value = useMemo(() => ({ user, token, login, selectPersona, logout }), [login, logout, token, selectPersona, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
