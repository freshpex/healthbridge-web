import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, FileText, FlaskConical, History, Pill, Share2, UploadCloud } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { Hospital, PatientDashboardPayload } from "../../types/domain";
import { useAuth } from "../auth/hooks/use-auth";

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)) : "Not set";
const formatContact = (contact: PatientDashboardPayload["profile"]["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");
const initials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
const ageFromDate = (value?: string) => {
  if (!value) return "Patient";
  const birth = new Date(value);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear() - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return `${age} years`;
};

export function PatientDashboard() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<PatientDashboardPayload>();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [emergencyQrUrl, setEmergencyQrUrl] = useState("");

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
      healthbridgeService.getEmergencyQRCode(token)
        .then((result) => setEmergencyQrUrl(result.qrCodeUrl))
        .catch(() => setEmergencyQrUrl(""));
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
  const activeShares = dashboard.shares.filter((share) => share.status === "active");
  const recentRecords = dashboard.records.slice(0, 4);

  return (
    <AppShell title="Patient dashboard" subtitle="Control your medical profile, connected hospitals, sharing, and emergency access.">
      {error && <div className="error-state">{error}</div>}
      <div style={{ marginBottom: 12 }}><Link to="/patient/ai-chat" className="secondary-button">Open AI assistant</Link></div>
      {status && <div className="success-state">{status}</div>}
      <section className="patient-dashboard-grid">
        <article className="panel profile-panel">
          <div className="panel-title-row">
            <h2>My profile summary</h2>
            <Link to="/patient/profile">View profile</Link>
          </div>
          <div className="profile-hero">
            <div className="avatar-ring">{initials(dashboard.profile.fullName)}</div>
            <div>
              <h3>{dashboard.profile.fullName}</h3>
              <p>{ageFromDate(dashboard.profile.dateOfBirth)} · HealthBridge patient · {dashboard.profile.bloodGroup}</p>
              <p>{connected.length} connected hospital{connected.length === 1 ? "" : "s"}</p>
              <p>{formatContact(dashboard.profile.emergencyContact) || "Emergency contact not set"}</p>
            </div>
          </div>
          <div className="profile-stat-row">
            <span>Hospitals<strong>{connected.length}</strong></span>
            <span>Records<strong>{dashboard.records.length}</strong></span>
            <span>Allergies<strong>{dashboard.profile.allergies[0] ?? "None"}</strong></span>
            <span>Blood group<strong>{dashboard.profile.bloodGroup}</strong></span>
          </div>
        </article>
        <article className="panel connected-panel">
          <div className="panel-title-row">
            <h2>Connected hospitals</h2>
            <Link to="/patient/profile">View all</Link>
          </div>
          <div className="hospital-list">
            {connected.slice(0, 4).map((hospital) => (
              <div className="hospital-row" key={hospital.id}>
                <Building2 size={18} />
                <span><strong>{hospital.name}</strong><small>{[hospital.city, hospital.state].filter(Boolean).join(", ")}</small></span>
                <b>Connected</b>
              </div>
            ))}
          </div>
        </article>
        <article className="panel emergency-panel" id="emergency">
          <h2>Emergency access</h2>
          <div className="emergency-code-card">
            <span>Your emergency code</span>
            <strong>{dashboard.profile.emergencyCode ?? "Not enabled"}</strong>
            <small>Scanned 1 time · last 7 days ago</small>
          </div>
          <div className="qr-card">
            {emergencyQrUrl ? <img src={emergencyQrUrl} alt="Emergency QR code" className="qr-image" /> : <span>{dashboard.profile.emergencyCode ? "QR" : "OFF"}</span>}
          </div>
          <p>Emergency staff see only critical info first. Every access is logged for patient review.</p>
          <button className="secondary-button" type="button" onClick={enableEmergency}>Generate new code</button>
        </article>
      </section>
      <section className="patient-dashboard-grid lower">
        <article className="panel record-card-list" id="records">
          <div className="panel-title-row">
            <h2>Medical records</h2>
            <Link to="/patient/records">View all</Link>
          </div>
          {recentRecords.length === 0 ? <div className="empty-state">No records have synced yet.</div> : recentRecords.map((record) => (
            <div className="record-row" key={record.id}>
              <FileText size={18} />
              <span><strong>{record.title}</strong><small>{record.type} · {formatDate(record.date)}</small></span>
              <b>{record.critical ? "Critical" : "PDF"}</b>
            </div>
          ))}
        </article>
        <article className="panel consent-preview">
          <div className="panel-title-row">
            <h2>Consent sharing</h2>
            <Link to="/patient/sharing">View all</Link>
          </div>
          {activeShares.length === 0 ? <div className="empty-state">No active shares.</div> : activeShares.slice(0, 3).map((share) => (
            <div className="share-row" key={share.id}>
              <Share2 size={18} />
              <span><strong>{hospitals.find((hospital) => hospital.id === share.toHospitalId)?.name ?? "Shared hospital"}</strong><small>{share.scopes.join(", ")}</small></span>
              <button className="small-button" onClick={() => revoke(share.id)}>Revoke</button>
            </div>
          ))}
        </article>
        <article className="panel audit-preview">
          <div className="panel-title-row">
            <h2>Audit history</h2>
            <Link to="/patient/audit">View all</Link>
          </div>
          <DataTable headers={["Who accessed", "What", "When"]} rows={dashboard.auditLogs.slice(0, 5).map((log) => [log.actor ?? log.role, log.action, formatDate(log.date)])} />
        </article>
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
