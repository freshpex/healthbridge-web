import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { Appointment, AppointmentStatus, Hospital, Role } from "../../types/domain";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatDate } from "./patient-format";

const statusLabels: Record<AppointmentStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  accepted: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  reschedule_requested: "Reschedule requested"
};

const statusTone = (status: AppointmentStatus) => {
  if (["accepted", "scheduled", "completed"].includes(status)) return "green";
  if (["requested", "reschedule_requested"].includes(status)) return "amber";
  return "";
};

const appointmentId = (appointment: Appointment) => appointment.id ?? appointment._id;

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export function PatientAppointmentsPage() {
  const { token, dashboard, hospitals, loading, error, setError, refresh } = usePatientDashboard();
  const [hospitalId, setHospitalId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [doctorLookup, setDoctorLookup] = useState<{ hospitalId: string; options: Array<{ id: string; name: string; role: Role }> }>({ hospitalId: "", options: [] });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [rescheduleById, setRescheduleById] = useState<Record<string, string>>({});

  const selectableHospitals = useMemo<Hospital[]>(() => {
    const connected = dashboard?.profile.hospitalIds?.length
      ? dashboard.profile.hospitalIds
      : hospitals.filter((hospital) => dashboard?.profile.connectedHospitalIds.includes(hospital.id));
    return (connected ?? []).filter((hospital) => hospital.status === "approved" || dashboard?.profile.connectedHospitalIds.includes(hospital.id));
  }, [dashboard, hospitals]);

  const selectedHospitalId = hospitalId || selectableHospitals[0]?.id || "";
  const doctorOptions = doctorLookup.hospitalId === selectedHospitalId ? doctorLookup.options : [];

  useEffect(() => {
    let alive = true;
    if (!selectedHospitalId) return;
    healthbridgeService.getHospitalDetails(selectedHospitalId)
      .then((details) => {
        if (!alive) return;
        setDoctorLookup({
          hospitalId: selectedHospitalId,
          options: details.staff.filter((staff) => staff.role === "doctor").map((staff) => ({ id: staff.id ?? staff._id ?? "", name: staff.name, role: staff.role })).filter((staff) => staff.id)
        });
      })
      .catch(() => {
        if (alive) setDoctorLookup({ hospitalId: selectedHospitalId, options: [] });
      });
    return () => {
      alive = false;
    };
  }, [selectedHospitalId]);

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("Please sign in again before booking an appointment.");
      return;
    }
    if (!selectedHospitalId) {
      setError("Select a hospital before requesting an appointment.");
      return;
    }
    if (!reason.trim() || !scheduledAt) {
      setError("Add a reason and preferred appointment time.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await healthbridgeService.createAppointment(token, { hospitalId: selectedHospitalId, doctorId: doctorId || undefined, reason: reason.trim(), scheduledAt: new Date(scheduledAt).toISOString() });
      setReason("");
      setScheduledAt("");
      setDoctorId("");
      setSuccess("Appointment request sent to the selected provider.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not request appointment");
    } finally {
      setSaving(false);
    }
  };

  const updateAppointment = async (appointment: Appointment, payload: { status?: "cancelled" | "reschedule_requested"; scheduledAt?: string }) => {
    if (!token) {
      setError("Please sign in again before updating an appointment.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await healthbridgeService.updateAppointment(token, appointmentId(appointment), payload);
      setSuccess(payload.status === "cancelled" ? "Appointment cancelled." : "Reschedule request sent.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Appointments" subtitle="Request, reschedule, and cancel visits with connected hospitals.">
      <section className="panel">
        <h2>Request an appointment</h2>
        {selectableHospitals.length === 0 ? <div className="empty-state">Connect with a hospital before booking an appointment.</div> : null}
        <form className="form-stack" onSubmit={submitBooking}>
          <div className="form-grid">
            <label>
              Hospital
              <select value={selectedHospitalId} onChange={(event) => { setHospitalId(event.target.value); setDoctorId(""); }} disabled={selectableHospitals.length === 0} required>
                <option value="">Select hospital</option>
                {selectableHospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
              </select>
            </label>
            <label>
              Doctor where available
              <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)} disabled={doctorOptions.length === 0}>
                <option value="">{doctorOptions.length === 0 ? "No listed doctors" : "Any available doctor"}</option>
                {doctorOptions.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
              </select>
            </label>
            <label>
              Preferred date and time
              <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required />
            </label>
          </div>
          <label>
            Reason for visit
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Describe symptoms, follow-up needs, or the visit goal." rows={3} required />
          </label>
          <button className="primary-button" type="submit" disabled={saving || selectableHospitals.length === 0}>{saving ? "Saving..." : "Send request"}</button>
        </form>
      </section>

      {loading ? <div className="loading-state">Loading appointments...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {success ? <div className="success-state">{success}</div> : null}
      {dashboard && dashboard.appointments.length === 0 ? <div className="empty-state"><CalendarDays size={18} /> No appointments are scheduled.</div> : null}
      {dashboard && dashboard.appointments.length > 0 ? (
        <section className="panel">
          <DataTable
            headers={["When", "Reason", "Status", "Actions"]}
            rows={dashboard.appointments.map((appointment) => {
              const id = appointmentId(appointment);
              const requestedTime = rescheduleById[id] ?? toDateTimeLocal(appointment.scheduledAt);
              return [
                formatDate(appointment.scheduledAt),
                appointment.reason,
                <span className={`tag ${statusTone(appointment.status)}`}>{statusLabels[appointment.status] ?? appointment.status}</span>,
                <div className="form-stack" style={{ minWidth: 240 }}>
                  <button className="small-button" type="button" disabled={saving || appointment.status === "cancelled" || appointment.status === "completed"} onClick={() => updateAppointment(appointment, { status: "cancelled" })}>Cancel</button>
                  <input type="datetime-local" value={requestedTime} onChange={(event) => setRescheduleById((current) => ({ ...current, [id]: event.target.value }))} />
                  <button className="small-button" type="button" disabled={saving || !requestedTime || appointment.status === "completed" || appointment.status === "cancelled"} onClick={() => updateAppointment(appointment, { status: "reschedule_requested", scheduledAt: new Date(requestedTime).toISOString() })}>Request reschedule</button>
                </div>
              ];
            })}
          />
        </section>
      ) : null}
    </AppShell>
  );
}
