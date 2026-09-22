import type { Metadata } from "next";
import { ArticleIndex } from "@/components/editorial/article-index";
import { COLOPHON_ARTICLES } from "@/lib/editorial-data";

export const metadata: Metadata = { title: "制作说明", description: "NEXTFIELD 的设计原则、技术选择与更新方式。" };

export default function ColophonPage() {
  return <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Colophon / 07</p><h1 className="mt-6 max-w-5xl font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.86] tracking-[-0.065em]">HOW THIS FIELD<br />WAS MADE.</h1><div className="mt-12 grid gap-8 border-t border-line pt-8 lg:grid-cols-[15rem_1fr]"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">Design & system notes</p><p className="max-w-3xl text-base leading-8 text-muted">从名字、内容结构到动态效果和交付方式，逐篇拆开 NEXTFIELD 背后的设计原则与工程系统。主视觉保留英文，正文随界面语言切换。</p></div><ArticleIndex articles={COLOPHON_ARTICLES} basePath="/colophon" /></div>;
}
