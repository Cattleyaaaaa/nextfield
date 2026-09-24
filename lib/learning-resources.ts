import type { LocalizedText } from "@/lib/editorial-data";
import type { LearningTrack } from "@/lib/learn-data";

type TrackSlug = LearningTrack["slug"];
const z = (zh: string, en: string): LocalizedText => ({ zh, en });

export type LearningCase = {
  id: string;
  track: TrackSlug;
  title: LocalizedText;
  situation: LocalizedText;
  question: LocalizedText;
  steps: { title: LocalizedText; detail: LocalizedText }[];
  outcome: LocalizedText;
  lesson: string;
};

export const LEARNING_CASES: LearningCase[] = [
  {
    id: "outdated-answer", track: "agent", title: z("旧文档回答了新问题", "An old document answers a new question"),
    situation: z("用户询问 v2 的退款规则，检索却把一年前的 v1 文档排在第一。模型写出流畅回答，并附上看似可信的引用。", "A user asks about the v2 refund policy, but retrieval ranks a year-old v1 document first. The model writes a fluent answer with a plausible-looking citation."),
    question: z("怎样阻止“有引用但引用错版本”的回答？", "How do you prevent an answer that is cited but cites the wrong version?"),
    steps: [
      { title: z("在检索前约束版本", "Constrain versions before retrieval"), detail: z("从问题和当前产品环境确定版本；候选文档必须带版本与生效时间，过期内容先过滤。", "Determine the requested version and current product context; require version and effective-date metadata, then filter expired documents first.") },
      { title: z("保留证据链", "Keep an evidence trail"), detail: z("记录查询、候选片段、重排结果和最终使用的引用，便于发现错误发生在召回还是生成。", "Record the query, candidate chunks, reranking results, and final citations to locate whether retrieval or generation failed.") },
      { title: z("无法确认就停下", "Stop when uncertain"), detail: z("如果只找到旧版资料，明确说明当前证据不足，不要把旧规则伪装成新规则。", "If only old material is available, state that current evidence is insufficient rather than passing the old policy off as new.") },
    ],
    outcome: z("产出一份带版本过滤和拒答条件的检索流程图。", "Produce a retrieval flow with version filtering and a refusal condition."), lesson: "agent/rag-pipeline",
  },
  {
    id: "duplicate-tool", track: "agent", title: z("工具超时后，动作执行了两次", "A timed-out tool runs twice"),
    situation: z("Agent 调用“创建工单”后超时。界面显示失败，但服务器其实已经写入；自动重试又创建了第二张工单。", "An Agent times out after calling create-ticket. The UI reports failure even though the server wrote the ticket; an automatic retry creates a duplicate."),
    question: z("怎样安全地重试有副作用的工具？", "How do you retry a side-effecting tool safely?"),
    steps: [
      { title: z("给动作稳定身份", "Give the action a stable identity"), detail: z("为这次创建动作生成幂等标识；重试沿用同一标识，不把“每次请求”当作“新任务”。", "Generate an idempotency key for the creation action and reuse it on retries instead of treating every request as a new task.") },
      { title: z("区分未知与失败", "Separate unknown from failed"), detail: z("超时只说明客户端没有收到结果。先查询动作状态，再决定是否重试，避免把未知状态误判成未执行。", "A timeout means the client received no result. Query the action status before retrying rather than assuming nothing happened.") },
      { title: z("在确认点说明影响", "Explain the impact at approval"), detail: z("执行前展示将创建的工单和目标空间；执行后显示可核对的工单编号。", "Before execution, show the ticket and destination; afterward, display a verifiable ticket ID.") },
    ],
    outcome: z("写出等待确认、执行、结果未知、恢复四种状态的转移规则。", "Write transition rules for awaiting approval, executing, unknown result, and recovery."), lesson: "agent/tools-and-confirmation",
  },
  {
    id: "stale-session", track: "fullstack", title: z("刷新页面后，登录状态消失", "The session disappears after refresh"),
    situation: z("任务台登录后能创建任务，但刷新页面就显示未登录；同时某些请求只靠前端传入的 ownerId 判断权限。", "A task desk can create tasks after sign-in, but refresh makes the user appear signed out. Some requests also rely on a client-provided ownerId for authorization."),
    question: z("身份应如何穿过浏览器、API 与数据库？", "How should identity flow through browser, API, and database?"),
    steps: [
      { title: z("恢复真实会话", "Restore the real session"), detail: z("页面加载时向服务端读取会话，明确展示加载、已登录和未登录状态，不依赖内存里的单个布尔值。", "Read the session from the server on page load and distinguish loading, signed-in, and signed-out states rather than relying on one in-memory boolean.") },
      { title: z("服务端决定所有权", "Let the server decide ownership"), detail: z("从已验证会话获取用户 ID；忽略请求体里的 ownerId，并在读取和写入时检查资源归属。", "Derive the user ID from a verified session, ignore ownerId in the request body, and check ownership on both reads and writes.") },
      { title: z("测试跨页面旅程", "Test the multi-page journey"), detail: z("依次验证登录、创建、刷新、打开另一页、退出和尝试访问他人任务。", "Test sign-in, creation, refresh, navigation, sign-out, and attempted access to another user's task in sequence.") },
    ],
    outcome: z("画出一次请求中的身份来源、权限检查和错误返回。", "Map the identity source, authorization check, and error response for one request."), lesson: "fullstack/api-contracts",
  },
  {
    id: "double-submit", track: "fullstack", title: z("双击提交，数据库多了两条", "A double-click creates two rows"),
    situation: z("用户在网络很慢时连点两次创建按钮。界面进入加载状态，但两个请求都到达服务端，产生重复任务。", "On a slow network, a user clicks Create twice. The UI enters loading state, but both requests reach the server and create duplicate tasks."),
    question: z("前端防重复和服务端约束各负责什么？", "What should the UI and server each do to prevent duplicates?"),
    steps: [
      { title: z("界面明确提交状态", "Make submission state explicit"), detail: z("首次提交后禁用按钮并保留输入；成功后展示结果，失败时允许有意识地重试。", "Disable the button after the first submit while retaining input; show the result on success and allow a deliberate retry on failure.") },
      { title: z("服务端识别重复请求", "Recognize duplicate requests server-side"), detail: z("为一次用户意图使用幂等键，或用业务唯一约束保护不变量；不能只相信按钮已禁用。", "Use an idempotency key for one user intent or a business uniqueness constraint; a disabled button alone cannot protect the invariant.") },
      { title: z("处理冲突与恢复", "Handle conflict and recovery"), detail: z("重复请求返回已有结果或稳定的冲突响应；界面解释发生了什么，并指向已创建的任务。", "Return the existing result or a stable conflict response; explain the outcome and link to the created task.") },
    ],
    outcome: z("实现一张包含空闲、提交中、成功、冲突、失败的状态表。", "Create a state table for idle, submitting, success, conflict, and failure."), lesson: "fullstack/interface-state",
  },
  {
    id: "approval-copy", track: "product", title: z("“继续”按钮到底会做什么？", "What does Continue actually do?"),
    situation: z("证据助手生成了邮件草稿，界面只有一个“继续”按钮。用户不确定它是预览、保存，还是立即发送。", "An evidence assistant drafts an email, but the interface has only a Continue button. Users cannot tell whether it previews, saves, or sends immediately."),
    question: z("如何让一次有后果的操作可理解、可控制？", "How do you make a consequential action understandable and controllable?"),
    steps: [
      { title: z("把动作写成具体动词", "Name the action precisely"), detail: z("把“继续”拆成“编辑草稿”“确认发送”；按钮附近展示收件人、最终内容和发送后的影响。", "Replace Continue with Edit draft and Confirm send; show recipient, final content, and consequences beside the action.") },
      { title: z("保留拒绝与修改路径", "Preserve decline and edit paths"), detail: z("用户拒绝时绝不调用发送工具，草稿仍可编辑；超时或失败时也要展示实际执行状态。", "A decline must never call the send tool, and the draft remains editable. Timeouts and failures should show the actual execution state.") },
      { title: z("用真实任务检验文案", "Test copy with a real task"), detail: z("让访客在点击前说出预计会发生什么。若回答不一致，说明确认界面仍不够清楚。", "Ask visitors what they expect before clicking. Inconsistent answers mean the approval UI remains unclear.") },
    ],
    outcome: z("画出草稿、等待确认、发送中、已发送和取消五个界面状态。", "Sketch draft, awaiting approval, sending, sent, and cancelled interface states."), lesson: "product/design-the-surface",
  },
  {
    id: "quality-regression", track: "product", title: z("使用量上涨，质量却下降", "Usage rises while quality falls"),
    situation: z("新版本带来更多访问，但错误引用和人工撤回也增加。只看访问量的报告会把一次退步误认为增长。", "A new release attracts more visits, but incorrect citations and manual reversals also rise. A usage-only report mistakes regression for growth."),
    question: z("上线后应该如何判断产品是否真的变好？", "How do you know whether the product actually improved after launch?"),
    steps: [
      { title: z("固定基线样本", "Freeze a baseline set"), detail: z("保留包含正常、旧版资料、无证据和越权请求的评估样本，发布前后用同一标准检查。", "Keep evaluation cases for normal queries, outdated sources, missing evidence, and unauthorized requests; compare releases against the same standard.") },
      { title: z("分开看质量与增长", "Separate quality from growth"), detail: z("同时追踪有效引用率、拒答准确性、任务完成率、延迟和成本，并按任务类型切分。", "Track valid citations, correct refusals, task completion, latency, and cost separately, segmented by task type.") },
      { title: z("设定暂停条件", "Set a pause condition"), detail: z("先小范围发布；当高风险错误超过阈值时停止扩大流量，回看具体运行轨迹。", "Roll out narrowly; pause expansion when high-impact errors cross a threshold and inspect the concrete traces.") },
    ],
    outcome: z("写一页发布评估卡，包含基线、指标、阈值和下一步决策。", "Write a one-page release scorecard with baseline, metrics, thresholds, and a next-step decision."), lesson: "product/ship-and-observe",
  },
];

export const LEARNING_GLOSSARY = [
  { term: "Agent", definition: z("围绕目标、状态与工具循环执行任务的系统；不是聊天界面的别名。", "A system that works toward a goal through state and tool use; not a synonym for a chat interface."), lesson: "agent/agent-vs-chat" },
  { term: "RAG", definition: z("检索资料并将可核对的证据带入生成过程；重点是来源与版本，不是塞入更多文字。", "Retrieval-augmented generation that brings checkable evidence into an answer; provenance and version matter more than volume."), lesson: "agent/rag-pipeline" },
  { term: "状态机", definition: z("用明确状态和转移条件描述系统下一步能做什么、何时停止。", "A set of explicit states and transition rules that describe what can happen next and when to stop."), lesson: "product/map-the-workflow" },
  { term: "幂等", definition: z("同一动作重复请求时，结果与执行一次相同，常用于安全重试写入。", "Repeating the same action has the same effect as executing it once, enabling safer retries."), lesson: "agent/tools-and-confirmation" },
  { term: "API 契约", definition: z("客户端和服务端共同遵守的输入、输出、权限和错误约定。", "The shared rules for inputs, outputs, authorization, and errors between client and server."), lesson: "fullstack/api-contracts" },
  { term: "数据库约束", definition: z("在数据层保护唯一性、关系和合法值，避免不同写入入口破坏规则。", "Data-layer rules protecting uniqueness, relationships, and valid values across all write paths."), lesson: "fullstack/data-models" },
  { term: "可观测性", definition: z("通过日志、轨迹和指标理解一次运行发生了什么，以及问题出在哪一步。", "Using logs, traces, and metrics to understand what happened in a run and where it failed."), lesson: "agent/evaluation-and-recovery" },
  { term: "评估集", definition: z("一组固定、带预期结果的测试任务，用于比较改动前后的真实质量。", "A fixed set of tasks with expected outcomes used to compare quality before and after a change."), lesson: "product/ship-and-observe" },
  { term: "确认边界", definition: z("系统在有副作用的动作前暂停，展示影响并交还决定权的节点。", "A point where the system pauses before a consequential action, shows its impact, and returns the decision to the user."), lesson: "agent/tools-and-confirmation" },
] as const;
