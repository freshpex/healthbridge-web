import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { useAuth } from "../auth/hooks/use-auth";
import { FlaskConical, Upload, Clock, CheckCircle } from "lucide-react";

export function LabDashboard() {
  useAuth();

  return (
    <AppShell
      title="Laboratory Dashboard"
      subtitle="Upload test results, manage patient samples, and track analyses."
    >
      <div className="metric-grid">
        <MetricCard
          label="Test Results Uploaded"
          value="0"
          icon={<CheckCircle />}
          tone="green"
        />
        <MetricCard
          label="Pending Uploads"
          value="0"
          icon={<Clock />}
          tone="amber"
        />
      </div>

      <section className="dashboard-section">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <h2 style={{ margin: 0 }}>Upload Test Results</h2>
          <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Upload size={18} />
            New Upload
          </button>
        </div>

        <div className="empty-state" style={{ textAlign: "center", padding: "60px 20px" }}>
          <FlaskConical size={48} color="#CCC" style={{ marginBottom: "16px" }} />
          <h3>No test results uploaded yet</h3>
          <p>Upload patient test results to get started</p>
        </div>
      </section>

      <section className="dashboard-section" style={{ marginTop: "40px" }}>
        <h2>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <button className="secondary-button" style={{ padding: "24px", textAlign: "center" }}>
            <Upload size={24} style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
            Upload Results
          </button>
          <button className="secondary-button" style={{ padding: "24px", textAlign: "center" }}>
            <FlaskConical size={24} style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
            Manage Tests
          </button>
          <button className="secondary-button" style={{ padding: "24px", textAlign: "center" }}>
            <CheckCircle size={24} style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
            View History
          </button>
        </div>
      </section>
    </AppShell>
  );
}
