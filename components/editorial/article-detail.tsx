"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { useLanguage } from "@/components/site/language-provider";
import type { EditorialArticle } from "@/lib/editorial-data";

function localizedEyebrow(value: string, locale: "zh" | "en") {
  if (locale === "en") return value;
  return value.replace("Build log", "建站纪事").replace("Colophon", "制作说明").replace("Essay", "随笔");
}

export function ArticleDetail({ article, basePath, backLabel, previous, next }: { article: EditorialArticle; basePath: string; backLabel: { zh: string; en: string }; previous?: EditorialArticle; next?: EditorialArticle }) {
  const { locale } = useLanguage();
  return (
    <article className="mx-auto max-w-site px-5 pb-28 pt-16 sm:px-8 sm:pt-24 lg:px-12">
      <TransitionLink className="inline-flex items-center gap-2 text-xs text-muted hover:text-accent" href={basePath}><ArrowLeft className="size-3.5" />{backLabel[locale]}</TransitionLink>
      <header className="mt-12 max-w-5xl">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent"><span>{localizedEyebrow(article.eyebrow, locale)}</span><span className="text-line">/</span><span>{article.date}</span><span className="text-line">/</span><span>{article.minutes} {locale === "zh" ? "分钟阅读" : "min read"}</span></div>
        <h1 className="mt-6 text-balance font-display text-[clamp(3.25rem,8vw,7rem)] leading-[0.88] tracking-[-0.065em]">{article.title[locale]}</h1>
        <p className="mt-8 max-w-3xl text-lg leading-9 text-muted">{article.summary[locale]}</p>
        <div className="mt-8 flex flex-wrap gap-2">{article.tags.map((tag) => <span className="rounded-full border border-line px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted" key={tag}>{tag}</span>)}</div>
      </header>

      <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-[14rem_minmax(0,46rem)] lg:gap-16">
        <aside className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted"><p className="sticky top-24">{locale === "zh" ? "目录" : "Contents"}<br /><span className="mt-2 block text-accent">{String(article.sections.length).padStart(2, "0")} {locale === "zh" ? "个章节" : "sections"}</span></p></aside>
        <div className="space-y-16">{article.sections.map((section, index) => <section key={section.heading.en}><p className="font-mono text-[10px] tracking-[0.16em] text-accent">{String(index + 1).padStart(2, "0")}</p><h2 className="mt-3 font-display text-3xl tracking-[-0.045em] sm:text-4xl">{section.heading[locale]}</h2><div className="mt-6 space-y-6">{section.paragraphs.map((paragraph) => <p className="text-base leading-8 text-muted sm:text-lg sm:leading-9" key={paragraph.en}>{paragraph[locale]}</p>)}</div></section>)}</div>
      </div>

      <nav aria-label={locale === "zh" ? "文章导航" : "Article navigation"} className="mt-20 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
        {previous ? <TransitionLink className="group rounded-2xl border border-line p-5 hover:border-accent" href={`${basePath}/${previous.slug}`}><span className="flex items-center gap-2 text-xs text-muted"><ArrowLeft className="size-3.5" />{locale === "zh" ? "上一篇" : "Previous"}</span><strong className="mt-4 block font-display text-2xl font-normal">{previous.title[locale]}</strong></TransitionLink> : <span />}
        {next ? <TransitionLink className="group rounded-2xl border border-line p-5 text-right hover:border-accent" href={`${basePath}/${next.slug}`}><span className="flex items-center justify-end gap-2 text-xs text-muted">{locale === "zh" ? "下一篇" : "Next"}<ArrowRight className="size-3.5" /></span><strong className="mt-4 block font-display text-2xl font-normal">{next.title[locale]}</strong></TransitionLink> : null}
      </nav>
    </article>
  );
}
