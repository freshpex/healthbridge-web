export const idOf = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const item = value as { id?: string; _id?: string };
    return item.id ?? item._id ?? "";
  }
  return "";
};

export const labelOf = (value: unknown, fallback = "Unassigned") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const item = value as { name?: string; fullName?: string; labName?: string; title?: string; email?: string };
    return item.name ?? item.fullName ?? item.labName ?? item.title ?? item.email ?? fallback;
  }
  return fallback;
};

export const dateOf = (value?: string) => {
  if (!value) return "Not dated";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not dated" : date.toLocaleString();
};

export const listText = (items?: string[]) => (items?.length ? items.join(", ") : "None listed");

export const apiErrorText = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: string }).message);
  return "Something went wrong. Please try again.";
};
