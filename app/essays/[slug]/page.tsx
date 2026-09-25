import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/editorial/article-detail";
import { ESSAY_ARTICLES, findEditorialArticle } from "@/lib/editorial-data";

export function generateStaticParams() { return ESSAY_ARTICLES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const article = findEditorialArticle(ESSAY_ARTICLES, slug); return article ? { title: article.title.zh, description: article.summary.zh } : {}; }
export default async function EssayArticlePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const article = findEditorialArticle(ESSAY_ARTICLES, slug); if (!article) notFound(); const index = ESSAY_ARTICLES.indexOf(article); return <ArticleDetail article={article} backLabel={{ zh: "返回随笔", en: "Back to Essays" }} basePath="/essays" previous={ESSAY_ARTICLES[index - 1]} next={ESSAY_ARTICLES[index + 1]} />; }
