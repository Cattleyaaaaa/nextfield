"use client";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { useLanguage } from "@/components/site/language-provider";
import { lessonKey, type LearningTrack } from "@/lib/learn-data";
import { STAGE_TITLES, lessonStage } from "@/lib/learning/extensions";
import { useLearningProgress } from "./use-learning-progress";
import { TRACK_PROJECTS } from "@/lib/learn-guides";
import { TrackExamCard } from "./track-exam-card";
import { SchoolNav } from "./school-nav";

export function TrackOverview({ track }: { track: LearningTrack }) {
  const { locale } = useLanguage();
  const { completed } = useLearningProgress();
  const zh = locale === "zh";
  const project = TRACK_PROJECTS[track.slug];
  const count = track.lessons.filter((l) =>
    completed.includes(lessonKey(track.slug, l.slug)),
  ).length;
  const next = track.lessons.find(
    (l) => !completed.includes(lessonKey(track.slug, l.slug)),
  );
  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-16 sm:px-8 lg:px-12">
      <TransitionLink
        href="/learn"
        className="inline-flex items-center gap-2 text-sm text-muted"
      >
        <ArrowLeft className="size-4" />
        {zh ? "全部课程" : "All courses"}
      </TransitionLink>
      <SchoolNav />
      <header className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="text-xs text-accent">
            {zh
              ? "循序渐进 · 从零到交付"
              : "Step by step · from zero to delivery"}
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">
            {track.title[locale]}
          </h1>
          <p className="mt-5 max-w-2xl leading-8 text-muted">
            {track.summary[locale]}
          </p>
          <p className="mt-4 text-sm text-accent">
            {track.lessons.length} {zh ? "节课" : "lessons"} ·{" "}
            {track.lessons.reduce((sum, l) => sum + l.minutes, 0)}{" "}
            {zh ? "分钟参考学习时间" : "estimated minutes"}
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-panel p-6">
          <p className="flex justify-between text-sm">
            <span>{zh ? "你的进度" : "Your progress"}</span>
            <span>
              {count}/{track.lessons.length}
            </span>
          </p>
          <progress
            aria-label={zh ? "课程进度" : "Course progress"}
            value={count}
            max={track.lessons.length}
            className="mt-4 h-2 w-full accent-accent"
          />
          <TransitionLink
            href={
              next
                ? `/learn/${track.slug}/${next.slug}`
                : `/learn/exam/${track.slug}`
            }
            className="mt-6 flex items-center justify-between rounded-full bg-ink px-5 py-3 text-sm text-paper"
          >
            {next
              ? count
                ? zh
                  ? "继续学习"
                  : "Continue learning"
                : zh
                  ? "从第一课开始"
                  : "Start lesson one"
              : zh
                ? "进入结课考试"
                : "Take the final exam"}
            <ArrowUpRight className="size-4" />
          </TransitionLink>
          <p className="mt-4 text-xs leading-6 text-muted">
            {zh
              ? "可先匿名学习；GitHub 登录后同步进度。"
              : "Study as a guest; sign in with GitHub to sync progress."}
          </p>
        </div>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <main className="space-y-8">
          {STAGE_TITLES.map((title, stage) => (
            <section
              key={title.en}
              className="overflow-hidden rounded-3xl border border-line"
            >
              <header className="flex items-center gap-4 bg-panel p-6">
                <span className="font-mono text-xs text-accent">
                  0{stage + 1}
                </span>
                <h2 className="font-display text-2xl">{title[locale]}</h2>
              </header>
              <ol className="divide-y divide-line">
                {track.lessons
                  .filter(
                    (_, index) =>
                      lessonStage(index, track.lessons.length) === stage,
                  )
                  .map((lesson) => (
                    <li key={lesson.slug}>
                      <TransitionLink
                        href={`/learn/${track.slug}/${lesson.slug}`}
                        className="group flex gap-4 p-5 sm:p-6"
                      >
                        <span className="pt-1 font-mono text-xs text-muted">
                          {lesson.number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-medium group-hover:text-accent">
                            {lesson.title[locale]}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {lesson.summary[locale]}
                          </p>
                          <p className="mt-3 text-xs text-accent">
                            {lesson.minutes}{" "}
                            {zh
                              ? "分钟 · 阅读 / 实践 / 测验"
                              : "min · Read / practice / quiz"}
                          </p>
                        </div>
                        {completed.includes(
                          lessonKey(track.slug, lesson.slug),
                        ) ? (
                          <CheckCircle2 className="mt-1 size-5 shrink-0 text-accent" />
                        ) : (
                          <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted" />
                        )}
                      </TransitionLink>
                    </li>
                  ))}
              </ol>
            </section>
          ))}
        </main>
        <aside className="h-fit rounded-3xl bg-ink p-7 text-paper lg:sticky lg:top-28">
          <p className="text-xs text-liquid-foam">
            {zh ? "你将完成的项目" : "Your capstone project"}
          </p>
          <h2 className="mt-4 font-display text-3xl">
            {project.title[locale]}
          </h2>
          <p className="mt-5 text-sm leading-7 text-paper/70">
            {project.brief[locale]}
          </p>
          <p className="mt-6 border-t border-paper/20 pt-5 text-sm leading-7">
            {project.deliverable[locale]}
          </p>
          <p className="mt-6 text-xs leading-6 text-liquid-foam">
            {zh
              ? "阅读 → 动手任务 → 检查点 → 下一课 → 结课考试。"
              : "Read → practice → checkpoint → next lesson → final exam."}
          </p>
        </aside>
      </div>
      <TrackExamCard track={track} completed={count} />
    </div>
  );
}
