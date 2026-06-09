import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../../../types/domain";
import { authService, type AuthSession, type SignupPayload } from "../services/auth-service";
import { AuthContext } from "./auth-context";

const userKey = "healthbridge-user";
const tokenKey = "healthbridge-token";
const refreshKey = "healthbridge-refresh-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(() => {
    const raw = localStorage.getItem(userKey);
    return raw ? (JSON.parse(raw) as User) : undefined;
  });
  const [token, setToken] = useState<string | undefined>(() => localStorage.getItem(tokenKey) ?? undefined);
  const [booting, setBooting] = useState(true);

  const persistSession = useCallback((session: AuthSession) => {
    setUser(session.user);
    setToken(session.accessToken);
    localStorage.setItem(userKey, JSON.stringify(session.user));
    localStorage.setItem(tokenKey, session.accessToken);
    localStorage.setItem(refreshKey, session.refreshToken);
  }, []);

  useEffect(() => {
    let alive = true;
    const hydrate = async () => {
      const currentToken = localStorage.getItem(tokenKey) ?? undefined;
      const currentRefresh = localStorage.getItem(refreshKey) ?? undefined;
      try {
        if (currentToken) {
          const nextUser = await authService.me(currentToken);
          if (!alive) return;
          setUser(nextUser);
          setToken(currentToken);
          localStorage.setItem(userKey, JSON.stringify(nextUser));
        } else if (currentRefresh) {
          const session = await authService.refresh(currentRefresh);
          if (!alive) return;
          persistSession(session);
        }
      } catch {
        if (currentRefresh) {
          try {
            const session = await authService.refresh(currentRefresh);
            if (!alive) return;
            persistSession(session);
          } catch {
            localStorage.removeItem(userKey);
            localStorage.removeItem(tokenKey);
            localStorage.removeItem(refreshKey);
            setUser(undefined);
            setToken(undefined);
          }
        }
      } finally {
        if (alive) setBooting(false);
      }
    };
    void hydrate();
    return () => {
      alive = false;
    };
  }, [persistSession]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login(email, password);
    persistSession(session);
    return session.user;
  }, [persistSession]);

  const signup = useCallback(async (payload: SignupPayload) => {
    const session = await authService.signup(payload);
    persistSession(session);
    return session.user;
  }, [persistSession]);

  const logout = useCallback(() => {
    setUser(undefined);
    setToken(undefined);
    localStorage.removeItem(userKey);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
  }, []);

  const value = useMemo(() => ({ user, token, booting, login, signup, logout }), [booting, login, logout, signup, token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
