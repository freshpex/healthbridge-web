import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { authService } from "../services/auth-service";

export function EmergencySignUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  const emergencyRoles = [
    "Paramedic",
    "EMT",
    "Firefighter",
    "Police Officer",
    "Ambulance Driver",
    "Emergency Dispatcher",
    "First Responder",
    "Search & Rescue"
  ];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const request = await authService.requestEmergencyStaffInvite({
        fullName,
        organizationName,
        emergencyRole: role,
        certificationNumber,
        email,
        password,
        phone
      });
      setSuccessMessage(`Verification request ${request.id} submitted. Redirecting to sign in...`);
      setTimeout(() => navigate("/signin"), 1500);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <Link to="/" className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Home size={18} /> Back to home
        </Link>
      </div>
      <section className="auth-panel" style={{ maxWidth: "700px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "10px",
              backgroundColor: "#D32F2F15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <AlertCircle size={28} color="#D32F2F" />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: "4px" }}>Emergency staff account</h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Register to access critical patient data in emergencies</p>
          </div>
        </div>

        {successMessage && (
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "#E8F5E9",
              border: "1px solid #4CAF50",
              color: "#2E7D32",
              marginBottom: "24px",
              fontWeight: "500"
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        <form className="form-stack" onSubmit={submit}>
          <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "12px" }}>Professional Information</h3>
          <div className="form-grid">
            <label>
              Full name
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </label>
            <label>
              Role
              <select required value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select role</option>
                {emergencyRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Organization
              <input
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g., Lagos Fire Service"
              />
            </label>
            <label>
              Certification number
              <input
                required
                value={certificationNumber}
                onChange={(e) => setCertificationNumber(e.target.value)}
                placeholder="Certification #"
              />
            </label>
          </div>

          <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "12px", marginTop: "24px" }}>Contact Information</h3>
          <div className="form-grid">
            <label>
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@organization.com"
              />
            </label>
            <label>
              Phone
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
              />
            </label>
          </div>

          <label>
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <div className="error-state">{error}</div>}

          <button className="primary-button" type="submit" disabled={submitting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
            <AlertCircle size={18} />
            {submitting ? "Submitting..." : "Request emergency access"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#666", marginTop: "16px" }}>
            Already have an account?{" "}
            <Link to="/signin" style={{ fontWeight: "900", color: "#0F4173" }}>
              Sign in here
            </Link>
          </p>
        </form>

        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            borderRadius: "8px",
            backgroundColor: "#FFF3E0",
            border: "1px solid #FFB74D",
            fontSize: "13px",
            color: "#E65100"
          }}
        >
          <strong>Verification Required:</strong> Emergency staff accounts require organization verification. You'll receive a confirmation email within 24 hours.
        </div>
      </section>
    </main>
  );
}
