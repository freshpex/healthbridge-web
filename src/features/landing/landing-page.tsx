import { motion } from "framer-motion";
import { ArrowRight, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Logo } from "../../components/ui/logo";

const features = [
  {
    title: "Patients carry control",
    body: "Profiles, records, consent, prescriptions, labs, emergency QR, and audit visibility stay in one responsive workspace.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Clinical teams coordinate",
    body: "Hospitals, doctors, labs, and admins work from role-specific screens backed by the live HealthBridge API.",
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Emergency access moves fast",
    body: "Verified responders can resolve emergency codes, review critical information, and preserve a clean audit trail.",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=900&q=85"
  }
];

export function LandingPage() {
  return (
    <main className="landing">
      <header className="public-nav">
        <Logo />
        <nav>
          <a href="#learn">Learn More</a>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/login">Sign In</Link>
          <Link className="nav-cta" to="/register">Create Account</Link>
        </nav>
      </header>
      <section className="hero">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="eyebrow">Secure care, moving with the patient</p>
          <h1>HealthBridge</h1>
          <p>One premium healthcare bridge for patients, hospitals, doctors, laboratories, emergency responders, and platform teams.</p>
          <div className="hero-actions">
            <Link to="/register"><Button><HeartPulse size={18} /> Create Account</Button></Link>
            <Link to="/login"><Button variant="ghost"><ShieldCheck size={18} /> Sign In</Button></Link>
            <a href="#learn"><Button variant="ghost"><Sparkles size={18} /> Learn More</Button></a>
          </div>
        </motion.div>
        <motion.div className="hero-media" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85" alt="Clinicians reviewing patient care data" />
          <div className="pulse-card"><HeartPulse /> Live care timeline</div>
        </motion.div>
      </section>
      <section className="motion-strip" aria-label="HealthBridge capabilities">
        {["Connected records", "Emergency QR", "Hospital workflows", "Lab coordination", "Patient consent", "Audit logs"].map((item) => <span key={item}>{item}</span>)}
      </section>
      <section id="learn" className="feature-grid">
        {features.map((feature, index) => (
          <motion.article className="feature-card" key={feature.title} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
            <img src={feature.image} alt="" loading="lazy" />
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </motion.article>
        ))}
      </section>
      <section id="contact" className="contact-band">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Bring HealthBridge into your care network.</h2>
        </div>
        <Link to="/contact"><Button>Contact <ArrowRight size={18} /></Button></Link>
      </section>
    </main>
  );
}
