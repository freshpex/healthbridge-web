import { NavLink } from "react-router-dom";
import type { Role } from "../../types/domain";
import { roleNavigation } from "./role-navigation";

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
