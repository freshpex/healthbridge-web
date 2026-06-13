import type { ReactNode } from "react";

export function Row({ title, meta, detail, badge }: { title: ReactNode; meta?: ReactNode; detail?: ReactNode; badge?: ReactNode }) {
  return (
    <>
      <div>
        <strong>{title}</strong>
        {meta ? <p className="muted">{meta}</p> : null}
        {detail ? <p>{detail}</p> : null}
      </div>
      {badge ? <span className="badge">{badge}</span> : null}
    </>
  );
}
