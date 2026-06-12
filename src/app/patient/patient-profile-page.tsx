import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import { usePatientDashboard } from "./hooks/use-patient-dashboard";
import { formatContact, formatDate } from "./patient-format";

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function PatientProfilePage() {
  const { token, dashboard, loading, error, setError, refresh } =
    usePatientDashboard();
  const [fullName, setFullName] = useState<string>();
  const [dateOfBirth, setDateOfBirth] = useState<string>();
  const [gender, setGender] = useState<string>();
  const [address, setAddress] = useState<string>();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
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
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    try {
      await healthbridgeService.updateProfile(token, {
        fullName: fullName ?? dashboard?.profile.fullName,
        dateOfBirth: dateOfBirth ?? dashboard?.profile.dateOfBirth,
        gender: gender ?? dashboard?.profile.gender,
        address: address ?? dashboard?.profile.address,
        avatarUrl,
        notificationPreferences: {
          email: emailNotifications,
          sms: smsNotifications,
          push: pushNotifications,
          appointments: true,
          labResults: true,
          emergencyAlerts: true,
        },
        bloodGroup: bloodGroup ?? dashboard?.profile.bloodGroup,
        allergies: splitList(
          allergies ?? dashboard?.profile.allergies.join(", ") ?? "",
        ),
        chronicConditions: splitList(
          conditions ?? dashboard?.profile.chronicConditions.join(", ") ?? "",
        ),
        currentMedications: splitList(
          medications ?? dashboard?.profile.currentMedications.join(", ") ?? "",
        ),
        emergencyContact: {
          name:
            contactName ??
            (typeof dashboard?.profile.emergencyContact === "object"
              ? dashboard.profile.emergencyContact?.name
              : ""),
          relationship:
            contactRelationship ??
            (typeof dashboard?.profile.emergencyContact === "object"
              ? dashboard.profile.emergencyContact?.relationship
              : ""),
          phone:
            contactPhone ??
            (typeof dashboard?.profile.emergencyContact === "object"
              ? dashboard.profile.emergencyContact?.phone
              : ""),
        },
      });
      setStatus("Profile updated.");
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not update profile",
      );
    }
  };

  const requestSync = async () => {
    const hospitalId =
      syncHospitalId ?? dashboard?.profile.connectedHospitalIds[0];
    if (!token || !hospitalId) return;
    try {
      await healthbridgeService.requestSync(token, {
        hospitalId,
        notes: "Patient requested record sync from profile settings.",
      });
      setStatus("Record sync request sent to hospital.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not request sync",
      );
    }
  };

  const upload = async () => {
    if (!token || !file) return;
    try {
      await healthbridgeService.uploadDocument(token, {
        file,
        category: "personal_document",
      });
      setFile(undefined);
      setStatus("Document uploaded.");
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not upload document",
      );
    }
  };

  const enableEmergency = async () => {
    if (!token) return;
    try {
      const result = await healthbridgeService.enableEmergency(token);
      setStatus(`Emergency code generated: ${result.code}`);
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not generate emergency code",
      );
    }
  };

  useEffect(() => {
    let alive = true;
    if (!token) return;
    healthbridgeService
      .getEmergencyQRCode(token)
      .then((result) => {
        if (alive) setQrCodeUrl(result.qrCodeUrl);
      })
      .catch(() => {
        if (alive) setQrCodeUrl("");
      });
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <AppShell
      title="Profile and settings"
      subtitle="Maintain your medical profile, sync requests, uploads, and emergency access."
    >
      {loading ? <div className="loading-state">Loading profile...</div> : null}
      {error ? <div className="error-state">{error}</div> : null}
      {status ? <div className="success-state">{status}</div> : null}
      {dashboard ? (
        <>
          <section className="panel-grid">
            <article className="panel">
              <h2>Medical profile</h2>
              <form className="form-stack" onSubmit={saveProfile}>
                <div className="form-grid">
                  <label>
                    Full name
                    <input
                      value={fullName ?? dashboard.profile.fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </label>
                  <label>
                    Date of birth
                    <input
                      type="date"
                      value={(
                        dateOfBirth ??
                        dashboard.profile.dateOfBirth ??
                        ""
                      ).slice(0, 10)}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                    />
                  </label>
                  <label>
                    Gender
                    <input
                      value={gender ?? dashboard.profile.gender ?? ""}
                      onChange={(event) => setGender(event.target.value)}
                    />
                  </label>
                  <label>
                    Blood group
                    <input
                      value={bloodGroup ?? dashboard.profile.bloodGroup}
                      onChange={(event) => setBloodGroup(event.target.value)}
                    />
                  </label>
                </div>
                <label>
                  Address
                  <input
                    value={address ?? dashboard.profile.address ?? ""}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </label>
                <label>
                  Avatar URL
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl ?? ""}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                  />
                </label>
                <div className="form-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(event) =>
                        setEmailNotifications(event.target.checked)
                      }
                    />{" "}
                    Email notifications
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(event) =>
                        setSmsNotifications(event.target.checked)
                      }
                    />{" "}
                    SMS notifications
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(event) =>
                        setPushNotifications(event.target.checked)
                      }
                    />{" "}
                    Push notifications
                  </label>
                </div>
                <label>
                  Allergies
                  <input
                    value={allergies ?? dashboard.profile.allergies.join(", ")}
                    onChange={(event) => setAllergies(event.target.value)}
                  />
                </label>
                <label>
                  Chronic conditions
                  <input
                    value={
                      conditions ??
                      dashboard.profile.chronicConditions.join(", ")
                    }
                    onChange={(event) => setConditions(event.target.value)}
                  />
                </label>
                <label>
                  Current medications
                  <input
                    value={
                      medications ??
                      dashboard.profile.currentMedications.join(", ")
                    }
                    onChange={(event) => setMedications(event.target.value)}
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Emergency contact
                    <input
                      value={
                        contactName ??
                        (typeof dashboard.profile.emergencyContact === "object"
                          ? (dashboard.profile.emergencyContact?.name ?? "")
                          : "")
                      }
                      onChange={(event) => setContactName(event.target.value)}
                    />
                  </label>
                  <label>
                    Relationship
                    <input
                      value={
                        contactRelationship ??
                        (typeof dashboard.profile.emergencyContact === "object"
                          ? (dashboard.profile.emergencyContact?.relationship ??
                            "")
                          : "")
                      }
                      onChange={(event) =>
                        setContactRelationship(event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      value={
                        contactPhone ??
                        (typeof dashboard.profile.emergencyContact === "object"
                          ? (dashboard.profile.emergencyContact?.phone ?? "")
                          : "")
                      }
                      onChange={(event) => setContactPhone(event.target.value)}
                    />
                  </label>
                </div>
                <button className="primary-button" type="submit">
                  Save profile
                </button>
              </form>
            </article>
            <article className="panel">
              <h2>Emergency and sync</h2>
              <p>
                <strong>Emergency code:</strong>{" "}
                {dashboard.profile.emergencyCode ?? "Not enabled"}
              </p>
              <p>
                <strong>Emergency contact:</strong>{" "}
                {formatContact(dashboard.profile.emergencyContact) || "Not set"}
              </p>
              {qrCodeUrl ? (
                <div
                  className="qr-card"
                  style={{ minHeight: "auto", margin: "16px 0" }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="Emergency QR code"
                    className="qr-image"
                  />
                </div>
              ) : null}
              <button
                className="secondary-button"
                type="button"
                onClick={enableEmergency}
              >
                Generate emergency code
              </button>
              <div className="form-stack inline-section">
                <label>
                  Request record sync
                  <select
                    value={
                      syncHospitalId ??
                      dashboard.profile.connectedHospitalIds[0] ??
                      ""
                    }
                    onChange={(event) => setSyncHospitalId(event.target.value)}
                  >
                    {dashboard.profile.hospitalIds?.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={requestSync}
                >
                  Request sync
                </button>
              </div>
            </article>
          </section>
          <section className="panel">
            <h2>
              <UploadCloud size={20} /> Personal medical documents
            </h2>
            <div className="upload-row">
              <input
                type="file"
                onChange={(event) => setFile(event.target.files?.[0])}
              />
              <button
                className="primary-button"
                type="button"
                onClick={upload}
                disabled={!file}
              >
                Upload document
              </button>
            </div>
            {dashboard.uploads.length === 0 ? (
              <div className="empty-state">
                No personal documents uploaded yet.
              </div>
            ) : (
              <DataTable
                headers={["Uploaded", "File", "Category", "Provider"]}
                rows={dashboard.uploads.map((item) => [
                  formatDate(item.createdAt),
                  item.fileName,
                  item.category,
                  item.provider,
                ])}
              />
            )}
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
