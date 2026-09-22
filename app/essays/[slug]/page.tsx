import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/editorial/article-detail";
import { ESSAY_ARTICLES, findEditorialArticle } from "@/lib/editorial-data";

export const dynamicParams = false;
export function generateStaticParams() { return ESSAY_ARTICLES.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata { const article = findEditorialArticle(ESSAY_ARTICLES, params.slug); return article ? { title: article.title.zh, description: article.summary.zh } : {}; }
export default function EssayArticlePage({ params }: { params: { slug: string } }) { const article = findEditorialArticle(ESSAY_ARTICLES, params.slug); if (!article) notFound(); const index = ESSAY_ARTICLES.indexOf(article); return <ArticleDetail article={article} backLabel={{ zh: "返回随笔", en: "Back to Essays" }} basePath="/essays" previous={ESSAY_ARTICLES[index - 1]} next={ESSAY_ARTICLES[index + 1]} />; }
