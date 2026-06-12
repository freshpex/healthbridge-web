import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, Home } from "lucide-react";
import { landingForRole } from "../../../utilities/rbac";
import { useAuth } from "../hooks/use-auth";
import { Logo } from "../../../components/static/logo";

export function SignInPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={landingForRole[user.role]} replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const signedIn = await login(email, password);
      navigate(landingForRole[signedIn.role]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <Link to="/" className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Home size={18} /> Back to home
        </Link>
      </div>
      <section className="auth-panel">
        <Logo />
        <h1>Sign in to HealthBridge</h1>
        <p>Access your patient, hospital, doctor, emergency, or admin workspace with your HealthBridge account.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <div className="error-state">{error}</div>}
          <button className="primary-button" type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <ShieldCheck size={18} />
            {loading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>
        <div className="account-help">
          <p>Don't have an account?</p>
          <Link to="/auth/role-select">Create a new account</Link>
        </div>
      </section>
    </main>
  );
}
