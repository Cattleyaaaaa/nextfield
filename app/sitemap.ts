import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/site.config";
import { BUILD_LOG_ARTICLES, COLOPHON_ARTICLES, ESSAY_ARTICLES } from "@/lib/editorial-data";
import { LEARNING_TRACKS } from "@/lib/learn-data";

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
    { url: `${siteConfig.url}/gallery/visual`, lastModified: new Date() },
    { url: `${siteConfig.url}/gallery/radio`, lastModified: new Date() },
    { url: `${siteConfig.url}/build-log`, lastModified: new Date() },
    { url: `${siteConfig.url}/colophon`, lastModified: new Date() },
    { url: `${siteConfig.url}/essays`, lastModified: new Date() },
    { url: `${siteConfig.url}/learn`, lastModified: new Date() },
    { url: `${siteConfig.url}/live-studio`, lastModified: new Date() },
    { url: `${siteConfig.url}/failures`, lastModified: new Date() },
    { url: `${siteConfig.url}/projects/replay`, lastModified: new Date() },
    { url: `${siteConfig.url}/systems`, lastModified: new Date() },
    { url: `${siteConfig.url}/proof`, lastModified: new Date() },
    { url: `${siteConfig.url}/scenario-lab`, lastModified: new Date() },
    { url: `${siteConfig.url}/architecture`, lastModified: new Date() },
    { url: `${siteConfig.url}/accessibility`, lastModified: new Date() },
    { url: `${siteConfig.url}/archive`, lastModified: new Date() },
    { url: `${siteConfig.url}/code-archaeology`, lastModified: new Date() },
    { url: `${siteConfig.url}/observatory`, lastModified: new Date() },
    { url: `${siteConfig.url}/missions`, lastModified: new Date() },
    { url: `${siteConfig.url}/field-question`, lastModified: new Date() },
    { url: `${siteConfig.url}/desktop`, lastModified: new Date() },
    { url: `${siteConfig.url}/share-card`, lastModified: new Date() },
    { url: `${siteConfig.url}/blog`, lastModified: new Date() },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: asLastModified(post.date),
    })),
    ...BUILD_LOG_ARTICLES.map((article) => ({ url: `${siteConfig.url}/build-log/${article.slug}`, lastModified: new Date() })),
    ...COLOPHON_ARTICLES.map((article) => ({ url: `${siteConfig.url}/colophon/${article.slug}`, lastModified: new Date() })),
    ...ESSAY_ARTICLES.map((article) => ({ url: `${siteConfig.url}/essays/${article.slug}`, lastModified: new Date() })),
    ...LEARNING_TRACKS.flatMap((track) => [
      { url: `${siteConfig.url}/learn/${track.slug}`, lastModified: new Date() },
      ...track.lessons.map((lesson) => ({ url: `${siteConfig.url}/learn/${track.slug}/${lesson.slug}`, lastModified: new Date() })),
    ]),
  ];
}
