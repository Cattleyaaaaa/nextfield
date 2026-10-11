import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FieldBookReader } from "@/components/field-book/field-book-reader";
import { ESSAY_ARTICLES, findEditorialArticle } from "@/lib/editorial-data";
import { getFieldBookEntries } from "@/lib/field-book";
import type { EditorialArticle } from "@/lib/editorial-data";

function EssayBody({ article, locale }: { article: EditorialArticle; locale: "zh" | "en" }) {
  return <div className="fieldbook-essay-body">
    {article.sections.map((section, index) => <section key={section.heading.en}>
      <p className="fieldbook-section-number">{String(index + 1).padStart(2, "0")}</p>
      <h2>{section.heading[locale]}</h2>
      {section.paragraphs.map((paragraph) => <p key={paragraph.en}>{paragraph[locale]}</p>)}
    </section>)}
  </div>;
}

export function generateStaticParams() { return ESSAY_ARTICLES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const article = findEditorialArticle(ESSAY_ARTICLES, slug); return article ? { title: article.title.zh, description: article.summary.zh } : {}; }
export default async function EssayArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = findEditorialArticle(ESSAY_ARTICLES, slug);
  if (!article) notFound();
  const entries = getFieldBookEntries();
  const entry = entries.find((item) => item.href === `/essays/${article.slug}`);
  if (!entry) notFound();
  return <FieldBookReader entry={entry} entries={entries} contentZh={<EssayBody article={article} locale="zh" />} contentEn={<EssayBody article={article} locale="en" />} />;
}
