import { useMemo, useState } from "react";
import { FlaskConical, Search } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatDate } from "./patient-format";
import type { LabResult } from "../../types/domain";

const statuses: Array<"all" | LabResult["status"]> = ["all", "normal", "abnormal", "critical"];

export function PatientLabsPage() {
  const { dashboard, loading, error } = usePatientDashboard();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredLabs = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (dashboard?.labResults ?? []).filter((lab) => {
      const collected = lab.collectedAt ? new Date(lab.collectedAt).getTime() : 0;
      const from = dateFrom ? new Date(dateFrom).getTime() : undefined;
      const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : undefined;
      return (!search || [lab.testName, lab.result, lab.referenceRange, lab.status].filter(Boolean).some((value) => String(value).toLowerCase().includes(search)))
        && (status === "all" || lab.status === status)
        && (!from || collected >= from)
        && (!to || collected <= to);
    });
  }, [dashboard?.labResults, dateFrom, dateTo, query, status]);

  return (
    <AppShell title="Lab results" subtitle="Review synced laboratory results from authorized care partners.">
      {loading ? <div className="loading-state">Loading lab results...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {dashboard ? (
        <section className="panel form-stack">
          <div className="panel-title-row">
            <h2>Filters</h2>
            <span className="tag">{filteredLabs.length} shown</span>
          </div>
          <div className="form-grid">
            <label><Search size={14} /> Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Test, result, reference range..." /></label>
            <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>{statuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : item}</option>)}</select></label>
            <label>From<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
            <label>To<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
          </div>
        </section>
      ) : null}
      {dashboard && dashboard.labResults.length === 0 ? <div className="empty-state"><FlaskConical size={18} /> No lab results are available yet.</div> : null}
      {dashboard && dashboard.labResults.length > 0 && filteredLabs.length === 0 ? <div className="empty-state"><FlaskConical size={18} /> No lab results match these filters.</div> : null}
      {filteredLabs.length > 0 ? (
        <section className="panel">
          <DataTable headers={["Collected", "Test", "Result", "Reference", "Status"]} rows={filteredLabs.map((lab) => [formatDate(lab.collectedAt), lab.testName, lab.result, lab.referenceRange ?? "Not listed", <span className={`tag ${lab.status === "critical" ? "amber" : lab.status === "normal" ? "green" : ""}`}>{lab.status}</span>])} />
        </section>
      ) : null}
    </AppShell>
  );
}
