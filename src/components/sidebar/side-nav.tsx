import { NavLink } from "react-router-dom";
import { Activity, Ambulance, Building2, ClipboardList, ShieldCheck, UserRound } from "lucide-react";
import type { Role } from "../../types/domain";

const links: Record<Role, Array<{ to: string; label: string; icon: typeof Activity }>> = {
  patient: [
    { to: "/patient", label: "Profile", icon: UserRound },
    { to: "/patient#records", label: "Records", icon: ClipboardList },
    { to: "/patient#sharing", label: "Sharing", icon: ShieldCheck },
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
      {links[role].map((item) => {
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
