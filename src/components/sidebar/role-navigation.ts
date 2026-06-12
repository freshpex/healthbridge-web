import { Activity, Ambulance, Bell, Building2, CalendarDays, ClipboardList, FlaskConical, History, MessageCircle, Pill, ShieldCheck, Stethoscope, UserRound, UsersRound } from "lucide-react";
import type { Role } from "../../types/domain";

export const roleNavigation: Record<Role, Array<{ to: string; label: string; icon: typeof Activity }>> = {
  patient: [
    { to: "/patient", label: "Dashboard", icon: Activity },
    { to: "/patient/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/patient/records", label: "Records", icon: ClipboardList },
    { to: "/patient/labs", label: "Lab results", icon: FlaskConical },
    { to: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
    { to: "/patient/sharing", label: "Consultations", icon: MessageCircle },
    { to: "/patient/audit", label: "Audit", icon: History },
    { to: "/patient/notifications", label: "Notifications", icon: Bell },
    { to: "/emergency/cases", label: "Emergency cases", icon: Ambulance },
    { to: "/patient/profile", label: "Profile", icon: UserRound }
  ],
  doctor: [
    { to: "/doctor", label: "Dashboard", icon: Activity },
    { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/doctor/patients", label: "Patients", icon: UsersRound },
    { to: "/doctor/messages", label: "Consultations", icon: MessageCircle },
    { to: "/doctor/notifications", label: "Notifications", icon: Bell },
    { to: "/emergency/cases", label: "Emergency cases", icon: Ambulance },
    { to: "/doctor/profile", label: "Profile", icon: UserRound }
  ],
  hospital_admin: [
    { to: "/hospital", label: "Dashboard", icon: Building2 },
    { to: "/hospital/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/hospital/staff", label: "Staff / doctors", icon: Stethoscope },
    { to: "/hospital/patients", label: "Patients", icon: UsersRound },
    { to: "/hospital/operations", label: "Operations", icon: ShieldCheck },
    { to: "/hospital/notifications", label: "Notifications", icon: Bell },
    { to: "/emergency/cases", label: "Emergency cases", icon: Ambulance },
    { to: "/hospital/profile", label: "Profile", icon: UserRound }
  ],
  super_admin: [
    { to: "/admin", label: "Dashboard", icon: ShieldCheck },
    { to: "/admin/users", label: "Users", icon: UsersRound },
    { to: "/admin/hospitals", label: "Hospitals", icon: Building2 },
    { to: "/admin/operations", label: "Operations", icon: Activity },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/emergency/cases", label: "Emergency cases", icon: Ambulance },
    { to: "/admin/profile", label: "Profile", icon: UserRound }
  ],
  emergency_staff: [
    { to: "/emergency", label: "Dashboard", icon: Ambulance },
    { to: "/emergency/requests", label: "Requests", icon: ClipboardList },
    { to: "/emergency/cases", label: "Cases", icon: Activity },
    { to: "/emergency/notifications", label: "Notifications", icon: Bell },
    { to: "/emergency/profile", label: "Profile", icon: UserRound }
  ],
  laboratory: [
    { to: "/laboratory", label: "Dashboard", icon: FlaskConical },
    { to: "/laboratory/requests", label: "Test requests", icon: ClipboardList },
    { to: "/laboratory/results", label: "Results", icon: Activity },
    { to: "/laboratory/notifications", label: "Notifications", icon: Bell },
    { to: "/laboratory/patients", label: "Patients", icon: UsersRound },
    { to: "/laboratory/profile", label: "Profile", icon: UserRound }
  ]
};
