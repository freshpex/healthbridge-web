import { useState } from "react";
import { Ambulance, ShieldAlert } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { patientProfile, records } from "../../constants/mock-data";

export function EmergencyPage() {
  const [code, setCode] = useState("HB-DEMO01");
  const [resolved, setResolved] = useState(false);
  const isValid = code.trim().toUpperCase() === patientProfile.emergencyCode;
  return (
    <AppShell title="Emergency access" subtitle="Scan or enter a patient code to reveal critical information and log the access event.">
      <section className="panel-grid">
        <article className="panel">
          <h2>Resolve emergency code</h2>
          <form className="form-stack" onSubmit={(event) => { event.preventDefault(); setResolved(isValid); }}>
            <label>Emergency code<input value={code} onChange={(event) => setCode(event.target.value)} /></label>
            <label>Access reason<textarea defaultValue="Emergency intake requires critical medication and allergy information." /></label>
            <button className="primary-button" type="submit"><Ambulance size={18} /> Resolve code</button>
          </form>
          {!isValid && <div className="error-state">Code is invalid or disabled.</div>}
        </article>
        {resolved && (
          <article className="panel emergency-panel">
            <h2><ShieldAlert size={20} /> Critical patient view</h2>
            <div className="metric-grid two">
              <MetricCard label="Full name" value={patientProfile.fullName} />
              <MetricCard label="Blood group" value={patientProfile.bloodGroup} tone="amber" />
            </div>
            <p><strong>Allergies:</strong> {patientProfile.allergies.join(", ")}</p>
            <p><strong>Chronic conditions:</strong> {patientProfile.chronicConditions.join(", ")}</p>
            <p><strong>Current medications:</strong> {patientProfile.currentMedications.join(", ")}</p>
            <p><strong>Emergency contact:</strong> {patientProfile.emergencyContact}</p>
            <ul>{records.filter((record) => record.critical).map((record) => <li key={record.id}>{record.title}: {record.summary}</li>)}</ul>
          </article>
        )}
      </section>
    </AppShell>
  );
}
