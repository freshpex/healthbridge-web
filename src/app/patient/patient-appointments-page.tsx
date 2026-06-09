import { CalendarDays } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatDate } from "./patient-format";

export function PatientAppointmentsPage() {
  const { dashboard, loading, error } = usePatientDashboard();
  return (
    <AppShell title="Appointments" subtitle="Upcoming and completed appointments from connected hospitals.">
      {loading ? <div className="loading-state">Loading appointments...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {dashboard && dashboard.appointments.length === 0 ? <div className="empty-state"><CalendarDays size={18} /> No appointments are scheduled.</div> : null}
      {dashboard && dashboard.appointments.length > 0 ? (
        <section className="panel">
          <DataTable headers={["When", "Reason", "Status"]} rows={dashboard.appointments.map((appointment) => [formatDate(appointment.scheduledAt), appointment.reason, <span className={`tag ${appointment.status === "scheduled" ? "green" : ""}`}>{appointment.status}</span>])} />
        </section>
      ) : null}
    </AppShell>
  );
}
