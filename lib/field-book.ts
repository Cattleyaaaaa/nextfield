import { contentDateISO } from "@/lib/content-dates";
import { ESSAY_ARTICLES } from "@/lib/editorial-data";
import { getPublishedPosts } from "@/lib/posts";
import type { FieldBookEntry } from "@/types/field-book";

export function getFieldBookEntries(): FieldBookEntry[] {
  const writing: FieldBookEntry[] = getPublishedPosts().map((post) => ({
    kind: "writing",
    slug: post.slug,
    href: `/blog/${post.slug}`,
    date: post.date,
    category: post.category,
    tags: { zh: post.tags, en: post.english?.tags ?? post.tags },
    title: { zh: post.title, en: post.english?.title ?? post.title },
    summary: { zh: post.summary, en: post.english?.summary ?? post.summary },
    minutes: { zh: post.minutes, en: post.english?.minutes ?? post.minutes },
  }));
  const essays: FieldBookEntry[] = ESSAY_ARTICLES.map((article) => ({
    kind: "essay",
    slug: article.slug,
    href: `/essays/${article.slug}`,
    date: contentDateISO(article.date) ?? article.date,
    category: "随笔",
    title: article.title,
    summary: article.summary,
    minutes: { zh: article.minutes, en: article.minutes },
  }));
  return [...writing, ...essays];
}
