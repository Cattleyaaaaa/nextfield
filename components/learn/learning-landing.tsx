"use client";

import { useLanguage } from "@/components/site/language-provider";
import { LEARNING_TRACKS } from "@/lib/learn-data";
import { LearningHub } from "./learning-hub";
import { BlurText } from "@/components/react-bits/blur-text";

export function LearningLanding() {
  const { locale } = useLanguage();
  const lessonCount = LEARNING_TRACKS.reduce(
    (sum, track) => sum + track.lessons.length,
    0,
  );

  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-16 sm:px-8 sm:pt-24 lg:px-12">
      <section className="grid gap-10 border-b border-line pb-14 lg:grid-cols-[1fr_23rem] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            NEXTFIELD / FIELD SCHOOL
          </p>
          <BlurText
            as="h1"
            text={
              locale === "zh"
                ? "从认识开始。\n向深入前进。"
                : "START WITH WHY.\nLEARN TO BUILD."
            }
            className="mt-6 max-w-5xl font-display text-[clamp(3rem,6vw,6rem)] leading-[1.08] tracking-[-0.055em]"
          />
        </div>
        <div>
          <p className="text-base leading-8 text-muted">
            {locale === "zh"
              ? "沿着 Agent、全栈开发与产品实战三条路径学习；通过案例拆解、动手任务和结课考试检验理解。GitHub 登录后可同步进度并保存考试记录。"
              : "Follow paths in Agent development, full-stack engineering, and product practice. Work through cases, hands-on tasks, and final exams. Sign in with GitHub to sync progress and save exam results."}
          </p>
          <div className="mt-6 flex flex-wrap gap-5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
            <span>
              {LEARNING_TRACKS.length} {locale === "zh" ? "条路径" : "paths"}
            </span>
            <span>
              {lessonCount} {locale === "zh" ? "节课程" : "lessons"}
            </span>
            <span>6 {locale === "zh" ? "个案例" : "case studies"}</span>
            <span>
              {LEARNING_TRACKS.length}{" "}
              {locale === "zh" ? "场结课考试" : "final exams"}
            </span>
          </div>
          <a
            className="mt-7 inline-flex items-center gap-2 border-b border-accent pb-1 text-sm text-accent hover:text-ink"
            href="#curriculum"
          >
            {locale === "zh" ? "选择课程路径" : "Choose a learning path"}{" "}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <div className="mt-8">
        <LearningHub />
      </div>
    </div>
  );
}
