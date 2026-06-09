import { CheckCircle2, ShieldCheck } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { hospitals } from "../../constants/mock-data";

export function AdminDashboard() {
  return (
    <AppShell title="Super admin console" subtitle="Approve hospitals, monitor platform activity, and manage governance controls.">
      <div className="metric-grid">
        <MetricCard label="Approved hospitals" value={String(hospitals.filter((hospital) => hospital.status === "approved").length)} icon={<CheckCircle2 />} />
        <MetricCard label="Pending approvals" value={String(hospitals.filter((hospital) => hospital.status === "pending").length)} tone="amber" icon={<ShieldCheck />} />
      </div>
      <section className="panel">
        <h2>Hospital approvals</h2>
        <DataTable headers={["Hospital", "Location", "Specialties", "Status"]} rows={hospitals.map((hospital) => [hospital.name, `${hospital.city}, ${hospital.state}`, hospital.specialties.join(", "), <span className={`tag ${hospital.status === "approved" ? "green" : "amber"}`}>{hospital.status}</span>])} />
      </section>
    </AppShell>
  );
}
