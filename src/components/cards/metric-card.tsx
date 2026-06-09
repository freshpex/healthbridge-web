import type { ReactNode } from "react";

export function MetricCard({ label, value, tone = "blue", icon }: { label: string; value: string; tone?: "blue" | "teal" | "green" | "amber"; icon?: ReactNode }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
