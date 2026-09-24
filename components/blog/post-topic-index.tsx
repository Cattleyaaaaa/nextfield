"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { gsap, useGSAP } from "@/lib/gsap";
import type { PostMeta } from "@/types/post";

const ALL = "all";
const TOPICS = [
  {
    key: "Agent",
    label: { zh: "Agent", en: "Agent" },
    summary: {
      zh: "自主行动、检索与边界",
      en: "Action, retrieval and boundaries",
    },
  },
  {
    key: "前端",
    label: { zh: "前端", en: "Frontend" },
    summary: {
      zh: "浏览器里的实现与取舍",
      en: "Implementation and trade-offs in the browser",
    },
  },
  {
    key: "交互",
    label: { zh: "交互", en: "Interaction" },
    summary: {
      zh: "状态、反馈与恢复路径",
      en: "States, feedback and recovery",
    },
  },
  {
    key: "设计",
    label: { zh: "设计", en: "Design" },
    summary: {
      zh: "内容层级与视觉判断",
      en: "Content hierarchy and visual decisions",
    },
  },
  {
    key: "哲学",
    label: { zh: "哲学", en: "Philosophy" },
    summary: {
      zh: "关于信任、证据与未完成",
      en: "Trust, evidence and unfinished work",
    },
  },
] as const;

export function PostTopicIndex({ posts }: { posts: PostMeta[] }) {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const topics = useMemo(() => {
    const known = TOPICS.filter((topic) =>
      posts.some((post) => post.category === topic.key),
    );
    const unknown = [...new Set(posts.map((post) => post.category))].filter(
      (category) => !TOPICS.some((topic) => topic.key === category),
    );
    return [
      ...known,
      ...unknown.map((category) => ({
        key: category,
        label: { zh: category, en: category },
        summary: { zh: "其他观察", en: "Other notes" },
      })),
    ];
  }, [posts]);
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return posts.filter(
      (post) =>
        (activeCategory === ALL || post.category === activeCategory) &&
        (!needle ||
          `${post.title} ${post.summary} ${post.category} ${post.tags.join(" ")}`
            .toLocaleLowerCase()
            .includes(needle)),
    );
  }, [posts, activeCategory, query]);

  useGSAP(
    () => {
      if (!motionEnabled) return;
      const headings = rootRef.current?.querySelectorAll<HTMLElement>(
        "[data-topic-heading]",
      );
      const rows =
        rootRef.current?.querySelectorAll<HTMLElement>("[data-post-row]");
      if (headings?.length)
        gsap.fromTo(
          headings,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.06,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          },
        );
      if (rows?.length)
        gsap.fromTo(
          rows,
          { autoAlpha: 0, y: 10 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.38,
            stagger: { each: 0.025, from: "start" },
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          },
        );
    },
    {
      scope: rootRef,
      dependencies: [activeCategory, query, motionEnabled],
      revertOnUpdate: true,
    },
  );

  if (!posts.length)
    return (
      <p className="border-t border-line pt-6 text-sm text-muted">
        {locale === "zh" ? "文章还在写。" : "Articles are on the way."}
      </p>
    );

  return (
    <div ref={rootRef}>
      <div className="sticky top-16 z-20 -mx-2 border-y border-line bg-paper/95 px-2 py-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.17em] text-accent">
              {locale === "zh" ? "主题索引" : "TOPIC INDEX"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {locale === "zh"
                ? `共 ${posts.length} 篇 · 当前显示 ${visible.length} 篇`
                : `${posts.length} articles · ${visible.length} showing`}
            </p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-full border border-line bg-panel px-4 py-2.5 text-sm sm:w-72">
            <Search
              className="size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="sr-only">
              {locale === "zh" ? "搜索文章" : "Search articles"}
            </span>
            <input
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
              placeholder={
                locale === "zh"
                  ? "搜索主题、标题或关键词"
                  : "Search topics, titles or tags"
              }
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                aria-label={locale === "zh" ? "清除搜索" : "Clear search"}
                onClick={() => setQuery("")}
                type="button"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
        </div>
        <div
          aria-label={locale === "zh" ? "按主题筛选" : "Filter by topic"}
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
        >
          <button
            aria-selected={activeCategory === ALL}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs ${activeCategory === ALL ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-accent"}`}
            onClick={() => setActiveCategory(ALL)}
            role="tab"
            type="button"
          >
            {locale === "zh" ? "全部" : "All"}{" "}
            <span className="ml-1 opacity-60">{posts.length}</span>
          </button>
          {topics.map((topic) => (
            <button
              aria-selected={activeCategory === topic.key}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs ${activeCategory === topic.key ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-accent"}`}
              key={topic.key}
              onClick={() => setActiveCategory(topic.key)}
              role="tab"
              type="button"
            >
              {topic.label[locale]}{" "}
              <span className="ml-1 opacity-60">
                {posts.filter((post) => post.category === topic.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {visible.length ? (
        <div className="mt-10 space-y-14">
          {topics.map((topic, topicIndex) => {
            const group = visible.filter((post) => post.category === topic.key);
            if (!group.length) return null;
            return (
              <section aria-label={topic.label[locale]} key={topic.key}>
                <div
                  className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-5"
                  data-topic-heading
                >
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.16em] text-accent">
                      {locale === "zh" ? "主题" : "TOPIC"} /{" "}
                      {String(topicIndex + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-2 font-display text-3xl tracking-[-0.04em] sm:text-4xl">
                      {topic.label[locale]}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {topic.summary[locale]}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {group.length} {locale === "zh" ? "篇" : "ARTICLES"}
                  </span>
                </div>
                <ol>
                  {group.map((post, index) => (
                    <li
                      className={`relative border-b border-line ${motionEnabled ? "before:absolute before:inset-y-3 before:left-0 before:w-[2px] before:origin-center before:scale-y-0 before:bg-accent before:transition-transform before:duration-300 hover:before:scale-y-100 focus-within:before:scale-y-100" : ""}`}
                      data-post-row
                      key={post.slug}
                    >
                      <TransitionLink
                        className={`group grid gap-3 py-5 hover:bg-panel/50 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-start sm:gap-5 sm:px-3 ${motionEnabled ? "transition-[transform,background-color] duration-300 hover:translate-x-1 focus-visible:translate-x-1" : ""}`}
                        href={`/blog/${post.slug}`}
                      >
                        <span className="pt-1 font-mono text-[10px] text-accent">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <strong className="block font-display text-xl font-normal leading-tight tracking-[-0.025em] group-hover:text-accent sm:text-2xl">
                            {post.title}
                          </strong>
                          <span className="mt-2 block max-w-3xl text-sm leading-6 text-muted">
                            {post.summary}
                          </span>
                          <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted">
                            <span>{post.date}</span>
                            <span>
                              {post.minutes} {locale === "zh" ? "分钟" : "min"}
                            </span>
                            <span className="truncate">
                              {post.tags.slice(0, 3).join(" / ")}
                            </span>
                          </span>
                        </span>
                        <ArrowUpRight
                          className="hidden size-4 text-accent transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 sm:block"
                          aria-hidden="true"
                        />
                      </TransitionLink>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-line p-8 text-sm text-muted">
          {locale === "zh"
            ? "没有找到符合条件的文章。试试清除搜索或选择其他主题。"
            : "No matching articles. Clear the search or choose another topic."}
        </div>
      )}
    </div>
  );
}
