import { Link } from "react-router-dom";
import { ArrowRight, FileLock2, Hospital, QrCode, ShieldCheck } from "lucide-react";
import { TopNav } from "../../components/header/top-nav";
import { MetricCard } from "../../components/cards/metric-card";

export function LandingPage() {
  return (
    <>
      <TopNav />
      <main className="landing">
        <section className="hero-section">
          <div className="hero-copy">
            <h1>Medical records, securely connected</h1>
            <p>HealthBridge gives patients control over cross-hospital records, consent sharing, emergency access, and audit visibility from one trusted platform.</p>
            <div className="hero-actions">
              <Link className="primary-button" to="/signup">Create patient account <ArrowRight size={18} /></Link>
              <Link className="secondary-button" to="/signin">View seeded portal</Link>
            </div>
          </div>
          <div className="hero-product" aria-label="HealthBridge dashboard preview">
            <div className="photo-panel" />
            <div className="preview-panel">
              <div className="preview-row"><span>Mercy General</span><strong>Synced</strong></div>
              <div className="preview-row"><span>Consent sharing</span><strong>3 scopes</strong></div>
              <div className="preview-row critical"><span>Emergency code</span><strong>HB-DEMO01</strong></div>
            </div>
          </div>
        </section>
        <section className="feature-band">
          <MetricCard label="Connected hospitals" value="2 approved" tone="blue" icon={<Hospital />} />
          <MetricCard label="Consent shares" value="1 active" tone="teal" icon={<ShieldCheck />} />
          <MetricCard label="Critical records" value="2 ready" tone="green" icon={<FileLock2 />} />
          <MetricCard label="Emergency access" value="Logged" tone="amber" icon={<QrCode />} />
        </section>
        <section className="info-grid">
          {[
            ["How it works", "Patients connect hospitals during signup, then request record sync and authorize scoped access."],
            ["Hospital partnership", "Hospitals register under super-admin approval, verify connections, and manage staff portals."],
            ["Security and privacy", "JWT auth, RBAC, consent records, emergency minimization, rate limiting, and audit logs are built in."],
            ["Production path", "The MVP is wired for MongoDB and deployable API contracts, with notes for HIPAA-grade hardening."]
          ].map(([title, copy]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </section>
        <section className="cta-band">
          <h2>Ready for a full production test presentation</h2>
          <Link className="primary-button" to="/signin">Open HealthBridge</Link>
        </section>
      </main>
    </>
  );
}
