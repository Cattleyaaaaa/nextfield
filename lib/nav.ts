// 站内主要板块的唯一真值来源。顶栏、页脚、首页门户卡片都从这里派生，
// 避免三处各写一份导致漂移。
export type NavSection = {
  /** 门户卡片上的编号，如 "01" */
  number: string;
  /** 中文名，用于门户卡片与页脚 */
  label: string;
  /** 英文眉标，用于子页顶部与顶栏 */
  eyebrow: string;
  href: string;
  /** 门户卡片与页脚的一句话说明 */
  description: string;
};

export const navSections: NavSection[] = [
  {
    number: "01",
    label: "关于我",
    eyebrow: "about",
    href: "/about",
    description: "九屏自述：从 Agent 工作流，到生产级 Web 产品。",
  },
  {
    number: "02",
    label: "项目",
    eyebrow: "projects",
    href: "/projects",
    description: "把想法做成产品的几个例子，含技术选型与取舍。",
  },
  {
    number: "03",
    label: "写作",
    eyebrow: "writing",
    href: "/blog",
    description: "技术文与短手记，踩过的坑都整理成可复用的文字。",
  },
  {
    number: "04",
    label: "AI 画廊",
    eyebrow: "gallery",
    href: "/gallery",
    description: "提示词与生成图的公开档案。",
  },
  {
    number: "05",
    label: "建站纪事",
    eyebrow: "log",
    href: "/build-log",
    description: "这个站是怎么一版一版搭起来的。",
  },
];

/** 顶栏导航：首页（index）放最前面，后面跟前三个板块；窄屏会挤，别再加长。 */
export const headerSections: NavSection[] = [
  {
    number: "00",
    label: "首页",
    eyebrow: "index",
    href: "/",
    description: "门户：五个板块的入口。",
  },
  ...navSections.slice(0, 3),
];
