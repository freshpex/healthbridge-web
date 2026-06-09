import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatContact, formatDate } from "./patient-format";

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export function PatientProfilePage() {
  const { token, dashboard, loading, error, setError, refresh } = usePatientDashboard();
  const [bloodGroup, setBloodGroup] = useState<string>();
  const [allergies, setAllergies] = useState<string>();
  const [conditions, setConditions] = useState<string>();
  const [medications, setMedications] = useState<string>();
  const [contactName, setContactName] = useState<string>();
  const [contactRelationship, setContactRelationship] = useState<string>();
  const [contactPhone, setContactPhone] = useState<string>();
  const [syncHospitalId, setSyncHospitalId] = useState<string>();
  const [file, setFile] = useState<File>();
  const [status, setStatus] = useState("");

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    try {
      await healthbridgeService.updateProfile(token, {
        bloodGroup: bloodGroup ?? dashboard?.profile.bloodGroup,
        allergies: splitList(allergies ?? dashboard?.profile.allergies.join(", ") ?? ""),
        chronicConditions: splitList(conditions ?? dashboard?.profile.chronicConditions.join(", ") ?? ""),
        currentMedications: splitList(medications ?? dashboard?.profile.currentMedications.join(", ") ?? ""),
        emergencyContact: {
          name: contactName ?? (typeof dashboard?.profile.emergencyContact === "object" ? dashboard.profile.emergencyContact?.name : ""),
          relationship: contactRelationship ?? (typeof dashboard?.profile.emergencyContact === "object" ? dashboard.profile.emergencyContact?.relationship : ""),
          phone: contactPhone ?? (typeof dashboard?.profile.emergencyContact === "object" ? dashboard.profile.emergencyContact?.phone : "")
        }
      });
      setStatus("Profile updated.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update profile");
    }
  };

  const requestSync = async () => {
    const hospitalId = syncHospitalId ?? dashboard?.profile.connectedHospitalIds[0];
    if (!token || !hospitalId) return;
    try {
      await healthbridgeService.requestSync(token, { hospitalId, notes: "Patient requested record sync from profile settings." });
      setStatus("Record sync request sent to hospital.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not request sync");
    }
  };

  const upload = async () => {
    if (!token || !file) return;
    try {
      await healthbridgeService.uploadDocument(token, { file, category: "personal_document" });
      setFile(undefined);
      setStatus("Document uploaded.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload document");
    }
  };

  const enableEmergency = async () => {
    if (!token) return;
    try {
      const result = await healthbridgeService.enableEmergency(token);
      setStatus(`Emergency code generated: ${result.code}`);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate emergency code");
    }
  };

  return (
    <AppShell title="Profile and settings" subtitle="Maintain your medical profile, sync requests, uploads, and emergency access.">
      {loading ? <div className="loading-state">Loading profile...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {status ? <div className="success-state">{status}</div> : null}
      {dashboard ? (
        <>
          <section className="panel-grid">
            <article className="panel">
              <h2>Medical profile</h2>
              <form className="form-stack" onSubmit={saveProfile}>
                <label>Blood group<input value={bloodGroup ?? dashboard.profile.bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} /></label>
                <label>Allergies<input value={allergies ?? dashboard.profile.allergies.join(", ")} onChange={(event) => setAllergies(event.target.value)} /></label>
                <label>Chronic conditions<input value={conditions ?? dashboard.profile.chronicConditions.join(", ")} onChange={(event) => setConditions(event.target.value)} /></label>
                <label>Current medications<input value={medications ?? dashboard.profile.currentMedications.join(", ")} onChange={(event) => setMedications(event.target.value)} /></label>
                <div className="form-grid">
                  <label>Emergency contact<input value={contactName ?? (typeof dashboard.profile.emergencyContact === "object" ? dashboard.profile.emergencyContact?.name ?? "" : "")} onChange={(event) => setContactName(event.target.value)} /></label>
                  <label>Relationship<input value={contactRelationship ?? (typeof dashboard.profile.emergencyContact === "object" ? dashboard.profile.emergencyContact?.relationship ?? "" : "")} onChange={(event) => setContactRelationship(event.target.value)} /></label>
                  <label>Phone<input value={contactPhone ?? (typeof dashboard.profile.emergencyContact === "object" ? dashboard.profile.emergencyContact?.phone ?? "" : "")} onChange={(event) => setContactPhone(event.target.value)} /></label>
                </div>
                <button className="primary-button" type="submit">Save profile</button>
              </form>
            </article>
            <article className="panel">
              <h2>Emergency and sync</h2>
              <p><strong>Emergency code:</strong> {dashboard.profile.emergencyCode ?? "Not enabled"}</p>
              <p><strong>Emergency contact:</strong> {formatContact(dashboard.profile.emergencyContact) || "Not set"}</p>
              <button className="secondary-button" type="button" onClick={enableEmergency}>Generate emergency code</button>
              <div className="form-stack inline-section">
                <label>Request record sync<select value={syncHospitalId ?? dashboard.profile.connectedHospitalIds[0] ?? ""} onChange={(event) => setSyncHospitalId(event.target.value)}>{dashboard.profile.hospitalIds?.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}</select></label>
                <button className="secondary-button" type="button" onClick={requestSync}>Request sync</button>
              </div>
            </article>
          </section>
          <section className="panel">
            <h2><UploadCloud size={20} /> Personal medical documents</h2>
            <div className="upload-row">
              <input type="file" onChange={(event) => setFile(event.target.files?.[0])} />
              <button className="primary-button" type="button" onClick={upload} disabled={!file}>Upload document</button>
            </div>
            {dashboard.uploads.length === 0 ? <div className="empty-state">No personal documents uploaded yet.</div> : <DataTable headers={["Uploaded", "File", "Category", "Provider"]} rows={dashboard.uploads.map((item) => [formatDate(item.createdAt), item.fileName, item.category, item.provider])} />}
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
