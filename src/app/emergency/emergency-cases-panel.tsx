import { useEffect, useState } from "react";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { EmergencyCase } from "../../types/domain";

const statusOptions: EmergencyCase["status"][] = ["requested", "triaged", "assigned", "in_progress", "resolved", "cancelled"];

export function EmergencyCasesPanel({ token }: { token?: string }) {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [emptyMessage, setEmptyMessage] = useState("No emergency cases are available for your account yet.");

  useEffect(() => {
    if (!token) return;
    let alive = true;
    const loadCases = async () => {
      await Promise.resolve();
      if (!alive) return;
      setLoading(true);
      setError("");
      try {
        const data = await healthbridgeService.listEmergencyCases(token);
        if (!alive) return;
        setCases(data);
        setEmptyMessage(data.length ? "" : "No emergency cases are available for your account yet.");
      } catch (caught) {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load emergency cases.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void loadCases();
    return () => {
      alive = false;
    };
  }, [token]);

  const createCase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const created = await healthbridgeService.createEmergencyCase(token, { location, reason, priority: "high" });
      setCases((current) => [created, ...current]);
      setLocation("");
      setReason("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create emergency case.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (emergencyCase: EmergencyCase, status: EmergencyCase["status"]) => {
    if (!token || emergencyCase.status === status) return;
    setError("");
    try {
      const updated = await healthbridgeService.updateEmergencyCase(token, emergencyCase.id, { status });
      setCases((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update emergency case.");
    }
  };

  return (
    <article className="panel">
      <h2>Emergency cases</h2>
      <form className="form-stack" onSubmit={createCase}>
        <label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ward, home address, or incident location" /></label>
        <label>Reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Briefly describe the emergency" /></label>
        <button className="primary-button" type="submit" disabled={saving || !location.trim() || !reason.trim()}>{saving ? "Creating..." : "Create emergency case"}</button>
      </form>
      {error && <div className="error-state">{error}</div>}
      {loading ? <div className="empty-state">Loading emergency cases...</div> : null}
      {!loading && cases.length === 0 ? <div className="empty-state">{emptyMessage}</div> : null}
      {!loading && cases.length > 0 ? (
        <div className="table-card">
          <table>
            <thead><tr><th>Priority</th><th>Status</th><th>Location</th><th>Reason</th><th>Updated</th></tr></thead>
            <tbody>
              {cases.map((emergencyCase) => (
                <tr key={emergencyCase.id}>
                  <td>{emergencyCase.priority}</td>
                  <td>
                    <select value={emergencyCase.status} onChange={(event) => void updateStatus(emergencyCase, event.target.value as EmergencyCase["status"])}>
                      {statusOptions.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td>{emergencyCase.location}</td>
                  <td>{emergencyCase.reason}</td>
                  <td>{emergencyCase.updatedAt ? new Date(emergencyCase.updatedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </article>
  );
}
