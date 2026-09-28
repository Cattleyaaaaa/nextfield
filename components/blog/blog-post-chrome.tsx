"use client";

import { ArrowLeft } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { useLanguage } from "@/components/site/language-provider";
import type { PostMeta } from "@/types/post";

const CATEGORY_EN: Record<string, string> = {
  Agent: "Agent", 前端: "Frontend", 交互: "Interaction", 设计: "Design", 哲学: "Philosophy",
};

export function BlogPostChrome({ post, position }: { post: PostMeta; position: "top" | "bottom" }) {
  const { locale } = useLanguage();
  const english = locale === "en" && post.english;

  if (position === "bottom") return (
    <div className="mt-16 border-t border-line pt-8">
      <TransitionLink className="group inline-flex items-center gap-2 text-sm font-medium hover:text-accent" href="/blog">
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        {locale === "zh" ? "回到全部文章" : "Back to all articles"}
      </TransitionLink>
    </div>
  );

  return <>
    <TransitionLink className="group inline-flex items-center gap-2 text-sm text-muted hover:text-ink" href="/blog">
      <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
      {locale === "zh" ? "全部文章" : "All articles"}
    </TransitionLink>
    <header className="mt-10 border-b border-line pb-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        {locale === "zh" ? "写作" : "Writing"} / {post.displayDate}
      </p>
      <h1 className="mt-6 max-w-4xl text-balance font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-[-0.055em]">
        {english ? english.title : post.title}
      </h1>
      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="font-mono tracking-[0.06em]">{post.date}</span>
        <span className="rounded-full border border-line px-2.5 py-1 tracking-[0.04em]">{english ? CATEGORY_EN[post.category] || post.category : post.category}</span>
        {(english ? english.tags : post.tags).map((tag) => (
          <span className="rounded-full border border-line px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]" key={tag}>{tag}</span>
        ))}
        <span className="tracking-[0.06em]">{english ? english.minutes : post.minutes} {locale === "zh" ? "分钟" : "min"}</span>
      </div>
    </header>
    {post.sample ? <p className="mt-8 rounded-2xl border border-dashed border-accent/50 bg-accent/[0.06] px-5 py-4 text-sm leading-6 text-ink">
      {locale === "zh" ? "这是一篇格式示例，不是你写的真实文章。" : "This is a formatting sample, not a published article."}
    </p> : null}
  </>;
}
