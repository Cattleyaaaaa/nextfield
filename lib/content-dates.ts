/** Dates used by editorial content: YYYY-MM-DD or YYYY · MM · DD. */
function dateParts(value: string | undefined) {
  if (!value) return null;
  const match = /^(\d{4})[\s·-]+(\d{1,2})(?:[\s·-]+(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = match[3] ? Number(match[3]) : 0;
  if (month < 1 || month > 12 || (match[3] && (day < 1 || day > 31))) return null;
  if (day && new Date(Date.UTC(year, month - 1, day)).getUTCMonth() !== month - 1) return null;
  return { year, month, day };
}

export function contentDateKey(value: string | undefined) {
  const parts = dateParts(value);
  return parts ? parts.year * 10000 + parts.month * 100 + parts.day : 0;
}

export function contentDateISO(value: string | undefined) {
  const parts = dateParts(value);
  if (!parts) return undefined;
  return `${parts.year}-${String(parts.month).padStart(2, "0")}${parts.day ? `-${String(parts.day).padStart(2, "0")}` : ""}`;
}

/** Return a sorted copy, preserving authored data and same-date ordering. */
export function newestContentFirst<T extends { date?: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => contentDateKey(b.date) - contentDateKey(a.date));
}
