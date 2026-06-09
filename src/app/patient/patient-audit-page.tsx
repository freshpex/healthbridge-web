import { History } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatDate } from "./patient-format";

export function PatientAuditPage() {
  const { dashboard, loading, error } = usePatientDashboard();
  return (
    <AppShell title="Audit history" subtitle="Every sensitive view, share, emergency access, and record action is visible here.">
      {loading ? <div className="loading-state">Loading audit trail...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {dashboard && dashboard.auditLogs.length === 0 ? <div className="empty-state"><History size={18} /> No audit events have been recorded yet.</div> : null}
      {dashboard && dashboard.auditLogs.length > 0 ? (
        <section className="panel">
          <DataTable headers={["When", "Actor role", "Action", "Emergency"]} rows={dashboard.auditLogs.map((log) => [formatDate(log.date), log.role, log.action, log.emergency ? <span className="tag amber">yes</span> : "No"])} />
        </section>
      ) : null}
    </AppShell>
  );
}
