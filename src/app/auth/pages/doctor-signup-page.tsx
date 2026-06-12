import { Link, Navigate } from "react-router-dom";
import { Home, ShieldCheck, Stethoscope } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

export function DoctorSignUpPage() {
  const { user } = useAuth();

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
              backgroundColor: "#0288D115",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Stethoscope size={28} color="#0288D1" />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: "4px" }}>Doctor accounts are invite-only</h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
              HealthBridge doctors are created by a verified hospital administrator.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "18px",
            borderRadius: "10px",
            backgroundColor: "#E3F2FD",
            border: "1px solid #90CAF9",
            color: "#0D47A1",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <ShieldCheck size={22} />
            <div>
              <strong>Ask your hospital administrator for an invitation.</strong>
              <p style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: 1.5 }}>
                Hospital admins use the existing doctor invite flow to create your account with your specialty,
                license number, department, and hospital assignment. You can sign in after that invite is created.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/signin" className="primary-button" style={{ textAlign: "center" }}>
            Sign in with invited account
          </Link>
          <Link to="/auth/hospital-signup" className="secondary-button" style={{ textAlign: "center" }}>
            Register a hospital
          </Link>
        </div>
      </section>
    </main>
  );
}
