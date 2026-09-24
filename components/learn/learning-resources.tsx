"use client";

import { useState } from "react";
import { ArrowUpRight, BookOpen, ChevronDown, Lightbulb } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { LEARNING_TRACKS, type LearningTrack } from "@/lib/learn-data";
import { LEARNING_CASES, LEARNING_GLOSSARY } from "@/lib/learning-resources";

type Filter = "all" | LearningTrack["slug"];

export function LearningResources() {
  const { locale } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");
  const cases = LEARNING_CASES.filter((item) => filter === "all" || item.track === filter);
  const trackName = (slug: LearningTrack["slug"]) =>
    LEARNING_TRACKS.find((track) => track.slug === slug)?.shortTitle[locale] ?? slug;

  return (
    <section aria-labelledby="case-library-title" className="mt-20 scroll-mt-24 border-t border-line pt-12" id="case-library">
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            <BookOpen className="size-4" aria-hidden="true" /> {locale === "zh" ? "案例学习 / 06" : "CASE STUDIES / 06"}
          </p>
          <h2 className="mt-5 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[-0.06em]" id="case-library-title">
            {locale === "zh" ? "把知识放进真实问题。" : "Put ideas into real problems."}
          </h2>
        </div>
        <p className="text-sm leading-7 text-muted">
          {locale === "zh"
            ? "六个常见的 Agent 与全栈产品情境。先想一想自己会怎么处理，再展开查看拆解步骤，最后回到相关课程深入学习。"
            : "Six practical Agent and full-stack product situations. Think through your response, open the walkthrough, then follow the linked lesson for depth."}
        </p>
      </div>

      <div aria-label={locale === "zh" ? "筛选案例方向" : "Filter case studies"} className="mt-8 flex flex-wrap gap-2">
        {(["all", ...LEARNING_TRACKS.map((track) => track.slug)] as Filter[]).map((item) => (
          <button
            aria-pressed={filter === item}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${filter === item ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-accent hover:text-accent"}`}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item === "all" ? (locale === "zh" ? "全部案例" : "All cases") : trackName(item)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
        {cases.map((item, index) => (
          <details className="group overflow-hidden rounded-[1.75rem] border border-line bg-panel open:border-accent/50" key={item.id}>
            <summary className="cursor-pointer list-none p-6 marker:hidden sm:p-7 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4 font-mono text-[10px] text-accent">
                <span>{trackName(item.track)} / {String(index + 1).padStart(2, "0")}</span>
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </span>
              <strong className="mt-6 block font-display text-2xl font-normal leading-tight tracking-[-0.04em] sm:text-3xl">{item.title[locale]}</strong>
              <span className="mt-4 block text-sm leading-7 text-muted">{item.situation[locale]}</span>
              <span className="mt-5 block border-t border-line pt-4 text-sm text-accent">{item.question[locale]}</span>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted group-open:hidden">
                {locale === "zh" ? "展开分析" : "Open walkthrough"} <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </span>
            </summary>
            <div className="border-t border-line px-6 pb-7 pt-6 sm:px-7">
              <ol className="space-y-5">
                {item.steps.map((step, stepIndex) => (
                  <li className="grid gap-3 sm:grid-cols-[2rem_1fr]" key={step.title.en}>
                    <span className="font-mono text-xs text-accent">{String(stepIndex + 1).padStart(2, "0")}</span>
                    <div><h3 className="text-sm font-medium">{step.title[locale]}</h3><p className="mt-1 text-sm leading-7 text-muted">{step.detail[locale]}</p></div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 rounded-xl bg-accent/[0.07] p-4 text-sm leading-7">
                <span className="font-medium text-accent">{locale === "zh" ? "动手产出：" : "Make this: "}</span>{item.outcome[locale]}
              </p>
              <TransitionLink className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline" href={`/learn/${item.lesson}`}>
                {locale === "zh" ? "进入相关课程" : "Open related lesson"} <ArrowUpRight className="size-4" aria-hidden="true" />
              </TransitionLink>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-16 scroll-mt-24 border-t border-line pt-12" id="learning-glossary">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent"><Lightbulb className="size-4" aria-hidden="true" /> {locale === "zh" ? "概念速查 / 09" : "QUICK REFERENCE / 09"}</p>
        <h2 className="mt-4 font-display text-3xl tracking-[-0.04em] sm:text-4xl">{locale === "zh" ? "遇到术语，随时回来查。" : "A small reference for the big ideas."}</h2>
        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {LEARNING_GLOSSARY.map((entry) => (
            <article className="flex flex-col rounded-2xl border border-line p-5" key={entry.term}>
              <h3 className="font-display text-xl">{entry.term}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted">{entry.definition[locale]}</p>
              <TransitionLink className="mt-5 inline-flex items-center gap-1.5 text-xs text-accent hover:underline" href={`/learn/${entry.lesson}`}>
                {locale === "zh" ? "阅读课程" : "Read the lesson"} <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </TransitionLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
