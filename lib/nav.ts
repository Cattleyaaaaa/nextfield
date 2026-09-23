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
    description: "八屏自述：从 Agent 工作流，到生产级 Web 产品。",
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
    label: "实验室",
    eyebrow: "lab",
    href: "/gallery",
    description: "文字、空间、声音与界面反馈的开放实验。",
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

/** 常驻全站的深层入口，避免它们只在首页底部和页脚出现。 */
export const fieldSections = [
  { label: "FIELD SCHOOL", eyebrow: "Learn", href: "/learn", description: "通过交互课程学习 Agent、全栈与产品实践。" },
  { label: "开放实验室", eyebrow: "Experiments", href: "/gallery", description: "触碰文字、空间、声音与界面反馈的开放实验。" },
  { label: "画廊", eyebrow: "Gallery", href: "/gallery/visual", description: "以图片为主的视觉档案：插画、配色与现场记录。" },
  { label: "电台", eyebrow: "Radio", href: "/gallery/radio", description: "少数几首确定的曲目，点开就播；播放器常驻右下角。" },
  { label: "随笔", eyebrow: "Essays", href: "/essays", description: "关于界面、系统与构建过程的短观察。" },
  { label: "建站纪事", eyebrow: "Build log", href: "/build-log", description: "查看网站每一版的设计与实现变化。" },
  { label: "制作说明", eyebrow: "Colophon", href: "/colophon", description: "了解技术栈、设计原则与构建方式。" },
  { label: "Live Studio", eyebrow: "Now", href: "/live-studio", description: "此刻正在构建、测试和计划的内容。" },
  { label: "失败博物馆", eyebrow: "Failures", href: "/failures", description: "被放弃的方案，以及它们留下的判断。" },
  { label: "Systems", eyebrow: "Evidence 13–25", href: "/systems", description: "浏览可操作、可下载、可验证的证据层。" },
] as const;
