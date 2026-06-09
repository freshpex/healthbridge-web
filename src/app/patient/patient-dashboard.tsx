import { useState } from "react";
import { Ambulance, Building2, FileText, History, Share2 } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { auditLogs, hospitals, patientProfile, records, shares as initialShares } from "../../constants/mock-data";

export function PatientDashboard() {
  const [shares, setShares] = useState(initialShares);
  const connected = hospitals.filter((hospital) => patientProfile.connectedHospitalIds.includes(hospital.id));
  return (
    <AppShell title="Patient dashboard" subtitle="Control your medical profile, connected hospitals, sharing, and emergency access.">
      <div className="metric-grid">
        <MetricCard label="Connected hospitals" value={String(connected.length)} icon={<Building2 />} />
        <MetricCard label="Medical records" value={String(records.length)} tone="teal" icon={<FileText />} />
        <MetricCard label="Active shares" value={String(shares.filter((share) => share.status === "active").length)} tone="green" icon={<Share2 />} />
        <MetricCard label="Emergency code" value={patientProfile.emergencyCode} tone="amber" icon={<Ambulance />} />
      </div>
      <section className="panel-grid">
        <article className="panel">
          <h2>Medical profile</h2>
          <div className="profile-list">
            <span>Blood group<strong>{patientProfile.bloodGroup}</strong></span>
            <span>Allergies<strong>{patientProfile.allergies.join(", ")}</strong></span>
            <span>Chronic conditions<strong>{patientProfile.chronicConditions.join(", ")}</strong></span>
            <span>Current medications<strong>{patientProfile.currentMedications.join(", ")}</strong></span>
            <span>Emergency contact<strong>{patientProfile.emergencyContact}</strong></span>
          </div>
        </article>
        <article className="panel" id="emergency">
          <h2>Emergency access</h2>
          <div className="qr-card">{patientProfile.emergencyCode}</div>
          <p>Emergency staff see only critical info first. Every access is logged for patient review.</p>
        </article>
      </section>
      <section className="panel" id="records">
        <h2>Medical history</h2>
        <DataTable
          headers={["Date", "Type", "Title", "Hospital", "Summary"]}
          rows={records.map((record) => [
            record.date,
            <span className={record.critical ? "tag amber" : "tag"}>{record.type}</span>,
            record.title,
            hospitals.find((hospital) => hospital.id === record.hospitalId)?.name ?? "Unknown",
            record.summary
          ])}
        />
      </section>
      <section className="panel" id="sharing">
        <h2>Consent sharing</h2>
        <DataTable
          headers={["Destination", "Scopes", "Expires", "Status", "Action"]}
          rows={shares.map((share) => [
            hospitals.find((hospital) => hospital.id === share.toHospitalId)?.name ?? share.toHospitalId,
            share.scopes.join(", "),
            share.expiresAt,
            <span className={`tag ${share.status === "active" ? "green" : ""}`}>{share.status}</span>,
            share.status === "active" ? <button className="small-button" onClick={() => setShares((current) => current.map((item) => item.id === share.id ? { ...item, status: "revoked" } : item))}>Revoke</button> : "Revoked"
          ])}
        />
      </section>
      <section className="panel">
        <h2><History size={20} /> Audit history</h2>
        <DataTable headers={["When", "Actor", "Role", "Action"]} rows={auditLogs.map((log) => [log.date, log.actor, log.role, log.action])} />
      </section>
    </AppShell>
  );
}
