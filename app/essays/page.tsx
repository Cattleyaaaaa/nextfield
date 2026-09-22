import type { Metadata } from "next";
import { ArticleIndex } from "@/components/editorial/article-index";
import { ESSAY_ARTICLES } from "@/lib/editorial-data";

export const metadata: Metadata = { title: "随笔", description: "关于界面、系统、过程与尚未成为结论的观察。" };

export default function EssaysPage() {
  return <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Essays / Field notes</p><div className="mt-6 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end"><h1 className="max-w-4xl text-balance font-display text-[clamp(4rem,9vw,8rem)] leading-[0.84] tracking-[-0.07em]">随手写下，<br />暂不定论。</h1><p className="text-base leading-8 text-muted">比技术文章更轻，比动态更新更慢。这里保存关于产品、界面与构建过程的短观察。</p></div><ArticleIndex articles={ESSAY_ARTICLES} basePath="/essays" /></div>;
}
