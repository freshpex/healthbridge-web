import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Heart, XCircle } from "lucide-react";
import { AppShell } from "../../components/layout/app-shell";
import { healthbridgeService } from "../../services/healthbridge-service";
import { useAuth } from "../auth/hooks/use-auth";

export function SymptomCheckerPage() {
  const { token } = useAuth();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomsInput, setSymptomsInput] = useState("");
  const [assessment, setAssessment] = useState<{
    conditions: string[];
    urgency: "low" | "medium" | "high";
    recommendations: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  const addSymptom = () => {
    if (symptomsInput.trim() && !symptoms.includes(symptomsInput.trim())) {
      setSymptoms([...symptoms, symptomsInput.trim()]);
      setSymptomsInput("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length === 0) {
      setError("Please add at least one symptom");
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Not authenticated");
      const result = await healthbridgeService.assessSymptoms(token, symptoms);
      setAssessment(result.assessment);
      setShowResults(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not assess symptoms");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    low: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "text-green-600" },
    medium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-600" },
    high: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-600" }
  };

  return (
    <AppShell
      title="AI Symptom Checker"
      subtitle="Describe your symptoms and get guidance on next steps. Not a diagnosis—always consult a healthcare provider."
    >
      <div className="symptom-checker-grid">
        <section className="panel symptom-input-panel">
          <h2>Describe your symptoms</h2>
          <form onSubmit={handleSubmit} className="form-stack">
            <div className="symptom-input-group">
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="e.g., headache, fever, cough, chest pain..."
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSymptom();
                    }
                  }}
                  autoFocus
                />
                <button type="button" className="secondary-button" onClick={addSymptom}>
                  Add
                </button>
              </div>

              {symptoms.length > 0 && (
                <div className="symptoms-tags">
                  {symptoms.map((symptom) => (
                    <span key={symptom} className="symptom-tag">
                      {symptom}
                      <button
                        type="button"
                        onClick={() => removeSymptom(symptom)}
                        className="symptom-tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <textarea
              placeholder="Add any additional details about when symptoms started, severity, recent medications, etc."
              className="form-textarea"
              rows={4}
              defaultValue=""
            />

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={symptoms.length === 0 || loading}
              >
                {loading ? "Analyzing..." : "Analyze symptoms"}
              </button>
              {showResults && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowResults(false);
                    setSymptoms([]);
                    setAssessment(null);
                  }}
                >
                  Start over
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="error-state">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </section>

        {showResults && assessment && (
          <section className="panel assessment-results-panel">
            <h2>Assessment Results</h2>

            <article className={`urgency-card ${urgencyColors[assessment.urgency].bg} border-2 ${urgencyColors[assessment.urgency].border}`}>
              <div className="urgency-header">
                <div className={urgencyColors[assessment.urgency].icon}>
                  {assessment.urgency === "high" && <AlertCircle size={24} />}
                  {assessment.urgency === "medium" && <AlertCircle size={24} />}
                  {assessment.urgency === "low" && <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h3 className={`urgency-title ${urgencyColors[assessment.urgency].text}`}>
                    {assessment.urgency === "high" && "Urgent - Seek Immediate Care"}
                    {assessment.urgency === "medium" && "Moderate - Visit Healthcare Facility"}
                    {assessment.urgency === "low" && "Low - Monitor and Consult"}
                  </h3>
                  <p className={urgencyColors[assessment.urgency].text}>
                    {assessment.urgency === "high" && "These symptoms require immediate medical attention."}
                    {assessment.urgency === "medium" && "You should seek care at an urgent care or hospital."}
                    {assessment.urgency === "low" && "Monitor your symptoms. Schedule an appointment if they persist."}
                  </p>
                </div>
              </div>
            </article>

            {assessment.conditions.length > 0 && (
              <article className="conditions-card">
                <h4>Possible Conditions</h4>
                <p className="card-subtitle">Based on your symptoms, these conditions should be considered:</p>
                <ul className="conditions-list">
                  {assessment.conditions.map((condition) => (
                    <li key={condition}>
                      <Heart size={16} />
                      {condition}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {assessment.recommendations.length > 0 && (
              <article className="recommendations-card">
                <h4>Recommended Next Steps</h4>
                <ol className="recommendations-list">
                  {assessment.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ol>
              </article>
            )}

            <div className="disclaimer-box">
              <XCircle size={16} />
              <p>
                <strong>Important:</strong> This assessment is not a medical diagnosis. It's an AI-assisted
                guidance system. Always consult with a qualified healthcare provider for proper diagnosis and
                treatment. In case of life-threatening symptoms, call emergency services immediately.
              </p>
            </div>
          </section>
        )}
      </div>

      <style>{`
        .symptom-checker-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        @media (max-width: 1024px) {
          .symptom-checker-grid {
            grid-template-columns: 1fr;
          }
        }

        .symptom-input-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-with-button {
          display: flex;
          gap: 0.5rem;
        }

        .input-with-button input {
          flex: 1;
        }

        .symptoms-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .symptom-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #e0e7ff;
          border: 1px solid #c7d2fe;
          color: #3730a3;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.875rem;
        }

        .symptom-tag-remove {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0;
          color: inherit;
        }

        .form-textarea {
          font-family: inherit;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
        }

        .urgency-card {
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
        }

        .urgency-header {
          display: flex;
          gap: 1rem;
        }

        .urgency-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .urgency-card p {
          margin: 0;
          font-size: 0.875rem;
        }

        .conditions-card,
        .recommendations-card {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .card-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.75rem 0;
        }

        .conditions-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .conditions-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #374151;
        }

        .recommendations-list {
          padding: 0 1.5rem;
          margin: 0;
        }

        .recommendations-list li {
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.5;
        }

        .disclaimer-box {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 0.5rem;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          color: #7f1d1d;
          font-size: 0.875rem;
        }

        .disclaimer-box svg {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .assessment-results-panel {
          grid-column: 1 / -1;
        }
      `}</style>
    </AppShell>
  );
}
