"use client";
import { useState } from "react";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import type { LearningTrack } from "@/lib/learn-data";
import { SchoolNav } from "./school-nav";

export function CourseSelfTest({ track }: { track: LearningTrack }) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = track.lessons.filter(
    (l) => l.challenge.options[answers[l.slug]]?.correct,
  ).length;
  const answered = Object.keys(answers).length;
  return (
    <main className="mx-auto max-w-4xl px-5 pb-28 pt-16 sm:px-8">
      <SchoolNav />
      <p className="text-xs text-accent">
        {zh
          ? "开放复习 · 不需要登录"
          : "Open-book review · no sign-in required"}
      </p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">
        {track.shortTitle[locale]} · {zh ? "综合自测" : "Course self-test"}
      </h1>
      <p className="mt-5 text-sm leading-7 text-muted">
        {zh
          ? "每节课一道题，可在读完后集中复习。自测在当前页面完成，不上传成绩、不生成结课记录；正式考试仍需完成课程并使用 GitHub 登录。"
          : "Review one question per lesson. This self-test runs on this page without uploads or completion records. Formal exams still require completed lessons and GitHub sign-in."}
      </p>
      {submitted && (
        <section
          role="status"
          className="mt-8 rounded-3xl bg-ink p-7 text-paper"
        >
          <h2 className="font-display text-3xl">
            {score}/{track.lessons.length}
          </h2>
          <p className="mt-3 text-sm text-paper/75">
            {zh
              ? "查看下面的解释，点击章节链接复习错题。此成绩不是正式考试结果。"
              : "Review explanations below and revisit incorrect lessons. This is not a formal exam result."}
          </p>
          <button
            type="button"
            className="mt-5 rounded-full bg-liquid-foam px-5 py-2 text-sm text-ink"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            {zh ? "重新自测" : "Try again"}
          </button>
        </section>
      )}
      <div className="mt-8 space-y-5">
        {track.lessons.map((l, index) => (
          <section
            key={l.slug}
            className="rounded-3xl border border-line bg-panel p-6"
          >
            <TransitionLink
              className="text-xs text-accent hover:underline"
              href={`/learn/${track.slug}/${l.slug}`}
            >
              {l.number} · {l.title[locale]} ↗
            </TransitionLink>
            <h2 className="mt-4 text-lg leading-7">
              {index + 1}. {l.challenge.question[locale]}
            </h2>
            <div
              role="group"
              aria-label={l.challenge.question[locale]}
              className="mt-5 space-y-2"
            >
              {l.challenge.options.map((o, i) => (
                <button
                  disabled={submitted}
                  aria-pressed={answers[l.slug] === i}
                  type="button"
                  key={o.label.en}
                  onClick={() => setAnswers((a) => ({ ...a, [l.slug]: i }))}
                  className={`block w-full rounded-xl border px-4 py-3 text-left text-sm disabled:cursor-default ${answers[l.slug] === i ? "border-accent bg-accent/10" : "border-line bg-paper"}`}
                >
                  {String.fromCharCode(65 + i)} · {o.label[locale]}
                </button>
              ))}
            </div>
            {submitted && (
              <p className="mt-5 border-t border-line pt-4 text-sm leading-7">
                <span className="text-accent">
                  {l.challenge.options[answers[l.slug]]?.correct
                    ? zh
                      ? "答对了。"
                      : "Correct. "
                    : zh
                      ? "需要复习。"
                      : "Review this topic. "}
                </span>
                {l.challenge.options.find((o) => o.correct)?.feedback[locale]}
              </p>
            )}
          </section>
        ))}
      </div>
      <div className="sticky bottom-4 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-5 shadow-lg">
        <span className="text-sm">
          {answered}/{track.lessons.length} {zh ? "已作答" : "answered"}
        </span>
        <button
          type="button"
          disabled={submitted || answered !== track.lessons.length}
          onClick={() => setSubmitted(true)}
          className="rounded-full bg-ink px-6 py-3 text-sm text-paper disabled:opacity-40"
        >
          {zh ? "提交自测并查看解释" : "Submit and review"}
        </button>
      </div>
      <TransitionLink
        className="mt-8 inline-block text-sm text-accent"
        href={`/learn/exam/${track.slug}`}
      >
        {zh ? "查看正式结课考试 →" : "View the formal final exam →"}
      </TransitionLink>
    </main>
  );
}
