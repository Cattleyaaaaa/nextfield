"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/use-motion-preference";
import type { PostMeta } from "@/types/post";

const WRITING_SLIDE_MOTION = {
  delay: 0.32,
  ease: "power2.out",
  rows: { at: 0, y: 16, duration: 0.45, stagger: 0.08 },
};

// 文章列表由 app/page.tsx 在服务端读好（写作屏是客户端组件，读不了文件系统），
// 这里只负责渲染最近的几篇。
export function WritingSlide({ posts }: { posts: PostMeta[] }) {
  const reducedMotion = useMotionPreference();
  const slideRef = useRef<HTMLElement>(null);
  const recentPosts = posts.slice(0, 4);

  useGSAP(() => {
    if (reducedMotion) return;

    gsap.timeline({
      delay: WRITING_SLIDE_MOTION.delay,
      defaults: { ease: WRITING_SLIDE_MOTION.ease },
    }).fromTo(
      "[data-writing-row]",
      { autoAlpha: 0, y: WRITING_SLIDE_MOTION.rows.y },
      {
        autoAlpha: 1,
        y: 0,
        duration: WRITING_SLIDE_MOTION.rows.duration,
        stagger: WRITING_SLIDE_MOTION.rows.stagger,
        clearProps: "opacity,visibility,transform",
      },
      WRITING_SLIDE_MOTION.rows.at,
    );
  }, { scope: slideRef, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <section className="mx-auto flex h-full max-w-site items-center px-5 py-8 sm:px-8 lg:px-12" ref={slideRef}>
      <div className="w-full">
        <header className="mb-5 flex items-end justify-between gap-6 border-b border-line pb-5 sm:mb-6 sm:pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">03 / Writing</p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.75rem)] leading-[0.92] tracking-[-0.055em]">写下来的东西。</h2>
          </div>
          <p className="hidden max-w-sm text-sm leading-6 text-muted sm:block">把踩过的坑与验证过的方法整理成可复用的文字。</p>
        </header>

        {posts.length === 0 ? (
          <p className="border-t border-line py-6 text-sm leading-6 text-muted">
            还没有文章。把 <span className="font-mono text-ink">.mdx</span> 放进{" "}
            <span className="font-mono text-ink">content/posts/</span> 就会出现在这里。
          </p>
        ) : (
          <ul>
            {recentPosts.map((post) => (
              <li className="border-t border-line" data-writing-row key={post.slug}>
                <TransitionLink
                  className="group flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
                  href={`/blog/${post.slug}`}
                >
                  <span className="shrink-0 font-mono text-xs tracking-[0.06em] text-accent sm:w-24">{post.displayDate}</span>
                  <h3 className="flex-1 font-display text-xl leading-tight tracking-[-0.03em] transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                    {post.title}
                  </h3>
                  <span className="flex shrink-0 flex-wrap items-center gap-2 text-[10px] text-muted">
                    {post.tags.map((tag) => (
                      <span className="rounded-full border border-line px-2 py-0.5 uppercase tracking-[0.12em]" key={tag}>{tag}</span>
                    ))}
                    <span className="ml-1 tracking-[0.06em]">{post.minutes} 分钟</span>
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </TransitionLink>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <TransitionLink className="group inline-flex items-center gap-2 text-sm font-medium hover:text-accent" href="/blog">
            查看全部文章
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </TransitionLink>
          <span className="text-[11px] tracking-[0.06em] text-muted">共 {posts.length} 篇</span>
        </div>
      </div>
    </section>
  );
}
