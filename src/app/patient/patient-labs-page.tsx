import { FlaskConical } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatDate } from "./patient-format";

export function PatientLabsPage() {
  const { dashboard, loading, error } = usePatientDashboard();
  return (
    <AppShell title="Lab results" subtitle="Synced laboratory results from connected hospitals.">
      {loading ? <div className="loading-state">Loading lab results...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {dashboard && dashboard.labResults.length === 0 ? <div className="empty-state"><FlaskConical size={18} /> No lab results are available yet.</div> : null}
      {dashboard && dashboard.labResults.length > 0 ? (
        <section className="panel">
          <DataTable headers={["Collected", "Test", "Result", "Reference", "Status"]} rows={dashboard.labResults.map((lab) => [formatDate(lab.collectedAt), lab.testName, lab.result, lab.referenceRange ?? "Not listed", <span className={`tag ${lab.status === "critical" ? "amber" : lab.status === "normal" ? "green" : ""}`}>{lab.status}</span>])} />
        </section>
      ) : null}
    </AppShell>
  );
}
