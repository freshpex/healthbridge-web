import { AlertTriangle, Loader2, SearchX } from "lucide-react";

export function Loader({ label = "Loading HealthBridge..." }: { label?: string }) {
  return (
    <div className="state-panel">
      <Loader2 className="spin" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", body = "When data is available from the backend it will appear here." }: { title?: string; body?: string }) {
  return (
    <div className="state-panel">
      <SearchX />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="state-panel error-state">
      <AlertTriangle />
      <strong>Request failed</strong>
      <p>{message}</p>
    </div>
  );
}
