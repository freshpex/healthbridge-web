import { NavLink } from "react-router-dom";
import { Activity, Ambulance, Building2, CalendarDays, ClipboardList, FlaskConical, History, Pill, ShieldCheck, Share2, UserRound } from "lucide-react";
import type { Role } from "../../types/domain";

export const roleNavigation: Record<Role, Array<{ to: string; label: string; icon: typeof Activity }>> = {
  patient: [
    { to: "/patient", label: "Dashboard", icon: Activity },
    { to: "/patient/profile", label: "Profile", icon: UserRound },
    { to: "/patient/records", label: "Records", icon: ClipboardList },
    { to: "/patient/labs", label: "Labs", icon: FlaskConical },
    { to: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
    { to: "/patient/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/patient/sharing", label: "Sharing", icon: Share2 },
    { to: "/patient/audit", label: "Audit", icon: History },
    { to: "/patient#emergency", label: "Emergency", icon: Ambulance }
  ],
  doctor: [{ to: "/doctor", label: "Portal", icon: Activity }],
  hospital_admin: [{ to: "/hospital", label: "Hospital", icon: Building2 }],
  super_admin: [{ to: "/admin", label: "Admin", icon: ShieldCheck }],
  emergency_staff: [{ to: "/emergency", label: "Emergency", icon: Ambulance }]
};

export function SideNav({ role }: { role: Role }) {
  return (
    <aside className="side-nav">
      {roleNavigation[role].map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.label} to={item.to}>
            <Icon size={18} /> {item.label}
          </NavLink>
        );
      })}
    </aside>
  );
}
