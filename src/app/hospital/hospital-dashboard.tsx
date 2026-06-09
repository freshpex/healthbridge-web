import { useEffect, useState } from "react";
import { Building2, FilePlus2, UsersRound } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { MedicalRecord, PatientProfile } from "../../types/domain";
import { useAuth } from "../auth/hooks/use-auth";

export function HospitalDashboard() {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [title, setTitle] = useState("Emergency note");
  const [summary, setSummary] = useState("Patient stabilized. Critical allergy profile reviewed.");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!token || !user?.hospitalId) return;
      setLoading(true);
      try {
        const nextPatients = await healthbridgeService.getHospitalPatients(user.hospitalId, token);
        if (!alive) return;
        setPatients(nextPatients);
        const firstPatientId = nextPatients[0]?.id ?? "";
        setSelectedPatientId(firstPatientId);
        if (firstPatientId) setRecords(await healthbridgeService.getRecords(token, firstPatientId));
      } catch (caught) {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load hospital dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [token, user?.hospitalId]);

  const create = async () => {
    if (!token || !selectedPatientId) return;
    setError("");
    try {
      const record = await healthbridgeService.createRecord(token, {
        patientId: selectedPatientId,
        hospitalId: user?.hospitalId,
        type: "emergency",
        title,
        summary,
        critical: true
      });
      setRecords((current) => [record, ...current]);
      setStatus("Clinical record uploaded and audit log recorded.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create record");
    }
  };

  if (loading) return <AppShell title="Hospital admin dashboard" subtitle="Loading hospital data."><div className="loading-state">Loading connected patients...</div></AppShell>;

  return (
    <AppShell title="Hospital admin dashboard" subtitle="Manage staff, connected patients, record uploads, verification, and sync requests.">
      {error && <div className="error-state">{error}</div>}
      {status && <div className="success-state">{status}</div>}
      <div className="metric-grid">
        <MetricCard label="Hospital status" value="approved" icon={<Building2 />} />
        <MetricCard label="Connected patients" value={String(patients.length)} tone="teal" icon={<UsersRound />} />
        <MetricCard label="Visible records" value={String(records.length)} tone="green" icon={<FilePlus2 />} />
      </div>
      <section className="panel-grid">
        <article className="panel">
          <h2>Connected patients</h2>
          {patients.length === 0 ? <div className="empty-state">No connected patients yet.</div> : (
            <DataTable headers={["Patient", "Blood", "Allergies"]} rows={patients.map((patient) => [patient.fullName, patient.bloodGroup, patient.allergies.join(", ") || "None"])} />
          )}
        </article>
        <article className="panel">
          <h2>Add clinical record</h2>
          <form className="form-stack">
            <label>Patient<select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}</select></label>
            <label>Record title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label>Summary<textarea value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
            <button className="secondary-button" type="button" onClick={create}>Upload record</button>
          </form>
        </article>
      </section>
      <section className="panel">
        <h2>Selected patient records</h2>
        {records.length === 0 ? <div className="empty-state">Select a patient with synced records.</div> : (
          <DataTable headers={["Date", "Title", "Type", "Critical"]} rows={records.map((record) => [record.date ? new Date(record.date).toLocaleDateString() : "Not set", record.title, record.type, record.critical ? "Yes" : "No"])} />
        )}
      </section>
    </AppShell>
  );
}
