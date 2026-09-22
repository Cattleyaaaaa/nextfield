import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/editorial/article-detail";
import { COLOPHON_ARTICLES, findEditorialArticle } from "@/lib/editorial-data";

export const dynamicParams = false;
export function generateStaticParams() { return COLOPHON_ARTICLES.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata { const article = findEditorialArticle(COLOPHON_ARTICLES, params.slug); return article ? { title: article.title.zh, description: article.summary.zh } : {}; }
export default function ColophonArticlePage({ params }: { params: { slug: string } }) { const article = findEditorialArticle(COLOPHON_ARTICLES, params.slug); if (!article) notFound(); const index = COLOPHON_ARTICLES.indexOf(article); return <ArticleDetail article={article} backLabel={{ zh: "返回制作说明", en: "Back to Colophon" }} basePath="/colophon" previous={COLOPHON_ARTICLES[index - 1]} next={COLOPHON_ARTICLES[index + 1]} />; }
