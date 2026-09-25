import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/editorial/article-detail";
import { BUILD_LOG_ARTICLES, findEditorialArticle } from "@/lib/editorial-data";

export function generateStaticParams() { return BUILD_LOG_ARTICLES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const article = findEditorialArticle(BUILD_LOG_ARTICLES, slug); return article ? { title: article.title.zh, description: article.summary.zh } : {}; }
export default async function BuildLogArticlePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const article = findEditorialArticle(BUILD_LOG_ARTICLES, slug); if (!article) notFound(); const index = BUILD_LOG_ARTICLES.indexOf(article); return <ArticleDetail article={article} backLabel={{ zh: "返回建站纪事", en: "Back to Build Log" }} basePath="/build-log" previous={BUILD_LOG_ARTICLES[index - 1]} next={BUILD_LOG_ARTICLES[index + 1]} />; }
