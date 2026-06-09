import { useEffect, useState } from "react";
import { ClipboardPlus, Pill, Stethoscope } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { MedicalRecord, PatientProfile, Prescription } from "../../types/domain";
import { useAuth } from "../auth/hooks/use-auth";

export function DoctorDashboard() {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [medication, setMedication] = useState("Albuterol");
  const [dosage, setDosage] = useState("90 mcg");
  const [frequency, setFrequency] = useState("2 puffs as needed");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!token || !user?.hospitalId) return;
      try {
        const nextPatients = await healthbridgeService.getHospitalPatients(user.hospitalId, token);
        if (!alive) return;
        setPatients(nextPatients);
        setSelectedPatientId(nextPatients[0]?.id ?? "");
      } catch (caught) {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load doctor portal");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [token, user?.hospitalId]);

  useEffect(() => {
    let alive = true;
    const loadClinicalData = async () => {
      if (!token || !selectedPatientId) return;
      const [nextRecords, nextPrescriptions] = await Promise.all([
        healthbridgeService.getRecords(token, selectedPatientId),
        healthbridgeService.getPrescriptions(token, selectedPatientId)
      ]);
      if (!alive) return;
      setRecords(nextRecords);
      setPrescriptions(nextPrescriptions);
    };
    loadClinicalData().catch((caught) => {
      if (alive) setError(caught instanceof Error ? caught.message : "Could not load patient records");
    });
    return () => {
      alive = false;
    };
  }, [selectedPatientId, token]);

  const addDiagnosis = async () => {
    if (!token || !selectedPatientId) return;
    try {
      const record = await healthbridgeService.createRecord(token, {
        patientId: selectedPatientId,
        type: "diagnosis",
        title: "Clinical diagnosis note",
        summary: "Doctor-authored continuity note added from HealthBridge web portal.",
        critical: false
      });
      setRecords((current) => [record, ...current]);
      setStatus("Diagnosis note added.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add diagnosis note");
    }
  };

  const addPrescription = async () => {
    if (!token || !selectedPatientId) return;
    try {
      const prescription = await healthbridgeService.createPrescription(token, { patientId: selectedPatientId, medication, dosage, frequency, active: true });
      setPrescriptions((current) => [prescription, ...current]);
      setStatus("Prescription created and visible to patient.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create prescription");
    }
  };

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);

  if (loading) return <AppShell title="Doctor portal" subtitle="Loading clinical workspace."><div className="loading-state">Loading patient panel...</div></AppShell>;

  return (
    <AppShell title="Doctor portal" subtitle="Review connected patients, add diagnoses, lab notes, prescriptions, and emergency documentation.">
      {error && <div className="error-state">{error}</div>}
      {status && <div className="success-state">{status}</div>}
      <div className="metric-grid">
        <MetricCard label="Patient panel" value={`${patients.length} connected`} icon={<Stethoscope />} />
        <MetricCard label="Critical flags" value={String(records.filter((record) => record.critical).length)} tone="amber" icon={<ClipboardPlus />} />
        <MetricCard label="Active prescriptions" value={String(prescriptions.filter((rx) => rx.active).length)} tone="green" icon={<Pill />} />
      </div>
      <section className="panel-grid">
        <article className="panel">
          <h2>Patient summary</h2>
          <label className="form-stack">Patient<select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}</select></label>
          {selectedPatient ? <p>{selectedPatient.fullName}: {selectedPatient.chronicConditions.join(", ") || "No chronic conditions"}. Allergies: {selectedPatient.allergies.join(", ") || "None"}.</p> : <div className="empty-state">No patient selected.</div>}
          <button className="primary-button" onClick={addDiagnosis}>Add diagnosis note</button>
        </article>
        <article className="panel">
          <h2>Prescription</h2>
          <form className="form-stack">
            <label>Medication<input value={medication} onChange={(event) => setMedication(event.target.value)} /></label>
            <label>Dosage<input value={dosage} onChange={(event) => setDosage(event.target.value)} /></label>
            <label>Frequency<input value={frequency} onChange={(event) => setFrequency(event.target.value)} /></label>
            <button className="secondary-button" type="button" onClick={addPrescription}>Create prescription</button>
          </form>
        </article>
      </section>
      <section className="panel">
        <h2>Patient records</h2>
        {records.length === 0 ? <div className="empty-state">No records are available for this patient.</div> : (
          <DataTable headers={["Date", "Title", "Summary"]} rows={records.map((record) => [record.date ? new Date(record.date).toLocaleDateString() : "Not set", record.title, record.summary])} />
        )}
      </section>
    </AppShell>
  );
}
