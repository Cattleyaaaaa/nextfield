"use client";

import { ArrowRight, GraduationCap } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";

export function ExamCallout() {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  return <section className="mt-6 rounded-[2rem] border border-accent/40 bg-accent/[0.05] p-7 sm:p-9"><div className="flex flex-wrap items-start justify-between gap-6"><div><GraduationCap className="size-7 text-accent" aria-hidden="true"/><p className="mt-5 font-mono text-[10px] tracking-[0.18em] text-accent">FIELD SCHOOL / EXAMS</p><h2 className="mt-3 font-display text-3xl sm:text-4xl">{zh ? "课程之后，是结课考试。" : "After the lessons comes the exam."}</h2></div><TransitionLink href="/learn/exam" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper">{zh ? "查看三条路径的考试" : "Explore all three exams"}<ArrowRight className="size-4"/></TransitionLink></div><ol className="mt-8 grid gap-3 sm:grid-cols-3">{[[zh ? "完成课程" : "Complete lessons",zh ? "按自己的节奏学习案例和练习。" : "Study each case and practice task."],[zh ? "GitHub 登录" : "Sign in with GitHub",zh ? "同步课程进度并进入试卷。" : "Sync progress and unlock the paper."],[zh ? "参加考试" : "Take the exam",zh ? "六题答对五题，留下结课记录。" : "Score 5 of 6 to record completion."]].map(([title,detail],index)=><li key={title} className="rounded-2xl border border-line bg-paper p-5"><span className="font-mono text-xs text-accent">0{index+1}</span><h3 className="mt-4 text-lg">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{detail}</p></li>)}</ol></section>;
}
