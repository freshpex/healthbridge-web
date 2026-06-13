import { useEffect, useState } from "react";
import { Building2, FilePlus2, UserPlus, UsersRound } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { MedicalRecord, PatientProfile, User } from "../../types/domain";
import { useAuth } from "../auth/hooks/use-auth";

export function HospitalDashboard() {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState<"doctor" | "hospital_admin">("doctor");
  const [specialty, setSpecialty] = useState("General medicine");
  const [department, setDepartment] = useState("Clinical");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const loadDashboard = async () => {
      if (!token || !user?.hospitalId) return;
      setLoading(true);
      setError("");
      try {
        const [nextPatients, nextStaff] = await Promise.all([
          healthbridgeService.getHospitalPatients(user.hospitalId, token),
          healthbridgeService.getHospitalStaff(token, user.hospitalId)
        ]);
        if (!alive) return;
        setPatients(nextPatients);
        setStaff(nextStaff);
        const firstPatientId = selectedPatientId || nextPatients[0]?.id || "";
        setSelectedPatientId(firstPatientId);
        setRecords(firstPatientId ? await healthbridgeService.getRecords(token, firstPatientId) : []);
      } catch (caught) {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load hospital dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void loadDashboard();
    return () => { alive = false; };
  }, [selectedPatientId, token, user?.hospitalId]);

  useEffect(() => {
    let alive = true;
    if (!token || !selectedPatientId) return;
    healthbridgeService.getRecords(token, selectedPatientId)
      .then((nextRecords) => { if (alive) setRecords(nextRecords); })
      .catch((caught) => { if (alive) setError(caught instanceof Error ? caught.message : "Could not load selected patient records"); });
    return () => { alive = false; };
  }, [selectedPatientId, token]);

  const create = async () => {
    if (!token || !selectedPatientId || !title.trim() || !summary.trim()) return;
    setError("");
    try {
      const record = await healthbridgeService.createRecord(token, { patientId: selectedPatientId, hospitalId: user?.hospitalId, type: "emergency", title, summary, critical: true });
      setRecords((current) => [record, ...current]);
      setTitle("");
      setSummary("");
      setStatus("Clinical record uploaded and audit log recorded.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create record");
    }
  };

  const createPersonnel = async () => {
    if (!token || !user?.hospitalId) return;
    setError("");
    setStatus("");
    try {
      const member = await healthbridgeService.createHospitalPersonnel(token, user.hospitalId, {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole,
        specialty: staffRole === "doctor" ? specialty : undefined,
        department: staffRole === "doctor" ? department : undefined,
        licenseNumber: staffRole === "doctor" ? licenseNumber : undefined
      });
      setStaff((current) => [member, ...current]);
      setStaffName(""); setStaffEmail(""); setStaffPassword(""); setLicenseNumber("");
      setStatus("Personnel account created securely.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create personnel account");
    }
  };

  const deactivate = async (member: User) => {
    if (!token || !user?.hospitalId) return;
    const id = member.id ?? member._id;
    if (!id) return;
    try {
      const updated = await healthbridgeService.updateHospitalPersonnel(token, user.hospitalId, id, { isActive: false });
      setStaff((current) => current.map((item) => (item.id ?? item._id) === id ? { ...item, ...updated } : item));
      setStatus("Personnel account deactivated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update personnel account");
    }
  };

  if (loading) return <AppShell title="Hospital admin dashboard" subtitle="Loading hospital data."><div className="loading-state">Loading connected patients and staff...</div></AppShell>;

  return (
    <AppShell title="Hospital admin dashboard" subtitle="Manage staff, connected patients, record uploads, verification, and sync requests.">
      {error && <div className="error-state">{error}</div>}
      {status && <div className="success-state">{status}</div>}
      <div className="metric-grid">
        <MetricCard label="Hospital status" value="approved" icon={<Building2 />} />
        <MetricCard label="Connected patients" value={String(patients.length)} tone="teal" icon={<UsersRound />} />
        <MetricCard label="Personnel" value={String(staff.length)} tone="green" icon={<UserPlus />} />
        <MetricCard label="Visible records" value={String(records.length)} tone="green" icon={<FilePlus2 />} />
      </div>
      <section className="panel-grid">
        <article className="panel">
          <h2>Connected patients</h2>
          {patients.length === 0 ? <div className="empty-state">No connected patients yet.</div> : <DataTable headers={["Patient", "Blood", "Allergies"]} rows={patients.map((patient) => [patient.fullName, patient.bloodGroup, patient.allergies.join(", ") || "None"])} />}
        </article>
        <article className="panel">
          <h2>Add clinical record</h2>
          <form className="form-stack">
            <label>Patient<select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}</select></label>
            <label>Record title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g., Emergency assessment" /></label>
            <label>Summary<textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Clinical summary" /></label>
            <button className="secondary-button" type="button" onClick={create}>Upload record</button>
          </form>
        </article>
      </section>
      <section className="panel-grid">
        <article className="panel">
          <h2>Create personnel</h2>
          <form className="form-stack">
            <label>Role<select value={staffRole} onChange={(event) => setStaffRole(event.target.value as typeof staffRole)}><option value="doctor">Doctor</option><option value="hospital_admin">Hospital admin</option></select></label>
            <label>Name<input value={staffName} onChange={(event) => setStaffName(event.target.value)} /></label>
            <label>Email<input value={staffEmail} onChange={(event) => setStaffEmail(event.target.value)} type="email" /></label>
            <label>Temporary password<input value={staffPassword} onChange={(event) => setStaffPassword(event.target.value)} type="password" /></label>
            {staffRole === "doctor" ? <><label>Specialty<input value={specialty} onChange={(event) => setSpecialty(event.target.value)} /></label><label>Department<input value={department} onChange={(event) => setDepartment(event.target.value)} /></label><label>License number<input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} /></label></> : null}
            <button className="primary-button" type="button" onClick={createPersonnel}>Create personnel</button>
          </form>
        </article>
        <article className="panel">
          <h2>Personnel</h2>
          {staff.length === 0 ? <div className="empty-state">No personnel accounts are linked yet.</div> : <DataTable headers={["Name", "Role", "Email", "Status", "Action"]} rows={staff.map((member) => [member.name, member.role, member.email, member.isActive === false ? "Inactive" : "Active", member.isActive === false ? "—" : <button className="ghost-button" type="button" onClick={() => void deactivate(member)}>Deactivate</button>])} />}
        </article>
      </section>
      <section className="panel">
        <h2>Selected patient records</h2>
        {records.length === 0 ? <div className="empty-state">Select a patient with synced records.</div> : <DataTable headers={["Date", "Title", "Type", "Critical"]} rows={records.map((record) => [record.date ? new Date(record.date).toLocaleDateString() : "Not set", record.title, record.type, record.critical ? "Yes" : "No"])} />}
      </section>
    </AppShell>
  );
}
