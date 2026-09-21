// 文章元数据的形状。单独放在这里，是为了让客户端组件可以只引用类型
// （`import type`），而不必把带 node:fs 的 lib/posts.ts 拖进客户端包。
export type PostMeta = {
  slug: string;
  title: string;
  /** 原始 ISO 日期，如 "2026-09-21" */
  date: string;
  /** 展示用，如 "2026 · 09" */
  displayDate: string;
  category: string;
  tags: string[];
  summary: string;
  /** 由正文自动估算的阅读时长（分钟） */
  minutes: number;
  /** 标记为示例的文章会带一条醒目横幅，且不参与搜索引擎收录 */
  sample: boolean;
};
