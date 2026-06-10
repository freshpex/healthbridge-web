import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Building2, ClipboardCheck, FileText, HeartPulse, Hospital, LockKeyhole, QrCode, ShieldCheck, Stethoscope, UserCheck } from "lucide-react";
import { TopNav } from "../../components/header/top-nav";
import { MetricCard } from "../../components/cards/metric-card";
import { landingForRole } from "../../utilities/rbac";
import { useAuth } from "../auth/hooks/use-auth";

export function LandingPage() {
  const { booting, user } = useAuth();
  if (!booting && user) return <Navigate to={landingForRole[user.role]} replace />;

  return (
    <>
      <TopNav />
      <main className="landing">
        <section className="hero-section concept-hero">
          <div className="hero-copy">
            <h1>Medical records that follow the patient, with consent.</h1>
            <p>HealthBridge connects patients, hospitals, doctors, and emergency teams through secure record access, governed sharing, and visible audit history.</p>
            <div className="hero-actions">
              <Link className="primary-button" to="/signup">Create patient account <ArrowRight size={18} /></Link>
              <Link className="secondary-button" to="/hospitals"><Building2 size={18} /> For hospitals</Link>
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
        <section className="problem-band">
          <div>
            <span>What HealthBridge solves</span>
            <h2>Care teams should not lose time rebuilding a patient story from scratch.</h2>
          </div>
          <div className="problem-grid">
            <article><HeartPulse size={22} /><h3>Missing history at intake</h3><p>Patients often arrive without complete medication, allergy, diagnosis, and hospital history. HealthBridge keeps the essentials ready.</p></article>
            <article><Hospital size={22} /><h3>Disconnected hospitals</h3><p>Approved hospitals can connect to the same patient profile instead of creating isolated record islands.</p></article>
            <article><FileText size={22} /><h3>Unclear sharing</h3><p>Consent scopes and audit logs make it clear who received access, what they needed, and when it happened.</p></article>
          </div>
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
            <h2>Why hospitals should register</h2>
            <p>HealthBridge gives hospitals a cleaner way to verify patient relationships, coordinate records, and support safer handoffs across facilities without removing patient control.</p>
            <ul>
              <li>Reduce repeated intake questions and missing clinical context.</li>
              <li>Give doctors a governed workspace for connected patients and clinical notes.</li>
              <li>Strengthen patient trust with visible consent and audit history.</li>
            </ul>
          </div>
        </section>
        <section className="privacy-band">
          <div>
            <h2>Security and privacy are product surfaces</h2>
            <p>Authenticated access, role permissions, consent scopes, emergency minimization, and patient-visible audit logs are part of the everyday user flow.</p>
          </div>
          <img src="/images/hospital-team.jpg" alt="Modern hospital clinical team using secure digital systems" />
        </section>
        <section className="cta-band">
          <h2>Build a trusted record bridge for your patients.</h2>
          <Link className="primary-button" to="/signup">Start with HealthBridge</Link>
        </section>
        <footer className="landing-footer">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms and conditions</Link>
          <Link to="/disclaimer">Disclaimer</Link>
        </footer>
      </main>
    </>
  );
}
