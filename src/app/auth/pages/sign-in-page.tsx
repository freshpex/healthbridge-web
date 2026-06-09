import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { landingForRole } from "../../../utilities/rbac";
import { useAuth } from "../hooks/use-auth";
import { Logo } from "../../../components/static/logo";

export function SignInPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("patient@healthbridge.test");
  const [password, setPassword] = useState("Password123!");
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
      <section className="auth-panel">
        <Logo />
        <h1>Sign in to HealthBridge</h1>
        <p>Use seeded credentials after running the backend seed script. Every dashboard reads from the API.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <div className="error-state">{error}</div>}
          <button className="primary-button" type="submit" disabled={loading}>
            <ShieldCheck size={18} />
            {loading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>
        <div className="seeded-list">
          <strong>Seeded demo users</strong>
          <span>patient@healthbridge.test, doctor@mercy.test, admin@mercy.test, superadmin@healthbridge.test, emt@healthbridge.test</span>
          <Link to="/signup">Create a new patient account</Link>
        </div>
      </section>
    </main>
  );
}
