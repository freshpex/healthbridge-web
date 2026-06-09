import { Pill } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";

export function PatientPrescriptionsPage() {
  const { dashboard, loading, error } = usePatientDashboard();
  return (
    <AppShell title="Prescriptions" subtitle="Active and historical medications from connected care teams.">
      {loading ? <div className="loading-state">Loading prescriptions...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {dashboard && dashboard.prescriptions.length === 0 ? <div className="empty-state"><Pill size={18} /> No prescriptions are available yet.</div> : null}
      {dashboard && dashboard.prescriptions.length > 0 ? (
        <section className="panel">
          <DataTable headers={["Medication", "Dosage", "Frequency", "Status"]} rows={dashboard.prescriptions.map((rx) => [rx.medication, rx.dosage, rx.frequency, rx.active ? <span className="tag green">active</span> : <span className="tag">inactive</span>])} />
        </section>
      ) : null}
    </AppShell>
  );
}
