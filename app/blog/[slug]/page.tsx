import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { TransitionLink } from "@/components/site/transition-link";
import { getAllPosts, getPostBySlug, loadPostComponent } from "@/lib/posts";
import { mdxComponents } from "@/mdx-components";

type PostPageParams = { slug: string };

export function generateStaticParams(): PostPageParams[] {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<PostPageParams> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary || undefined,
    // 示例文不进搜索引擎，换成真实文章后这行自动失效。
    robots: post.sample ? { index: false, follow: false } : undefined,
  };
}

export default async function PostPage({ params }: { params: Promise<PostPageParams> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const Content = await loadPostComponent(post.slug);

  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <TransitionLink className="group inline-flex items-center gap-2 text-sm text-muted hover:text-ink" href="/blog">
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        全部文章
      </TransitionLink>

      <header className="mt-10 border-b border-line pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Writing / {post.displayDate}
        </p>
        <h1 className="mt-6 max-w-4xl text-balance font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-[-0.055em]">
          {post.title}
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span className="font-mono tracking-[0.06em]">{post.date}</span>
          <span className="rounded-full border border-line px-2.5 py-1 tracking-[0.04em]">{post.category}</span>
          {post.tags.map((tag) => (
            <span className="rounded-full border border-line px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]" key={tag}>
              {tag}
            </span>
          ))}
          <span className="tracking-[0.06em]">{post.minutes} 分钟</span>
        </div>
      </header>

      {post.sample ? (
        <p className="mt-8 rounded-2xl border border-dashed border-accent/50 bg-accent/[0.06] px-5 py-4 text-sm leading-6 text-ink">
          这是一篇格式示例，不是你写的真实文章。替换{" "}
          <span className="font-mono text-ink">content/posts/{post.slug}.mdx</span> 的内容，或者直接删掉这个文件。
        </p>
      ) : null}

      <article className="mt-10 max-w-article">
        <Content components={mdxComponents} />
      </article>

      <div className="mt-16 border-t border-line pt-8">
        <TransitionLink className="group inline-flex items-center gap-2 text-sm font-medium hover:text-accent" href="/blog">
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          回到全部文章
        </TransitionLink>
      </div>
    </div>
  );
}
