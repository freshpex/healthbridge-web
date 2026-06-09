import { useEffect, useState } from "react";
import { Ambulance, Building2, CalendarDays, FileText, FlaskConical, History, Pill, Share2, UploadCloud } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { Hospital, PatientDashboardPayload } from "../../types/domain";
import { useAuth } from "../auth/hooks/use-auth";

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)) : "Not set";
const formatContact = (contact: PatientDashboardPayload["profile"]["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");

export function PatientDashboard() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<PatientDashboardPayload>();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [nextDashboard, nextHospitals] = await Promise.all([
        healthbridgeService.getPatientDashboard(token),
        healthbridgeService.listHospitals()
      ]);
      setDashboard(nextDashboard);
      setHospitals(nextHospitals);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load patient dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    if (!token) return;
    Promise.all([
      healthbridgeService.getPatientDashboard(token),
      healthbridgeService.listHospitals()
    ])
      .then(([nextDashboard, nextHospitals]) => {
        if (!alive) return;
        setDashboard(nextDashboard);
        setHospitals(nextHospitals);
      })
      .catch((caught) => {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load patient dashboard");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const revoke = async (shareId: string) => {
    if (!token) return;
    setStatus("");
    try {
      await healthbridgeService.revokeShare(token, shareId);
      setStatus("Shared access revoked and audit log updated.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not revoke access");
    }
  };

  const enableEmergency = async () => {
    if (!token) return;
    try {
      const result = await healthbridgeService.enableEmergency(token);
      setStatus(`Emergency access enabled. Code: ${result.code}`);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not enable emergency access");
    }
  };

  if (loading) return <AppShell title="Patient dashboard" subtitle="Loading secure patient data."><div className="loading-state">Loading records from HealthBridge API...</div></AppShell>;
  if (error && !dashboard) return <AppShell title="Patient dashboard" subtitle="Secure patient data"><div className="error-state">{error}</div></AppShell>;
  if (!dashboard) return <AppShell title="Patient dashboard" subtitle="Secure patient data"><div className="empty-state">No patient profile was found for this account.</div></AppShell>;

  const connected = dashboard.profile.hospitalIds ?? hospitals.filter((hospital) => dashboard.profile.connectedHospitalIds.includes(hospital.id));

  return (
    <AppShell title="Patient dashboard" subtitle="Control your medical profile, connected hospitals, sharing, and emergency access.">
      {error && <div className="error-state">{error}</div>}
      {status && <div className="success-state">{status}</div>}
      <div className="metric-grid">
        <MetricCard label="Connected hospitals" value={String(connected.length)} icon={<Building2 />} />
        <MetricCard label="Medical records" value={String(dashboard.records.length)} tone="teal" icon={<FileText />} />
        <MetricCard label="Active shares" value={String(dashboard.shares.filter((share) => share.status === "active").length)} tone="green" icon={<Share2 />} />
        <MetricCard label="Emergency code" value={dashboard.profile.emergencyCode ?? "Disabled"} tone="amber" icon={<Ambulance />} />
      </div>
      <section className="panel-grid">
        <article className="panel">
          <h2>Medical profile</h2>
          <div className="profile-list">
            <span>Blood group<strong>{dashboard.profile.bloodGroup}</strong></span>
            <span>Allergies<strong>{dashboard.profile.allergies.join(", ") || "None recorded"}</strong></span>
            <span>Chronic conditions<strong>{dashboard.profile.chronicConditions.join(", ") || "None recorded"}</strong></span>
            <span>Current medications<strong>{dashboard.profile.currentMedications.join(", ") || "None recorded"}</strong></span>
            <span>Emergency contact<strong>{formatContact(dashboard.profile.emergencyContact) || "Not set"}</strong></span>
          </div>
        </article>
        <article className="panel" id="emergency">
          <h2>Emergency access</h2>
          <div className="qr-card">{dashboard.profile.emergencyCode ?? "Not enabled"}</div>
          <p>Emergency staff see only critical info first. Every access is logged for patient review.</p>
          <button className="secondary-button" type="button" onClick={enableEmergency}>Generate new code</button>
        </article>
      </section>
      <section className="panel" id="records">
        <h2>Medical history</h2>
        {dashboard.records.length === 0 ? <div className="empty-state">No records have synced yet.</div> : (
          <DataTable
            headers={["Date", "Type", "Title", "Summary", "Critical"]}
            rows={dashboard.records.map((record) => [
              formatDate(record.date),
              <span className={record.critical ? "tag amber" : "tag"}>{record.type}</span>,
              record.title,
              record.summary,
              record.critical ? "Yes" : "No"
            ])}
          />
        )}
      </section>
      <section className="panel-grid">
        <article className="panel">
          <h2><FlaskConical size={20} /> Lab results</h2>
          {dashboard.labResults.length === 0 ? <div className="empty-state">No lab results yet.</div> : (
            <DataTable headers={["Collected", "Test", "Result", "Status"]} rows={dashboard.labResults.map((lab) => [formatDate(lab.collectedAt), lab.testName, lab.result, <span className={`tag ${lab.status === "critical" ? "amber" : lab.status === "normal" ? "green" : ""}`}>{lab.status}</span>])} />
          )}
        </article>
        <article className="panel">
          <h2><Pill size={20} /> Prescriptions</h2>
          {dashboard.prescriptions.length === 0 ? <div className="empty-state">No prescriptions yet.</div> : (
            <DataTable headers={["Medication", "Dosage", "Frequency", "Active"]} rows={dashboard.prescriptions.map((rx) => [rx.medication, rx.dosage, rx.frequency, rx.active ? "Yes" : "No"])} />
          )}
        </article>
      </section>
      <section className="panel-grid">
        <article className="panel">
          <h2><CalendarDays size={20} /> Appointments</h2>
          <DataTable headers={["When", "Reason", "Status"]} rows={dashboard.appointments.map((appointment) => [formatDate(appointment.scheduledAt), appointment.reason, appointment.status])} />
        </article>
        <article className="panel">
          <h2><UploadCloud size={20} /> Personal uploads</h2>
          {dashboard.uploads.length === 0 ? <div className="empty-state">Uploaded medical documents will appear here.</div> : (
            <DataTable headers={["File", "Category", "Provider"]} rows={dashboard.uploads.map((upload) => [upload.fileName, upload.category, upload.provider])} />
          )}
        </article>
      </section>
      <section className="panel" id="sharing">
        <h2>Consent sharing</h2>
        <DataTable
          headers={["Destination", "Scopes", "Expires", "Status", "Action"]}
          rows={dashboard.shares.map((share) => [
            hospitals.find((hospital) => hospital.id === share.toHospitalId)?.name ?? share.toHospitalId,
            share.scopes.join(", "),
            share.expiresAt ? formatDate(share.expiresAt) : "No expiry",
            <span className={`tag ${share.status === "active" ? "green" : ""}`}>{share.status}</span>,
            share.status === "active" ? <button className="small-button" onClick={() => revoke(share.id)}>Revoke</button> : "Revoked"
          ])}
        />
      </section>
      <section className="panel">
        <h2><History size={20} /> Audit history</h2>
        {dashboard.auditLogs.length === 0 ? <div className="empty-state">No audit events have been recorded yet.</div> : (
          <DataTable headers={["When", "Role", "Action", "Emergency"]} rows={dashboard.auditLogs.map((log) => [formatDate(log.date), log.role, log.action, log.emergency ? "Yes" : "No"])} />
        )}
      </section>
    </AppShell>
  );
}
