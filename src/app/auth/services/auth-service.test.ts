import { afterEach, describe, expect, it, vi } from "vitest";
import { authService } from "./auth-service";

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  } as Response);

const session = (role: "hospital_admin" | "laboratory") => ({
  user: { id: "user-1", name: "Test User", email: "test@example.com", role },
  accessToken: "access-token",
  refreshToken: "refresh-token"
});

describe("auth signup services", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits hospital signup to auth signup with hospital_admin role", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(201, { data: session("hospital_admin") }));

    await expect(authService.signupHospital({
      hospitalName: "Metro General",
      email: "admin@metro.example",
      password: "Password123!",
      address: "1 Health Way",
      city: "Lagos",
      state: "Lagos",
      specialties: ["General"]
    })).resolves.toEqual(session("hospital_admin"));

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/signup"), expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        name: "Metro General Admin",
        email: "admin@metro.example",
        password: "Password123!",
        role: "hospital_admin",
        hospital: {
          name: "Metro General",
          address: "1 Health Way",
          city: "Lagos",
          state: "Lagos",
          contactEmail: "admin@metro.example",
          specialties: ["General"]
        }
      })
    }));
  });

  it("surfaces hospital signup API failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(409, { message: "Email already registered" }));

    await expect(authService.signupHospital({
      hospitalName: "Metro General",
      email: "admin@metro.example",
      password: "Password123!",
      address: "1 Health Way",
      city: "Lagos",
      state: "Lagos",
      specialties: ["General"]
    })).rejects.toThrow("Email already registered");
  });

  it("submits laboratory signup to auth signup with laboratory role", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(201, { data: session("laboratory") }));

    await expect(authService.signupLaboratory({
      labName: "Central Diagnostics",
      certificationNumber: "LAB-123",
      department: "Pathology",
      email: "lab@example.com",
      password: "Password123!",
      testCapabilities: ["Blood Tests"],
      hospitalId: "hospital-1"
    })).resolves.toEqual(session("laboratory"));

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/signup"), expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        name: "Central Diagnostics",
        email: "lab@example.com",
        password: "Password123!",
        role: "laboratory",
        labName: "Central Diagnostics",
        certificationNumber: "LAB-123",
        department: "Pathology",
        testCapabilities: ["Blood Tests"],
        hospitalId: "hospital-1"
      })
    }));
  });

  it("surfaces laboratory signup API failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(400, { message: "Lab name, certification number, and department are required" }));

    await expect(authService.signupLaboratory({
      labName: "Central Diagnostics",
      certificationNumber: "LAB-123",
      department: "Pathology",
      email: "lab@example.com",
      password: "Password123!",
      testCapabilities: ["Blood Tests"]
    })).rejects.toThrow("Lab name, certification number, and department are required");
  });

  it("submits emergency staff signup as an approval request", async () => {
    const request = {
      id: "request-1",
      fullName: "Sam Rivera",
      organizationName: "City EMS",
      emergencyRole: "EMT",
      certificationNumber: "EMS-123",
      email: "sam@example.com",
      phone: "+15550123",
      status: "pending"
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(202, { data: request }));

    await expect(authService.requestEmergencyStaffInvite({
      fullName: "Sam Rivera",
      organizationName: "City EMS",
      emergencyRole: "EMT",
      certificationNumber: "EMS-123",
      email: "sam@example.com",
      password: "Password123!",
      phone: "+15550123"
    })).resolves.toEqual(request);

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/emergency-staff/requests"), expect.objectContaining({ method: "POST" }));
  });

  it("surfaces emergency staff request failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(409, { message: "Emergency staff request is already pending" }));

    await expect(authService.requestEmergencyStaffInvite({
      fullName: "Sam Rivera",
      organizationName: "City EMS",
      emergencyRole: "EMT",
      certificationNumber: "EMS-123",
      email: "sam@example.com",
      password: "Password123!",
      phone: "+15550123"
    })).rejects.toThrow("Emergency staff request is already pending");
  });

  it("submits doctor creation through the invite flow", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(201, { data: { id: "doctor-1" } }));

    await expect(authService.inviteDoctor({
      name: "Dr. Jane Smith",
      email: "jane@example.com",
      password: "Password123!",
      specialty: "Cardiology",
      licenseNumber: "MD-123",
      department: "Cardiology"
    }, "admin-token")).resolves.toEqual({ id: "doctor-1" });

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/doctors"), expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer admin-token" })
    }));
  });

  it("surfaces doctor invite failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(403, { message: "You do not have permission for this action" }));

    await expect(authService.inviteDoctor({
      name: "Dr. Jane Smith",
      email: "jane@example.com",
      password: "Password123!",
      specialty: "Cardiology",
      licenseNumber: "MD-123",
      department: "Cardiology"
    }, "patient-token")).rejects.toThrow("You do not have permission for this action");
  });
});
