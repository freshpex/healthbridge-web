import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatDate } from "./patient-format";

export function PatientRecordsPage() {
  const { dashboard, loading, error } = usePatientDashboard();
  return (
    <AppShell title="Medical records" subtitle="Diagnoses, visits, imaging, emergency notes, and uploaded clinical documents.">
      {loading ? <div className="loading-state">Loading medical records...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {dashboard && dashboard.records.length === 0 ? <div className="empty-state">No medical records have synced yet.</div> : null}
      {dashboard && dashboard.records.length > 0 ? (
        <section className="panel">
          <DataTable headers={["Date", "Type", "Title", "Summary", "Critical"]} rows={dashboard.records.map((record) => [formatDate(record.date), <span className={record.critical ? "tag amber" : "tag"}>{record.type}</span>, record.title, record.summary, record.critical ? "Yes" : "No"])} />
        </section>
      ) : null}
    </AppShell>
  );
}
