import { useState } from "react";
import { hospitals } from "../../../constants/mock-data";
import { TopNav } from "../../../components/header/top-nav";

export function SignUpPage() {
  const [selected, setSelected] = useState(["h-mercy"]);
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <TopNav />
      <main className="signup-page">
        <section>
          <h1>Create your patient record bridge</h1>
          <p>Select the hospitals that should verify and sync your records during signup.</p>
          <div className="hospital-selector">
            {hospitals.filter((hospital) => hospital.status === "approved").map((hospital) => (
              <label key={hospital.id} className="select-card">
                <input
                  type="checkbox"
                  checked={selected.includes(hospital.id)}
                  onChange={() => setSelected((current) => current.includes(hospital.id) ? current.filter((id) => id !== hospital.id) : [...current, hospital.id])}
                />
                <strong>{hospital.name}</strong>
                <span>{hospital.city}, {hospital.state}</span>
              </label>
            ))}
          </div>
          {submitted && <div className="success-state">Account request ready. The backend will connect this patient to {selected.length} hospital(s).</div>}
          <button className="primary-button" onClick={() => setSubmitted(true)}>Create patient account</button>
        </section>
      </main>
    </>
  );
}
