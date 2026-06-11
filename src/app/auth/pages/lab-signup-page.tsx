import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { FlaskConical, Home } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { healthbridgeService } from "../../../services/healthbridge-service";
import type { Hospital } from "../../../types/domain";

export function LabSignUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [labType, setLabType] = useState<"standalone" | "affiliated">("standalone");
  const [labName, setLabName] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [testCapabilities, setTestCapabilities] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const testTypes = [
    "Blood Tests",
    "Urinalysis",
    "Chemistry",
    "Hematology",
    "Microbiology",
    "Immunology",
    "Pathology",
    "Toxicology",
    "Histology",
    "Cytology"
  ];

  useEffect(() => {
    let alive = true;
    healthbridgeService.listHospitals()
      .then((items) => {
        if (!alive) return;
        const approved = items.filter((hospital) => hospital.status === "approved");
        setHospitals(approved);
        if (approved.length > 0) setSelectedHospital(approved[0].id);
      })
      .catch((caught) => {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load hospitals");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleTestCapabilityChange = (test: string) => {
    setTestCapabilities((current) =>
      current.includes(test)
        ? current.filter((t) => t !== test)
        : [...current, test]
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (labType === "affiliated" && !selectedHospital) {
      setError("Please select a hospital.");
      return;
    }
    if (testCapabilities.length === 0) {
      setError("Select at least one test capability.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      // TODO: Implement lab signup API call
      // const response = await labService.registerLab({
      //   labName,
      //   certificationNumber,
      //   department,
      //   hospitalId: labType === "affiliated" ? selectedHospital : undefined,
      //   testCapabilities,
      //   email,
      //   password
      // });
      // navigate("/signin");

      // For now, show success message
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 2000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (user) return <Navigate to="/dashboard" replace />;

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
              backgroundColor: "#7B1FA215",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <FlaskConical size={28} color="#7B1FA2" />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: "4px" }}>Register your laboratory</h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Upload test results and manage patient samples</p>
          </div>
        </div>

        {success && (
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
            ✓ Registration submitted successfully! Our team will review your application and contact you within 24 hours.
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading hospitals...</div>
        ) : (
          <form className="form-stack" onSubmit={submit}>
            <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "12px" }}>Laboratory Type</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px",
                  borderRadius: "8px",
                  border: `2px solid ${labType === "standalone" ? "#7B1FA2" : "#E8ECF1"}`,
                  backgroundColor: labType === "standalone" ? "#7B1FA215" : "#FFF",
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name="lab-type"
                  value="standalone"
                  checked={labType === "standalone"}
                  onChange={(e) => setLabType(e.target.value as "standalone" | "affiliated")}
                />
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>Standalone</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Independent laboratory</div>
                </div>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px",
                  borderRadius: "8px",
                  border: `2px solid ${labType === "affiliated" ? "#7B1FA2" : "#E8ECF1"}`,
                  backgroundColor: labType === "affiliated" ? "#7B1FA215" : "#FFF",
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name="lab-type"
                  value="affiliated"
                  checked={labType === "affiliated"}
                  onChange={(e) => setLabType(e.target.value as "standalone" | "affiliated")}
                />
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>Hospital Affiliated</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Under a hospital</div>
                </div>
              </label>
            </div>

            <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "12px" }}>Laboratory Information</h3>
            <div className="form-grid">
              <label>
                Laboratory name
                <input
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g., Central Diagnostic Lab"
                />
              </label>
              <label>
                Certification number
                <input
                  required
                  value={certificationNumber}
                  onChange={(e) => setCertificationNumber(e.target.value)}
                  placeholder="Lab certification #"
                />
              </label>
              <label>
                Department
                <input
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Clinical Laboratory"
                />
              </label>
              {labType === "affiliated" && (
                <label>
                  Associated Hospital
                  <select required value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)}>
                    <option value="">Select hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "12px", marginTop: "24px" }}>Test Capabilities</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {testTypes.map((test) => (
                <label
                  key={test}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #E8ECF1",
                    cursor: "pointer",
                    backgroundColor: testCapabilities.includes(test) ? "#7B1FA215" : "#FFF"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={testCapabilities.includes(test)}
                    onChange={() => handleTestCapabilityChange(test)}
                  />
                  <span style={{ fontSize: "14px" }}>{test}</span>
                </label>
              ))}
            </div>

            <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "12px", marginTop: "24px" }}>Account Information</h3>
            <div className="form-grid">
              <label>
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lab@example.com"
                />
              </label>
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
            </div>

            {error && <div className="error-state">{error}</div>}

            <button className="primary-button" type="submit" disabled={submitting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
              <FlaskConical size={18} />
              {submitting ? "Submitting..." : "Register laboratory"}
            </button>

            <p style={{ textAlign: "center", fontSize: "13px", color: "#666", marginTop: "16px" }}>
              Already have an account?{" "}
              <Link to="/signin" style={{ fontWeight: "900", color: "#0F4173" }}>
                Sign in here
              </Link>
            </p>
          </form>
        )}

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
          <strong>Note:</strong> Laboratory registrations require verification. Your registration will be reviewed within 24 hours, and you'll receive an email with your login credentials once approved.
        </div>
      </section>
    </main>
  );
}
