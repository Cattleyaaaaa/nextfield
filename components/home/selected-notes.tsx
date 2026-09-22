import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import type { PostMeta } from "@/types/post";

export function SelectedNotes({ posts }: { posts: PostMeta[] }) {
  return (
    <section className="border-y border-line bg-panel">
      <div className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12">
        <div className="grid gap-7 lg:grid-cols-12 lg:items-end"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent lg:col-span-3">Selected notes / 05</p><h2 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.88] tracking-[-0.06em] lg:col-span-6">THOUGHTS,<br />IN PROGRESS.</h2><p className="max-w-sm text-sm leading-6 text-muted lg:col-span-3">不等想法彻底完成才发布；先留下可被继续推演的版本。</p></div>
        <ol className="mt-12 border-t border-line">
          {posts.map((post, index) => <li className="border-b border-line" key={post.slug}><TransitionLink className="group grid gap-4 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-center" href={`/blog/${post.slug}`}><span className="font-mono text-[10px] tracking-[0.16em] text-accent">{String(index + 1).padStart(2, "0")}</span><div><p className="font-display text-2xl tracking-[-0.035em] group-hover:text-accent sm:text-3xl">{post.title}</p><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{post.summary}</p></div><span className="flex items-center gap-3 text-xs text-muted">{post.minutes} MIN <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span></TransitionLink></li>)}
        </ol>
        <TransitionLink className="mt-8 inline-flex items-center gap-2 text-sm text-muted hover:text-accent" href="/blog">查看全部笔记 <ArrowUpRight className="size-4" /></TransitionLink>
      </div>
    </section>
  );
}
