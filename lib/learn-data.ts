import type { LocalizedText } from "@/lib/editorial-data";
import { COURSE_ORDER, EXTRA_LESSONS } from "./learning/extensions";

export type LearningLesson = {
  slug: string;
  number: string;
  title: LocalizedText;
  summary: LocalizedText;
  minutes: number;
  concept: LocalizedText[];
  model: { label: LocalizedText; detail: LocalizedText }[];
  code: string;
  challenge: { question: LocalizedText; options: { label: LocalizedText; feedback: LocalizedText; correct: boolean }[] };
};

export type LearningTrack = {
  slug: "agent" | "fullstack" | "product";
  number: string;
  title: LocalizedText;
  shortTitle: LocalizedText;
  summary: LocalizedText;
  outcome: LocalizedText;
  lessons: LearningLesson[];
};

const z = (zh: string, en: string): LocalizedText => ({ zh, en });

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    slug: "agent", number: "01", title: z("Agent 开发基础", "Agent Development Foundations"), shortTitle: z("Agent 开发", "Agent Development"),
    summary: z("从认识 Agent 与 LLM 开始，逐步学习提示词、工具、状态、RAG、多 Agent 协作与生产运行。", "Start with Agents and LLMs, then progress through prompts, tools, state, RAG, multi-Agent collaboration, and production operations."),
    outcome: z("完成后，你将能画出一个 Agent 状态机，并判断检索、工具调用和确认应该出现在哪里。", "You will be able to model an Agent state machine and place retrieval, tools and confirmation deliberately."),
    lessons: [
      { slug: "agent-vs-chat", number: "01", title: z("Agent 不只是聊天框", "An Agent is more than a chat box"), summary: z("用目标、状态、工具与循环重新理解 Agent。", "Understand Agents through goals, state, tools and loops."), minutes: 16,
        concept: [z("聊天模型根据输入生成回答；Agent 则围绕目标持续判断下一步动作，并读取动作产生的新状态。界面中的聊天框只是其中一个入口。", "A chat model generates a response from input. An Agent repeatedly decides the next action around a goal and reads the state produced by that action. Chat is only one entrance."), z("真正影响产品体验的是系统何时规划、何时调用工具、何时停止，以及用户何时能够介入。", "The product experience depends on when the system plans, calls tools, stops and allows the user to intervene.")],
        model: [{ label: z("目标", "Goal"), detail: z("定义完成条件", "Define completion") }, { label: z("状态", "State"), detail: z("保存已知信息", "Store known information") }, { label: z("动作", "Action"), detail: z("调用模型或工具", "Call a model or tool") }, { label: z("循环", "Loop"), detail: z("观察结果并继续", "Observe and continue") }],
        code: `type AgentState = {\n  goal: string;\n  status: "planning" | "acting" | "waiting" | "done";\n  observations: string[];\n};`,
        challenge: { question: z("下面哪项最能区分 Agent 与普通聊天回答？", "What best distinguishes an Agent from a normal chat response?"), options: [
          { label: z("使用更长的 Prompt", "A longer prompt"), feedback: z("Prompt 长度不会自动形成 Agent。", "Prompt length does not create an Agent."), correct: false },
          { label: z("根据状态循环选择动作", "Choosing actions in a stateful loop"), feedback: z("正确。目标、状态、动作和观察形成了可持续执行的闭环。", "Correct. Goals, state, actions and observations form an execution loop."), correct: true },
          { label: z("回答速度更快", "Faster responses"), feedback: z("速度与是否为 Agent 没有直接关系。", "Speed does not define an Agent."), correct: false },
        ]},
      },
      { slug: "rag-pipeline", number: "02", title: z("RAG 是一条证据管线", "RAG is an evidence pipeline"), summary: z("拆开切分、召回、重排、生成与引用验证。", "Separate chunking, retrieval, reranking, generation and citation validation."), minutes: 20,
        concept: [z("RAG 的价值不是把更多文本塞给模型，而是用可检查的过程选择相关证据。每一步都可能引入错误。", "RAG is not about pushing more text into a model. It is an inspectable process for selecting relevant evidence, and every stage can fail."), z("高质量系统会保存查询、候选片段、重排分数和最终引用，从而知道错误发生在哪一层。", "A strong system preserves the query, candidate chunks, reranking scores and final citations so failures can be located.")],
        model: [{ label: z("切分", "Chunk"), detail: z("建立可检索单元", "Create retrievable units") }, { label: z("召回", "Retrieve"), detail: z("找出候选证据", "Find candidates") }, { label: z("重排", "Rerank"), detail: z("重新判断相关性", "Reassess relevance") }, { label: z("验证", "Validate"), detail: z("核对答案与引用", "Check answer and citations") }],
        code: `const evidence = await retrieve(query, { topK: 12 });\nconst ranked = await rerank(query, evidence);\nconst answer = await generate({ query, context: ranked.slice(0, 4) });\nreturn validateCitations(answer, ranked);`,
        challenge: { question: z("复杂问题混入旧版文档时，应该优先增加哪一步？", "When complex questions mix old document versions, what should be added first?"), options: [
          { label: z("把 Top K 调到最大", "Max out Top K"), feedback: z("更多候选可能带来更多噪音。", "More candidates may add more noise."), correct: false },
          { label: z("版本过滤与引用验证", "Version filtering and citation validation"), feedback: z("正确。先约束证据版本，再验证结论能否被引用支持。", "Correct. Constrain evidence versions, then verify the claim is supported."), correct: true },
          { label: z("移除所有元数据", "Remove all metadata"), feedback: z("元数据恰好能帮助过滤版本。", "Metadata is exactly what helps filter versions."), correct: false },
        ]},
      },
      { slug: "tools-and-confirmation", number: "03", title: z("工具调用与确认边界", "Tools and confirmation boundaries"), summary: z("区分读取、写入、外部副作用与不可逆操作。", "Distinguish reads, writes, external side effects and irreversible actions."), minutes: 18,
        concept: [z("工具把语言模型的输出变成真实世界中的动作。风险不取决于工具名称，而取决于动作影响范围、可逆性和用户预期。", "Tools turn model output into real-world action. Risk depends not on the tool name but on impact, reversibility and user expectation."), z("确认应该成为工作流中的显式状态，而不是一句临时追加的提示词。", "Confirmation should be an explicit workflow state, not a sentence appended to a prompt.")],
        model: [{ label: z("读取", "Read"), detail: z("通常可以自动执行", "Usually safe to automate") }, { label: z("草稿", "Draft"), detail: z("可预览、未提交", "Previewable, not committed") }, { label: z("写入", "Write"), detail: z("需要范围说明", "Needs scope disclosure") }, { label: z("不可逆", "Irreversible"), detail: z("必须明确确认", "Requires explicit confirmation") }],
        code: `if (tool.impact === "external" || !tool.reversible) {\n  return { status: "awaiting_confirmation", preview: tool.args };\n}\nreturn execute(tool);`,
        challenge: { question: z("发送一封尚未预览的客户邮件前，Agent 应该怎么做？", "Before sending an unreviewed customer email, what should the Agent do?"), options: [
          { label: z("直接发送以节省时间", "Send immediately"), feedback: z("外部沟通会产生真实副作用。", "External communication has real side effects."), correct: false },
          { label: z("展示收件人和内容并请求确认", "Show recipient and content, then confirm"), feedback: z("正确。确认点应展示动作范围和最终内容。", "Correct. The confirmation should expose scope and final content."), correct: true },
          { label: z("只记录日志", "Only log it"), feedback: z("日志不能代替用户控制权。", "A log does not replace user control."), correct: false },
        ]},
      },
      { slug: "evaluation-and-recovery", number: "04", title: z("评估、观测与恢复", "Evaluation, observability and recovery"), summary: z("让失败可以被发现、分类、重现并恢复。", "Make failures detectable, classifiable, reproducible and recoverable."), minutes: 19,
        concept: [z("在线日志告诉你系统发生了什么，离线评估告诉你一次修改是否让整体质量变好。两者不能互相替代。", "Online traces tell you what happened; offline evaluations tell you whether a change improved overall quality. Neither replaces the other."), z("恢复能力来自保存稳定的状态边界：输入、输出、工具结果与失败原因都可以成为重新开始的位置。", "Recovery comes from stable state boundaries. Inputs, outputs, tool results and failure reasons can all become restart points.")],
        model: [{ label: z("记录", "Trace"), detail: z("保存运行轨迹", "Preserve the run") }, { label: z("分类", "Classify"), detail: z("识别失败类型", "Identify failure type") }, { label: z("评估", "Evaluate"), detail: z("与基准比较", "Compare to a baseline") }, { label: z("恢复", "Recover"), detail: z("从稳定节点继续", "Resume from a stable point") }],
        code: `const checkpoint = await saveState(run);\ntry {\n  return await executeStep(checkpoint);\n} catch (error) {\n  await recordFailure(checkpoint, classify(error));\n  return { status: "recoverable", checkpointId: checkpoint.id };\n}`,
        challenge: { question: z("修改检索策略后，怎样判断整体质量是否提升？", "After changing retrieval, how do you know overall quality improved?"), options: [
          { label: z("只测试一个成功问题", "Test one successful question"), feedback: z("单个案例无法代表整体变化。", "One case cannot represent overall change."), correct: false },
          { label: z("在固定评估集上比较修改前后", "Compare before and after on a fixed evaluation set"), feedback: z("正确。固定样本和指标才能形成可比较结果。", "Correct. Fixed samples and metrics create comparable results."), correct: true },
          { label: z("查看代码行数", "Count lines of code"), feedback: z("代码规模不是回答质量。", "Code size is not answer quality."), correct: false },
        ]},
      },
    ],
  },
  {
    slug: "fullstack", number: "02", title: z("全栈产品基础", "Full-stack Product Foundations"), shortTitle: z("全栈开发", "Full-stack Development"),
    summary: z("从 Web 原理、HTML、CSS 与 JavaScript 起步，逐步深入 React、服务端、API、数据库、登录、安全与部署。", "Begin with the Web, HTML, CSS, and JavaScript, then explore React, servers, APIs, databases, authentication, security, and deployment."),
    outcome: z("完成后，你将理解一个 Web 产品从浏览器到数据库再到生产环境的完整路径。", "You will understand the complete path of a web product from browser to database to production."),
    lessons: [
      { slug: "interface-state", number: "01", title: z("界面首先表达状态", "Interfaces express state first"), summary: z("把加载、成功、空数据、失败与恢复设计成明确状态。", "Design loading, success, empty, failure and recovery as explicit states."), minutes: 16,
        concept: [z("组件不是静态画面，而是状态到界面的映射。先列出状态，再设计每种状态下用户能看到和能做什么。", "A component is a mapping from state to interface, not a static picture. List states first, then design what users see and can do in each one."), z("状态越明确，异步请求、错误恢复和可访问反馈就越容易保持一致。", "Explicit states make asynchronous work, error recovery and accessible feedback easier to keep consistent.")],
        model: [{ label: z("空闲", "Idle"), detail: z("等待用户动作", "Await input") }, { label: z("加载", "Loading"), detail: z("说明正在发生什么", "Explain what is happening") }, { label: z("成功", "Success"), detail: z("展示结果与下一步", "Show result and next step") }, { label: z("失败", "Failure"), detail: z("解释并提供恢复", "Explain and recover") }],
        code: `type ViewState<T> =\n  | { status: "idle" }\n  | { status: "loading" }\n  | { status: "success"; data: T }\n  | { status: "error"; message: string };`,
        challenge: { question: z("请求失败后，界面最少应该提供什么？", "After a request fails, what should the interface provide at minimum?"), options: [
          { label: z("只显示红色", "Only show red"), feedback: z("颜色不能说明问题或恢复方式。", "Color alone explains neither the problem nor recovery."), correct: false },
          { label: z("错误原因与可执行的下一步", "A reason and an actionable next step"), feedback: z("正确。用户需要理解状态并继续行动。", "Correct. Users need to understand the state and continue."), correct: true },
          { label: z("自动刷新页面", "Automatically reload"), feedback: z("自动刷新可能丢失上下文并重复失败。", "Reloading may lose context and repeat the failure."), correct: false },
        ]},
      },
      { slug: "api-contracts", number: "02", title: z("API 是稳定契约", "APIs are stable contracts"), summary: z("让客户端和服务端通过明确输入、输出与错误协作。", "Coordinate clients and servers through explicit inputs, outputs and errors."), minutes: 18,
        concept: [z("API 不只是一个 URL，而是调用双方共同依赖的契约。请求结构、响应结构、错误语义和权限边界都属于契约。", "An API is not merely a URL; it is a contract shared by caller and server. Request shape, response shape, error semantics and authorization boundaries all belong to it."), z("在边界处验证数据，比让错误进入业务逻辑后再猜测原因更便宜。", "Validating data at the boundary is cheaper than diagnosing malformed state deep inside business logic.")],
        model: [{ label: z("输入", "Input"), detail: z("验证请求结构", "Validate request shape") }, { label: z("权限", "Auth"), detail: z("确认调用身份", "Confirm caller identity") }, { label: z("逻辑", "Logic"), detail: z("执行领域规则", "Run domain rules") }, { label: z("响应", "Response"), detail: z("返回稳定结构", "Return a stable shape") }],
        code: `const input = CreateTaskSchema.parse(await request.json());\nconst user = await requireUser(request);\nconst task = await createTask(user.id, input);\nreturn Response.json({ data: task }, { status: 201 });`,
        challenge: { question: z("无效输入应该在哪里最先被拒绝？", "Where should invalid input first be rejected?"), options: [
          { label: z("数据库报错以后", "After the database fails"), feedback: z("这会让底层承担不属于它的验证职责。", "This pushes validation into the wrong layer."), correct: false },
          { label: z("进入业务逻辑之前的 API 边界", "At the API boundary before business logic"), feedback: z("正确。边界验证让错误更早、更清楚。", "Correct. Boundary validation makes failures earlier and clearer."), correct: true },
          { label: z("只在前端验证", "Only in the frontend"), feedback: z("服务端不能信任客户端输入。", "The server cannot trust client input."), correct: false },
        ]},
      },
      { slug: "data-models", number: "03", title: z("数据模型承载产品规则", "Data models carry product rules"), summary: z("从实体、关系、约束和迁移理解数据库设计。", "Understand database design through entities, relationships, constraints and migrations."), minutes: 19,
        concept: [z("数据表不是界面字段的简单复制。模型需要表达哪些事实必须唯一、哪些关系可以为空、哪些变化需要被保留。", "A table is not a copy of form fields. A model expresses which facts must be unique, which relationships may be absent and which changes must be preserved."), z("约束越接近数据，越能防止多个入口写入互相矛盾的状态。", "Constraints close to the data prevent multiple write paths from creating contradictory state.")],
        model: [{ label: z("实体", "Entity"), detail: z("识别稳定对象", "Identify stable objects") }, { label: z("关系", "Relation"), detail: z("表达对象连接", "Express connections") }, { label: z("约束", "Constraint"), detail: z("保护不变量", "Protect invariants") }, { label: z("迁移", "Migration"), detail: z("安全演进结构", "Evolve safely") }],
        code: `model Task {\n  id        String   @id @default(cuid())\n  ownerId   String\n  status    TaskStatus @default(PENDING)\n  createdAt DateTime @default(now())\n  owner     User @relation(fields: [ownerId], references: [id])\n}`,
        challenge: { question: z("用户名必须唯一，这条规则最应该放在哪里？", "Usernames must be unique. Where should this rule live?"), options: [
          { label: z("只写在页面提示里", "Only in UI copy"), feedback: z("多个客户端可能绕过页面提示。", "Other clients can bypass UI copy."), correct: false },
          { label: z("数据库唯一约束，并在 API 中处理冲突", "A database unique constraint with API conflict handling"), feedback: z("正确。数据库保护事实，API 把冲突变成可理解的响应。", "Correct. The database protects the fact and the API makes conflict understandable."), correct: true },
          { label: z("依靠团队记住", "Rely on team memory"), feedback: z("约定不能替代可执行约束。", "A convention cannot replace an enforceable constraint."), correct: false },
        ]},
      },
      { slug: "production-delivery", number: "04", title: z("从构建到生产交付", "From build to production delivery"), summary: z("用类型、测试、可访问性、性能与观测守住上线质量。", "Protect release quality with types, tests, accessibility, performance and observability."), minutes: 18,
        concept: [z("部署不是开发结束后的最后一步，而是一条可重复的管线。构建、检查、发布和回滚都应该有明确输入与结果。", "Deployment is not the final step after development; it is a repeatable pipeline. Build, validation, release and rollback should all have explicit inputs and outcomes."), z("生产质量来自多个小护栏，而不是一次最终人工检查。", "Production quality comes from many small guardrails, not one final manual review.")],
        model: [{ label: z("检查", "Check"), detail: z("类型、规范与测试", "Types, lint and tests") }, { label: z("构建", "Build"), detail: z("生成可交付产物", "Create an artifact") }, { label: z("发布", "Release"), detail: z("部署确定版本", "Deploy a known version") }, { label: z("观测", "Observe"), detail: z("确认真实表现", "Verify real behavior") }],
        code: `npm run typecheck\nnpm run lint\nnpm run test\nnpm run build\n# deploy the exact successful artifact`,
        challenge: { question: z("为什么应该部署确定的构建产物？", "Why deploy a specific build artifact?"), options: [
          { label: z("方便使用更多动画", "To enable more animation"), feedback: z("与构建可复现性无关。", "This is unrelated to reproducibility."), correct: false },
          { label: z("确保检查通过的代码就是上线代码", "So the validated code is exactly what ships"), feedback: z("正确。它让发布可追踪、可复现、可回滚。", "Correct. It makes release traceable, reproducible and reversible."), correct: true },
          { label: z("减少文件名长度", "To shorten filenames"), feedback: z("文件名不是核心原因。", "Filenames are not the reason."), correct: false },
        ]},
      },
    ],
  },
  {
    slug: "product", number: "03", title: z("Agent 产品实战", "Agent Product Workshop"), shortTitle: z("综合实战", "Product Workshop"),
    summary: z("把 Agent 工作流嵌入一个可理解、可控制的全栈产品。", "Embed an Agent workflow in a full-stack product people can understand and control."),
    outcome: z("完成后，你将拥有一张从问题定义到生产观测的完整 Agent 产品蓝图。", "You will leave with a complete Agent product blueprint from problem definition to production observability."),
    lessons: [
      { slug: "define-the-problem", number: "01", title: z("先定义可信任务", "Define a trustworthy task first"), summary: z("从用户问题、成功指标和风险边界开始，而不是从模型开始。", "Start with the user problem, success criteria and risk boundaries—not the model."), minutes: 16,
        concept: [z("“做一个 Agent”不是产品目标。目标需要描述谁在什么情境下完成什么任务，以及什么结果值得信任。", "Build an Agent is not a product goal. A goal describes who completes which task in what context and what outcome deserves trust."), z("同时写下非目标，可以阻止原型在早期吸收所有可能功能。", "Writing non-goals at the same time prevents the prototype from absorbing every possible feature.")],
        model: [{ label: z("用户", "User"), detail: z("谁在做决定", "Who decides") }, { label: z("任务", "Task"), detail: z("需要完成什么", "What must be done") }, { label: z("证据", "Evidence"), detail: z("如何判断可信", "How trust is judged") }, { label: z("边界", "Boundary"), detail: z("系统不做什么", "What the system will not do") }],
        code: `const productBrief = {\n  user: "support specialist",\n  task: "answer from approved knowledge",\n  success: ["cited", "current", "recoverable"],\n  nonGoals: ["autonomous policy changes"]\n};`,
        challenge: { question: z("下面哪个成功指标最可验证？", "Which success criterion is most verifiable?"), options: [
          { label: z("回答感觉很聪明", "Answers feel smart"), feedback: z("感受难以稳定测量。", "This is difficult to measure consistently."), correct: false },
          { label: z("答案中的结论都有有效引用", "Every claim has a valid citation"), feedback: z("正确。它可以被自动或人工检查。", "Correct. It can be checked automatically or manually."), correct: true },
          { label: z("使用最新模型", "Use the newest model"), feedback: z("模型版本不是用户结果。", "A model version is not a user outcome."), correct: false },
        ]},
      },
      { slug: "map-the-workflow", number: "02", title: z("把工作流画成状态图", "Map the workflow as a state graph"), summary: z("让规划、检索、工具、确认与恢复成为显式节点。", "Make planning, retrieval, tools, confirmation and recovery explicit nodes."), minutes: 20,
        concept: [z("状态图让系统行为可以被讨论和测试。每条边代表进入下一状态的条件，每个节点拥有明确输入、输出和失败方式。", "A state graph makes behavior discussable and testable. Every edge represents a transition condition, while each node has explicit inputs, outputs and failure modes."), z("不要把整个任务藏在一个巨大函数或一次模型调用里。", "Do not hide the entire task in one large function or a single model call.")],
        model: [{ label: z("计划", "Plan"), detail: z("拆分任务", "Break down work") }, { label: z("检索", "Retrieve"), detail: z("获取证据", "Gather evidence") }, { label: z("确认", "Confirm"), detail: z("交还控制权", "Return control") }, { label: z("执行", "Execute"), detail: z("产生可观察结果", "Produce observable results") }],
        code: `const graph = createGraph()\n  .node("plan", plan)\n  .node("retrieve", retrieve)\n  .node("confirm", awaitUser)\n  .node("execute", execute)\n  .edge("execute", "confirm", requiresApproval);`,
        challenge: { question: z("哪个节点最适合保存恢复检查点？", "Which node is best for a recovery checkpoint?"), options: [
          { label: z("只有最终完成后", "Only after completion"), feedback: z("这样无法恢复中途失败。", "That cannot recover mid-run failures."), correct: false },
          { label: z("每个具有稳定输入输出的节点之后", "After every node with stable input and output"), feedback: z("正确。稳定边界为重试和恢复提供起点。", "Correct. Stable boundaries create restart points."), correct: true },
          { label: z("随机保存", "At random"), feedback: z("随机状态无法保证一致性。", "Random state cannot guarantee consistency."), correct: false },
        ]},
      },
      { slug: "design-the-surface", number: "03", title: z("设计可控制的产品界面", "Design a controllable product surface"), summary: z("把系统状态、证据、确认和恢复交还给用户。", "Return system state, evidence, confirmation and recovery to the user."), minutes: 18,
        concept: [z("Agent 界面需要同时回答三个问题：系统正在做什么、为什么这样做、用户现在可以做什么。", "An Agent interface must answer three questions: what the system is doing, why, and what the user can do now."), z("来源、工具状态和确认范围应该靠近相关结果，而不是藏在单独的调试页面里。", "Sources, tool state and confirmation scope should stay near the relevant result rather than hiding in a separate debug page.")],
        model: [{ label: z("状态", "State"), detail: z("当前进行到哪里", "Where the run stands") }, { label: z("理由", "Rationale"), detail: z("展示证据而非思维链", "Show evidence, not chain-of-thought") }, { label: z("控制", "Control"), detail: z("暂停、确认或取消", "Pause, confirm or cancel") }, { label: z("恢复", "Recovery"), detail: z("重试或改变路径", "Retry or change path") }],
        code: `<TaskPanel\n  status={run.status}\n  evidence={run.citations}\n  pendingAction={run.confirmation}\n  onConfirm={confirm}\n  onCancel={cancel}\n/>`,
        challenge: { question: z("界面应该展示哪种“为什么”？", "What kind of why should the interface show?"), options: [
          { label: z("完整隐藏推理过程的逐字内容", "Hidden reasoning verbatim"), feedback: z("这既不稳定，也不一定帮助用户判断。", "This is unstable and may not help users judge the result."), correct: false },
          { label: z("使用的来源、规则和可验证依据", "Sources, rules and verifiable grounds"), feedback: z("正确。可验证依据能帮助用户形成判断。", "Correct. Verifiable grounds help users make a judgment."), correct: true },
          { label: z("只显示“AI 生成”", "Only show AI-generated"), feedback: z("标签不能解释具体结论。", "A label does not explain a specific claim."), correct: false },
        ]},
      },
      { slug: "ship-and-observe", number: "04", title: z("上线、观察并继续改进", "Ship, observe and keep improving"), summary: z("建立评估集、运行信号、成本预算和迭代循环。", "Create evaluation sets, runtime signals, cost budgets and an iteration loop."), minutes: 19,
        concept: [z("上线只是获得真实信号的开始。需要同时观察任务成功率、失败类型、人工介入、延迟和成本。", "Launch is the beginning of real signals. Observe task success, failure types, human intervention, latency and cost together."), z("产品指标必须能够回到具体运行轨迹，否则团队只能看到数字变化，却不知道应该修改哪里。", "Product metrics must connect back to concrete traces, otherwise teams see numbers move without knowing what to change.")],
        model: [{ label: z("基准", "Baseline"), detail: z("保存发布前质量", "Capture pre-release quality") }, { label: z("信号", "Signals"), detail: z("观察真实使用", "Observe real use") }, { label: z("诊断", "Diagnose"), detail: z("连接指标与轨迹", "Connect metrics to traces") }, { label: z("迭代", "Iterate"), detail: z("小步验证改变", "Validate small changes") }],
        code: `track({\n  taskSuccess: result.accepted,\n  failureType: result.failure?.type,\n  latencyMs: trace.duration,\n  costUsd: trace.cost,\n  humanIntervention: trace.confirmations.length > 0\n});`,
        challenge: { question: z("延迟突然增加时，最有帮助的下一步是什么？", "When latency suddenly rises, what is the most useful next step?"), options: [
          { label: z("立刻更换整个技术栈", "Replace the whole stack"), feedback: z("先定位问题，避免扩大变化范围。", "Locate the issue before broadening the change."), correct: false },
          { label: z("按工作流节点查看耗时轨迹", "Inspect duration traces by workflow node"), feedback: z("正确。节点级轨迹能定位检索、模型或工具瓶颈。", "Correct. Node-level traces locate retrieval, model or tool bottlenecks."), correct: true },
          { label: z("隐藏加载状态", "Hide the loading state"), feedback: z("这只隐藏问题，不会改善延迟。", "This hides the problem without improving latency."), correct: false },
        ]},
      },
    ],
  },
];

for (const track of LEARNING_TRACKS) {
  const lessons = [...track.lessons, ...EXTRA_LESSONS[track.slug]];
  track.lessons = COURSE_ORDER[track.slug].map((slug, index) => {
    const lesson = lessons.find(item => item.slug === slug);
    if (!lesson) throw new Error(`Missing curriculum lesson: ${track.slug}/${slug}`);
    return { ...lesson, number: String(index + 1).padStart(2, "0") };
  });
}

export function findLearningTrack(slug: string) { return LEARNING_TRACKS.find((track) => track.slug === slug); }
export function findLearningLesson(track: LearningTrack, slug: string) { return track.lessons.find((lesson) => lesson.slug === slug); }
export function lessonKey(trackSlug: string, lessonSlug: string) { return `${trackSlug}/${lessonSlug}`; }
export function learningRecordTitle(key: string, locale: "zh" | "en") {
  if (key.startsWith("exam:")) {
    const track = findLearningTrack(key.slice(5));
    return track ? `${track.title[locale]} · ${locale === "zh" ? "结课考试" : "Final exam"}` : key;
  }
  const [trackSlug, lessonSlug] = key.split("/");
  const track = findLearningTrack(trackSlug);
  return track ? findLearningLesson(track, lessonSlug)?.title[locale] ?? key : key;
}
