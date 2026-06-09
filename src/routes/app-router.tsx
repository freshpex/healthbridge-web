import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminDashboard } from "../app/admin/admin-dashboard";
import { SignInPage } from "../app/auth/pages/sign-in-page";
import { SignUpPage } from "../app/auth/pages/sign-up-page";
import { DoctorDashboard } from "../app/doctor/doctor-dashboard";
import { EmergencyPage } from "../app/emergency/emergency-page";
import { HospitalDashboard } from "../app/hospital/hospital-dashboard";
import { LandingPage } from "../app/landing/landing-page";
import { PatientDashboard } from "../app/patient/patient-dashboard";
import { AuthProvider } from "../app/auth/hooks/auth-provider";
import { ProtectedRoute } from "./protected-route";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/patient" element={<ProtectedRoute allowed={["patient"]}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute allowed={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/hospital" element={<ProtectedRoute allowed={["hospital_admin"]}><HospitalDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowed={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute allowed={["emergency_staff", "doctor"]}><EmergencyPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
