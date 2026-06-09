import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, UsersRound } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { Hospital, User } from "../../types/domain";
import { useAuth } from "../auth/hooks/use-auth";

export function AdminDashboard() {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [nextHospitals, nextUsers] = await Promise.all([
        healthbridgeService.getHospitals(token),
        healthbridgeService.getUsers(token)
      ]);
      setHospitals(nextHospitals);
      setUsers(nextUsers);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load admin console");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const approve = async (hospitalId: string) => {
    if (!token) return;
    try {
      await healthbridgeService.approveHospital(token, hospitalId);
      setStatus("Hospital approved and available for patient signup.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not approve hospital");
    }
  };

  if (loading) return <AppShell title="Super admin console" subtitle="Loading platform controls."><div className="loading-state">Loading hospitals and users...</div></AppShell>;

  return (
    <AppShell title="Super admin console" subtitle="Approve hospitals, monitor platform activity, and manage governance controls.">
      {error && <div className="error-state">{error}</div>}
      {status && <div className="success-state">{status}</div>}
      <div className="metric-grid">
        <MetricCard label="Approved hospitals" value={String(hospitals.filter((hospital) => hospital.status === "approved").length)} icon={<CheckCircle2 />} />
        <MetricCard label="Pending approvals" value={String(hospitals.filter((hospital) => hospital.status === "pending").length)} tone="amber" icon={<ShieldCheck />} />
        <MetricCard label="Platform users" value={String(users.length)} tone="teal" icon={<UsersRound />} />
      </div>
      <section className="panel">
        <h2>Hospital approvals</h2>
        {hospitals.length === 0 ? <div className="empty-state">No hospitals have registered yet.</div> : (
          <DataTable headers={["Hospital", "Location", "Specialties", "Status", "Action"]} rows={hospitals.map((hospital) => [hospital.name, `${hospital.city}, ${hospital.state}`, hospital.specialties.join(", "), <span className={`tag ${hospital.status === "approved" ? "green" : "amber"}`}>{hospital.status}</span>, hospital.status === "pending" ? <button className="small-button" onClick={() => approve(hospital.id)}>Approve</button> : "Ready"])} />
        )}
      </section>
      <section className="panel">
        <h2>User directory</h2>
        <DataTable headers={["Name", "Email", "Role"]} rows={users.slice(0, 20).map((item) => [item.name, item.email, item.role.replace("_", " ")])} />
      </section>
    </AppShell>
  );
}
