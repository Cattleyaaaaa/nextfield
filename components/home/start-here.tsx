"use client";

import { ArrowUpRight, BookOpen, Compass, GraduationCap } from "lucide-react";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";

const paths = [
  {
    number: "01", icon: Compass, href: "/projects",
    title: { zh: "看做过什么", en: "Explore the work" },
    copy: { zh: "从项目与可操作的证据开始，看看想法如何变成界面和系统。", en: "Start with projects and interactive evidence of how ideas became interfaces and systems." },
    action: { zh: "进入项目", en: "See projects" },
  },
  {
    number: "02", icon: GraduationCap, href: "/learn",
    title: { zh: "跟着课程学习", en: "Learn by building" },
    copy: { zh: "学习 Agent、全栈与产品设计；每条路径都有课程、练习和结课考试。", en: "Follow Agent, full-stack and product paths with lessons, practice and final exams." },
    action: { zh: "进入学习区", en: "Open Field School" },
  },
  {
    number: "03", icon: BookOpen, href: "/build-log",
    title: { zh: "看网站怎么长成", en: "See how this site grew" },
    copy: { zh: "翻阅建站纪事：哪些决定保留下来，哪些问题在过程中被改写。", en: "Read the build log: the choices that stayed and the questions that changed along the way." },
    action: { zh: "阅读纪事", en: "Read the build log" },
  },
] as const;

export function StartHere() {
  const { locale } = useLanguage();
  return <section aria-labelledby="start-here-title" className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:px-12">
    <div className="grid gap-6 border-t border-line pt-8 lg:grid-cols-[1fr_2fr] lg:items-end">
      <p className="font-mono text-[10px] tracking-[0.18em] text-accent">START HERE / 01</p>
      <div><h2 id="start-here-title" className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.055em]">{locale === "zh" ? "你可以从这里开始。" : "Find your way in."}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{locale === "zh" ? "不必从头读到尾。选一条适合你的路线，再往深处走。" : "You do not need to read from top to bottom. Pick the route that fits, then go deeper."}</p></div>
    </div>
    <div className="mt-9 grid gap-4 md:grid-cols-3">{paths.map(({ number, icon: Icon, href, title, copy, action }) =>
      <GlareHover className="h-full" key={number}><TransitionLink className="group flex h-full min-h-72 flex-col rounded-[1.5rem] border border-line bg-panel p-6 transition-[border-color,transform] hover:-translate-y-1 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" href={href}>
        <span className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-full border border-line text-accent"><Icon className="size-5" aria-hidden="true" /></span><span className="font-mono text-[10px] text-muted">{number} / 03</span></span>
        <strong className="mt-12 block font-display text-3xl font-normal tracking-[-0.04em]">{title[locale]}</strong>
        <span className="mt-3 block flex-1 text-sm leading-6 text-muted">{copy[locale]}</span>
        <span className="mt-8 flex items-center justify-between border-t border-line pt-4 text-xs text-accent">{action[locale]}<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </TransitionLink></GlareHover>
    )}</div>
  </section>;
}
