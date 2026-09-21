import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/site.config";

function asLastModified(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // 标记为示例的文章不收录，换成真实文章后会自动出现在这里。
  const posts = getPublishedPosts();

  return [
    { url: `${siteConfig.url}/`, lastModified: new Date() },
    { url: `${siteConfig.url}/about`, lastModified: new Date() },
    { url: `${siteConfig.url}/projects`, lastModified: new Date() },
    { url: `${siteConfig.url}/gallery`, lastModified: new Date() },
    { url: `${siteConfig.url}/build-log`, lastModified: new Date() },
    { url: `${siteConfig.url}/blog`, lastModified: new Date() },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: asLastModified(post.date),
    })),
  ];
}
