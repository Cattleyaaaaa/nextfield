"use client";

import { ArrowUpRight } from "lucide-react";
import { TiltSurface } from "@/components/motion/tilt-surface";
import { TransitionLink } from "@/components/site/transition-link";
import { useLanguage } from "@/components/site/language-provider";
import type { EditorialArticle } from "@/lib/editorial-data";

export function ArticleIndex({ articles, basePath }: { articles: readonly EditorialArticle[]; basePath: string }) {
  const { locale } = useLanguage();
  return (
    <ol className="mt-14 border-t border-line">
      {articles.map((article) => (
        <li className="border-b border-line" key={article.slug}>
          {/* 整行是链接；倾斜幅度给得很小，只是让"这一行可以点"多一层物理反馈 */}
          <TiltSurface className="rounded-2xl" lift={2} maxTilt={2.5}>
            <TransitionLink className="group grid gap-4 py-8 sm:grid-cols-12 sm:gap-6 sm:py-10" href={`${basePath}/${article.slug}`}>
              <span className="font-mono text-xs tracking-[0.06em] text-accent sm:col-span-2">{article.date}</span>
              <div className="sm:col-span-7">
                <h2 className="font-display text-2xl leading-tight tracking-[-0.035em] transition-colors group-hover:text-accent sm:text-3xl">{article.title[locale]}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{article.summary[locale]}</p>
              </div>
              <div className="flex items-start justify-between gap-4 sm:col-span-3 sm:justify-end">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{article.minutes} {locale === "zh" ? "分钟" : "min"}</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
            </TransitionLink>
          </TiltSurface>
        </li>
      ))}
    </ol>
  );
}
