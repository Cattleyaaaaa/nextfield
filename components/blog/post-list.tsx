"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
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
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="按分类筛选">
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

      <ul className="mt-6">
        <AnimatePresence initial={false} mode="popLayout">
          {visiblePosts.map((post) => (
            <motion.li
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-line"
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              key={post.slug}
              transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <TransitionLink className="group block py-6" href={`/blog/${post.slug}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="shrink-0 font-mono text-xs tracking-[0.06em] text-accent sm:w-24">
                    {post.displayDate}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-xl leading-tight tracking-[-0.03em] transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                      {post.title}
                    </h3>
                    {post.summary ? (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{post.summary}</p>
                    ) : null}
                  </div>
                  <span className="flex shrink-0 flex-wrap items-center gap-2 text-[10px] text-muted">
                    {post.tags.map((tag) => (
                      <span className="rounded-full border border-line px-2 py-0.5 uppercase tracking-[0.12em]" key={tag}>
                        {tag}
                      </span>
                    ))}
                    <span className="ml-1 tracking-[0.06em]">{post.minutes} 分钟</span>
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </TransitionLink>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
