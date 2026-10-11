import type { Metadata } from "next";
import { FieldNotesBook } from "@/components/field-book/field-notes-book";
import { getFieldBookEntries } from "@/lib/field-book";

export const metadata: Metadata = {
  title: "场域手记",
  description: "一本收录 NEXTFIELD 写作与随笔的数字书。",
};

export default function BlogIndexPage() {
  return <FieldNotesBook entries={getFieldBookEntries()} />;
}
