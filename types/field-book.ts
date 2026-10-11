export type FieldBookEntry = {
  kind: "writing" | "essay";
  slug: string;
  href: string;
  date: string;
  category: string;
  title: { zh: string; en: string };
  summary: { zh: string; en: string };
  minutes: { zh: number; en: number };
};
