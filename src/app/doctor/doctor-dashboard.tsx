import { useState } from "react";
import { ClipboardPlus, Stethoscope } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { patientProfile, records } from "../../constants/mock-data";

export function DoctorDashboard() {
  const [added, setAdded] = useState(false);
  return (
    <AppShell title="Doctor portal" subtitle="Review connected patients, add diagnoses, lab notes, prescriptions, and emergency documentation.">
      <div className="metric-grid">
        <MetricCard label="Patient panel" value="1 connected" icon={<Stethoscope />} />
        <MetricCard label="Critical flags" value={String(records.filter((record) => record.critical).length)} tone="amber" icon={<ClipboardPlus />} />
      </div>
      <section className="panel-grid">
        <article className="panel">
          <h2>Patient summary</h2>
          <p>{patientProfile.fullName}: {patientProfile.chronicConditions.join(", ")}. Allergies: {patientProfile.allergies.join(", ")}.</p>
          <button className="primary-button" onClick={() => setAdded(true)}>Add diagnosis note</button>
          {added && <div className="success-state">Diagnosis note staged for upload.</div>}
        </article>
        <article className="panel">
          <h2>Prescription</h2>
          <form className="form-stack">
            <label>Medication<input defaultValue="Albuterol" /></label>
            <label>Dosage<input defaultValue="90 mcg, two puffs as needed" /></label>
          </form>
        </article>
      </section>
      <section className="panel">
        <h2>Patient records</h2>
        <DataTable headers={["Date", "Title", "Summary"]} rows={records.map((record) => [record.date, record.title, record.summary])} />
      </section>
    </AppShell>
  );
}
