export const EVIDENCE_SYSTEMS = [
  { number: "13", title: "Proof Mode", copy: "关闭叙事噪音，只看职责、证据、结果与链接。", href: "/proof", status: "LIVE" },
  { number: "14", title: "Agent Scenario Lab", copy: "在真实约束下作出 Agent 产品决定并查看后果。", href: "/scenario-lab", status: "LIVE" },
  { number: "15", title: "Architecture X-Ray", copy: "逐层拆开产品界面、状态、工作流与数据。", href: "/architecture", status: "LIVE" },
  { number: "16", title: "Personal API", copy: "供程序和未来 Agent 读取的公开静态 JSON。", href: "/api/status.json", status: "JSON" },
  { number: "17", title: "Field Pack", copy: "可下载、适合转发的一页式能力与项目 PDF。", href: "/downloads/NEXTFIELD-Field-Pack.pdf", status: "PDF" },
  { number: "18", title: "Accessibility Lab", copy: "检查对比度、键盘焦点、动态偏好与静态降级。", href: "/accessibility", status: "A11Y" },
  { number: "19", title: "Field Archive", copy: "按月份回看网站内容、封面和方向的变化。", href: "/archive", status: "LIVE" },
  { number: "20", title: "Code Archaeology", copy: "查看一个交互组件从静态版本到可访问 3D 的演变。", href: "/code-archaeology", status: "LIVE" },
  { number: "21", title: "Performance Observatory", copy: "公开构建体积、静态页面与体验预算。", href: "/observatory", status: "SNAPSHOT" },
  { number: "22", title: "Field Missions", copy: "通过探索任务认识整个站点并生成 Field Pass。", href: "/missions", status: "LOCAL" },
  { number: "23", title: "Collaborative Note", copy: "围绕每月问题留下结构化、匿名、本地优先的观点。", href: "/field-question", status: "LOCAL" },
  { number: "24", title: "Spatial Desktop", copy: "把项目、笔记、声音和工作室放入可拖动窗口。", href: "/desktop", status: "LAB" },
  { number: "25", title: "Shareable Cards", copy: "把项目、笔记与日志生成可下载 PNG 卡片。", href: "/share-card", status: "TOOL" },
] as const;

export const PROOF_ROWS = [
  { capability: "Agent product design", scope: "工作流、工具状态、确认与恢复路径", evidence: "Knowledge Copilot / Agent interface note", result: "从聊天界面扩展为可理解、可控制的任务系统", href: "/projects/replay" },
  { capability: "Full-stack delivery", scope: "Next.js、MDX、静态生成、主题与路由", evidence: "NEXTFIELD / Build Log", result: "22+ 静态页面与统一内容管线", href: "/build-log" },
  { capability: "Interaction systems", scope: "滚动编排、3D 反馈、Canvas 与降级", evidence: "Open Experiments / Depth note", result: "桌面增强，触屏与 reduced motion 保持完整", href: "/gallery" },
  { capability: "Evaluation mindset", scope: "失败分类、运行信号和证据链接", evidence: "Failure Museum / Capability map", result: "让判断过程成为可审阅内容", href: "/failures" },
] as const;

export const ARCHIVE_MONTHS = [
  { date: "2026 · 09", title: "The field opens", note: "从传统作品集转向持续生长的内容场域。", additions: ["Kinetic home", "Field Radio", "Open Experiments", "NEXTFIELD OS"], tone: "Liquid cyan / paper" },
  { date: "2026 · 08", title: "System sketches", note: "确立 Agent、全栈与交互实验三条内容线。", additions: ["Information architecture", "MDX pipeline", "Motion language"], tone: "Ink / warm neutral" },
  { date: "2026 · 07", title: "Before the name", note: "仍然是一组零散组件和关于个人网站的想法。", additions: ["First cards", "Theme tokens", "Project notes"], tone: "Unresolved" },
] as const;
