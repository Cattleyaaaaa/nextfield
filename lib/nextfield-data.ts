export const FIELD_CHANNELS = [
  { id: "work", label: "WORK", title: "把复杂能力做成产品", copy: "Agent 工作台、运行观测与语义检索。", href: "/projects", color: "var(--accent)" },
  { id: "think", label: "THINK", title: "记录仍在形成的判断", copy: "技术取舍、设计方法与过程复盘。", href: "/blog", color: "var(--liquid-mid)" },
  { id: "play", label: "PLAY", title: "用实验回答小问题", copy: "粒子、空间、声音与界面反馈。", href: "/gallery", color: "var(--liquid-foam)" },
  { id: "now", label: "NOW", title: "查看此刻正在发生什么", copy: "当前方向、构建记录和下一步计划。", href: "/live-studio", color: "var(--ink)" },
] as const;

export const CAPABILITIES = [
  { id: "product", label: "Product Thinking", x: 50, y: 10, evidence: "从问题、约束和成功指标开始，而不是从功能清单开始。", links: ["/projects", "/blog/building-a-living-index"] },
  { id: "agent", label: "Agent Architecture", x: 25, y: 37, evidence: "工作流、工具调用、状态管理与可恢复任务。", links: ["/projects", "/blog/agent-interface-is-a-state-machine"] },
  { id: "evaluation", label: "Evaluation", x: 75, y: 37, evidence: "把输出质量、运行轨迹和失败路径变成可观察信号。", links: ["/projects", "/failures"] },
  { id: "interface", label: "Interface Design", x: 20, y: 72, evidence: "让等待、确认、错误与结果拥有清晰的界面状态。", links: ["/gallery", "/blog/agent-interface-is-a-state-machine"] },
  { id: "engineering", label: "Production Engineering", x: 52, y: 86, evidence: "以类型、性能、可访问性和静态部署约束完成交付。", links: ["/build-log", "/colophon"] },
  { id: "motion", label: "Spatial Motion", x: 82, y: 72, evidence: "用克制的 transform 与反馈建立空间感，而不是堆叠特效。", links: ["/gallery", "/blog/depth-without-weight"] },
] as const;

export const FAILURE_ITEMS = [
  { number: "F–01", title: "两个 Hero 抢着开场", tried: "连续使用两块满屏巨幅标题，希望加强叙事力度。", failed: "两个区域承担了相同任务，访问者需要穿过两次序言才能抵达内容。", survived: "保留第一屏作为宣言，把第二屏改造成可更新的 Now 状态。", tag: "Information architecture" },
  { number: "F–02", title: "让每一张卡片都动起来", tried: "为所有内容同时加入悬浮、扫光、位移和旋转。", failed: "反馈失去优先级，页面持续要求注意力，低性能设备也会更吃力。", survived: "只让关键入口拥有空间反馈，滚动动效使用一次性入场。", tag: "Motion" },
  { number: "F–03", title: "把聊天框当作 Agent 产品", tried: "先完成对话界面，再考虑工具调用过程如何呈现。", failed: "用户看不到任务状态，也无法判断何时需要介入或如何恢复。", survived: "先画状态机，再决定聊天框在其中扮演什么角色。", tag: "Agent UX" },
  { number: "F–04", title: "等待完整内容再发布", tried: "计划一次性准备所有项目案例、长文和视觉素材。", failed: "网站长期停留在‘快完成了’，也失去了记录过程的价值。", survived: "建立 Notes、Experiments 和 Build Log，让不同完成度的内容都有位置。", tag: "Publishing" },
  { number: "F–05", title: "用百分比给装饰定位", tried: "首页弹簧线按容器的 right-[14%] 摆放，以为比例关系稳定。", failed: "标语按 clamp(4rem, 14vw, 12.5rem) 缩放，装饰按容器缩放，两者比例不同；换个窗口宽度，弹簧线就压到字母上，看起来像渲染错误。", survived: "行容器收缩到文字实际宽度，装饰锚在最后一个字母右侧，尺寸改用 em 跟随字号。", tag: "Typography" },
  { number: "F–06", title: "裁切层沿用通用留白", tried: "逐字入场动画的裁切层统一给 pb-[0.06em]，沿用常见写法。", failed: "对没有下伸部的字母够用，却把 y 和 g 的尾巴切平——0.06em 远小于字体约 0.24em 的 descender 深度。", survived: "留白按字体 descender 深度给（0.26em），入场的 yPercent 同步加大，避免动画开始前露出字头。", tag: "CSS" },
  { number: "F–07", title: "悬停动效不管入场进度", tried: "标语的悬停起伏直接在 pointerover 上触发，认为随时可用。", failed: "入场还没播完时划过，overwrite 会覆盖入场进度，字母冻在半空成一排高低不齐的字。", survived: "用入场 onComplete 置位的 ready 标记做守门，并让悬停只动 scale、循环动画只动 rotate，两者互不打断。", tag: "Motion" },
] as const;

export const STUDIO_LOG = [
  { status: "active", label: "Building", title: "NEXTFIELD OS", detail: "把内容、声音、导航和探索方式连接成一个系统。" },
  { status: "testing", label: "Testing", title: "Visitor traces", detail: "验证本地优先的数据痕迹在隐私和参与感之间的平衡。" },
  { status: "queued", label: "Next", title: "Field Agent", detail: "数字分身接口已保留，等待内容与模型配置成熟后接入。" },
] as const;
