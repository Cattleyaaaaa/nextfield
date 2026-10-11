import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FieldBookReader } from "@/components/field-book/field-book-reader";
import { getFieldBookEntries } from "@/lib/field-book";
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
  const entries = getFieldBookEntries();
  const entry = entries.find((item) => item.href === `/blog/${post.slug}`) ?? {
    kind: "writing" as const,
    slug: post.slug,
    href: `/blog/${post.slug}`,
    date: post.date,
    category: post.category,
    title: { zh: post.title, en: post.english?.title ?? post.title },
    summary: { zh: post.summary, en: post.english?.summary ?? post.summary },
    minutes: { zh: post.minutes, en: post.english?.minutes ?? post.minutes },
  };

  return <FieldBookReader
    entry={entry}
    entries={entries}
    contentZh={<Content components={mdxComponents} />}
    contentEn={EnglishContent ? <EnglishContent components={mdxComponents} /> : undefined}
  />;
}
