import type { PatientDashboardPayload } from "../../types/domain";

export const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)) : "Not set";

export const formatContact = (contact: PatientDashboardPayload["profile"]["emergencyContact"]) =>
  typeof contact === "string" ? contact : [contact?.name, contact?.relationship, contact?.phone].filter(Boolean).join(", ");
