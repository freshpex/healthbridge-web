import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, UserPlus, Home } from "lucide-react";
import { TopNav } from "../../../components/header/top-nav";
import { healthbridgeService } from "../../../services/healthbridge-service";
import type { Hospital } from "../../../types/domain";
import { landingForRole } from "../../../utilities/rbac";
import { useAuth } from "../hooks/use-auth";

export function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("New Patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    healthbridgeService.listHospitals()
      .then((items) => {
        if (!alive) return;
        const approved = items.filter((hospital) => hospital.status === "approved");
        setHospitals(approved);
        setSelected(approved.slice(0, 1).map((hospital) => hospital.id));
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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selected.length === 0) {
      setError("Select at least one approved hospital.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const user = await signup({ name, email, password, role: "patient", hospitalIds: selected });
      navigate(landingForRole[user.role]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopNav />
      <div style={{ position: "fixed", top: "20px", left: "20px", zIndex: 100 }}>
        <Link to="/" className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Home size={18} /> Back to home
        </Link>
      </div>
      <main className="signup-page" style={{ marginTop: "20px" }}>
        <section>
          <h1>Create your patient record bridge</h1>
          <p>Select approved hospitals that should verify and sync your records during signup.</p>
          <form className="form-stack signup-form" onSubmit={submit}>
            <div className="form-grid">
              <label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            </div>
            <h2><Building2 size={22} /> Choose hospitals</h2>
            {loading ? <div className="loading-state">Loading registered hospitals...</div> : null}
            {!loading && hospitals.length === 0 ? <div className="empty-state">No approved hospitals are available yet.</div> : null}
            <div className="hospital-selector">
              {hospitals.map((hospital) => (
                <label key={hospital.id} className="select-card">
                  <input
                    type="checkbox"
                    checked={selected.includes(hospital.id)}
                    onChange={() => setSelected((current) => current.includes(hospital.id) ? current.filter((id) => id !== hospital.id) : [...current, hospital.id])}
                  />
                  <strong>{hospital.name}</strong>
                  <span>{hospital.city}, {hospital.state}</span>
                  <small>{hospital.specialties.join(", ")}</small>
                </label>
              ))}
            </div>
            {error && <div className="error-state">{error}</div>}
            <button className="primary-button" type="submit" disabled={submitting || loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <UserPlus size={18} />
              {submitting ? "Creating account..." : "Create patient account"}
            </button>
            <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
              Already have an account? <Link to="/signin" style={{ fontWeight: "900", color: "#0F4173" }}>Sign in</Link>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
