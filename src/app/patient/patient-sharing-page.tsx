import { useState } from "react";
import { Share2 } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatDate } from "./patient-format";

const scopes = ["profile", "records", "labs", "prescriptions", "appointments", "critical"];

export function PatientSharingPage() {
  const { token, dashboard, hospitals, loading, error, setError, refresh } = usePatientDashboard();
  const [toHospitalId, setToHospitalId] = useState("");
  const [selectedScopes, setSelectedScopes] = useState(["profile", "records"]);
  const [expiresAt, setExpiresAt] = useState("2026-12-31");
  const [status, setStatus] = useState("");

  const destinationOptions = hospitals.filter((hospital) => !dashboard?.profile.connectedHospitalIds.includes(hospital.id));

  const createShare = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const destination = toHospitalId || destinationOptions[0]?.id;
    if (!destination) {
      setError("Choose a destination hospital.");
      return;
    }
    try {
      await healthbridgeService.createShare(token, { toHospitalId: destination, scopes: selectedScopes, expiresAt });
      setStatus("Consent share created and audit log recorded.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create share");
    }
  };

  const revoke = async (id: string) => {
    if (!token) return;
    try {
      await healthbridgeService.revokeShare(token, id);
      setStatus("Shared access revoked.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not revoke share");
    }
  };

  return (
    <AppShell title="Consent sharing" subtitle="Grant scoped access to another hospital or doctor, then revoke it any time.">
      {loading ? <div className="loading-state">Loading consent grants...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {status ? <div className="success-state">{status}</div> : null}
      <section className="panel-grid">
        <article className="panel">
          <h2><Share2 size={20} /> Create share</h2>
          <form className="form-stack" onSubmit={createShare}>
            <label>Destination hospital<select value={toHospitalId} onChange={(event) => setToHospitalId(event.target.value)}>{destinationOptions.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}</select></label>
            <div className="check-grid">
              {scopes.map((scope) => (
                <label key={scope} className="inline-check">
                  <input type="checkbox" checked={selectedScopes.includes(scope)} onChange={() => setSelectedScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope])} />
                  {scope}
                </label>
              ))}
            </div>
            <label>Expires<input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label>
            <button className="primary-button" type="submit">Share records</button>
          </form>
        </article>
        <article className="panel">
          <h2>Sharing policy</h2>
          <p>Shares are scoped by consent, expire automatically when configured, and are enforced by backend patient access checks for doctors and hospital admins.</p>
        </article>
      </section>
      {dashboard && dashboard.shares.length === 0 ? <div className="empty-state">No shares exist yet.</div> : null}
      {dashboard && dashboard.shares.length > 0 ? (
        <section className="panel">
          <DataTable headers={["Destination", "Scopes", "Expires", "Status", "Action"]} rows={dashboard.shares.map((share) => [hospitals.find((hospital) => hospital.id === share.toHospitalId)?.name ?? share.toHospitalId, share.scopes.join(", "), share.expiresAt ? formatDate(share.expiresAt) : "No expiry", <span className={`tag ${share.status === "active" ? "green" : ""}`}>{share.status}</span>, share.status === "active" ? <button className="small-button" onClick={() => revoke(share.id)}>Revoke</button> : "Revoked"])} />
        </section>
      ) : null}
    </AppShell>
  );
}
