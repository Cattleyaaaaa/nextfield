"use client";

export type SchoolSession = { configured: boolean; user: null | { id: string; name: string } };
let pending: Promise<SchoolSession> | undefined;

// Several learning widgets mount together. One request prevents refresh-token races.
export function getSchoolSession(): Promise<SchoolSession> {
  pending ??= fetch("/api/school/session", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Could not load session");
      return response.json() as Promise<SchoolSession>;
    })
    .catch((error) => { pending = undefined; throw error; });
  return pending;
}
