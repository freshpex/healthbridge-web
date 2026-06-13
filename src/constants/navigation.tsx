import {
  Activity,
  Ambulance,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Hospital,
  MessageCircle,
  Pill,
  Search,
  Bot,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users
} from "lucide-react";
import type { ReactNode } from "react";
import type { Role } from "../types/domain";

export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const common: NavItem[] = [
  { path: "/app/messages", label: "Messages", icon: <MessageCircle /> },
  { path: "/app/notifications", label: "Notifications", icon: <Bell /> },
  { path: "/app/profile", label: "Profile", icon: <UserRound /> }
];

export const roleNavigation: Record<Role, NavItem[]> = {
  patient: [
    { path: "/app", label: "Overview", icon: <Activity /> },
    { path: "/app/records", label: "Records", icon: <ClipboardList /> },
    { path: "/app/prescriptions", label: "Prescriptions", icon: <Pill /> },
    { path: "/app/appointments", label: "Appointments", icon: <CalendarDays /> },
    { path: "/app/labs", label: "Labs", icon: <FlaskConical /> },
    { path: "/app/sharing", label: "Sharing", icon: <ShieldCheck /> },
    { path: "/app/emergency", label: "Emergency", icon: <Ambulance /> },
    { path: "/app/finder", label: "Hospitals", icon: <Search /> },
    { path: "/app/symptoms-checker", label: "Symptoms", icon: <HeartPulse /> },
    { path: "/app/ai-chat", label: "AI Chat", icon: <Bot /> },
    ...common
  ],
  doctor: [
    { path: "/app", label: "Overview", icon: <Activity /> },
    { path: "/app/patients", label: "Patients", icon: <Users /> },
    { path: "/app/records", label: "Records", icon: <ClipboardList /> },
    { path: "/app/prescriptions", label: "Prescriptions", icon: <Pill /> },
    { path: "/app/appointments", label: "Appointments", icon: <CalendarDays /> },
    { path: "/app/labs", label: "Labs", icon: <FlaskConical /> },
    { path: "/app/emergency", label: "Emergency", icon: <Ambulance /> },
    { path: "/app/symptoms-checker", label: "Symptoms", icon: <HeartPulse /> },
    { path: "/app/ai-chat", label: "AI Chat", icon: <Bot /> },
    ...common
  ],
  hospital_admin: [
    { path: "/app", label: "Overview", icon: <Activity /> },
    { path: "/app/patients", label: "Patients", icon: <Users /> },
    { path: "/app/providers", label: "Staff", icon: <Stethoscope /> },
    { path: "/app/records", label: "Records", icon: <ClipboardList /> },
    { path: "/app/appointments", label: "Appointments", icon: <CalendarDays /> },
    { path: "/app/labs", label: "Labs", icon: <FlaskConical /> },
    { path: "/app/analytics", label: "Analytics", icon: <BarChart3 /> },
    { path: "/app/hospital", label: "Hospital", icon: <Hospital /> },
    ...common
  ],
  super_admin: [
    { path: "/app", label: "Operations", icon: <BarChart3 /> },
    { path: "/app/users", label: "Users", icon: <Users /> },
    { path: "/app/hospitals", label: "Hospitals", icon: <Hospital /> },
    { path: "/app/hospital", label: "Hospital", icon: <Hospital /> },
    { path: "/app/providers", label: "Providers", icon: <Stethoscope /> },
    { path: "/app/appointments", label: "Appointments", icon: <CalendarDays /> },
    { path: "/app/analytics", label: "Analytics", icon: <BarChart3 /> },
    ...common
  ],
  emergency_staff: [
    { path: "/app", label: "Overview", icon: <HeartPulse /> },
    { path: "/app/emergency", label: "Cases", icon: <Ambulance /> },
    { path: "/app/patients", label: "Patients", icon: <Users /> },
    ...common
  ],
  laboratory: [
    { path: "/app", label: "Overview", icon: <Activity /> },
    { path: "/app/labs", label: "Lab Work", icon: <FlaskConical /> },
    { path: "/app/laboratory", label: "Laboratory", icon: <FlaskConical /> },
    { path: "/app/patients", label: "Patients", icon: <Users /> },
    ...common
  ]
};
