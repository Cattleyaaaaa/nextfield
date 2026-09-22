import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/editorial/article-detail";
import { BUILD_LOG_ARTICLES, findEditorialArticle } from "@/lib/editorial-data";

export const dynamicParams = false;
export function generateStaticParams() { return BUILD_LOG_ARTICLES.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata { const article = findEditorialArticle(BUILD_LOG_ARTICLES, params.slug); return article ? { title: article.title.zh, description: article.summary.zh } : {}; }
export default function BuildLogArticlePage({ params }: { params: { slug: string } }) { const article = findEditorialArticle(BUILD_LOG_ARTICLES, params.slug); if (!article) notFound(); const index = BUILD_LOG_ARTICLES.indexOf(article); return <ArticleDetail article={article} backLabel={{ zh: "返回建站纪事", en: "Back to Build Log" }} basePath="/build-log" previous={BUILD_LOG_ARTICLES[index - 1]} next={BUILD_LOG_ARTICLES[index + 1]} />; }
