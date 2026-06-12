import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Building2, Home } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

export function HospitalSignUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const availableSpecialties = [
    "General",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Oncology",
    "Surgery",
    "Emergency",
    "ICU",
    "Radiology",
    "Pathology"
  ];

  const handleSpecialtyChange = (specialty: string) => {
    setSpecialties((current) =>
      current.includes(specialty)
        ? current.filter((s) => s !== specialty)
        : [...current, specialty]
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (specialties.length === 0) {
      setError("Select at least one specialty.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      // TODO: Implement hospital signup API call
      // const response = await hospitalService.registerHospital({
      //   name: hospitalName,
      //   email,
      //   password,
      //   address,
      //   city,
      //   state,
      //   contactPhone,
      //   specialties
      // });
      // navigate("/signin");
      
      // For now, show a placeholder success message
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 2000);
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
              backgroundColor: "#1565C015",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Building2 size={28} color="#1565C0" />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: "4px" }}>Register your hospital</h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Join HealthBridge and improve patient care coordination</p>
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

        <form className="form-stack" onSubmit={submit}>
          <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "12px", marginTop: "24px" }}>Hospital Information</h3>
          <div className="form-grid">
            <label>
              Hospital name
              <input
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g., Metro General Hospital"
              />
            </label>
            <label>
              City
              <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Lagos" />
            </label>
            <label>
              State/Region
              <input required value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g., Lagos State" />
            </label>
            <label>
              Contact Phone
              <input
                required
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+234..."
              />
            </label>
          </div>

          <label>
            Address
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, building number, etc."
              rows={2}
              style={{ resize: "vertical" }}
            />
          </label>

          <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "12px", marginTop: "24px" }}>Specialties</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {availableSpecialties.map((specialty) => (
              <label
                key={specialty}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #E8ECF1",
                  cursor: "pointer",
                  backgroundColor: specialties.includes(specialty) ? "#0F417315" : "#FFF"
                }}
              >
                <input
                  type="checkbox"
                  checked={specialties.includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                />
                <span style={{ fontSize: "14px" }}>{specialty}</span>
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
                placeholder="admin@hospital.com"
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
            <Building2 size={18} />
            {submitting ? "Submitting..." : "Submit hospital registration"}
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
          <strong>Note:</strong> HealthBridge approval required. Your registration will be reviewed within 24 hours. You'll receive an email with your login credentials once approved.
        </div>
      </section>
    </main>
  );
}
