"use client";

import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { useLearningProgress } from "@/components/learn/use-learning-progress";
import { LEARNING_TRACKS, lessonKey } from "@/lib/learn-data";
import { SchoolAccount } from "./school-account";
import { SchoolNav } from "./school-nav";
import { CloudWorkspace } from "./cloud-workspace";

export function LearningDashboard() {
  const { locale } = useLanguage();
  const { completed, ready, cloud, error } = useLearningProgress();
  const zh = locale === "zh";
  const tracks = LEARNING_TRACKS.map(track => ({ track, done: track.lessons.filter(lesson => completed.includes(lessonKey(track.slug, lesson.slug))).length, next: track.lessons.find(lesson => !completed.includes(lessonKey(track.slug, lesson.slug))) }));
  return <div className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:px-12">
    <TransitionLink href="/learn" className="text-sm text-accent">← FIELD SCHOOL</TransitionLink>
    <h1 className="mt-8 font-display text-5xl tracking-tight">{zh ? "学习工作台" : "Learning workspace"}</h1>
    <p className="mt-5 text-muted">{zh ? "根据已完成的课程，继续每条路径中的下一课。" : "Continue the next lesson in each path based on your completed work."}</p>
    <SchoolNav/><SchoolAccount/>
    <p role="status" className="text-sm text-muted">{error ? (zh ? "进度同步失败，请刷新重试。" : "Progress sync failed. Please refresh to retry.") : cloud ? (zh ? "当前使用账户云端进度。" : "Using account cloud progress.") : (zh ? "访客进度仅保存在此浏览器。" : "Guest progress stays in this browser.")}</p>
    {!ready ? <p className="mt-10" role="status">{zh ? "正在读取进度…" : "Loading progress…"}</p> : <div className="mt-12 grid gap-5 lg:grid-cols-3">{tracks.map(({ track, done, next }) => <section key={track.slug} className="rounded-3xl border border-line bg-panel p-7">
      <h2 className="font-display text-3xl">{track.title[locale]}</h2>
      <p className="mt-5 font-mono text-sm text-accent">{done} / {track.lessons.length}</p>
      <progress className="mt-3 w-full accent-[rgb(var(--accent))]" value={done} max={track.lessons.length} aria-label={track.title[locale]} />
      <p className="mt-7 text-xs text-muted">{next ? (zh ? "下一课" : "Next lesson") : (zh ? "课程已完成" : "Lessons complete")}</p>
      <p className="mt-3 text-lg">{next ? next.title[locale] : (zh ? "下一步：参加结课考试。" : "Next step: take the final exam.")}</p>
      <TransitionLink className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm text-paper" href={next ? `/learn/${track.slug}/${next.slug}` : `/learn/exam/${track.slug}`}>{next ? (done ? (zh ? "继续学习" : "Continue") : (zh ? "开始学习" : "Start learning")) : (zh ? "参加考试" : "Take exam")} →</TransitionLink>
    </section>)}</div>}
    <CloudWorkspace/>
  </div>;
}
