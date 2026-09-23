"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { TiltSurface } from "@/components/motion/tilt-surface";
import { TransitionLink } from "@/components/site/transition-link";
import { useMotionPreference } from "@/lib/use-motion-preference";
import type { PostMeta } from "@/types/post";

const ALL = "全部";

export function PostList({ posts }: { posts: PostMeta[] }) {
  const reducedMotion = useMotionPreference();
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categories = useMemo(() => [ALL, ...[...new Set(posts.map((post) => post.category))]], [posts]);
  const visiblePosts = useMemo(
    () => (activeCategory === ALL ? posts : posts.filter((post) => post.category === activeCategory)),
    [activeCategory, posts],
  );

  if (posts.length === 0) {
    return (
      <p className="border-t border-line pt-6 text-sm leading-6 text-muted">
        还没有文章。把 <span className="font-mono text-ink">.mdx</span> 文件放进{" "}
        <span className="font-mono text-ink">content/posts/</span> 就会出现在这里。
      </p>
    );
  }

  return (
    <div>
      {/* 分类多了以后往上滚动会一直够得到；backdrop-blur 保证盖在卡片上时可读 */}
      <div className="sticky top-0 z-20 -mx-2 flex flex-wrap items-center gap-2 bg-paper/85 px-2 py-3 backdrop-blur-md" role="tablist" aria-label="按分类筛选">
        {categories.map((category) => {
          const active = category === activeCategory;
          return (
            <button
              aria-selected={active}
              className={`rounded-full border px-3.5 py-1.5 text-xs tracking-[0.04em] transition-colors duration-300 ${
                active ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-accent hover:text-accent"
              }`}
              key={category}
              onClick={() => setActiveCategory(category)}
              role="tab"
              type="button"
            >
              {category}
            </button>
          );
        })}
      </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {visiblePosts.map((post, index) => (
            <motion.li
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -14 }}
              initial={reducedMotion ? false : { opacity: 0, y: 26 }}
              key={post.slug}
              layout
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.05, 0.4) }}
            >
              <TiltSurface className="h-full rounded-[1.6rem] border border-line bg-panel/60">
                <TransitionLink className="group flex h-full flex-col p-6" href={`/blog/${post.slug}`}>
                  <div className="flex items-baseline justify-between gap-3" data-tilt-depth="12">
                    <span className="font-mono text-xs tracking-[0.06em] text-accent">{post.displayDate}</span>
                    <span className="font-mono text-[10px] text-muted">{post.minutes} 分钟</span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl leading-tight tracking-[-0.03em] transition-colors duration-300 group-hover:text-accent" data-tilt-depth="30">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{post.summary}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-6" data-tilt-depth="8">
                    <span className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      阅读
                      <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </TransitionLink>
              </TiltSurface>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
