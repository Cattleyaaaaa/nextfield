import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostChrome } from "@/components/blog/blog-post-chrome";
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
  const EnglishContent = post.english ? await loadPostComponent(post.slug, "en") : null;

  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <BlogPostChrome post={post} position="top" />
      <article className="post-content--zh mt-10 max-w-article" lang="zh-CN">
        <Content components={mdxComponents} />
      </article>
      {EnglishContent ? <article className="post-content--en mt-10 max-w-article" lang="en"><EnglishContent components={mdxComponents} /></article> : null}
      <BlogPostChrome post={post} position="bottom" />
    </div>
  );
}
