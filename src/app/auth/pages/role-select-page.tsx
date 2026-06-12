import { Link } from "react-router-dom";
import { Users, Building2, Stethoscope, AlertCircle, Home } from "lucide-react";

const roles = [
  {
    id: "patient",
    label: "Patient",
    description: "Connect hospitals, manage medical records, control access",
    icon: Users,
    color: "#0F4173",
    path: "/signup"
  },
  {
    id: "hospital",
    label: "Hospital",
    description: "Register your hospital, manage staff, access patient records",
    icon: Building2,
    color: "#1565C0",
    path: "/auth/hospital-signup"
  },
  {
    id: "doctor",
    label: "Doctor",
    description: "Create doctor account, manage patients, upload records",
    icon: Stethoscope,
    color: "#0288D1",
    path: "/auth/doctor-signup"
  },
  {
    id: "emergency",
    label: "Emergency Staff",
    description: "Quick access to patient records in emergency situations",
    icon: AlertCircle,
    color: "#D32F2F",
    path: "/auth/emergency-signup"
  }
];

export function RoleSelectPage() {
  return (
    <main className="auth-page">
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <Link to="/" className="secondary-button" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Home size={18} /> Back to home
        </Link>
      </div>
      <section className="auth-panel" style={{ maxWidth: "900px" }}>
        <h1 style={{ marginBottom: "16px" }}>Join HealthBridge</h1>
        <p style={{ marginBottom: "48px", fontSize: "16px", color: "#666" }}>
          Select your role to create an account. Already have an account?{" "}
          <Link to="/signin" style={{ fontWeight: "900", color: "#0F4173" }}>Sign in here</Link>
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "32px"
          }}
        >
          {roles.map(({ id, label, description, icon: Icon, color, path }) => (
            <Link
              key={id}
              to={path}
              style={{
                padding: "32px",
                borderRadius: "12px",
                border: "2px solid #E8ECF1",
                backgroundColor: "#FFF",
                cursor: "pointer",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.boxShadow = `0 8px 24px ${color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E8ECF1";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "8px",
                    backgroundColor: `${color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "900", margin: 0, color }}>{label}</h3>
              </div>
              <p style={{ fontSize: "14px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                {description}
              </p>
            </Link>
          ))}
        </div>

        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#F5FAFB",
            border: "1px solid #E8ECF1",
            fontSize: "13px",
            color: "#666",
            textAlign: "center"
          }}
        >
          <strong>Hospital Admins:</strong> HealthBridge will review and approve hospital registrations before staff access is granted.
        </div>
      </section>
    </main>
  );
}
