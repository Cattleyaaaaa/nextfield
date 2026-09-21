import fs from "node:fs";
import path from "node:path";
import type { PostMeta } from "@/types/post";

export type { PostMeta };

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const POST_EXTENSION = ".mdx";

type FrontmatterValue = string | string[];
type Frontmatter = Record<string, FrontmatterValue>;

function unquote(value: string) {
  const trimmed = value.trim();
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return quoted ? trimmed.slice(1, -1) : trimmed;
}

function parseValue(value: string): FrontmatterValue {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map(unquote)
      .filter(Boolean);
  }
  return unquote(trimmed);
}

// 只支持博客 frontmatter 用到的那一小撮 YAML 子集：
//   key: value / key: "value" / key: [a, b] / key: 后跟缩进短横线列表
// 刻意不引入 YAML 依赖 —— 这层解析完全由我们自己的书写格式约束。
function parseFrontmatter(source: string): { data: Frontmatter; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/.exec(source);
  if (!match) return { data: {}, content: source };

  const data: Frontmatter = {};
  let currentKey: string | null = null;

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const listItem = /^-\s+(.*)$/.exec(line);
    if (listItem && currentKey) {
      const existing = data[currentKey];
      data[currentKey] = [...(Array.isArray(existing) ? existing : []), unquote(listItem[1])];
      continue;
    }

    const entry = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!entry) continue;
    currentKey = entry[1];
    data[currentKey] = entry[2] ? parseValue(entry[2]) : [];
  }

  return { data, content: source.slice(match[0].length) };
}

// 中文按字计、西文按词计，粗算出阅读时长。写长文时不需要手动维护这个数字。
function estimateMinutes(content: string) {
  const cjk = (content.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (content.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 200));
}

function asString(value: FrontmatterValue | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toMeta(slug: string, data: Frontmatter, content: string): PostMeta {
  const date = asString(data.date);
  const [year, month] = date.split("-");
  return {
    slug,
    title: asString(data.title, slug),
    date,
    displayDate: year && month ? `${year} · ${month}` : date,
    category: asString(data.category, "其他"),
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: asString(data.summary),
    minutes: estimateMinutes(content),
    sample: asString(data.sample) === "true",
  };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(POST_EXTENSION))
    .map((file) => file.slice(0, -POST_EXTENSION.length));
}

export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const { data, content } = parseFrontmatter(fs.readFileSync(path.join(POSTS_DIR, slug + POST_EXTENSION), "utf8"));
      return toMeta(slug, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

export function getPostBySlug(slug: string): PostMeta | null {
  if (!getPostSlugs().includes(slug)) return null;
  const { data, content } = parseFrontmatter(fs.readFileSync(path.join(POSTS_DIR, slug + POST_EXTENSION), "utf8"));
  return toMeta(slug, data, content);
}

export function getPostCategories(): string[] {
  return [...new Set(getAllPosts().map((post) => post.category))];
}

/** 真的要被收录、写进 sitemap 的文章（示例文排除在外）。 */
export function getPublishedPosts(): PostMeta[] {
  return getAllPosts().filter((post) => !post.sample);
}

// webpack 会把这段模板字面量动态 import 编译成一个 context，
// 匹配 content/posts 下的所有 .mdx —— 新增文章不需要改这里的代码。
export async function loadPostComponent(slug: string) {
  const mod = await import(`@/content/posts/${slug}.mdx`);
  return mod.default;
}
