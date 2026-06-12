import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Ambulance, Building2, CalendarDays, CheckCircle2, ClipboardList, FlaskConical, ShieldCheck, UsersRound } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { MetricCard } from "../../components/cards/metric-card";
import { DataTable } from "../../components/tables/data-table";
import { healthbridgeService } from "../../services/healthbridge-service";
import type { Appointment, Hospital, LabResult, Laboratory, MedicalRecord, PatientProfile, User, WorkspacePayload } from "../../types/domain";
import { useAuth } from "../auth/hooks/use-auth";

type WorkspaceMode = "appointments" | "laboratory-requests" | "laboratory-results" | "emergency-requests" | "emergency-cases" | "operations" | "patients" | "staff" | "users" | "hospitals" | "profile" | "messages" | "notifications";
type EmergencyResult = Awaited<ReturnType<typeof healthbridgeService.resolveEmergency>>;
type OperationalDashboard = Awaited<ReturnType<typeof healthbridgeService.getOperationalDashboard>>;

const modeCopy: Record<WorkspaceMode, { title: string; subtitle: string }> = {
  appointments: {
    title: "Appointment workspace",
    subtitle: "Schedule and review appointment activity for connected patients."
  },
  "laboratory-requests": {
    title: "Laboratory test requests",
    subtitle: "Review connected patient requests and send test results to the laboratory backend."
  },
  "laboratory-results": {
    title: "Laboratory results",
    subtitle: "Upload and review patient laboratory results."
  },
  "emergency-requests": {
    title: "Emergency requests",
    subtitle: "Resolve patient emergency access requests with a code and reason."
  },
  "emergency-cases": {
    title: "Emergency cases",
    subtitle: "Review resolved emergency cases and critical records returned by the backend."
  },
  operations: {
    title: "Operations dashboard",
    subtitle: "Manage hospitals, laboratories, staff, patients, and approvals with operational data."
  },
  patients: {
    title: "Patient workspace",
    subtitle: "Review patients in your authorized workspace scope."
  },
  staff: {
    title: "Staff workspace",
    subtitle: "Review staff and clinicians in your authorized workspace scope."
  },
  users: {
    title: "User workspace",
    subtitle: "Review users available to your administrative role."
  },
  hospitals: {
    title: "Hospital workspace",
    subtitle: "Review hospitals available to your administrative role."
  },
  profile: {
    title: "Profile workspace",
    subtitle: "Review account and role profile details from the secured backend."
  },
  messages: {
    title: "Consultation messages",
    subtitle: "Review secure consultation messages in your authorized scope."
  },
  notifications: {
    title: "Notifications",
    subtitle: "Review role notifications in your authorized scope."
  }
};

const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : "Not set";
const displayError = (caught: unknown, fallback: string) => caught instanceof Error ? caught.message : fallback;
const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const joinList = (value?: string[]) => value?.join(", ") ?? "";

const buildProfileForm = (profile?: WorkspacePayload["profile"]): Record<string, string | boolean> => {
  const account = profile?.account;
  if (!profile || !account) return {};
  return {
    name: account.name ?? "",
    email: account.email ?? "",
    phone: account.phone ?? "",
    avatarUrl: account.avatarUrl ?? "",
    notifyEmail: account.notificationPreferences?.email ?? true,
    notifySms: account.notificationPreferences?.sms ?? false,
    notifyPush: account.notificationPreferences?.push ?? true,
    specialty: profile.doctorProfile?.specialty ?? "",
    licenseNumber: profile.doctorProfile?.licenseNumber ?? "",
    department: profile.doctorProfile?.department ?? profile.labProfile?.department ?? "",
    availability: profile.doctorProfile?.availabilityText ?? "",
    acceptingAppointments: profile.doctorProfile?.acceptingAppointments ?? true,
    hospitalAffiliation: profile.doctorProfile?.hospitalAffiliation ?? "",
    organizationName: profile.hospitalProfile?.name ?? account.emergencyProfile?.organizationName ?? "",
    address: profile.hospitalProfile?.address ?? "",
    city: profile.hospitalProfile?.city ?? "",
    state: profile.hospitalProfile?.state ?? "",
    contactEmail: profile.hospitalProfile?.contactEmail ?? "",
    specialties: joinList(profile.hospitalProfile?.specialties),
    labName: profile.labProfile?.labName ?? "",
    certificationNumber: profile.labProfile?.certificationNumber ?? account.emergencyProfile?.certificationNumber ?? "",
    testCapabilities: joinList(profile.labProfile?.testCapabilities),
    serviceArea: account.emergencyProfile?.serviceArea ?? "",
    dispatchContact: account.emergencyProfile?.dispatchContact ?? ""
  };
};

function PatientPicker({ patients, value, onChange }: { patients: PatientProfile[]; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      Patient
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select a patient</option>
        {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}
      </select>
    </label>
  );
}

function InlineButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button className="small-button" type="button" onClick={onClick} disabled={disabled}>{children}</button>;
}

export function RoleWorkspacePage({ mode }: { mode: WorkspaceMode }) {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [emergencyResult, setEmergencyResult] = useState<EmergencyResult>();
  const [operations, setOperations] = useState<OperationalDashboard>();
  const [workspace, setWorkspace] = useState<WorkspacePayload>();
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [appointmentReason, setAppointmentReason] = useState("Follow-up consultation");
  const [testName, setTestName] = useState("Complete blood count");
  const [testResult, setTestResult] = useState("Pending review");
  const [testStatus, setTestStatus] = useState<LabResult["status"]>("normal");
  const [emergencyCode, setEmergencyCode] = useState("");
  const [emergencyReason, setEmergencyReason] = useState("Emergency care request");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [profileForm, setProfileForm] = useState<Record<string, string | boolean>>({});

  const showAppointmentWorkspace = mode === "appointments";
  const showLaboratoryRequests = mode === "laboratory-requests";
  const showLaboratoryResults = mode === "laboratory-results";
  const showEmergencyRequests = mode === "emergency-requests";
  const showEmergencyCases = mode === "emergency-cases";
  const showOperations = mode === "operations";
  const showPatients = mode === "patients";
  const showStaff = mode === "staff";
  const showUsers = mode === "users";
  const showHospitals = mode === "hospitals";
  const showProfile = mode === "profile";
  const showMessages = mode === "messages";
  const showNotifications = mode === "notifications";
  const showWorkspacePayload = showPatients || showStaff || showUsers || showHospitals || showProfile || showMessages || showNotifications;

  const canUseHospitalScope = Boolean(token && user?.hospitalId);
  const selectedPatient = useMemo(() => patients.find((patient) => patient.id === selectedPatientId), [patients, selectedPatientId]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        if ((showAppointmentWorkspace || showLaboratoryRequests || showLaboratoryResults) && user?.hospitalId) {
          const nextPatients = await healthbridgeService.getHospitalPatients(user.hospitalId, token);
          if (!alive) return;
          setPatients(nextPatients);
          setSelectedPatientId((current) => current || nextPatients[0]?.id || "");
        }

        if (showOperations) {
          const nextOperations = await healthbridgeService.getOperationalDashboard(token, user?.hospitalId);
          if (!alive) return;
          setOperations(nextOperations);
          setPatients(nextOperations.hospitalPatients);
        }

        if (showWorkspacePayload) {
          const nextWorkspace = await healthbridgeService.getWorkspace(token);
          if (!alive) return;
          setWorkspace(nextWorkspace);
          setPatients(nextWorkspace.patients);
          setProfileForm(buildProfileForm(nextWorkspace.profile));
        }
      } catch (caught) {
        if (alive) setError(displayError(caught, "Could not load workspace data"));
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, [showAppointmentWorkspace, showLaboratoryRequests, showLaboratoryResults, showOperations, showWorkspacePayload, token, user?.hospitalId]);


  useEffect(() => {
    let alive = true;
    const loadPatientDomainRows = async () => {
      if (!token || !selectedPatientId) return;
      setError("");
      try {
        if (showAppointmentWorkspace) {
          const nextAppointments = await healthbridgeService.getAppointments(token, selectedPatientId);
          if (alive) setAppointments(nextAppointments);
        }
        if (showLaboratoryResults) {
          const nextResults = await healthbridgeService.getLabResults(token, selectedPatientId);
          if (alive) setLabResults(nextResults);
        }
      } catch (caught) {
        if (alive) setError(displayError(caught, "Could not load selected patient data"));
      }
    };

    void loadPatientDomainRows();
    return () => {
      alive = false;
    };
  }, [selectedPatientId, showAppointmentWorkspace, showLaboratoryResults, token]);

  const scheduleAppointment = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !selectedPatientId) return;
    setError("");
    setStatus("");
    setActionLoading(true);
    try {
      const appointment = await healthbridgeService.createAppointment(token, {
        patientId: selectedPatientId,
        hospitalId: user?.hospitalId,
        reason: appointmentReason,
        scheduledAt: new Date(scheduledAt).toISOString(),
        status: "scheduled"
      });
      setAppointments((current) => [appointment, ...current]);
      setStatus("Appointment scheduled with the appointments endpoint.");
    } catch (caught) {
      setError(displayError(caught, "Could not schedule appointment"));
    } finally {
      setActionLoading(false);
    }
  };

  const uploadLabResult = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!token || !selectedPatientId) return;
    setError("");
    setStatus("");
    setActionLoading(true);
    try {
      const result = await healthbridgeService.createLabResult(token, {
        patientId: selectedPatientId,
        hospitalId: user?.hospitalId,
        testName,
        result: testResult,
        status: testStatus,
        collectedAt: new Date().toISOString()
      });
      setLabResults((current) => [result, ...current]);
      setStatus("Laboratory result uploaded with the lab-results endpoint.");
    } catch (caught) {
      setError(displayError(caught, "Could not upload laboratory result"));
    } finally {
      setActionLoading(false);
    }
  };

  const resolveEmergency = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setError("");
    setStatus("");
    setActionLoading(true);
    try {
      const result = await healthbridgeService.resolveEmergency(token, emergencyCode.trim().toUpperCase(), emergencyReason);
      setEmergencyResult(result);
      setStatus("Emergency request resolved and audit log recorded.");
    } catch (caught) {
      setEmergencyResult(undefined);
      setError(displayError(caught, "Could not resolve emergency request"));
    } finally {
      setActionLoading(false);
    }
  };

  const approveHospital = async (hospital: Hospital) => {
    if (!token) return;
    setError("");
    setActionLoading(true);
    try {
      const approved = await healthbridgeService.approveHospital(token, hospital.id);
      setOperations((current) => current ? { ...current, hospitals: current.hospitals.map((item) => item.id === approved.id ? approved : item) } : current);
      setStatus(`${approved.name} approved.`);
    } catch (caught) {
      setError(displayError(caught, "Could not approve hospital"));
    } finally {
      setActionLoading(false);
    }
  };

  const approveLaboratory = async (laboratory: Laboratory) => {
    if (!token) return;
    setError("");
    setActionLoading(true);
    try {
      const approved = await healthbridgeService.approveLaboratory(token, laboratory.id);
      setOperations((current) => current ? { ...current, laboratories: current.laboratories.map((item) => item.id === approved.id ? approved : item) } : current);
      setStatus(`${approved.labName} approved.`);
    } catch (caught) {
      setError(displayError(caught, "Could not approve laboratory"));
    } finally {
      setActionLoading(false);
    }
  };

  const verifyPatient = async (patient: PatientProfile) => {
    if (!token || !user?.hospitalId) return;
    setError("");
    setActionLoading(true);
    try {
      await healthbridgeService.verifyPatientConnection(token, user.hospitalId, patient.id);
      setStatus(`${patient.fullName} verified for hospital access.`);
    } catch (caught) {
      setError(displayError(caught, "Could not verify patient connection"));
    } finally {
      setActionLoading(false);
    }
  };

  const updateProfileField = (key: string, value: string | boolean) => {
    setProfileForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !workspace?.profile.account) return;
    setError("");
    setStatus("");
    setActionLoading(true);
    const account = workspace.profile.account;
    const payload: Record<string, unknown> = {
      name: String(profileForm.name ?? ""),
      email: String(profileForm.email ?? ""),
      phone: String(profileForm.phone ?? ""),
      avatarUrl: String(profileForm.avatarUrl ?? ""),
      notificationPreferences: {
        email: Boolean(profileForm.notifyEmail),
        sms: Boolean(profileForm.notifySms),
        push: Boolean(profileForm.notifyPush),
        appointments: true,
        labResults: true,
        emergencyAlerts: true
      }
    };

    if (account.role === "doctor") {
      payload.doctorProfile = {
        specialty: profileForm.specialty,
        licenseNumber: profileForm.licenseNumber,
        department: profileForm.department,
        availability: profileForm.availability,
        acceptingAppointments: Boolean(profileForm.acceptingAppointments),
        hospitalAffiliation: profileForm.hospitalAffiliation
      };
    }
    if (account.role === "hospital_admin" || account.role === "super_admin") {
      payload.hospitalProfile = {
        name: profileForm.organizationName,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        contactEmail: profileForm.contactEmail,
        specialties: splitList(String(profileForm.specialties ?? ""))
      };
    }
    if (account.role === "laboratory") {
      payload.labProfile = {
        labName: profileForm.labName,
        department: profileForm.department,
        certificationNumber: profileForm.certificationNumber,
        testCapabilities: splitList(String(profileForm.testCapabilities ?? ""))
      };
    }
    if (account.role === "emergency_staff") {
      payload.emergencyProfile = {
        organizationName: profileForm.organizationName,
        serviceArea: profileForm.serviceArea,
        certificationNumber: profileForm.certificationNumber,
        dispatchContact: profileForm.dispatchContact
      };
    }

    try {
      await healthbridgeService.updateAccountProfile(token, payload);
      const nextWorkspace = await healthbridgeService.getWorkspace(token);
      setWorkspace(nextWorkspace);
      setProfileForm(buildProfileForm(nextWorkspace.profile));
      setStatus("Profile saved successfully.");
    } catch (caught) {
      setError(displayError(caught, "Could not save profile"));
    } finally {
      setActionLoading(false);
    }
  };

  const copy = modeCopy[mode];

  if (loading) {
    return <AppShell title={copy.title} subtitle={copy.subtitle}><div className="loading-state">Loading workspace...</div></AppShell>;
  }

  return (
    <AppShell title={copy.title} subtitle={copy.subtitle}>
      {error && <div className="error-state">{error}</div>}
      {status && <div className="success-state">{status}</div>}

      {showAppointmentWorkspace && (
        <>
          <div className="metric-grid">
            <MetricCard label="Connected patients" value={String(patients.length)} icon={<UsersRound />} />
            <MetricCard label="Appointments" value={String(appointments.length)} tone="green" icon={<CalendarDays />} />
          </div>
          <section className="panel-grid">
            <article className="panel">
              <h2>Schedule appointment</h2>
              {!canUseHospitalScope ? <div className="empty-state">A hospital connection is required to schedule appointments.</div> : (
                <form className="form-stack" onSubmit={scheduleAppointment}>
                  <PatientPicker patients={patients} value={selectedPatientId} onChange={setSelectedPatientId} />
                  <label>Reason<input value={appointmentReason} onChange={(event) => setAppointmentReason(event.target.value)} /></label>
                  <label>Scheduled time<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></label>
                  <button className="primary-button" type="submit" disabled={actionLoading || !selectedPatientId}><CalendarDays size={18} /> Schedule appointment</button>
                </form>
              )}
            </article>
            <article className="panel">
              <h2>Selected patient</h2>
              {selectedPatient ? <p>{selectedPatient.fullName} has {appointments.length} appointment rows loaded from the appointments endpoint.</p> : <div className="empty-state">Select a patient to load appointment rows.</div>}
            </article>
          </section>
          <section className="panel">
            <h2>Appointment rows</h2>
            {appointments.length === 0 ? <div className="empty-state">No appointments for this route.</div> : (
              <DataTable headers={["Reason", "Scheduled", "Status"]} rows={appointments.map((appointment) => [appointment.reason, formatDate(appointment.scheduledAt), appointment.status])} />
            )}
          </section>
        </>
      )}

      {showLaboratoryRequests && (
        <>
          <div className="metric-grid">
            <MetricCard label="Test requests" value={String(patients.length)} icon={<ClipboardList />} />
            <MetricCard label="Selected patient" value={selectedPatient?.fullName ?? "None"} tone="amber" icon={<FlaskConical />} />
          </div>
          <section className="panel-grid">
            <article className="panel">
              <h2>Laboratory test requests</h2>
              {patients.length === 0 ? <div className="empty-state">No connected patient test requests are available.</div> : (
                <DataTable headers={["Patient", "Blood", "Requested action"]} rows={patients.map((patient) => [patient.fullName, patient.bloodGroup, <InlineButton key={patient.id} onClick={() => setSelectedPatientId(patient.id)}>Prepare result</InlineButton>])} />
              )}
            </article>
            <article className="panel">
              <h2>Fulfill request</h2>
              <form className="form-stack" onSubmit={uploadLabResult}>
                <PatientPicker patients={patients} value={selectedPatientId} onChange={setSelectedPatientId} />
                <label>Test name<input value={testName} onChange={(event) => setTestName(event.target.value)} /></label>
                <label>Result<textarea value={testResult} onChange={(event) => setTestResult(event.target.value)} /></label>
                <button className="primary-button" type="submit" disabled={actionLoading || !selectedPatientId}><FlaskConical size={18} /> Upload result</button>
              </form>
            </article>
          </section>
        </>
      )}

      {showLaboratoryResults && (
        <>
          <div className="metric-grid">
            <MetricCard label="Loaded results" value={String(labResults.length)} icon={<CheckCircle2 />} tone="green" />
            <MetricCard label="Critical results" value={String(labResults.filter((result) => result.status === "critical").length)} tone="amber" icon={<FlaskConical />} />
          </div>
          <section className="panel-grid">
            <article className="panel">
              <h2>Upload lab result</h2>
              <form className="form-stack" onSubmit={uploadLabResult}>
                <PatientPicker patients={patients} value={selectedPatientId} onChange={setSelectedPatientId} />
                <label>Test name<input value={testName} onChange={(event) => setTestName(event.target.value)} /></label>
                <label>Result<textarea value={testResult} onChange={(event) => setTestResult(event.target.value)} /></label>
                <label>Status<select value={testStatus} onChange={(event) => setTestStatus(event.target.value as LabResult["status"])}><option value="normal">Normal</option><option value="abnormal">Abnormal</option><option value="critical">Critical</option></select></label>
                <button className="primary-button" type="submit" disabled={actionLoading || !selectedPatientId}><FlaskConical size={18} /> Upload result</button>
              </form>
            </article>
            <article className="panel">
              <h2>Results</h2>
              {labResults.length === 0 ? <div className="empty-state">Select a patient to load lab results.</div> : (
                <DataTable headers={["Test", "Result", "Status", "Collected"]} rows={labResults.map((result) => [result.testName, result.result, result.status, formatDate(result.collectedAt)])} />
              )}
            </article>
          </section>
        </>
      )}

      {showEmergencyRequests && (
        <section className="panel-grid">
          <article className="panel">
            <h2>Resolve emergency request</h2>
            <form className="form-stack" onSubmit={resolveEmergency}>
              <label>Emergency code<input value={emergencyCode} onChange={(event) => setEmergencyCode(event.target.value)} /></label>
              <label>Access reason<textarea value={emergencyReason} onChange={(event) => setEmergencyReason(event.target.value)} /></label>
              <button className="primary-button" type="submit" disabled={actionLoading}><Ambulance size={18} /> Resolve request</button>
            </form>
          </article>
          <EmergencyCasePanel result={emergencyResult} />
        </section>
      )}

      {showEmergencyCases && (
        <section className="panel-grid">
          <article className="panel">
            <h2>Load emergency case</h2>
            <form className="form-stack" onSubmit={resolveEmergency}>
              <label>Emergency code<input value={emergencyCode} onChange={(event) => setEmergencyCode(event.target.value)} /></label>
              <label>Case reason<textarea value={emergencyReason} onChange={(event) => setEmergencyReason(event.target.value)} /></label>
              <button className="primary-button" type="submit" disabled={actionLoading}><ShieldCheck size={18} /> Load case</button>
            </form>
          </article>
          <EmergencyCasePanel result={emergencyResult} />
        </section>
      )}



      {showPatients && (
        <article className="panel">
          <h2>Patients</h2>
          {(workspace?.patients.length ?? 0) === 0 ? <div className="empty-state">No patients in scope.</div> : (
            <DataTable headers={["Patient", "Blood", "Conditions"]} rows={(workspace?.patients ?? []).map((patient) => [patient.fullName, patient.bloodGroup, patient.chronicConditions.join(", ") || "None recorded"])} />
          )}
        </article>
      )}

      {(showStaff || showUsers) && (
        <article className="panel">
          <h2>{showStaff ? "Staff and doctors" : "Users"}</h2>
          {(showStaff ? (workspace?.staff.length ?? 0) + (workspace?.doctors.length ?? 0) : (workspace?.staff.length ?? 0)) === 0 ? <div className="empty-state">No users in scope.</div> : (
            <DataTable headers={["Name", "Email", "Role"]} rows={(showStaff ? [...(workspace?.staff ?? []), ...(workspace?.doctors ?? []).map((doctor) => ({ id: doctor._id ?? doctor.userId, name: doctor.specialty, email: doctor.licenseNumber, role: "doctor" as const }))] : (workspace?.staff ?? [])).map((member) => [member.name, member.email, member.role.replace("_", " ")])} />
          )}
        </article>
      )}

      {showHospitals && (
        <article className="panel">
          <h2>Hospitals</h2>
          {(workspace?.hospitals.length ?? 0) === 0 ? <div className="empty-state">No hospitals available.</div> : (
            <DataTable headers={["Hospital", "Location", "Status"]} rows={(workspace?.hospitals ?? []).map((hospital) => [hospital.name, `${hospital.city}, ${hospital.state}`, hospital.status])} />
          )}
        </article>
      )}

      {showMessages && (
        <article className="panel">
          <h2>Secure messages</h2>
          {(workspace?.messages.length ?? 0) === 0 ? <div className="empty-state">No secure messages.</div> : (
            <DataTable headers={["Message", "Created"]} rows={(workspace?.messages ?? []).map((message) => [message.body, formatDate(message.createdAt)])} />
          )}
        </article>
      )}

      {showNotifications && (
        <article className="panel">
          <h2>Notifications</h2>
          {(workspace?.notifications.length ?? 0) === 0 ? <div className="empty-state">No notifications.</div> : (
            <DataTable headers={["Title", "Type", "Created"]} rows={(workspace?.notifications ?? []).map((notification) => [notification.title, notification.type, formatDate(notification.createdAt)])} />
          )}
        </article>
      )}

      {showProfile && (
        <article className="panel">
          <h2>Account profile</h2>
          {workspace?.profile.account ? (
            <form className="form-stack" onSubmit={saveProfile}>
              <div className="form-grid">
                <label>Name<input value={String(profileForm.name ?? "")} onChange={(event) => updateProfileField("name", event.target.value)} /></label>
                <label>Email<input value={String(profileForm.email ?? "")} onChange={(event) => updateProfileField("email", event.target.value)} /></label>
                <label>Phone<input value={String(profileForm.phone ?? "")} onChange={(event) => updateProfileField("phone", event.target.value)} /></label>
                <label>Avatar URL<input value={String(profileForm.avatarUrl ?? "")} onChange={(event) => updateProfileField("avatarUrl", event.target.value)} /></label>
              </div>
              <div className="form-grid">
                <label><input type="checkbox" checked={Boolean(profileForm.notifyEmail)} onChange={(event) => updateProfileField("notifyEmail", event.target.checked)} /> Email notifications</label>
                <label><input type="checkbox" checked={Boolean(profileForm.notifySms)} onChange={(event) => updateProfileField("notifySms", event.target.checked)} /> SMS notifications</label>
                <label><input type="checkbox" checked={Boolean(profileForm.notifyPush)} onChange={(event) => updateProfileField("notifyPush", event.target.checked)} /> Push notifications</label>
              </div>
              {workspace.profile.account.role === "doctor" ? (
                <div className="form-grid">
                  <label>Specialty<input value={String(profileForm.specialty ?? "")} onChange={(event) => updateProfileField("specialty", event.target.value)} /></label>
                  <label>License number<input value={String(profileForm.licenseNumber ?? "")} onChange={(event) => updateProfileField("licenseNumber", event.target.value)} /></label>
                  <label>Department<input value={String(profileForm.department ?? "")} onChange={(event) => updateProfileField("department", event.target.value)} /></label>
                  <label>Availability<input value={String(profileForm.availability ?? "")} onChange={(event) => updateProfileField("availability", event.target.value)} /></label>
                  <label>Hospital affiliation<input value={String(profileForm.hospitalAffiliation ?? "")} onChange={(event) => updateProfileField("hospitalAffiliation", event.target.value)} /></label>
                  <label><input type="checkbox" checked={Boolean(profileForm.acceptingAppointments)} onChange={(event) => updateProfileField("acceptingAppointments", event.target.checked)} /> Accepting appointments</label>
                </div>
              ) : null}
              {workspace.profile.account.role === "hospital_admin" || workspace.profile.account.role === "super_admin" ? (
                <>
                  <div className="form-grid">
                    <label>Organization<input value={String(profileForm.organizationName ?? "")} onChange={(event) => updateProfileField("organizationName", event.target.value)} /></label>
                    <label>Contact email<input value={String(profileForm.contactEmail ?? "")} onChange={(event) => updateProfileField("contactEmail", event.target.value)} /></label>
                    <label>City<input value={String(profileForm.city ?? "")} onChange={(event) => updateProfileField("city", event.target.value)} /></label>
                    <label>State<input value={String(profileForm.state ?? "")} onChange={(event) => updateProfileField("state", event.target.value)} /></label>
                  </div>
                  <label>Address<input value={String(profileForm.address ?? "")} onChange={(event) => updateProfileField("address", event.target.value)} /></label>
                  <label>Specialties/services<input value={String(profileForm.specialties ?? "")} onChange={(event) => updateProfileField("specialties", event.target.value)} /></label>
                </>
              ) : null}
              {workspace.profile.account.role === "laboratory" ? (
                <div className="form-grid">
                  <label>Lab name<input value={String(profileForm.labName ?? "")} onChange={(event) => updateProfileField("labName", event.target.value)} /></label>
                  <label>Department<input value={String(profileForm.department ?? "")} onChange={(event) => updateProfileField("department", event.target.value)} /></label>
                  <label>Certification number<input value={String(profileForm.certificationNumber ?? "")} onChange={(event) => updateProfileField("certificationNumber", event.target.value)} /></label>
                  <label>Test capabilities<input value={String(profileForm.testCapabilities ?? "")} onChange={(event) => updateProfileField("testCapabilities", event.target.value)} /></label>
                </div>
              ) : null}
              {workspace.profile.account.role === "emergency_staff" ? (
                <div className="form-grid">
                  <label>Organization<input value={String(profileForm.organizationName ?? "")} onChange={(event) => updateProfileField("organizationName", event.target.value)} /></label>
                  <label>Service area<input value={String(profileForm.serviceArea ?? "")} onChange={(event) => updateProfileField("serviceArea", event.target.value)} /></label>
                  <label>Certification number<input value={String(profileForm.certificationNumber ?? "")} onChange={(event) => updateProfileField("certificationNumber", event.target.value)} /></label>
                  <label>Dispatch contact<input value={String(profileForm.dispatchContact ?? "")} onChange={(event) => updateProfileField("dispatchContact", event.target.value)} /></label>
                </div>
              ) : null}
              <button className="primary-button" type="submit" disabled={actionLoading}>{actionLoading ? "Saving..." : "Save profile"}</button>
            </form>
          ) : <div className="empty-state">No account profile was returned.</div>}
        </article>
      )}

      {showOperations && operations && (
        <>
          <div className="metric-grid">
            <MetricCard label="Hospitals" value={String(operations.hospitals.length)} icon={<Building2 />} />
            <MetricCard label="Users" value={String(operations.users.length || operations.hospitalStaff.length)} tone="teal" icon={<UsersRound />} />
            <MetricCard label="Laboratories" value={String(operations.laboratories.length)} tone="green" icon={<FlaskConical />} />
          </div>
          <section className="panel-grid">
            <article className="panel">
              <h2>Hospital operations</h2>
              {operations.hospitals.length === 0 ? <div className="empty-state">No hospitals available.</div> : (
                <DataTable headers={["Hospital", "Location", "Status", "Action"]} rows={operations.hospitals.map((hospital) => [hospital.name, `${hospital.city}, ${hospital.state}`, hospital.status, hospital.status === "pending" ? <InlineButton key={hospital.id} onClick={() => approveHospital(hospital)} disabled={actionLoading}>Approve</InlineButton> : "Ready"])} />
              )}
            </article>
            <article className="panel">
              <h2>Laboratory operations</h2>
              {operations.laboratories.length === 0 ? <div className="empty-state">No laboratories available.</div> : (
                <DataTable headers={["Lab", "Department", "Status", "Action"]} rows={operations.laboratories.map((laboratory) => [laboratory.labName, laboratory.department, laboratory.status, !laboratory.isActive ? <InlineButton key={laboratory.id} onClick={() => approveLaboratory(laboratory)} disabled={actionLoading}>Approve</InlineButton> : "Active"])} />
              )}
            </article>
          </section>
          <section className="panel-grid">
            <article className="panel">
              <h2>Connected patients</h2>
              {operations.hospitalPatients.length === 0 ? <div className="empty-state">No scoped hospital patients loaded.</div> : (
                <DataTable headers={["Patient", "Blood", "Action"]} rows={operations.hospitalPatients.map((patient) => [patient.fullName, patient.bloodGroup, <InlineButton key={patient.id} onClick={() => verifyPatient(patient)} disabled={actionLoading}>Verify connection</InlineButton>])} />
              )}
            </article>
            <article className="panel">
              <h2>Staff and users</h2>
              <DataTable headers={["Name", "Email", "Role"]} rows={(operations.hospitalStaff.length ? operations.hospitalStaff : operations.users).slice(0, 10).map((item: User) => [item.name, item.email, item.role.replace("_", " ")])} />
            </article>
          </section>
        </>
      )}
    </AppShell>
  );
}

function EmergencyCasePanel({ result }: { result?: EmergencyResult }) {
  if (!result) {
    return (
      <article className="panel emergency-panel">
        <h2>Emergency case details</h2>
        <div className="empty-state">Resolve an emergency request to display case details and critical records.</div>
      </article>
    );
  }

  return (
    <article className="panel emergency-panel">
      <h2>Emergency case details</h2>
      <div className="metric-grid two">
        <MetricCard label="Full name" value={result.fullName} />
        <MetricCard label="Blood group" value={result.bloodGroup} tone="amber" />
      </div>
      <p><strong>Allergies:</strong> {result.allergies.join(", ") || "None recorded"}</p>
      <p><strong>Chronic conditions:</strong> {result.chronicConditions.join(", ") || "None recorded"}</p>
      <p><strong>Current medications:</strong> {result.currentMedications.join(", ") || "None recorded"}</p>
      {result.recentCriticalRecords.length === 0 ? <div className="empty-state">No emergency cases are marked as critical.</div> : (
        <DataTable headers={["Case", "Summary", "Date"]} rows={result.recentCriticalRecords.map((record: MedicalRecord) => [record.title, record.summary, formatDate(record.date ?? record.recordDate)])} />
      )}
    </article>
  );
}
