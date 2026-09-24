"use client";

import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { useLearningProgress } from "@/components/learn/use-learning-progress";
import { LEARNING_TRACKS, lessonKey } from "@/lib/learn-data";
import { SchoolAccount } from "./school-account";
import { SchoolNav } from "./school-nav";

export function ExamIndex() {
  const { locale } = useLanguage();
  const { completed } = useLearningProgress();
  const zh = locale === "zh";
  return <main className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:px-12"><TransitionLink href="/learn" className="text-sm text-accent">← FIELD SCHOOL</TransitionLink><SchoolNav/><header className="mt-12 max-w-4xl"><p className="font-mono text-[10px] tracking-widest text-accent">COURSE → EXAM → RECORD</p><h1 className="mt-5 font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.9] tracking-tight">{zh ? "学完，再来验证。" : "Learn it. Then test it."}</h1><p className="mt-7 text-base leading-8 text-muted">{zh ? "每条路径都有独立结课考试。完成该路径全部课程，并使用 GitHub 登录，就可以参加考试；未通过可以复习后重考。" : "Each path has its own final exam. Complete its lessons and sign in with GitHub to take it. If you do not pass, review and try again."}</p></header><SchoolAccount/><div className="mt-10 grid gap-5 lg:grid-cols-3">{LEARNING_TRACKS.map(track=>{const done=track.lessons.filter(lesson=>completed.includes(lessonKey(track.slug,lesson.slug))).length;return <section key={track.slug} className="flex flex-col rounded-[2rem] border border-line bg-panel p-7"><p className="font-mono text-[10px] text-accent">PATH / {track.number}</p><h2 className="mt-7 font-display text-3xl">{track.title[locale]}</h2><p className="mt-4 flex-1 text-sm leading-7 text-muted">{track.outcome[locale]}</p><p className="mt-6 border-t border-line pt-5 text-sm">{zh ? "课程进度" : "Lessons"} · {done}/{track.lessons.length}</p><TransitionLink href={`/learn/exam/${track.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline">{done===track.lessons.length ? (zh ? "进入考试" : "Enter exam") : (zh ? "查看要求" : "View requirements")}<ArrowRight className="size-4"/></TransitionLink></section>;})}</div><p className="mt-8 text-xs leading-6 text-muted">{zh ? "结课考试是自学反馈，不是监考考试或职业资格认证。" : "Final exams are for self-study feedback, not proctored or professional certification."}</p></main>;
}
