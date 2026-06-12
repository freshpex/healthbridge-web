import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Stethoscope, Home } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

export function DoctorSignUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const specialties = [
    "General Practice",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Oncology",
    "Surgery",
    "Emergency Medicine",
    "Radiology",
    "Pathology",
    "Anesthesiology"
  ];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // TODO: Implement doctor signup API call
      // const response = await doctorService.registerDoctor({
      //   fullName,
      //   licenseNumber,
      //   specialty,
      //   hospitalName,
      //   email,
      //   password,
      //   phone
      // });
      // navigate("/signin");

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
              backgroundColor: "#0288D115",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Stethoscope size={28} color="#0288D1" />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: "4px" }}>Doctor account</h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Create your medical professional account</p>
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
            ✓ Registration submitted! You can now sign in with your credentials.
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
                placeholder="Dr. Jane Smith"
              />
            </label>
            <label>
              License number
              <input
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="Medical license #"
              />
            </label>
            <label>
              Specialty
              <select required value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="">Select specialty</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Hospital/Clinic name
              <input
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g., Metro General Hospital"
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
                placeholder="doctor@example.com"
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
            <Stethoscope size={18} />
            {submitting ? "Registering..." : "Create doctor account"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#666", marginTop: "16px" }}>
            Already have an account?{" "}
            <Link to="/signin" style={{ fontWeight: "900", color: "#0F4173" }}>
              Sign in here
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
