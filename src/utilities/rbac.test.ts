import { describe, expect, it } from "vitest";
import { canAccessRoute, landingForRole } from "./rbac";

describe("web RBAC helpers", () => {
  it("routes seeded roles to the right dashboard", () => {
    expect(landingForRole.patient).toBe("/patient");
    expect(landingForRole.emergency_staff).toBe("/emergency");
  });

  it("blocks roles outside protected route allow lists", () => {
    expect(canAccessRoute("doctor", ["doctor", "emergency_staff"])).toBe(true);
    expect(canAccessRoute("patient", ["doctor", "emergency_staff"])).toBe(false);
  });
});
