import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../layouts/app-shell";
import { useSessionStore } from "../store/session-store";
import { Loader } from "../components/ui/feedback";
import type { Role } from "../types/domain";

const LandingPage = lazy(() => import("../features/landing/landing-page").then((module) => ({ default: module.LandingPage })));
const PublicInfoPage = lazy(() => import("../features/landing/public-pages").then((module) => ({ default: module.PublicInfoPage })));
const LoginPage = lazy(() => import("../features/auth/auth-pages").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("../features/auth/auth-pages").then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("../features/auth/auth-pages").then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../features/auth/auth-pages").then((module) => ({ default: module.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import("../features/auth/auth-pages").then((module) => ({ default: module.VerifyEmailPage })));
const ResendVerificationPage = lazy(() => import("../features/auth/auth-pages").then((module) => ({ default: module.ResendVerificationPage })));
const DashboardPage = lazy(() => import("../features/dashboard").then((module) => ({ default: module.DashboardPage })));
const PatientsPage = lazy(() => import("../features/patients").then((module) => ({ default: module.PatientsPage })));
const ProvidersPage = lazy(() => import("../features/providers").then((module) => ({ default: module.ProvidersPage })));
const CreateStaffPage = lazy(() => import("../features/providers").then((module) => ({ default: module.CreateStaffPage })));
const RecordsPage = lazy(() => import("../features/records").then((module) => ({ default: module.RecordsPage })));
const CreateRecordPage = lazy(() => import("../features/records").then((module) => ({ default: module.CreateRecordPage })));
const AppointmentsPage = lazy(() => import("../features/appointments").then((module) => ({ default: module.AppointmentsPage })));
const CreateAppointmentPage = lazy(() => import("../features/appointments").then((module) => ({ default: module.CreateAppointmentPage })));
const LabsPage = lazy(() => import("../features/labs").then((module) => ({ default: module.LabsPage })));
const CreateLabResultPage = lazy(() => import("../features/labs").then((module) => ({ default: module.CreateLabResultPage })));
const PrescriptionsPage = lazy(() => import("../features/prescriptions").then((module) => ({ default: module.PrescriptionsPage })));
const CreatePrescriptionPage = lazy(() => import("../features/prescriptions").then((module) => ({ default: module.CreatePrescriptionPage })));
const SharingPage = lazy(() => import("../features/dashboard").then((module) => ({ default: module.SharingPage })));
const CreateSharePage = lazy(() => import("../features/dashboard").then((module) => ({ default: module.CreateSharePage })));
const EmergencyPage = lazy(() => import("../features/emergency").then((module) => ({ default: module.EmergencyPage })));
const CreateEmergencyCasePage = lazy(() => import("../features/emergency").then((module) => ({ default: module.CreateEmergencyCasePage })));
const ResolveEmergencyPage = lazy(() => import("../features/emergency").then((module) => ({ default: module.ResolveEmergencyPage })));
const HospitalFinderPage = lazy(() => import("../features/dashboard").then((module) => ({ default: module.HospitalFinderPage })));
const MessagesPage = lazy(() => import("../features/messaging").then((module) => ({ default: module.MessagesPage })));
const SendMessagePage = lazy(() => import("../features/messaging").then((module) => ({ default: module.SendMessagePage })));
const NotificationsPage = lazy(() => import("../features/notifications").then((module) => ({ default: module.NotificationsPage })));
const UsersPage = lazy(() => import("../features/admin").then((module) => ({ default: module.UsersPage })));
const HospitalsAdminPage = lazy(() => import("../features/admin").then((module) => ({ default: module.HospitalsAdminPage })));
const AnalyticsPage = lazy(() => import("../features/analytics").then((module) => ({ default: module.AnalyticsPage })));
const TelemedicinePage = lazy(() => import("../features/telemedicine").then((module) => ({ default: module.TelemedicinePage })));
const SymptomsCheckerPage = lazy(() => import("../features/symptoms-checker").then((module) => ({ default: module.SymptomsCheckerPage })));
const AiChatPage = lazy(() => import("../features/ai-chat").then((module) => ({ default: module.AiChatPage })));
const ProfilePage = lazy(() => import("../features/profile").then((module) => ({ default: module.ProfilePage })));
const EditProfilePage = lazy(() => import("../features/profile").then((module) => ({ default: module.EditProfilePage })));
const UpdatePasswordPage = lazy(() => import("../features/profile").then((module) => ({ default: module.UpdatePasswordPage })));

function ProtectedRoute() {
  const session = useSessionStore((state) => state.session);
  return session ? <AppShell /> : <Navigate to="/login" replace />;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const session = useSessionStore((state) => state.session);
  return session ? <Navigate to="/app" replace /> : children;
}

function RolePage({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const session = useSessionStore((state) => state.session);
  if (!session) return <Navigate to="/login" replace />;
  return allowed.includes(session.user.role) ? children : <Navigate to="/app" replace />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<PublicInfoPage type="contact" />} />
        <Route path="/privacy" element={<PublicInfoPage type="privacy" />} />
        <Route path="/terms" element={<PublicInfoPage type="terms" />} />
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<RolePage allowed={["doctor", "hospital_admin", "super_admin", "emergency_staff", "laboratory"]}><PatientsPage /></RolePage>} />
          <Route path="providers" element={<RolePage allowed={["hospital_admin", "super_admin"]}><ProvidersPage /></RolePage>} />
          <Route path="providers/new" element={<RolePage allowed={["hospital_admin", "super_admin"]}><CreateStaffPage /></RolePage>} />
          <Route path="records" element={<RolePage allowed={["patient", "doctor", "hospital_admin", "super_admin", "emergency_staff"]}><RecordsPage /></RolePage>} />
          <Route path="records/new" element={<RolePage allowed={["doctor", "hospital_admin", "super_admin"]}><CreateRecordPage /></RolePage>} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="appointments/new" element={<CreateAppointmentPage />} />
          <Route path="labs" element={<LabsPage />} />
          <Route path="labs/new" element={<RolePage allowed={["doctor", "hospital_admin", "super_admin", "laboratory"]}><CreateLabResultPage /></RolePage>} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="prescriptions/new" element={<RolePage allowed={["doctor", "hospital_admin", "super_admin"]}><CreatePrescriptionPage /></RolePage>} />
          <Route path="sharing" element={<RolePage allowed={["patient"]}><SharingPage /></RolePage>} />
          <Route path="sharing/new" element={<RolePage allowed={["patient"]}><CreateSharePage /></RolePage>} />
          <Route path="emergency" element={<EmergencyPage />} />
          <Route path="emergency/new" element={<CreateEmergencyCasePage />} />
          <Route path="emergency/resolve" element={<RolePage allowed={["emergency_staff", "doctor"]}><ResolveEmergencyPage /></RolePage>} />
          <Route path="finder" element={<RolePage allowed={["patient", "doctor", "hospital_admin"]}><HospitalFinderPage /></RolePage>} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/new" element={<SendMessagePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="users" element={<RolePage allowed={["super_admin"]}><UsersPage /></RolePage>} />
          <Route path="hospitals" element={<RolePage allowed={["super_admin"]}><HospitalsAdminPage /></RolePage>} />
          <Route path="analytics" element={<RolePage allowed={["hospital_admin", "super_admin"]}><AnalyticsPage /></RolePage>} />
          <Route path="telemedicine" element={<RolePage allowed={["patient", "doctor", "hospital_admin"]}><TelemedicinePage /></RolePage>} />
          <Route path="symptoms-checker" element={<RolePage allowed={["patient", "doctor", "hospital_admin"]}><SymptomsCheckerPage /></RolePage>} />
          <Route path="ai-chat" element={<RolePage allowed={["patient", "doctor", "hospital_admin"]}><AiChatPage /></RolePage>} />
          <Route path="laboratory" element={<RolePage allowed={["laboratory", "hospital_admin", "super_admin"]}><LabsPage /></RolePage>} />
          <Route path="hospital" element={<RolePage allowed={["hospital_admin", "super_admin"]}><ProvidersPage /></RolePage>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
          <Route path="profile/password" element={<UpdatePasswordPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
