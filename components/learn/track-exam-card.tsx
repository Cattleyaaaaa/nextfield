"use client";

import { ArrowRight, GraduationCap } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import type { LearningTrack } from "@/lib/learn-data";

export function TrackExamCard({
  track,
  completed,
}: {
  track: LearningTrack;
  completed: number;
}) {
  const { locale } = useLanguage();
  const ready = completed === track.lessons.length;
  return (
    <section className="mt-12 rounded-[2rem] border border-accent/40 bg-accent/[0.05] p-7 sm:p-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <GraduationCap className="size-7 text-accent" aria-hidden="true" />
          <p className="mt-6 font-mono text-[10px] tracking-widest text-accent">
            FINAL EXAM / {track.number}
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            {locale === "zh"
              ? "完成课程，参加结课考试"
              : "Finish the lessons. Take the final exam."}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            {locale === "zh"
              ? `当前 ${completed}/${track.lessons.length} 节课程已完成。考试需 GitHub 登录，答对 6 题中的至少 5 题通过；通过记录会保存在账户中。`
              : `${completed}/${track.lessons.length} lessons complete. Sign in with GitHub to take the exam; 5 of 6 correct answers pass. Your result is saved to your account.`}
          </p>
        </div>
        <span className="rounded-full border border-accent/40 px-3 py-1.5 text-xs text-accent">
          {ready
            ? locale === "zh"
              ? "课程已完成"
              : "Lessons complete"
            : locale === "zh"
              ? "继续学习"
              : "Keep learning"}
        </span>
      </div>
      <TransitionLink
        href={`/learn/exam/${track.slug}`}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper"
      >
        {ready
          ? locale === "zh"
            ? "参加结课考试"
            : "Take final exam"
          : locale === "zh"
            ? "查看考试要求"
            : "View exam requirements"}
        <ArrowRight className="size-4" />
      </TransitionLink>
      <TransitionLink
        href={`/learn/review/${track.slug}`}
        className="ml-0 mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 px-6 py-3 text-sm text-accent sm:ml-4"
      >
        {locale === "zh"
          ? "先做免登录综合自测"
          : "Try the guest self-test first"}
        <ArrowRight className="size-4" />
      </TransitionLink>
    </section>
  );
}
