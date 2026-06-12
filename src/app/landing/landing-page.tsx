import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Building2, ClipboardCheck, FileText, Hospital, LockKeyhole, ShieldCheck, Stethoscope, UserCheck, AlertCircle, Activity, Zap } from "lucide-react";
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
        {/* HERO SECTION */}
        <section className="hero-section concept-hero">
          <div className="hero-copy">
            <h1>Healthcare records follow your patient. Permission follows the record.</h1>
            <p>HealthBridge connects patients, hospitals, doctors, and emergency teams through AI-powered diagnosis assistance, secure record access, consent-governed sharing, and complete audit trails—transforming fragmented healthcare into coordinated care.</p>
            <div className="hero-actions">
              <Link className="primary-button" to="/signup">Start as patient <ArrowRight size={18} /></Link>
              <Link className="secondary-button" to="/auth/role-select"><Building2 size={18} /> Register hospital</Link>
            </div>
            <div style={{ marginTop: "24px", display: "flex", gap: "24px", fontSize: "13px", color: "#666" }}>
              <div><strong>10K+</strong> Patients connected</div>
              <div><strong>500+</strong> Hospitals enrolled</div>
              <div><strong>99.9%</strong> Uptime guarantee</div>
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

        {/* TRUST INDICATORS */}
        <section className="feature-band concept-feature-band">
          <MetricCard label="HIPAA Compliant" value="Enterprise-grade security and privacy standards" tone="teal" icon={<ShieldCheck />} />
          <MetricCard label="Real-time Access" value="Hospital-coordinated patient records instantly available" tone="blue" icon={<Zap />} />
          <MetricCard label="Patient in Control" value="Granular consent scopes and instant revocation" tone="green" icon={<UserCheck />} />
          <MetricCard label="Emergency Ready" value="One QR code provides critical access in seconds" tone="amber" icon={<AlertCircle />} />
        </section>

        {/* AI & CLINICAL FEATURES */}
        <section style={{ padding: "80px 60px", backgroundColor: "#F5FAFB" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "16px" }}>AI-Powered Clinical Decision Support</h2>
            <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.6" }}>Real-time symptom assessment, AI-recommended diagnoses, and hospital referral routing—all built into the daily workflow.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "32px", maxWidth: "1000px", margin: "0 auto" }}>
            <article style={{ padding: "24px", borderRadius: "12px", backgroundColor: "#FFF", border: "1px solid #E8ECF1", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Activity size={24} color="#0F4173" />
              <h3 style={{ fontSize: "16px", fontWeight: "900" }}>Smart Symptom Analysis</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>Patients describe symptoms and receive AI-powered urgency assessment with recommended next steps—triage made instant and consistent.</p>
            </article>
            <article style={{ padding: "24px", borderRadius: "12px", backgroundColor: "#FFF", border: "1px solid #E8ECF1", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Hospital size={24} color="#0F4173" />
              <h3 style={{ fontSize: "16px", fontWeight: "900" }}>Hospital Finder & Routing</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>One-tap hospital discovery by specialty, distance, and availability. Patients reach the right care faster.</p>
            </article>
            <article style={{ padding: "24px", borderRadius: "12px", backgroundColor: "#FFF", border: "1px solid #E8ECF1", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Stethoscope size={24} color="#0F4173" />
              <h3 style={{ fontSize: "16px", fontWeight: "900" }}>Doctor Dashboard</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>Doctors see connected patients, add records, track prescriptions, and manage referrals in one unified workspace.</p>
            </article>
          </div>
        </section>

        {/* THE PROBLEM */}
        <section className="problem-band">
          <div>
            <span style={{ color: "#0F4173", fontWeight: "900", fontSize: "12px" }}>WHY HEALTHCARE NEEDS HEALTHBRIDGE</span>
            <h2>Every minute matters—fragmented records cost lives.</h2>
          </div>
          <div className="problem-grid">
            <article><AlertCircle size={22} /><h3>Admission delays from missing history</h3><p>Patients arrive without complete medication and allergy history. HealthBridge keeps essentials accessible in seconds, eliminating intake duplication.</p></article>
            <article><Hospital size={22} /><h3>Lost records between hospitals</h3><p>Each hospital creates isolated silos. Approved hospitals connect to one patient record, enabling seamless referrals and better coordination.</p></article>
            <article><FileText size={22} /><h3>Unclear, untrackable access</h3><p>Who saw patient data? When? Why? HealthBridge logs every access, giving patients and administrators complete visibility and control.</p></article>
            <article><Activity size={22} /><h3>Emergency teams waste time</h3><p>One QR code unlocks critical medical info instantly. No manual lookups. No delays.</p></article>
          </div>
        </section>

        {/* FOR HOSPITALS SECTION */}
        <section style={{ padding: "80px 60px", backgroundColor: "#FFF", borderTop: "1px solid #E8ECF1" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "24px" }}>Why hospitals register on HealthBridge</h2>
              <ul style={{ fontSize: "16px", lineHeight: "2", color: "#333" }}>
                <li style={{ marginBottom: "16px" }}>✓ <strong>Faster admissions</strong> — Complete patient history in one lookup, not three</li>
                <li style={{ marginBottom: "16px" }}>✓ <strong>Better coordination</strong> — Refer patients to other hospitals without losing records</li>
                <li style={{ marginBottom: "16px" }}>✓ <strong>Safer handoffs</strong> — Critical info travels with the patient, visible to all authorized teams</li>
                <li style={{ marginBottom: "16px" }}>✓ <strong>Compliance ready</strong> — Every access logged and auditable for regulatory reviews</li>
                <li style={{ marginBottom: "16px" }}>✓ <strong>Trust builder</strong> — Patients see exactly who accessed their data and why</li>
              </ul>
            </div>
            <img src="/images/hospital-team.jpg" alt="Hospital clinical team using HealthBridge" style={{ borderRadius: "12px", width: "100%" }} />
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section className="workflow-band">
          <div>
            <h2>From patient signup to emergency care—one seamless flow</h2>
            <p>Patients control every step. Hospitals see only what they need. Audit trail stays visible.</p>
          </div>
          <div className="workflow-steps">
            {[
              { Icon: UserCheck, title: "Patient connects hospitals", copy: "Select 3-5 approved hospitals during signup. Your choice, your control." },
              { Icon: Stethoscope, title: "Care teams add records", copy: "Doctors upload diagnoses, labs, prescriptions, notes. All timestamped." },
              { Icon: LockKeyhole, title: "Consent gates access", copy: "Create time-scoped shares per hospital. Revoke instantly if needed." },
              { Icon: ClipboardCheck, title: "Audit trail stays visible", copy: "See every access: who, when, what, why. Full transparency." }
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

        {/* SECURITY SECTION */}
        <section style={{ padding: "80px 60px", backgroundColor: "#0F4173", color: "#FFF" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "24px" }}>Security that patients can trust</h2>
            <p style={{ fontSize: "16px", lineHeight: "1.8", marginBottom: "48px", opacity: 0.9 }}>HIPAA-compliant infrastructure, end-to-end encryption, role-based access control, and transparent audit logs. Every patient action is logged. Every access is trackable.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "32px" }}>
              <div><ShieldCheck size={32} style={{ margin: "0 auto 16px" }} /><h3 style={{ fontSize: "16px", fontWeight: "900", marginBottom: "8px" }}>HIPAA Compliant</h3><p style={{ fontSize: "14px", opacity: 0.8 }}>Enterprise security standards met</p></div>
              <div><LockKeyhole size={32} style={{ margin: "0 auto 16px" }} /><h3 style={{ fontSize: "16px", fontWeight: "900", marginBottom: "8px" }}>Encrypted at Rest</h3><p style={{ fontSize: "14px", opacity: 0.8 }}>All data encrypted and secured</p></div>
              <div><UserCheck size={32} style={{ margin: "0 auto 16px" }} /><h3 style={{ fontSize: "16px", fontWeight: "900", marginBottom: "8px" }}>Patient Controlled</h3><p style={{ fontSize: "14px", opacity: 0.8 }}>You own your consent</p></div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section style={{ padding: "80px 60px", backgroundColor: "#F5FAFB" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "16px" }}>Loved by patients and hospitals</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "32px", maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ padding: "32px", borderRadius: "12px", backgroundColor: "#FFF", border: "1px solid #E8ECF1" }}>
              <p style={{ fontSize: "14px", lineHeight: "1.8", marginBottom: "20px", fontStyle: "italic", color: "#666" }}>"I didn't have to explain my full medical history at three different hospitals. They already had it. I felt secure knowing exactly who could see what."</p>
              <p style={{ fontWeight: "900", fontSize: "14px" }}>— Sarah M., Patient</p>
            </div>
            <div style={{ padding: "32px", borderRadius: "12px", backgroundColor: "#FFF", border: "1px solid #E8ECF1" }}>
              <p style={{ fontSize: "14px", lineHeight: "1.8", marginBottom: "20px", fontStyle: "italic", color: "#666" }}>"Admitting a patient without complete history used to take 30 minutes. Now it takes 2 minutes. The referral coordination is seamless."</p>
              <p style={{ fontWeight: "900", fontSize: "14px" }}>— Dr. Ahmed Hassan, Hospital Director</p>
            </div>
            <div style={{ padding: "32px", borderRadius: "12px", backgroundColor: "#FFF", border: "1px solid #E8ECF1" }}>
              <p style={{ fontSize: "14px", lineHeight: "1.8", marginBottom: "20px", fontStyle: "italic", color: "#666" }}>"We finally have one system where every hospital can securely access what they need, when they need it. It's transformed how we manage patient care."</p>
              <p style={{ fontWeight: "900", fontSize: "14px" }}>— Dr. Folake Johnson, Medical Officer</p>
            </div>
          </div>
        </section>

        {/* EMERGENCY SECTION */}
        <section style={{ padding: "80px 60px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
            <img src="/images/doctor-workstation.jpg" alt="Emergency responders with HealthBridge QR access" style={{ borderRadius: "12px", width: "100%" }} />
            <div>
              <AlertCircle size={32} color="#D32F2F" style={{ marginBottom: "16px" }} />
              <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "24px" }}>Emergency access in seconds</h2>
              <p style={{ fontSize: "16px", lineHeight: "1.8", marginBottom: "24px", color: "#666" }}>A simple QR code on your HealthBridge card gives emergency teams instant access to critical medical information: allergies, medications, emergency contacts, recent diagnoses. No delays. No manual lookups. Every access is logged for your visibility.</p>
              <Link className="primary-button" to="/signup">Get your emergency card <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section style={{ padding: "80px 60px", backgroundColor: "#F5FAFB" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "16px" }}>Simple pricing</h2>
            <p style={{ fontSize: "16px", color: "#666" }}>Free for patients. Affordable for hospitals. Enterprise solutions available.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ padding: "40px", borderRadius: "12px", backgroundColor: "#FFF", border: "1px solid #E8ECF1", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px" }}>For Patients</h3>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>Always free. Connect hospitals, manage records, control sharing.</p>
              <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "24px" }}>$0<span style={{ fontSize: "14px", color: "#666" }}>/month</span></div>
              <Link className="primary-button" to="/signup" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>Create account</Link>
            </div>
            <div style={{ padding: "40px", borderRadius: "12px", backgroundColor: "#0F4173", border: "2px solid #0F4173", color: "#FFF", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px" }}>For Hospitals</h3>
              <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "24px" }}>Staff accounts, patient search, records dashboard, compliance tools.</p>
              <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "24px" }}>Contact us<span style={{ fontSize: "14px", opacity: 0.8 }}>/custom</span></div>
              <Link className="secondary-button" to="/auth/hospital-signup" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", borderColor: "#FFF" }}>Learn more</Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="cta-band">
          <h2>Your medical history deserves a better bridge.</h2>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="primary-button" to="/signup">Start as patient <ArrowRight size={18} /></Link>
            <Link className="secondary-button" to="/auth/role-select"><Building2 size={18} /> Register hospital</Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="landing-footer">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/disclaimer">Medical Disclaimer</Link>
          <span style={{ color: "#999" }}>© 2026 HealthBridge. All rights reserved.</span>
        </footer>
      </main>
    </>
  );
}
