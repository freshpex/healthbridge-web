import { create } from "zustand";
import type { AuthSession } from "../types/domain";

const sessionKey = "healthbridge.web.session";
const sidebarKey = "healthbridge.web.sidebar.collapsed";
const themeKey = "healthbridge.web.theme";

type Theme = "light" | "dark" | "system";

interface SessionState {
  session: AuthSession | null;
  sidebarCollapsed: boolean;
  theme: Theme;
  setSession: (session: AuthSession | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: Theme) => void;
}

const readSession = () => {
  try {
    const saved = localStorage.getItem(sessionKey);
    return saved ? (JSON.parse(saved) as AuthSession) : null;
  } catch {
    return null;
  }
};

export const useSessionStore = create<SessionState>((set) => ({
  session: readSession(),
  sidebarCollapsed: localStorage.getItem(sidebarKey) === "true",
  theme: (localStorage.getItem(themeKey) as Theme | null) ?? "system",
  setSession: (session) => {
    if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
    else localStorage.removeItem(sessionKey);
    set({ session });
  },
  setSidebarCollapsed: (sidebarCollapsed) => {
    localStorage.setItem(sidebarKey, String(sidebarCollapsed));
    set({ sidebarCollapsed });
  },
  setTheme: (theme) => {
    localStorage.setItem(themeKey, theme);
    set({ theme });
  }
}));

export const getStoredSession = () => useSessionStore.getState().session;
export const saveStoredSession = (session: AuthSession | null) => useSessionStore.getState().setSession(session);
