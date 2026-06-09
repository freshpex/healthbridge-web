import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { demoPassword, demoUsers } from "../../../constants/mock-data";
import { landingForRole } from "../../../utilities/rbac";
import { useAuth } from "../hooks/use-auth";
import { Logo } from "../../../components/static/logo";

export function SignInPage() {
  const { user, login, selectPersona } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("patient@healthbridge.test");
  const [password, setPassword] = useState(demoPassword);
  const [error, setError] = useState("");

  if (user) return <Navigate to={landingForRole[user.role]} replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      const selected = demoUsers.find((candidate) => candidate.email === email);
      navigate(selected ? landingForRole[selected.role] : "/patient");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Logo />
        <h1>Sign in to HealthBridge</h1>
        <p>Use seeded users for a production-style walkthrough, or connect to the backend API.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <div className="error-state">{error}</div>}
          <button className="primary-button" type="submit">Sign in securely</button>
        </form>
        <div className="persona-grid">
          {demoUsers.map((candidate) => (
            <button key={candidate.email} onClick={() => { selectPersona(candidate); navigate(landingForRole[candidate.role]); }}>
              <strong>{candidate.name}</strong>
              <span>{candidate.role.replace("_", " ")}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
