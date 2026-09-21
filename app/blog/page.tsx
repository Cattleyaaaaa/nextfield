import type { Metadata } from "next";
import { PostList } from "@/components/blog/post-list";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "写作",
  description: "把踩过的坑与验证过的方法整理成可复用的文字。",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-accent">Writing / Index</p>
      <h1 className="max-w-5xl text-balance font-display text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.92] tracking-[-0.06em]">
        写下来的东西。
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">
        把踩过的坑与验证过的方法整理成可复用的文字。
        {posts.length > 0 ? ` 目前 ${posts.length} 篇。` : null}
      </p>

      <div className="mt-14">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
