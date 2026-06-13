import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Ambulance, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { healthbridgeApi } from "../../api/healthbridge-api";
import { DataList } from "../../components/data/data-list";
import { Row } from "../../components/data/row";
import { Button } from "../../components/ui/button";
import { ErrorState, Loader } from "../../components/ui/feedback";
import { FormPanel } from "../../components/ui/form-panel";
import { useWorkspaceContext } from "../../hooks/use-workspace-context";
import type { Appointment, ConsentShare, EmergencyCase, Hospital, LabRequest, LabResult, MedicalRecord, Message, NotificationItem, PatientProfile, Prescription, User, WorkspacePayload } from "../../types/domain";
import { apiErrorText, dateOf, idOf, labelOf, listText } from "../../utils/format";

export function DashboardPage() {
  const { workspace } = useWorkspaceContext();
  const profile = workspace?.profile.account;
  const dashboard = useQuery({ queryKey: ["patient-dashboard"], queryFn: healthbridgeApi.patientDashboard, enabled: profile?.role === "patient", retry: false });
  const admin = useQuery({ queryKey: ["admin-operations"], queryFn: healthbridgeApi.adminOperations, enabled: profile?.role === "super_admin", retry: false });
  const stats = [
    ["Patients", workspace?.patients.length ?? 0],
    ["Appointments", workspace?.appointments.length ?? dashboard.data?.appointments.length ?? 0],
    ["Records", workspace?.records.length ?? dashboard.data?.records.length ?? 0],
    ["Notifications", workspace?.notifications.length ?? 0]
  ];
  return (
    <div className="page-grid">
      <section className="welcome panel">
        <p className="eyebrow">Today on HealthBridge</p>
        <h2>Care operations at a glance</h2>
        </section>
      <div className="stat-grid">
        {stats.map(([label, value]) => <article className="stat" key={String(label)}><Activity /><p>{label}</p><strong>{value}</strong></article>)}
      </div>
      {profile?.role === "patient" && dashboard.data?.profile ? <EmergencyAccessCard profile={dashboard.data.profile} /> : null}
      {admin.data ? <DataList title="Pending approvals" items={[...admin.data.pendingApprovals.hospitals, ...admin.data.pendingApprovals.laboratories]} searchableText={labelOf} render={(item) => <Row title={labelOf(item)} meta={JSON.stringify(item).includes("isActive") ? "Laboratory approval" : "Hospital approval"} />} /> : null}
      <DataList title="Recent appointments" items={dashboard.data?.appointments ?? workspace?.appointments ?? []} searchableText={(item) => item.reason} render={(item) => <AppointmentRow item={item} workspace={workspace} />} />
    </div>
  );
}

export function PatientsPage() {
  const { workspace } = useWorkspaceContext();
  return <DataList title="Patients" items={workspace?.patients ?? []} searchableText={(item) => `${item.fullName} ${item.bloodGroup}`} render={(item) => <Row title={item.fullName} meta={`${item.bloodGroup} • ${item.gender ?? "Gender not set"}`} detail={listText(item.chronicConditions)} badge="profile" />} />;
}

export function ProvidersPage() {
  const { workspace } = useWorkspaceContext();
  return (
    <div className="page-grid">
      <DataList title="Staff" items={workspace?.staff ?? []} searchableText={(item) => `${item.name} ${item.email} ${item.role}`} action={<Link to="/app/providers/new"><Button>Invite staff</Button></Link>} render={(item: User) => <Row title={item.name} meta={`${item.email} • ${item.role}`} badge={item.isActive === false ? "inactive" : "active"} />} />
      <DataList title="Doctors" items={workspace?.doctors ?? []} searchableText={(item) => `${item.specialty} ${item.department}`} render={(item) => <Row title={item.specialty ?? "Doctor"} meta={item.department} detail={item.hospitalAffiliation} badge={item.acceptingAppointments ? "accepting" : "paused"} />} />
    </div>
  );
}

export function CreateStaffPage() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();
  const createStaff = useMutation({
    mutationFn: (payload: Record<string, unknown>) => healthbridgeApi.createStaff(String(payload.hospitalId), payload),
    onSuccess: async () => {
      await refreshWorkspace();
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    }
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createStaff.mutate({
      hospitalId: String(form.get("hospitalId")),
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      role: String(form.get("role")),
      specialty: String(form.get("specialty") || ""),
      licenseNumber: String(form.get("licenseNumber") || ""),
      department: String(form.get("department") || "")
    });
    event.currentTarget.reset();
  };
  return (
    <FormPanel title="Invite staff" onSubmit={submit}>
      <HospitalSelect workspace={workspace} name="hospitalId" required />
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Temporary password" required />
      <select name="role"><option value="doctor">Doctor</option><option value="hospital_admin">Hospital admin</option></select>
      <input name="specialty" placeholder="Specialty" />
      <input name="licenseNumber" placeholder="License number" />
      <input name="department" placeholder="Department" />
      {createStaff.error ? <p className="error">{apiErrorText(createStaff.error)}</p> : null}
    </FormPanel>
  );
}

export function RecordsPage() {
  const { workspace } = useWorkspaceContext();
  const role = workspace?.profile.account?.role;
  const dashboard = useQuery({ queryKey: ["patient-dashboard"], queryFn: healthbridgeApi.patientDashboard, enabled: role === "patient", retry: false });
  const records = dashboard.data?.records ?? workspace?.records ?? [];
  return <DataList title="Medical records" items={records} searchableText={(item) => `${item.title} ${item.type} ${item.summary}`} action={role !== "patient" ? <Link to="/app/records/new"><Button>Create record</Button></Link> : undefined} render={(item: MedicalRecord) => <Row title={item.title} meta={`${item.type} • ${dateOf(item.recordDate ?? item.date ?? item.createdAt)}`} detail={item.summary} badge={item.critical ? "critical" : "record"} />} />;
}

export function CreateRecordPage() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const create = useMutation({ mutationFn: healthbridgeApi.createRecord, onSuccess: refreshWorkspace });
  const role = workspace?.profile.account?.role;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({
      patientId: String(form.get("patientId") || ""),
      hospitalId: String(form.get("hospitalId") || workspace?.profile.account?.hospitalId || ""),
      type: String(form.get("type")),
      title: String(form.get("title")),
      summary: String(form.get("summary")),
      critical: form.get("critical") === "on"
    });
    event.currentTarget.reset();
  };
  return (
      <FormPanel title="Create medical record" onSubmit={submit}>
        {role !== "patient" ? <PatientSelect workspace={workspace} name="patientId" required /> : null}
        <HospitalSelect workspace={workspace} name="hospitalId" />
        <select name="type"><option value="visit">Visit</option><option value="diagnosis">Diagnosis</option><option value="imaging">Imaging</option><option value="surgery">Surgery</option><option value="emergency">Emergency</option><option value="document">Document</option></select>
        <input name="title" placeholder="Title" required />
        <textarea name="summary" placeholder="Summary" required />
        <label className="check-row"><input name="critical" type="checkbox" /> Critical</label>
        {create.error ? <p className="error">{apiErrorText(create.error)}</p> : null}
      </FormPanel>
  );
}

export function AppointmentsPage() {
  const { workspace } = useWorkspaceContext();
  return <DataList title="Appointments" items={workspace?.appointments ?? []} searchableText={(item) => `${item.reason} ${item.status}`} action={<Link to="/app/appointments/new"><Button>Create appointment</Button></Link>} render={(item) => <AppointmentRow item={item} workspace={workspace} />} />;
}

export function CreateAppointmentPage() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const create = useMutation({ mutationFn: healthbridgeApi.createAppointment, onSuccess: refreshWorkspace });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({
      patientId: String(form.get("patientId") || workspace?.profile.account?.patientId || ""),
      hospitalId: String(form.get("hospitalId") || workspace?.profile.account?.hospitalId || ""),
      doctorId: String(form.get("doctorId") || ""),
      reason: String(form.get("reason")),
      scheduledAt: String(form.get("scheduledAt")),
      notes: String(form.get("notes") || "")
    });
    event.currentTarget.reset();
  };
  return (
      <FormPanel title="Create appointment" onSubmit={submit}>
        {workspace?.profile.account?.role !== "patient" ? <PatientSelect workspace={workspace} name="patientId" /> : null}
        <HospitalSelect workspace={workspace} name="hospitalId" />
        <DoctorSelect workspace={workspace} name="doctorId" />
        <input name="reason" placeholder="Reason" required />
        <input name="scheduledAt" type="datetime-local" required />
        <textarea name="notes" placeholder="Notes" />
        {create.error ? <p className="error">{apiErrorText(create.error)}</p> : null}
      </FormPanel>
  );
}

export function LabsPage() {
  const { workspace } = useWorkspaceContext();
  const role = workspace?.profile.account?.role;
  const canViewRequests = role === "doctor" || role === "hospital_admin" || role === "super_admin" || role === "laboratory";
  const canCreateResult = role === "doctor" || role === "hospital_admin" || role === "super_admin" || role === "laboratory";
  const requests = useQuery({ queryKey: ["lab-requests", role], queryFn: () => role === "laboratory" ? healthbridgeApi.assignedLabRequests() : healthbridgeApi.labRequests(), enabled: canViewRequests, retry: false });
  return (
    <div className="page-grid">
      {requests.isLoading ? <Loader label="Loading lab requests..." /> : null}
      {canViewRequests ? <DataList title="Lab requests" items={requests.data ?? []} searchableText={(item) => `${item.testName} ${item.status}`} render={(item: LabRequest) => <Row title={item.testName} meta={`${displayRef(item.patientId, workspace, "patient")} • ${item.priority}`} detail={item.clinicalNotes ?? item.notes} badge={item.status} />} /> : null}
      <DataList title="Lab results" items={workspace?.labResults ?? []} searchableText={(item) => `${item.testName} ${item.result}`} action={canCreateResult ? <Link to="/app/labs/new"><Button>Upload result</Button></Link> : undefined} render={(item: LabResult) => <Row title={item.testName} meta={`${item.result} ${item.unit ?? ""}`} detail={item.referenceRange} badge={item.status} />} />
    </div>
  );
}

export function CreateLabResultPage() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const create = useMutation({ mutationFn: healthbridgeApi.createLabResult, onSuccess: refreshWorkspace });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({
      requestId: String(form.get("requestId") || ""),
      patientId: String(form.get("patientId") || ""),
      hospitalId: String(form.get("hospitalId") || workspace?.profile.account?.hospitalId || ""),
      testName: String(form.get("testName")),
      result: String(form.get("result")),
      unit: String(form.get("unit") || ""),
      referenceRange: String(form.get("referenceRange") || ""),
      status: String(form.get("status") || "normal")
    });
    event.currentTarget.reset();
  };
  return (
      <FormPanel title="Upload lab result" onSubmit={submit}>
        <input name="requestId" placeholder="Request ID" />
        <PatientSelect workspace={workspace} name="patientId" />
        <HospitalSelect workspace={workspace} name="hospitalId" />
        <input name="testName" placeholder="Test name" required />
        <textarea name="result" placeholder="Result" required />
        <input name="unit" placeholder="Unit" />
        <input name="referenceRange" placeholder="Reference range" />
        <select name="status"><option value="normal">Normal</option><option value="abnormal">Abnormal</option><option value="critical">Critical</option></select>
        {create.error ? <p className="error">{apiErrorText(create.error)}</p> : null}
      </FormPanel>
  );
}

export function PrescriptionsPage() {
  const { workspace } = useWorkspaceContext();
  const canCreate = workspace?.profile.account?.role !== "patient";
  return <DataList title="Prescriptions" items={workspace?.prescriptions ?? []} searchableText={(item) => `${item.medication} ${item.dosage}`} action={canCreate ? <Link to="/app/prescriptions/new"><Button>Create prescription</Button></Link> : undefined} render={(item: Prescription) => <Row title={item.medication} meta={`${item.dosage} • ${item.frequency}`} badge={item.active ? "active" : "ended"} />} />;
}

export function CreatePrescriptionPage() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const create = useMutation({ mutationFn: healthbridgeApi.createPrescription, onSuccess: refreshWorkspace });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({
      patientId: String(form.get("patientId") || workspace?.profile.account?.patientId || ""),
      hospitalId: String(form.get("hospitalId") || workspace?.profile.account?.hospitalId || ""),
      medication: String(form.get("medication")),
      dosage: String(form.get("dosage")),
      frequency: String(form.get("frequency"))
    });
    event.currentTarget.reset();
  };
  return (
      <FormPanel title="Create prescription" onSubmit={submit}>
        {workspace?.profile.account?.role !== "patient" ? <PatientSelect workspace={workspace} name="patientId" /> : null}
        <HospitalSelect workspace={workspace} name="hospitalId" />
        <input name="medication" placeholder="Medication" required />
        <input name="dosage" placeholder="Dosage" required />
        <input name="frequency" placeholder="Frequency" required />
        {create.error ? <p className="error">{apiErrorText(create.error)}</p> : null}
      </FormPanel>
  );
}

export function SharingPage() {
  const dashboard = useQuery({ queryKey: ["patient-dashboard"], queryFn: healthbridgeApi.patientDashboard });
  const hospitals = useQuery({ queryKey: ["public-hospitals"], queryFn: healthbridgeApi.hospitals });
  const hospitalName = (value: unknown) => {
    if (typeof value !== "string") return labelOf(value, "Hospital");
    return hospitals.data?.find((hospital) => idOf(hospital) === value)?.name ?? "Shared hospital";
  };
  const download = () => {
    if (!dashboard.data) return;
    const file = new Blob([JSON.stringify(dashboard.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "healthbridge-records.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="page-grid">
      <section className="panel panel-head">
        <div>
          <p className="eyebrow">Patient records</p>
          <h2>Sharing and downloads</h2>
        </div>
        <div className="hero-actions">
          <Link to="/app/sharing/new"><Button>Share records</Button></Link>
          <Button variant="ghost" onClick={download}>Download records</Button>
        </div>
      </section>
      <DataList title="Consent shares" items={dashboard.data?.shares ?? []} searchableText={(item) => `${hospitalName(item.toHospitalId)} ${item.scopes.join(" ")}`} render={(item: ConsentShare) => <Row title={hospitalName(item.toHospitalId)} meta={item.scopes.join(", ")} badge={item.status} />} />
    </div>
  );
}

export function CreateSharePage() {
  const dashboard = useQuery({ queryKey: ["patient-dashboard"], queryFn: healthbridgeApi.patientDashboard });
  const create = useMutation({ mutationFn: healthbridgeApi.createShare, onSuccess: () => dashboard.refetch() });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({
      toHospitalId: String(form.get("toHospitalId")),
      scopes: String(form.get("scopes")).split(",").map((scope) => scope.trim()).filter(Boolean),
      expiresAt: String(form.get("expiresAt") || "")
    });
    event.currentTarget.reset();
  };
  return (
      <FormPanel title="Share records" onSubmit={submit}>
        <HospitalSelect workspace={undefined} name="toHospitalId" required includePublic />
        <input name="scopes" placeholder="profile,records,labs" defaultValue="profile,records,labs,prescriptions" required />
        <input name="expiresAt" type="date" />
        {create.error ? <p className="error">{apiErrorText(create.error)}</p> : null}
      </FormPanel>
  );
}

export function EmergencyPage() {
  const { workspace } = useWorkspaceContext();
  const cases = useQuery({ queryKey: ["emergency-cases"], queryFn: () => workspace?.profile.account?.role === "emergency_staff" ? healthbridgeApi.assignedEmergencyCases() : healthbridgeApi.emergencyCases(), retry: false });
  return <DataList title="Emergency cases" items={cases.data ?? workspace?.emergencyCases ?? []} searchableText={(item) => `${item.reason} ${item.status}`} action={<div className="hero-actions"><Link to="/app/emergency/new"><Button>Create case</Button></Link><Link to="/app/emergency/resolve"><Button variant="ghost">Resolve code</Button></Link></div>} render={(item: EmergencyCase) => <Row title={item.reason ?? item.chiefComplaint ?? "Emergency case"} meta={`${displayRef(item.patientId, workspace, "patient")} • ${item.location ?? "No location"}`} badge={item.status} />} />;
}

export function ResolveEmergencyPage() {
  const [resolved, setResolved] = useState<Record<string, unknown> | null>(null);
  const resolve = useMutation({ mutationFn: ({ code, reason }: { code: string; reason: string }) => healthbridgeApi.resolveEmergency(code, reason), onSuccess: setResolved });
  const submitResolve = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    resolve.mutate({ code: String(form.get("code")), reason: String(form.get("reason")) });
  };
  return (
    <div className="page-grid">
      <FormPanel title="Resolve emergency QR or code" onSubmit={submitResolve}>
        <input name="code" placeholder="Emergency code from patient QR" required />
        <textarea name="reason" placeholder="Reason for emergency access" required />
        {resolve.error ? <p className="error">{apiErrorText(resolve.error)}</p> : null}
      </FormPanel>
      {resolved ? <EmergencyResolvedPanel data={resolved} /> : null}
    </div>
  );
}

export function CreateEmergencyCasePage() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const create = useMutation({ mutationFn: healthbridgeApi.createEmergencyCase, onSuccess: refreshWorkspace });
  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({
      patientId: String(form.get("patientId") || workspace?.profile.account?.patientId || ""),
      location: String(form.get("location")),
      reason: String(form.get("reason")),
      priority: String(form.get("priority") || "high"),
      notes: String(form.get("notes") || "")
    });
    event.currentTarget.reset();
  };
  return (
      <FormPanel title="Create emergency case" onSubmit={submitCreate}>
        {workspace?.profile.account?.role !== "patient" ? <PatientSelect workspace={workspace} name="patientId" /> : null}
        <input name="location" placeholder="Location" required />
        <input name="reason" placeholder="Reason" required />
        <select name="priority"><option value="high">High</option><option value="critical">Critical</option><option value="medium">Medium</option><option value="low">Low</option></select>
        <textarea name="notes" placeholder="Notes" />
      </FormPanel>
  );
}

export function HospitalFinderPage() {
  const hospitals = useQuery({ queryKey: ["public-hospitals"], queryFn: healthbridgeApi.hospitals });
  const [items, setItems] = useState<Hospital[]>([]);
  const search = useMutation({ mutationFn: ({ query, specialty, city }: { query: string; specialty?: string; city?: string }) => healthbridgeApi.hospitalSearch(query, specialty, city), onSuccess: setItems });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    search.mutate({ query: String(form.get("query")), specialty: String(form.get("specialty") || ""), city: String(form.get("city") || "") });
  };
  return (
    <div className="page-grid">
      <FormPanel title="Find hospitals" onSubmit={submit} submitLabel="Search">
        <input name="query" placeholder="Hospital name or specialty" required />
        <input name="specialty" placeholder="Specialty" />
        <input name="city" placeholder="City" />
      </FormPanel>
      <DataList title="Hospitals" items={items.length ? items : hospitals.data ?? []} searchableText={(item) => `${item.name} ${item.city} ${item.specialties?.join(" ")}`} render={(item) => <Row title={item.name} meta={`${item.city}${item.state ? `, ${item.state}` : ""}`} detail={item.specialties?.join(", ")} badge={item.status} />} />
    </div>
  );
}

export function MessagesPage() {
  const query = useQuery({ queryKey: ["messages"], queryFn: healthbridgeApi.messages });
  if (query.isLoading) return <Loader label="Loading messages..." />;
  if (query.error) return <ErrorState message={query.error.message} />;
  return <DataList title="Messages" items={query.data ?? []} searchableText={(item) => item.body} action={<Link to="/app/messages/new"><Button>Send message</Button></Link>} render={(item: Message) => <Row title={item.body} meta={dateOf(item.createdAt)} badge={<Send size={16} />} />} />;
}

export function SendMessagePage() {
  const query = useQuery({ queryKey: ["message-contacts"], queryFn: healthbridgeApi.messageContacts });
  const send = useMutation({ mutationFn: healthbridgeApi.sendMessage, onSuccess: () => query.refetch() });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    send.mutate({ recipientUserId: String(form.get("recipientUserId")), body: String(form.get("body")) });
    event.currentTarget.reset();
  };
  if (query.isLoading) return <Loader label="Loading contacts..." />;
  if (query.error) return <ErrorState message={query.error.message} />;
  return (
      <FormPanel title="Send message" onSubmit={submit}>
        <select name="recipientUserId" required defaultValue="">
          <option value="">Select recipient</option>
          {query.data?.map((contact) => <option key={idOf(contact)} value={idOf(contact)}>{contact.name} • {contact.role.replace("_", " ")}</option>)}
        </select>
        <textarea name="body" placeholder="Message" required />
        {send.error ? <p className="error">{apiErrorText(send.error)}</p> : null}
      </FormPanel>
  );
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["notifications"], queryFn: healthbridgeApi.notifications });
  const mark = useMutation({ mutationFn: healthbridgeApi.markNotificationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  if (query.isLoading) return <Loader label="Loading notifications..." />;
  if (query.error) return <ErrorState message={query.error.message} />;
  return <DataList title="Notifications" items={query.data ?? []} searchableText={(item) => `${item.title} ${item.body}`} render={(item: NotificationItem) => <Row title={item.title} meta={item.body} detail={dateOf(item.createdAt)} badge={<Button variant="tiny" onClick={() => mark.mutate(item._id)}>{item.readAt ? "Read" : "Mark read"}</Button>} />} />;
}

export function UsersPage() {
  const query = useQuery({ queryKey: ["users"], queryFn: healthbridgeApi.users });
  if (query.isLoading) return <Loader label="Loading users..." />;
  if (query.error) return <ErrorState message={query.error.message} />;
  return <DataList title="Users" items={query.data ?? []} searchableText={(item) => `${item.name} ${item.email} ${item.role}`} render={(item: User) => <Row title={item.name} meta={`${item.email} • ${item.role}`} badge={item.isActive === false ? "inactive" : "active"} />} />;
}

export function HospitalsAdminPage() {
  const queryClient = useQueryClient();
  const admin = useQuery({ queryKey: ["admin-operations"], queryFn: healthbridgeApi.adminOperations });
  const approve = useMutation({ mutationFn: healthbridgeApi.approveHospital, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-operations"] }) });
  if (admin.isLoading) return <Loader label="Loading hospitals..." />;
  if (admin.error) return <ErrorState message={admin.error.message} />;
  return <DataList title="Hospitals" items={admin.data?.hospitals ?? []} searchableText={(item) => `${item.name} ${item.city} ${item.status}`} render={(item: Hospital) => <Row title={item.name} meta={`${item.city} • ${item.contactEmail ?? ""}`} badge={<Button variant="tiny" onClick={() => approve.mutate(idOf(item))}>{item.status === "approved" ? "Approved" : "Approve"}</Button>} />} />;
}

export function AnalyticsPage() {
  const { workspace } = useWorkspaceContext();
  const admin = useQuery({ queryKey: ["admin-operations"], queryFn: healthbridgeApi.adminOperations, retry: false });
  const statRows = [
    ["Appointments", workspace?.appointments.length ?? admin.data?.statistics.appointmentsByStatus.reduce((sum, item) => sum + item.count, 0) ?? 0],
    ["Lab results", workspace?.labResults.length ?? 0],
    ["Patients", workspace?.patients.length ?? 0],
    ["Pending approvals", admin.data?.statistics.pendingApprovals ?? 0]
  ];
  return (
    <div className="page-grid">
      <section className="panel">
        <p className="eyebrow">Analytics</p>
        <h2>Operational signals</h2>
      </section>
      <div className="stat-grid">{statRows.map(([label, value]) => <article className="stat" key={String(label)}><Activity /><p>{label}</p><strong>{value}</strong></article>)}</div>
    </div>
  );
}

export function SymptomsCheckerPage() {
  const assess = useMutation({ mutationFn: ({ symptoms, notes }: { symptoms: string[]; notes?: string }) => healthbridgeApi.symptomAssess(symptoms, notes) });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    assess.mutate({ symptoms: String(form.get("symptoms")).split(",").map((item) => item.trim()).filter(Boolean), notes: String(form.get("notes") || "") });
  };
  return (
    <div className="page-grid">
      <FormPanel title="AI symptom assessment" onSubmit={submit} submitLabel="Assess">
        <input name="symptoms" placeholder="Symptoms, comma separated" required />
        <textarea name="notes" placeholder="Additional notes" />
      </FormPanel>
      {assess.data ? <AssessmentPanel data={assess.data} /> : null}
    </div>
  );
}

export function AiChatPage() {
  const chat = useMutation({ mutationFn: ({ symptoms, notes }: { symptoms: string[]; notes?: string }) => healthbridgeApi.symptomAssess(symptoms, notes) });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    chat.mutate({ symptoms: [String(form.get("prompt"))], notes: "AI chat style clinical triage prompt" });
  };
  return (
    <div className="page-grid">
      <FormPanel title="AI care assistant" onSubmit={submit} submitLabel="Send">
        <textarea name="prompt" placeholder="Describe symptoms, care questions, or follow-up concerns" required />
      </FormPanel>
      {chat.data ? <AssessmentPanel data={chat.data} title="Care guidance" /> : null}
    </div>
  );
}

export function TelemedicinePage() {
  return <AiChatPage />;
}

export function ProfilePage() {
  const { workspace } = useWorkspaceContext();
  const account = workspace?.profile.account;
  const patient = workspace?.profile.patientProfile;
  return (
    <div className="page-grid">
      <section className="panel profile-summary">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Account summary</p>
            <h2>{account?.name ?? "Profile"}</h2>
          </div>
          <div className="hero-actions">
            <Link to="/app/profile/edit"><Button>Edit details</Button></Link>
            <Link to="/app/profile/password"><Button variant="ghost">Update password</Button></Link>
          </div>
        </div>
        <div className="summary-grid">
          <Row title="Email" meta={account?.email ?? "Not set"} />
          <Row title="Role" meta={account?.role?.replace("_", " ") ?? "Not set"} />
          <Row title="Phone" meta={account?.phone ?? "Not set"} />
          <Row title="Blood group" meta={patient?.bloodGroup ?? "Not applicable"} />
        </div>
      </section>
    </div>
  );
}

export function EditProfilePage() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const update = useMutation({ mutationFn: healthbridgeApi.updateAccount, onSuccess: refreshWorkspace });
  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    update.mutate({
      name: String(form.get("name")),
      phone: String(form.get("phone") || ""),
      patientProfile: {
        fullName: String(form.get("fullName") || ""),
        bloodGroup: String(form.get("bloodGroup") || ""),
        allergies: String(form.get("allergies") || "").split(",").map((item) => item.trim()).filter(Boolean),
        chronicConditions: String(form.get("chronicConditions") || "").split(",").map((item) => item.trim()).filter(Boolean),
        currentMedications: String(form.get("currentMedications") || "").split(",").map((item) => item.trim()).filter(Boolean)
      }
    });
  };
  const account = workspace?.profile.account;
  const patient = workspace?.profile.patientProfile;
  return (
      <FormPanel title="Account profile" onSubmit={submitProfile}>
        <input name="name" placeholder="Name" defaultValue={account?.name ?? ""} required />
        <input name="phone" placeholder="Phone" defaultValue={account?.phone ?? ""} />
        <input name="fullName" placeholder="Patient full name" defaultValue={patient?.fullName ?? ""} />
        <input name="bloodGroup" placeholder="Blood group" defaultValue={patient?.bloodGroup ?? ""} />
        <input name="allergies" placeholder="Allergies" defaultValue={patient?.allergies.join(", ") ?? ""} />
        <input name="chronicConditions" placeholder="Chronic conditions" defaultValue={patient?.chronicConditions.join(", ") ?? ""} />
        <input name="currentMedications" placeholder="Current medications" defaultValue={patient?.currentMedications.join(", ") ?? ""} />
        {update.error ? <p className="error">{apiErrorText(update.error)}</p> : null}
      </FormPanel>
  );
}

export function UpdatePasswordPage() {
  const changePassword = useMutation({ mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => healthbridgeApi.changePassword(currentPassword, newPassword) });
  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    changePassword.mutate({ currentPassword: String(form.get("currentPassword")), newPassword: String(form.get("newPassword")) });
    event.currentTarget.reset();
  };
  return (
      <FormPanel title="Change password" onSubmit={submitPassword} submitLabel="Update password">
        <input name="currentPassword" type="password" placeholder="Current password" required />
        <input name="newPassword" type="password" placeholder="New password" required />
        {changePassword.error ? <p className="error">{apiErrorText(changePassword.error)}</p> : null}
      </FormPanel>
  );
}

function AppointmentRow({ item, workspace }: { item: Appointment; workspace?: WorkspacePayload }) {
  return <Row title={item.reason} meta={`${dateOf(item.scheduledAt)} • ${displayRef(item.hospitalId, workspace, "hospital")}`} detail={item.notes} badge={item.status} />;
}

function EmergencyAccessCard({ profile }: { profile: PatientProfile }) {
  const [qr, setQr] = useState<{ qrCodeUrl: string; code: string } | null>(null);
  const enable = useMutation({
    mutationFn: async () => {
      await healthbridgeApi.enableEmergency();
      return healthbridgeApi.emergencyQr();
    },
    onSuccess: setQr
  });
  return (
    <section className="panel emergency-card">
      <div>
        <p className="eyebrow">Emergency access</p>
        <h2>{profile.emergencyAccessEnabled ? profile.emergencyCode ?? "Enabled" : "Disabled"}</h2>
        <p>{profile.bloodGroup} • Allergies: {listText(profile.allergies)}</p>
      </div>
      {qr?.qrCodeUrl ? <img src={qr.qrCodeUrl} alt="Emergency QR code" /> : null}
      <Button onClick={() => enable.mutate()}><Ambulance size={18} /> Enable / refresh QR</Button>
    </section>
  );
}

function AssessmentPanel({ data, title = "Assessment" }: { data: Record<string, unknown>; title?: string }) {
  const assessment = data.assessment as { urgency?: string; conditions?: string[]; recommendations?: string[] } | undefined;
  return (
    <section className="panel">
      <p className="eyebrow">AI-assisted triage</p>
      <h2>{title}</h2>
      <div className="summary-grid">
        <Row title="Urgency" meta={assessment?.urgency ?? "Review recommended"} />
        <Row title="Possible focus areas" meta={assessment?.conditions?.join(", ") ?? "Consultation recommended"} />
      </div>
      <div className="stack">
        {(assessment?.recommendations ?? []).map((item) => <div className="list-row" key={item}><strong>{item}</strong></div>)}
      </div>
      <p className="muted">{String(data.note ?? "This is not a diagnosis. Always consult a healthcare provider.")}</p>
    </section>
  );
}

function EmergencyResolvedPanel({ data }: { data: Record<string, unknown> }) {
  const records = Array.isArray(data.recentCriticalRecords) ? data.recentCriticalRecords as MedicalRecord[] : [];
  return (
    <section className="panel">
      <p className="eyebrow">Emergency profile</p>
      <h2>{String(data.fullName ?? "Resolved patient")}</h2>
      <div className="summary-grid">
        <Row title="Blood group" meta={String(data.bloodGroup ?? "Not listed")} />
        <Row title="Allergies" meta={Array.isArray(data.allergies) ? data.allergies.join(", ") : "Not listed"} />
        <Row title="Chronic conditions" meta={Array.isArray(data.chronicConditions) ? data.chronicConditions.join(", ") : "Not listed"} />
        <Row title="Current medications" meta={Array.isArray(data.currentMedications) ? data.currentMedications.join(", ") : "Not listed"} />
      </div>
      <DataList title="Critical records" items={records} searchableText={(item) => `${item.title} ${item.summary}`} render={(item) => <Row title={item.title} meta={item.type} detail={item.summary} />} />
    </section>
  );
}

function knownHospitals(workspace?: WorkspacePayload) {
  const values = [workspace?.profile.hospitalProfile, ...(workspace?.hospitals ?? []), ...(workspace?.profile.patientProfile?.hospitalIds ?? [])].filter(Boolean) as Hospital[];
  return Array.from(new Map(values.map((item) => [idOf(item), item])).values());
}

function displayRef(value: unknown, workspace: WorkspacePayload | undefined, kind: "patient" | "hospital" | "doctor") {
  if (typeof value !== "string") return labelOf(value, kind);
  const collection = kind === "patient" ? workspace?.patients : kind === "hospital" ? knownHospitals(workspace) : workspace?.staff.filter((item) => item.role === "doctor");
  const found = collection?.find((item) => idOf(item) === value);
  return found ? labelOf(found, kind) : `${kind[0].toUpperCase()}${kind.slice(1)} selected`;
}

function PatientSelect({ workspace, name, required = false }: { workspace?: WorkspacePayload; name: string; required?: boolean }) {
  const patients = workspace?.patients ?? [];
  if (!patients.length) return <input name={name} type="hidden" defaultValue={workspace?.profile.account?.patientId ?? ""} />;
  return (
    <select name={name} required={required} defaultValue="">
      <option value="">Select patient</option>
      {patients.map((patient) => <option key={idOf(patient)} value={idOf(patient)}>{patient.fullName}</option>)}
    </select>
  );
}

function DoctorSelect({ workspace, name }: { workspace?: WorkspacePayload; name: string }) {
  const doctors = workspace?.staff.filter((item) => item.role === "doctor") ?? [];
  if (!doctors.length) return <input name={name} type="hidden" />;
  return (
    <select name={name} defaultValue="">
      <option value="">Any available doctor</option>
      {doctors.map((doctor) => <option key={idOf(doctor)} value={idOf(doctor)}>{doctor.name}</option>)}
    </select>
  );
}

function HospitalSelect({ workspace, name, required = false, includePublic = false }: { workspace?: WorkspacePayload; name: string; required?: boolean; includePublic?: boolean }) {
  const publicHospitals = useQuery({ queryKey: ["public-hospitals"], queryFn: healthbridgeApi.hospitals, enabled: includePublic });
  const hospitals = includePublic ? publicHospitals.data ?? [] : knownHospitals(workspace);
  const defaultHospital = workspace?.profile.account?.hospitalId ?? idOf(workspace?.profile.hospitalProfile);
  if (!hospitals.length && defaultHospital) return <input name={name} type="hidden" defaultValue={defaultHospital} />;
  return (
    <select name={name} required={required} defaultValue={defaultHospital || ""}>
      <option value="">Select hospital</option>
      {hospitals.map((hospital) => <option key={idOf(hospital)} value={idOf(hospital)}>{hospital.name}</option>)}
    </select>
  );
}
