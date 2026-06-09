import type { ReactNode } from "react";
import { useAuth } from "../../app/auth/hooks/use-auth";
import { SideNav } from "../sidebar/side-nav";
import { TopNav } from "../header/top-nav";

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { user } = useAuth();
  return (
    <>
      <TopNav />
      <main className="app-shell">
        {user && <SideNav role={user.role} />}
        <section className="workspace">
          <div className="workspace-header">
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="status-pill">HIPAA-ready MVP controls</div>
          </div>
          {children}
        </section>
      </main>
    </>
  );
}
