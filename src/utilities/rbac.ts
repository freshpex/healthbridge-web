import type { Role } from "../types/domain";

export const landingForRole: Record<Role, string> = {
  patient: "/patient",
  doctor: "/doctor",
  hospital_admin: "/hospital",
  super_admin: "/admin",
  emergency_staff: "/emergency"
};

export const canAccessRoute = (role: Role | undefined, allowed: Role[]) => Boolean(role && allowed.includes(role));
