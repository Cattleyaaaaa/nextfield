import type { Metadata } from "next";
import { BlogIntro } from "@/components/blog/blog-intro";
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
      <BlogIntro postCount={posts.length} />

      <div className="mt-14">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
