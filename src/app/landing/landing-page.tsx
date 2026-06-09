import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, FileLock2, Hospital, LockKeyhole, QrCode, ShieldCheck, Stethoscope, UserCheck } from "lucide-react";
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
              <Link className="secondary-button" to="/signin">Open secure portal</Link>
            </div>
          </div>
          <div className="hero-product" aria-label="HealthBridge dashboard preview">
            <div className="photo-panel" />
            <div className="preview-panel">
              <div className="preview-heading">Live care bridge</div>
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
        <section className="workflow-band">
          <div>
            <h2>One record bridge from signup to emergency care</h2>
            <p>Patients choose approved hospitals during signup. Care teams see only the patients and data they are allowed to access. Emergency staff resolve a patient code into critical data first, with every view written to the audit trail.</p>
          </div>
          <div className="workflow-steps">
            {[
              { Icon: UserCheck, title: "Patient connects hospitals", copy: "Approved hospitals are linked during account creation." },
              { Icon: Stethoscope, title: "Staff adds records", copy: "Doctors and hospital admins upload diagnoses, labs, prescriptions, and notes." },
              { Icon: LockKeyhole, title: "Consent controls access", copy: "Patients create scoped shares and revoke them at any time." },
              { Icon: ClipboardCheck, title: "Audit trail stays visible", copy: "Sensitive access is logged for later patient review." }
            ].map(({ Icon: StepIcon, title, copy }) => {
              return (
                <article key={title}>
                  <StepIcon size={22} />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="image-story">
          <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=85" alt="Clinician reviewing secure patient records on a hospital workstation" />
          <div>
            <h2>Built for serious hospital demos</h2>
            <p>Seeded hospitals, doctors, patients, consent grants, emergency codes, audit logs, and clinical records let stakeholders walk through a full production-style presentation without manual setup.</p>
            <ul>
              <li>Role-based portals for patients, doctors, hospital admins, super admins, and emergency staff.</li>
              <li>Cloudinary-capable uploads with local development fallback.</li>
              <li>MongoDB relationships for hospitals, staff, connected patients, and scoped sharing.</li>
            </ul>
          </div>
        </section>
        <section className="privacy-band">
          <div>
            <h2>Security and privacy are product surfaces</h2>
            <p>JWT auth, refresh tokens, RBAC, consent sharing, rate limiting, Helmet headers, emergency minimization, and patient-visible audit logs are part of the working MVP.</p>
          </div>
          <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=85" alt="Modern hospital clinical team using secure digital systems" />
        </section>
        <section className="cta-band">
          <h2>Ready for a full production test presentation</h2>
          <Link className="primary-button" to="/signin">Open HealthBridge</Link>
        </section>
      </main>
    </>
  );
}
