"use client";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { type LearningTrack } from "@/lib/learn-data";
import { STAGE_TITLES, lessonStage } from "@/lib/learning/extensions";
export function CourseOutline({
  track,
  current,
}: {
  track: LearningTrack;
  current: string;
}) {
  const { locale } = useLanguage();
  return (
    <details className="mt-8 rounded-2xl border border-line bg-panel p-5">
      <summary className="cursor-pointer text-sm font-medium">
        {locale === "zh"
          ? "课程全目录 · 选择章节"
          : "Course outline · choose a lesson"}
      </summary>
      <nav
        aria-label={locale === "zh" ? "课程全目录" : "Full course outline"}
        className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STAGE_TITLES.map((title, stage) => (
          <div key={title.en}>
            <h2 className="mb-3 text-xs text-accent">
              0{stage + 1} / {title[locale]}
            </h2>
            <ol className="space-y-2">
              {track.lessons
                .filter(
                  (_, index) =>
                    lessonStage(index, track.lessons.length) === stage,
                )
                .map((l) => (
                  <li key={l.slug}>
                    <TransitionLink
                      aria-current={l.slug === current ? "page" : undefined}
                      className={`block rounded-lg px-2 py-2 text-sm ${l.slug === current ? "bg-accent/10 text-accent" : "text-muted hover:text-accent"}`}
                      href={`/learn/${track.slug}/${l.slug}`}
                    >
                      {l.number} · {l.title[locale]}
                    </TransitionLink>
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </nav>
    </details>
  );
}
