import createMDX from "@next/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";

const isProduction = process.env.NODE_ENV === "production";
const isCloudflareBuild = process.env.CLOUDFLARE_BUILD === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: isCloudflareBuild ? ".next" : isProduction ? ".next-production" : ".next-development",
  outputFileTracingRoot: process.cwd(),
  // Vercel serves authenticated APIs alongside pre-rendered course pages.
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  poweredByHeader: false,
  eslint: {
    // build 内部跑 eslint 会先把 distDir/cache/eslint 写出来，导致导出目录
    // 在导出前就已存在；本机 safe-delete 走回收站删除目录会失败（F: 盘回收站
    // 报「这个系统不支持该功能」），导出随之中止。lint 由 npm run lint 单独跑。
    ignoreDuringBuilds: true,
  },
  experimental: {
    // 本机的 jest-worker 子进程在渲染 app/blog/[slug] 时会不定时崩溃
    // （报 "Jest worker encountered 2 child process exceptions"），改用 worker_threads 后 dev 稳定。
    // 只在开发环境开启：生产构建下它会触发 revalidateTag 的 IPC 报错（localhost:undefined）。
    ...(isProduction ? {} : { workerThreads: true }),
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.glb$/i,
      type: "asset/resource",
    });
    return config;
  },
};

// 文章正文放在 content/posts/*.mdx，靠 frontmatter 提供标题/日期/分类。
// - remark-frontmatter：让 MDX 把文首的 YAML 块当作元数据剥离，而不是渲染成正文。
// - remark-gfm：表格、删除线、任务列表、自动链接都靠它，MDX 默认管线不含这些。
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkFrontmatter, remarkGfm],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
