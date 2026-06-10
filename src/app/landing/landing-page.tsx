import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, Hospital, LockKeyhole, QrCode, ShieldCheck, Stethoscope, UserCheck } from "lucide-react";
import { TopNav } from "../../components/header/top-nav";
import { MetricCard } from "../../components/cards/metric-card";

export function LandingPage() {
  return (
    <>
      <TopNav />
      <main className="landing">
        <section className="hero-section concept-hero">
          <div className="hero-copy">
            <h1>Medical records, securely connected</h1>
            <p>HealthBridge connects you and your healthcare providers to share and access medical records securely.</p>
            <div className="hero-actions">
              <Link className="primary-button" to="/signup">Get started <ArrowRight size={18} /></Link>
              <Link className="secondary-button" to="/signin">Learn more</Link>
            </div>
          </div>
          <div className="hero-product concept-product" aria-label="HealthBridge dashboard preview">
            <div className="photo-panel" />
            <div className="phone-preview" aria-hidden="true">
              <div className="phone-top">9:41</div>
              <div className="phone-brand">HealthBridge</div>
              <p>Welcome back,<strong> Sarah</strong></p>
              <div className="phone-emergency">
                <span>Emergency access</span>
                <strong>HB7X-9K2L-P4Q8</strong>
              </div>
              <div className="phone-list">
                <span>Cityview Medical Center <b>Connected</b></span>
                <span>Lakeside Community Hospital <b>Connected</b></span>
                <span>Metro Specialty Clinic <b>Connected</b></span>
              </div>
            </div>
          </div>
        </section>
        <section className="feature-band concept-feature-band">
          <MetricCard label="Secure" value="End-to-end encryption and privacy by design" tone="teal" icon={<ShieldCheck />} />
          <MetricCard label="Connected" value="Seamless sharing across trusted hospitals" tone="teal" icon={<Hospital />} />
          <MetricCard label="In control" value="You decide who can access your records" tone="blue" icon={<UserCheck />} />
          <MetricCard label="Emergency-ready" value="Critical access with full audit visibility" tone="amber" icon={<QrCode />} />
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
          <img src="/images/doctor-workstation.jpg" alt="Clinician reviewing secure patient records on a hospital workstation" />
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
          <img src="/images/hospital-team.jpg" alt="Modern hospital clinical team using secure digital systems" />
        </section>
        <section className="cta-band">
          <h2>Ready for a full production test presentation</h2>
          <Link className="primary-button" to="/signin">Open HealthBridge</Link>
        </section>
      </main>
    </>
  );
}
