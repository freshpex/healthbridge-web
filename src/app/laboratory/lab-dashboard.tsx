import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { useAuth } from "../auth/hooks/use-auth";
import { FlaskConical, Upload, Clock, CheckCircle, XCircle } from "lucide-react";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { LabRequest, LabResult } from "../../types/domain";

export function LabDashboard() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [resultValue, setResultValue] = useState("");
  const [status, setStatus] = useState<"normal" | "abnormal" | "critical">("normal");
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(true);

  const loadLabWork = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [requestItems, resultItems] = await Promise.all([
        healthbridgeService.getLabRequests(token),
        healthbridgeService.getLabResults(token)
      ]);
      setRequests(requestItems);
      setResults(resultItems);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to load laboratory work queue");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (alive) void loadLabWork();
    });
    return () => {
      alive = false;
    };
  }, [loadLabWork]);

  const selectedRequest = useMemo(() => requests.find((request) => request._id === selectedRequestId), [requests, selectedRequestId]);
  const activeRequests = requests.filter((request) => request.status !== "completed" && request.status !== "rejected");

  const changeRequestStatus = async (request: LabRequest, nextStatus: LabRequest["status"]) => {
    if (!token) return;
    setMessage(undefined);
    try {
      await healthbridgeService.updateLabRequestStatus(token, request._id, { status: nextStatus });
      await loadLabWork();
      setMessage(`Request ${nextStatus.replace("_", " ")}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to update request");
    }
  };

  const uploadResult = async () => {
    if (!token || !selectedRequest || !resultValue.trim()) return;
    setMessage(undefined);
    try {
      await healthbridgeService.uploadLabResult(token, { requestId: selectedRequest._id, result: resultValue.trim(), status });
      setResultValue("");
      setSelectedRequestId("");
      await loadLabWork();
      setMessage("Result uploaded and request completed.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to upload result");
    }
  };

  return (
    <AppShell title="Laboratory Dashboard" subtitle="Accept assigned test requests, upload results, and track analyses.">
      <div className="metric-grid">
        <MetricCard label="Test Results Uploaded" value={String(results.length)} icon={<CheckCircle />} tone="green" />
        <MetricCard label="Active Requests" value={String(activeRequests.length)} icon={<Clock />} tone="amber" />
      </div>

      {message ? <div className="panel" style={{ marginBottom: 16 }}>{message}</div> : null}

      <section className="dashboard-section">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <h2 style={{ margin: 0 }}>Lab Requests</h2>
          {loading ? <span className="tag">Loading...</span> : null}
        </div>

        {requests.length === 0 ? (
          <div className="empty-state" style={{ textAlign: "center", padding: "40px 20px" }}>
            <FlaskConical size={48} color="#CCC" style={{ marginBottom: "16px" }} />
            <h3>No lab requests assigned</h3>
            <p>Requests assigned to your lab or hospital scope will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {requests.map((request) => (
              <div key={request._id} className="panel" style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong>{request.testName}</strong>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>{request.clinicalNotes ?? "No clinical notes"}</p>
                  </div>
                  <span className={`tag ${request.status === "completed" ? "green" : request.status === "rejected" ? "amber" : ""}`}>{request.status.replace("_", " ")}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {request.status === "requested" ? <button className="secondary-button" onClick={() => changeRequestStatus(request, "accepted")}><CheckCircle size={16} /> Accept</button> : null}
                  {request.status === "requested" || request.status === "accepted" || request.status === "in_progress" ? <button className="secondary-button" onClick={() => changeRequestStatus(request, "rejected")}><XCircle size={16} /> Reject</button> : null}
                  {request.status === "accepted" ? <button className="secondary-button" onClick={() => changeRequestStatus(request, "in_progress")}>Mark in progress</button> : null}
                  {request.status !== "completed" && request.status !== "rejected" ? <button className="primary-button" onClick={() => setSelectedRequestId(request._id)}><Upload size={16} /> Upload result</button> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section" style={{ marginTop: "40px" }}>
        <h2>Upload Test Results</h2>
        <div className="panel" style={{ display: "grid", gap: 12 }}>
          <label>
            Request
            <select value={selectedRequestId} onChange={(event) => setSelectedRequestId(event.target.value)}>
              <option value="">Select a request</option>
              {activeRequests.map((request) => <option key={request._id} value={request._id}>{request.testName} · {request.status}</option>)}
            </select>
          </label>
          <label>
            Result
            <textarea value={resultValue} onChange={(event) => setResultValue(event.target.value)} placeholder="Enter verified laboratory result" />
          </label>
          <label>
            Result status
            <select value={status} onChange={(event) => setStatus(event.target.value as "normal" | "abnormal" | "critical")}>
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <button className="primary-button" disabled={!selectedRequestId || !resultValue.trim()} onClick={uploadResult}>Upload Result</button>
        </div>
      </section>
    </AppShell>
  );
}
