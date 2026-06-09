import { useState } from "react";
import { Building2, FilePlus2, UsersRound } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { hospitals, patientProfile, records } from "../../constants/mock-data";

export function HospitalDashboard() {
  const [requestHandled, setRequestHandled] = useState(false);
  const hospital = hospitals[0];
  return (
    <AppShell title="Hospital admin dashboard" subtitle="Manage staff, connected patients, record uploads, verification, and sync requests.">
      <div className="metric-grid">
        <MetricCard label="Hospital status" value={hospital.status} icon={<Building2 />} />
        <MetricCard label="Connected patients" value={hospital.connectedPatients.toLocaleString()} tone="teal" icon={<UsersRound />} />
        <MetricCard label="Records uploaded" value={String(records.length)} tone="green" icon={<FilePlus2 />} />
      </div>
      <section className="panel-grid">
        <article className="panel">
          <h2>Connected patient</h2>
          <p>{patientProfile.fullName} is verified with {hospital.name}. Record sync is available for lab results, prescriptions, diagnoses, and emergency notes.</p>
          <button className="primary-button" onClick={() => setRequestHandled(true)}>Handle sync request</button>
          {requestHandled && <div className="success-state">Request marked in review and audit log queued.</div>}
        </article>
        <article className="panel">
          <h2>Add clinical record</h2>
          <form className="form-stack">
            <label>Record title<input defaultValue="Emergency note" /></label>
            <label>Summary<textarea defaultValue="Patient stabilized. Critical allergy profile reviewed." /></label>
            <button className="secondary-button" type="button">Upload record</button>
          </form>
        </article>
      </section>
      <section className="panel">
        <h2>Staff and records</h2>
        <DataTable headers={["Patient", "Record", "Type", "Critical"]} rows={records.map((record) => [patientProfile.fullName, record.title, record.type, record.critical ? "Yes" : "No"])} />
      </section>
    </AppShell>
  );
}
