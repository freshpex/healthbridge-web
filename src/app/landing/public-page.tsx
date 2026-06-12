import { Link } from "react-router-dom";
import { ArrowRight, Building2, ClipboardCheck, FileText, LockKeyhole, ShieldCheck, Stethoscope } from "lucide-react";
import { TopNav } from "../../components/header/top-nav";

const content = {
  product: {
    eyebrow: "Connected care records",
    title: "One trusted bridge between patients, hospitals, doctors, and emergency teams.",
    copy: "HealthBridge gives patients a secure account for their medical profile while giving approved hospitals a faster way to verify, update, and share records with consent.",
    cards: [
      ["Patient-controlled sharing", "Patients connect approved hospitals, grant scoped consent, and revoke access when care changes."],
      ["Clinical continuity", "Doctors can see connected patients, review records, add notes, and create prescriptions without chasing paper history."],
      ["Emergency readiness", "A patient emergency code reveals critical information first and records every access event."]
    ]
  },
  hospitals: {
    eyebrow: "For hospitals",
    title: "Reduce admission time. Improve patient outcomes. Build trust through transparency.",
    copy: "HealthBridge solves the coordination nightmare. Connect to a network of verified patients, eliminate fragmented intake, and give your care teams instant access to critical records—all with patient consent and complete audit trails.",
    cards: [
      ["30+ minutes saved per admission", "Complete patient history available instantly instead of manual lookups and phone calls. Staff can focus on care, not paperwork."],
      ["Reduce clinical errors from missing data", "Allergies, medications, and prior diagnoses are available before the patient even arrives. Safer prescriptions, fewer drug interactions, better outcomes."],
      ["Seamless referrals between hospitals", "Refer patients to partner hospitals without losing their medical context. Care coordination that actually works."]
    ]
  },
  security: {
    eyebrow: "Security and compliance",
    title: "Enterprise-grade security built for healthcare.",
    copy: "HIPAA-compliant infrastructure with end-to-end encryption, role-based access control, consent-first data sharing, and patient-visible audit logs. Every access is tracked. Every change is logged. Every decision is documented.",
    cards: [
      ["HIPAA compliance ready", "Role-based access control (RBAC), audit logging, encryption at rest, and secure infrastructure meet healthcare security standards."],
      ["Transparent audit trails", "Patients can see exactly who accessed their records, when, why, and from where. Full accountability for all staff and emergency responders."],
      ["Consent-first architecture", "No access without explicit patient permission. Scoped sharing by data type, time-limited access, and instant revocation capabilities."]
    ]
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Affordable for hospitals. Free for patients. ROI in weeks.",
    copy: "HealthBridge is designed to save hospitals time and reduce operational costs from day one. Patient accounts stay free. Hospital pricing scales with your facility size and integration needs.",
    cards: [
      ["Patient accounts are free", "Patients create secure profiles at no cost. You only pay when your hospital joins the network."],
      ["Hospital pricing by scale", "Small clinics, mid-size hospitals, and large networks have different price points. Contact us for a custom quote."],
      ["ROI in first month", "Average hospital saves 30+ minutes per admission. Multiply by 50+ daily admissions and the savings pay for subscriptions immediately."]
    ]
  },
  privacy: {
    eyebrow: "Privacy",
    title: "HealthBridge privacy commitment",
    copy: "HealthBridge should collect only the information needed to provide account access, connected care workflows, consent sharing, emergency access, and support.",
    cards: [
      ["Data use", "Medical and account data should be used to operate the platform, support care coordination, and maintain security."],
      ["Patient control", "Patients should be able to review connected hospitals, active shares, and audit history."],
      ["Retention", "Retention rules should follow applicable healthcare, contractual, and regulatory obligations."]
    ]
  },
  terms: {
    eyebrow: "Terms",
    title: "Terms and conditions",
    copy: "Use of HealthBridge should require accurate account information, authorized access, responsible clinical use, and compliance with applicable laws and hospital policies.",
    cards: [
      ["Authorized use", "Users may access only accounts, patients, hospitals, and records they are permitted to use."],
      ["Clinical responsibility", "HealthBridge supports care coordination but does not replace professional clinical judgment."],
      ["Account security", "Users are responsible for protecting credentials and reporting suspected unauthorized access."]
    ]
  },
  disclaimer: {
    eyebrow: "Disclaimer",
    title: "Medical and platform disclaimer",
    copy: "HealthBridge is a health-record coordination platform. It is not a substitute for emergency services, diagnosis, treatment, or direct advice from licensed clinicians.",
    cards: [
      ["Emergency care", "In an emergency, contact local emergency services or the nearest qualified care provider immediately."],
      ["Record accuracy", "Clinical records depend on information entered by patients, hospitals, and authorized care teams."],
      ["Regulatory review", "Production deployment should include legal, privacy, security, and clinical governance review."]
    ]
  }
} as const;

const icons = [ShieldCheck, Stethoscope, ClipboardCheck];

export function PublicPage({ page }: { page: keyof typeof content }) {
  const item = content[page];
  return (
    <>
      <TopNav />
      <main className="public-page">
        <section className="public-hero">
          <span>{item.eyebrow}</span>
          <h1>{item.title}</h1>
          <p>{item.copy}</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/signup">Create patient account <ArrowRight size={18} /></Link>
            <Link className="secondary-button" to="/hospitals"><Building2 size={18} /> Hospital registration</Link>
          </div>
        </section>
        <section className="public-card-grid">
          {item.cards.map(([title, copy], index) => {
            const Icon = icons[index] ?? FileText;
            return (
              <article key={title}>
                <Icon size={24} />
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            );
          })}
        </section>
        <section className="public-note">
          <LockKeyhole size={22} />
          <p>HealthBridge should be deployed with real hospital approval workflows, verified staff accounts, production security monitoring, and jurisdiction-specific compliance review.</p>
        </section>
      </main>
    </>
  );
}
