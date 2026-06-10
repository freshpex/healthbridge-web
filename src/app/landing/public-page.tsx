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
    title: "Register because fragmented records slow down care and increase clinical risk.",
    copy: "HealthBridge helps hospitals reduce repeated intake questions, missing history, delayed referrals, and untracked record sharing. Registration gives your team a governed workspace for verified patients and consent-led record access.",
    cards: [
      ["Faster intake", "Patients arrive with connected profiles, emergency contacts, allergies, medications, and prior records."],
      ["Cleaner governance", "Hospital admins approve staff workflows, monitor patient connections, and keep activity visible."],
      ["Better patient trust", "Patients can see who accessed their information and why, which makes digital record sharing easier to explain."]
    ]
  },
  security: {
    eyebrow: "Security and compliance",
    title: "Privacy controls are built into the workflow, not hidden in fine print.",
    copy: "The app is designed around authenticated access, role permissions, consent scopes, emergency minimization, and patient-visible audit history.",
    cards: [
      ["Role-based access", "Patients, doctors, hospital admins, super admins, and emergency staff only see routes and data meant for their role."],
      ["Consent-first sharing", "Sharing is scoped by purpose and can expire or be revoked by the patient."],
      ["Audit visibility", "Emergency and record access events are captured so patients and administrators can review sensitive activity."]
    ]
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple onboarding for hospitals and free access for patients.",
    copy: "Patient accounts are intended to stay free. Hospital pricing should be based on facility size, staff seats, integration needs, and support requirements.",
    cards: [
      ["Patient accounts", "Patients can create a secure medical profile and connect approved hospitals."],
      ["Hospital workspace", "Hospitals get a managed portal for staff, connected patients, and clinical record workflows."],
      ["Implementation support", "Deployment can include data migration planning, staff training, and governance setup."]
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
