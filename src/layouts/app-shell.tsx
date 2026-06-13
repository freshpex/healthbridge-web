import { useQuery } from "@tanstack/react-query";
import { LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { healthbridgeApi } from "../api/healthbridge-api";
import { Button } from "../components/ui/button";
import { ErrorState, Loader } from "../components/ui/feedback";
import { Logo } from "../components/ui/logo";
import { roleNavigation } from "../constants/navigation";
import { useTheme } from "../hooks/use-theme";
import { useSessionStore } from "../store/session-store";
import type { Role } from "../types/domain";
import { useState } from "react";

export function AppShell() {
  const navigate = useNavigate();
  const session = useSessionStore((state) => state.session);
  const setSession = useSessionStore((state) => state.setSession);
  const collapsed = useSessionStore((state) => state.sidebarCollapsed);
  const setCollapsed = useSessionStore((state) => state.setSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const workspaceQuery = useQuery({ queryKey: ["workspace"], queryFn: healthbridgeApi.workspace, enabled: Boolean(session) });
  const role = workspaceQuery.data?.profile.account?.role ?? session?.user.role ?? "patient";
  const user = workspaceQuery.data?.profile.account ?? session?.user;
  const navItems = roleNavigation[role as Role] ?? roleNavigation.patient;

  const logout = async () => {
    await healthbridgeApi.logout().catch(() => undefined);
    setSession(null);
    navigate("/", { replace: true });
  };

  const resolvedTheme = theme === "dark" ? "light" : "dark";

  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="side-top">
          <Logo />
          <Button variant="icon" className="mobile-only" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></Button>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === "/app"} onClick={() => setMobileOpen(false)} title={item.label}>
              {item.icon}<span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      {mobileOpen ? <button className="drawer-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /> : null}
      <div className="workspace">
        <header className="topbar">
          <Button variant="icon" className="desktop-only" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}</Button>
          <Button variant="icon" className="mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19} /></Button>
          <div>
            <p className="eyebrow">{role.replace("_", " ")}</p>
            <h1>{user?.name ?? "HealthBridge workspace"}</h1>
          </div>
          <div className="top-actions">
            <Button variant="icon" onClick={() => setTheme(resolvedTheme)} aria-label="Toggle theme">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</Button>
            <Button variant="icon" onClick={logout} aria-label="Sign out"><LogOut size={18} /></Button>
          </div>
        </header>
        <main className="content">
          {workspaceQuery.isLoading ? <Loader /> : workspaceQuery.error ? <ErrorState message={String(workspaceQuery.error.message)} /> : <Outlet context={{ workspace: workspaceQuery.data, refreshWorkspace: workspaceQuery.refetch }} />}
        </main>
      </div>
    </div>
  );
}
