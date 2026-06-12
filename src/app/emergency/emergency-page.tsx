import { useState } from "react";
import { Ambulance, ShieldAlert } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { healthbridgeService } from "../../services/healthbridge-service";
import { useAuth } from "../auth/hooks/use-auth";
import { EmergencyCasesPanel } from "./emergency-cases-panel";

type EmergencyResult = Awaited<ReturnType<typeof healthbridgeService.resolveEmergency>>;

export function EmergencyPage() {
  const { token } = useAuth();
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<EmergencyResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      setResult(await healthbridgeService.resolveEmergency(token, code.trim().toUpperCase(), reason));
    } catch (caught) {
      setResult(undefined);
      setError(caught instanceof Error ? caught.message : "Code is invalid or disabled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Emergency access" subtitle="Scan or enter a patient code to reveal critical information and log the access event.">
      <section className="panel-grid">
        <EmergencyCasesPanel token={token} />
        <article className="panel">
          <h2>Resolve emergency code</h2>
          <form className="form-stack" onSubmit={submit}>
            <label>Emergency code<input value={code} onChange={(event) => setCode(event.target.value)} /></label>
            <label>Access reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label>
            {error && <div className="error-state">{error}</div>}
            <button className="primary-button" type="submit" disabled={loading}><Ambulance size={18} /> {loading ? "Resolving..." : "Resolve code"}</button>
          </form>
        </article>
        {result && (
          <article className="panel emergency-panel">
            <h2><ShieldAlert size={20} /> Critical patient view</h2>
            <div className="metric-grid two">
              <MetricCard label="Full name" value={result.fullName} />
              <MetricCard label="Blood group" value={result.bloodGroup} tone="amber" />
            </div>
            <p><strong>Allergies:</strong> {result.allergies.join(", ") || "None recorded"}</p>
            <p><strong>Chronic conditions:</strong> {result.chronicConditions.join(", ") || "None recorded"}</p>
            <p><strong>Current medications:</strong> {result.currentMedications.join(", ") || "None recorded"}</p>
            <p><strong>Emergency contact:</strong> {typeof result.emergencyContact === "string" ? result.emergencyContact : [result.emergencyContact?.name, result.emergencyContact?.relationship, result.emergencyContact?.phone].filter(Boolean).join(", ")}</p>
            {result.recentCriticalRecords.length === 0 ? <div className="empty-state">No recent critical records are marked.</div> : (
              <ul>{result.recentCriticalRecords.map((record) => <li key={record.id ?? record._id}>{record.title}: {record.summary}</li>)}</ul>
            )}
          </article>
        )}
      </section>
    </AppShell>
  );
}
