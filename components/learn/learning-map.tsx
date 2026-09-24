"use client";

import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { LEARNING_TRACKS } from "@/lib/learn-data";
import { TRACK_PROJECTS } from "@/lib/learn-guides";

export function LearningMap() {
  const { locale } = useLanguage();
  const totalMinutes = LEARNING_TRACKS.reduce((sum, track) => sum + track.lessons.reduce((time, lesson) => time + lesson.minutes, 0), 0);

  return <section className="my-12 border-y border-line py-10" aria-labelledby="learning-map-heading">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] tracking-[0.18em] text-accent">THE LEARNING MAP</p><h2 id="learning-map-heading" className="mt-4 font-display text-3xl sm:text-4xl">{locale === "zh" ? "从概念走到自己的作品" : "From concepts to your own work"}</h2></div><p className="max-w-sm text-sm leading-6 text-muted">{locale === "zh" ? `三条路径、${LEARNING_TRACKS.reduce((sum, track) => sum + track.lessons.length, 0)} 节课，建议投入约 ${totalMinutes} 分钟。每节课都有案例和动手任务，可按自己的节奏完成。` : `Three paths and ${LEARNING_TRACKS.reduce((sum, track) => sum + track.lessons.length, 0)} lessons, about ${totalMinutes} minutes of guided study. Every lesson includes a case and a hands-on task.`}</p></div>
    <div className="mt-8 grid gap-4 lg:grid-cols-3">{LEARNING_TRACKS.map((track) => {const project=TRACK_PROJECTS[track.slug];return <TransitionLink href={`/learn/${track.slug}`} key={track.slug} className="group flex flex-col rounded-2xl border border-line bg-panel p-6 hover:border-accent"><p className="font-mono text-[10px] text-accent">{track.number} / {track.lessons.length} {locale === "zh" ? "节" : "lessons"}</p><h3 className="mt-5 font-display text-2xl">{project.title[locale]}</h3><p className="mt-4 flex-1 text-sm leading-7 text-muted">{project.brief[locale]}</p><p className="mt-5 border-t border-line pt-4 text-xs leading-6"><span className="text-accent">{locale === "zh" ? "最终产物 / " : "Deliverable / "}</span>{project.deliverable[locale]}</p><span className="mt-5 inline-flex items-center gap-2 text-xs text-accent">{locale === "zh" ? "查看学习路径" : "Explore this path"}<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"/></span></TransitionLink>;})}</div>
  </section>;
}
