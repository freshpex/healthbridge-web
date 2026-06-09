import { HeartPulse } from "lucide-react";

export function Logo() {
  return (
    <div className="logo-mark" aria-label="HealthBridge">
      <span><HeartPulse size={20} /></span>
      <strong>HealthBridge</strong>
    </div>
  );
}
