import type { Metadata } from "next";
import { ArticleIndex } from "@/components/editorial/article-index";
import { BUILD_LOG_ARTICLES } from "@/lib/editorial-data";

export const metadata: Metadata = { title: "建站纪事", description: "这个站如何一版一版搭起来：完整记录设计、交互与工程取舍。" };

export default function BuildLogPage() {
  return <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Build log / 05</p><div className="mt-6 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end"><h1 className="max-w-4xl text-balance font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.88] tracking-[-0.065em]">建站不是一次发布，<br />而是一串决定。</h1><p className="text-base leading-8 text-muted">这里不只记录“新增了什么”，也说明为什么这样设计、哪些方案被放弃，以及下一版准备解决什么。</p></div><ArticleIndex articles={BUILD_LOG_ARTICLES} basePath="/build-log" /></div>;
}
