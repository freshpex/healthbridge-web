import type { FormEvent, ReactNode } from "react";
import { Button } from "./button";

export function FormPanel({ title, children, onSubmit, submitLabel = "Save" }: { title: string; children: ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitLabel?: string }) {
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <h2>{title}</h2>
      {children}
      <Button>{submitLabel}</Button>
    </form>
  );
}
