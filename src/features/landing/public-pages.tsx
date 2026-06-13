import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Logo } from "../../components/ui/logo";

const sections = {
  contact: {
    title: "Contact HealthBridge",
    body: "Reach the HealthBridge team for hospital onboarding, platform support, partnership requests, or implementation questions.",
    rows: ["hello@healthbridge.local", "Implementation support for hospitals, labs, emergency teams, and patient programs", "Response target: one business day"]
  },
  privacy: {
    title: "Privacy Policy",
    body: "HealthBridge is designed around patient control, role-based access, auditability, and secure handling of healthcare records.",
    rows: ["Only authenticated users can access protected workspace data", "Emergency access is audited", "Patients can review sharing and access history", "Tokens are stored client-side and refreshed through the backend refresh flow"]
  },
  terms: {
    title: "Terms and Conditions",
    body: "Use HealthBridge responsibly as a healthcare coordination platform. Clinical decisions remain the responsibility of licensed professionals.",
    rows: ["Do not use symptom assessment as a diagnosis", "Do not access patient information without authorization", "Keep account credentials private", "Follow applicable healthcare privacy laws and organizational policies"]
  }
} as const;

export function PublicInfoPage({ type }: { type: keyof typeof sections }) {
  const page = sections[type];
  return (
    <main className="auth-page public-info-page">
      <section className="auth-card public-info-card">
        <Logo />
        <p className="eyebrow">HealthBridge</p>
        <h1>{page.title}</h1>
        <p className="muted">{page.body}</p>
        <div className="stack">
          {page.rows.map((row) => <div className="list-row" key={row}><strong>{row}</strong></div>)}
        </div>
        <div className="hero-actions">
          <Link to="/register"><Button>Create Account</Button></Link>
          <Link to="/"><Button variant="ghost">Back Home</Button></Link>
        </div>
      </section>
    </main>
  );
}
