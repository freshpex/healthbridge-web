import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminDashboard } from "../app/admin/admin-dashboard";
import { SignInPage } from "../app/auth/pages/sign-in-page";
import { SignUpPage } from "../app/auth/pages/sign-up-page";
import { RoleSelectPage } from "../app/auth/pages/role-select-page";
import { HospitalSignUpPage } from "../app/auth/pages/hospital-signup-page";
import { DoctorSignUpPage } from "../app/auth/pages/doctor-signup-page";
import { EmergencySignUpPage } from "../app/auth/pages/emergency-signup-page";
import { DoctorDashboard } from "../app/doctor/doctor-dashboard";
import { EmergencyPage } from "../app/emergency/emergency-page";
import { HospitalDashboard } from "../app/hospital/hospital-dashboard";
import { LandingPage } from "../app/landing/landing-page";
import { PublicPage } from "../app/landing/public-page";
import { PatientAppointmentsPage } from "../app/patient/patient-appointments-page";
import { PatientAuditPage } from "../app/patient/patient-audit-page";
import { PatientDashboard } from "../app/patient/patient-dashboard";
import { PatientLabsPage } from "../app/patient/patient-labs-page";
import { PatientPrescriptionsPage } from "../app/patient/patient-prescriptions-page";
import { PatientProfilePage } from "../app/patient/patient-profile-page";
import { PatientRecordsPage } from "../app/patient/patient-records-page";
import { PatientSharingPage } from "../app/patient/patient-sharing-page";
import { SymptomCheckerPage } from "../app/patient/symptom-checker-page";
import { HospitalFinderPage } from "../app/patient/hospital-finder-page";
import { AuthProvider } from "../app/auth/hooks/auth-provider";
import { ProtectedRoute } from "./protected-route";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/product" element={<PublicPage page="product" />} />
          <Route path="/hospitals" element={<PublicPage page="hospitals" />} />
          <Route path="/security" element={<PublicPage page="security" />} />
          <Route path="/pricing" element={<PublicPage page="pricing" />} />
          <Route path="/privacy" element={<PublicPage page="privacy" />} />
          <Route path="/terms" element={<PublicPage page="terms" />} />
          <Route path="/disclaimer" element={<PublicPage page="disclaimer" />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/auth/role-select" element={<RoleSelectPage />} />
          <Route path="/auth/hospital-signup" element={<HospitalSignUpPage />} />
          <Route path="/auth/doctor-signup" element={<DoctorSignUpPage />} />
          <Route path="/auth/emergency-signup" element={<EmergencySignUpPage />} />
          <Route path="/patient" element={<ProtectedRoute allowed={["patient"]}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute allowed={["patient"]}><PatientRecordsPage /></ProtectedRoute>} />
          <Route path="/patient/labs" element={<ProtectedRoute allowed={["patient"]}><PatientLabsPage /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute allowed={["patient"]}><PatientPrescriptionsPage /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowed={["patient"]}><PatientAppointmentsPage /></ProtectedRoute>} />
          <Route path="/patient/sharing" element={<ProtectedRoute allowed={["patient"]}><PatientSharingPage /></ProtectedRoute>} />
          <Route path="/patient/audit" element={<ProtectedRoute allowed={["patient"]}><PatientAuditPage /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute allowed={["patient"]}><PatientProfilePage /></ProtectedRoute>} />
          <Route path="/patient/symptom-checker" element={<ProtectedRoute allowed={["patient"]}><SymptomCheckerPage /></ProtectedRoute>} />
          <Route path="/patient/hospital-finder" element={<ProtectedRoute allowed={["patient"]}><HospitalFinderPage /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute allowed={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/hospital" element={<ProtectedRoute allowed={["hospital_admin"]}><HospitalDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowed={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute allowed={["emergency_staff", "doctor"]}><EmergencyPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
