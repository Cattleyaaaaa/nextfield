"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Layers3, PenLine, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";

const steps = [
  {
    number: "01", icon: PenLine, href: "/build-log/rebuilding-the-home-story",
    label: { zh: "问题", en: "Question" }, title: { zh: "首页该讲什么？", en: "What should the homepage say?" },
    copy: { zh: "站点不只是作品列表。先确定访客需要理解的主线，再决定哪些内容值得占据首屏。", en: "A site is more than a list of projects. First decide what visitors need to understand, then what deserves the first screen." },
    link: { zh: "阅读首页改造纪事", en: "Read the homepage build log" },
  },
  {
    number: "02", icon: Layers3, href: "/colophon/decoration-follows-content",
    label: { zh: "方案", en: "Direction" }, title: { zh: "让装饰跟着内容走。", en: "Let content lead the design." },
    copy: { zh: "把浏览路径、内容层级与视觉语言放在同一张图里；效果服务于可读性，而不是盖住内容。", en: "Align the reading path, content hierarchy and visual language. Effects should support clarity, not cover it." },
    link: { zh: "阅读设计取舍", en: "Read the design rationale" },
  },
  {
    number: "03", icon: Sparkles, href: "/build-log/making-the-hero-move",
    label: { zh: "实现", en: "Build" }, title: { zh: "让首屏真正动起来。", en: "Make the first screen move." },
    copy: { zh: "把静态叙事做成可交互的首页，同时保留清楚的文字、导航和关闭动效的选择。", en: "Turn a static story into an interactive homepage while keeping readable text, navigation and a way to reduce motion." },
    link: { zh: "阅读动效建造记录", en: "Read the motion build log" },
  },
  {
    number: "04", icon: Check, href: "/systems",
    label: { zh: "检查", en: "Check" }, title: { zh: "把成品交给证据。", en: "Let the evidence speak." },
    copy: { zh: "站点持续公开结构、系统与体验约束；这是一份仍会更新的交付记录，不是一次性展示。", en: "The site exposes its structure, systems and experience constraints. It is a continuing record, not a one-off showcase." },
    link: { zh: "查看系统与证据", en: "Explore systems and evidence" },
  },
] as const;

export function BuildJourney() {
  const { locale } = useLanguage();
  const [active, setActive] = useState(0);
  const step = steps[active];
  const Icon = step.icon;

  return <section aria-labelledby="build-journey-title" className="border-y border-line bg-panel">
    <div className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:px-12">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-end"><p className="font-mono text-[10px] tracking-[0.18em] text-accent">ONE PROJECT / FOUR DECISIONS</p><div><h2 id="build-journey-title" className="font-display text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[0.92] tracking-[-0.055em]">{locale === "zh" ? "这个网站，如何从问题走到成品。" : "From question to shipped site."}</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-muted">{locale === "zh" ? "用 NEXTFIELD 自身做案例。点开每一步，看得到真实的记录与页面。" : "NEXTFIELD is the case study. Open each step to find the actual notes and pages behind it."}</p></div></div>
      <div className="mt-10 grid overflow-hidden rounded-[1.75rem] border border-line bg-paper lg:grid-cols-[16rem_1fr]">
        <div aria-label={locale === "zh" ? "项目阶段" : "Project stages"} className="grid grid-cols-2 border-b border-line p-3 sm:grid-cols-4 lg:grid-cols-1 lg:border-b-0 lg:border-r">
          {steps.map((item, index) => <button aria-current={active === index ? "step" : undefined} className={`flex min-h-16 items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${active === index ? "bg-ink text-paper" : "text-muted hover:bg-panel hover:text-ink"}`} key={item.number} onClick={() => setActive(index)} type="button"><span className={`font-mono text-[10px] ${active === index ? "text-liquid-foam" : "text-accent"}`}>{item.number}</span><span className="text-sm">{item.label[locale]}</span></button>)}
        </div>
        <div aria-live="polite" className="flex min-h-80 flex-col p-7 sm:p-10">
          <div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-full border border-accent/30 bg-accent/[0.07] text-accent"><Icon className="size-5" aria-hidden="true" /></span><span className="font-mono text-[10px] tracking-[0.15em] text-accent">{step.number} / 04</span></div>
          <div className="mt-auto pt-10"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{step.label[locale]}</p><h3 className="mt-3 font-display text-3xl tracking-[-0.04em] sm:text-4xl">{step.title[locale]}</h3><p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{step.copy[locale]}</p><TransitionLink className="mt-7 inline-flex items-center gap-2 border-b border-accent pb-1 text-sm text-accent hover:text-ink" href={step.href}>{step.link[locale]}<ArrowUpRight className="size-4" aria-hidden="true" /></TransitionLink></div>
        </div>
      </div>
    </div>
  </section>;
}
