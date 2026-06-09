import { useEffect, useState } from "react";
import { healthbridgeService } from "../../../services/healthbridge-service";
import type { Hospital, PatientDashboardPayload } from "../../../types/domain";
import { useAuth } from "../../auth/hooks/use-auth";

export function usePatientDashboard() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<PatientDashboardPayload>();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [nextDashboard, nextHospitals] = await Promise.all([
        healthbridgeService.getPatientDashboard(token),
        healthbridgeService.listHospitals()
      ]);
      setDashboard(nextDashboard);
      setHospitals(nextHospitals);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    if (!token) return;
    Promise.all([
      healthbridgeService.getPatientDashboard(token),
      healthbridgeService.listHospitals()
    ])
      .then(([nextDashboard, nextHospitals]) => {
        if (!alive) return;
        setDashboard(nextDashboard);
        setHospitals(nextHospitals);
      })
      .catch((caught) => {
        if (alive) setError(caught instanceof Error ? caught.message : "Could not load patient data");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  return { token, dashboard, hospitals, loading, error, setError, refresh };
}
