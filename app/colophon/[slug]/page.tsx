import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/editorial/article-detail";
import { COLOPHON_ARTICLES, findEditorialArticle } from "@/lib/editorial-data";

export function generateStaticParams() { return COLOPHON_ARTICLES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const article = findEditorialArticle(COLOPHON_ARTICLES, slug); return article ? { title: article.title.zh, description: article.summary.zh } : {}; }
export default async function ColophonArticlePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const article = findEditorialArticle(COLOPHON_ARTICLES, slug); if (!article) notFound(); const index = COLOPHON_ARTICLES.indexOf(article); return <ArticleDetail article={article} backLabel={{ zh: "返回制作说明", en: "Back to Colophon" }} basePath="/colophon" previous={COLOPHON_ARTICLES[index - 1]} next={COLOPHON_ARTICLES[index + 1]} />; }
