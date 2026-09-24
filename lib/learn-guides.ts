import type { LocalizedText } from "@/lib/editorial-data";

export type LearningGuide = {
  scenario: LocalizedText;
  steps: { title: LocalizedText; detail: LocalizedText }[];
  task: LocalizedText;
  checks: LocalizedText[];
  pitfall: LocalizedText;
};

export type TrackProject = {
  title: LocalizedText;
  brief: LocalizedText;
  milestones: LocalizedText[];
  deliverable: LocalizedText;
};

const z = (zh: string, en: string): LocalizedText => ({ zh, en });

export const TRACK_PROJECTS: Record<string, TrackProject> = {
  agent: {
    title: z("证据助手：从问题到可核对的答案", "Evidence assistant: from question to checkable answer"),
    brief: z("设想访客向一个产品文档助手提问。它要找到正确版本的资料、说明依据，并在准备修改或发送内容前停下来请人确认。四节课分别完成这个系统的状态、证据、权限与恢复设计。", "Imagine a product-docs assistant answering visitors. It must find the right document version, show its basis, and pause before changing or sending anything. The four lessons design its state, evidence, permissions, and recovery."),
    milestones: [z("画出目标、观察、动作和停止条件", "Map goals, observations, actions, and stopping conditions"), z("为答案保存证据片段和版本", "Keep evidence chunks and versions for each answer"), z("区分自动读取与需要确认的写入", "Separate automatic reads from confirmed writes"), z("用固定问题集重现失败并改进", "Reproduce failures with a fixed question set")],
    deliverable: z("一张可实现的 Agent 状态图，加上一份检索与安全边界说明。", "An implementable Agent state diagram with retrieval and safety boundaries."),
  },
  fullstack: {
    title: z("任务台：从界面到可上线的数据流", "Task desk: from interface to deployable data flow"),
    brief: z("为一小组协作者制作任务台：创建任务、查看状态、处理失败，并确保每个人只能修改自己的任务。四节课把界面状态、API、数据库约束和上线检查连接起来。", "Build a task desk for a small team: create tasks, inspect status, recover from errors, and ensure each person can change only their own tasks. The four lessons connect UI state, API, database constraints, and release checks."),
    milestones: [z("列出空闲、加载、空结果、成功和失败状态", "List idle, loading, empty, success, and failure states"), z("定义创建任务的请求、响应与错误", "Define the create-task request, response, and errors"), z("写出用户、任务与唯一约束", "Model users, tasks, and uniqueness constraints"), z("制定发布、监控和回滚清单", "Prepare release, monitoring, and rollback checks")],
    deliverable: z("一个可以解释数据如何从浏览器到数据库、再返回界面的最小全栈方案。", "A minimal full-stack design that explains the round trip from browser to database and back."),
  },
  product: {
    title: z("把证据助手做成可交付产品", "Turn the evidence assistant into a usable product"),
    brief: z("把前两条路径合并：访客提问、查看来源、批准有副作用的动作；运营者则能发现失败并修正。这里关注的不只是模型效果，还有用户是否理解系统正在做什么。", "Combine the first two paths: visitors ask questions, inspect sources, and approve consequential actions; operators find and repair failures. Focus on whether users understand the system, not just model quality."),
    milestones: [z("写出一个可测量的用户任务", "Write one measurable user task"), z("画出成功、等待、确认、失败与恢复路径", "Map success, waiting, confirmation, failure, and recovery"), z("为每个状态设计用户能采取的动作", "Give users a meaningful action in each state"), z("定义评估样本、成本边界和下一轮迭代", "Define evaluation cases, cost limits, and the next iteration")],
    deliverable: z("一份可供开发的产品流程稿，包含边界、界面状态和上线验证方法。", "A build-ready product flow covering boundaries, interface states, and release validation."),
  },
};

export const LEARNING_GUIDES: Record<string, LearningGuide> = {
  "agent/agent-vs-chat": {
    scenario: z("访客问：“这项功能在新版中还能用吗？”普通聊天可能直接给出一句猜测；证据助手必须先确认文档版本、查找资料，再决定回答还是承认不知道。", "A visitor asks, ‘Does this feature still work in the new version?’ A chat response might guess. The evidence assistant must identify the document version, look for sources, then answer or admit uncertainty."),
    steps: [
      { title: z("写清目标", "Name the goal"), detail: z("把“回答问题”改成可检验条件：答案应标出版本、来源和仍不确定的部分。", "Replace ‘answer the question’ with a testable condition: show the version, sources, and remaining uncertainty.") },
      { title: z("把观察放进状态", "Keep observations in state"), detail: z("一次检索没有找到证据也是观察。记录查询、候选片段和工具错误，下一步才能根据事实改变。", "No search result is still an observation. Record queries, candidate chunks, and tool errors so the next step responds to facts.") },
      { title: z("定义停止边界", "Define a stop boundary"), detail: z("设置最大步数、可接受的证据条件和无法回答的出口。循环不能因为模型一直想尝试就无限继续。", "Set a step limit, evidence threshold, and no-answer exit. The loop cannot continue indefinitely just because the model wants to try again.") },
    ],
    task: z("为证据助手画一个最小状态图：收到问题 → 检索 → 检查证据 → 回答或说明不足。写出每条边触发的条件。", "Draw a minimal state graph: receive question → retrieve → inspect evidence → answer or explain insufficiency. Write the condition for each transition."),
    checks: [z("能指出何时调用工具，而不是只输出文本", "Shows when a tool runs rather than only producing text"), z("包含检索失败或证据不足的分支", "Includes a branch for failed retrieval or insufficient evidence"), z("包含明确的停止条件", "Includes an explicit stopping condition")],
    pitfall: z("把多轮对话当成 Agent 循环。对话次数增加，不等于系统能观察外部结果并据此改变动作。", "Mistaking a long conversation for an Agent loop. More turns do not mean the system observes external results and changes its actions."),
  },
  "agent/rag-pipeline": {
    scenario: z("知识库同时有 v1 与 v2 的发布说明。问题明确询问 v2，但语义相似度最高的片段来自旧版。直接交给模型会得到流畅却过期的答案。", "The knowledge base has v1 and v2 release notes. The question asks about v2, but the most similar chunk is from v1. Passing it straight to the model produces a fluent yet stale answer."),
    steps: [
      { title: z("检索前限定范围", "Constrain before retrieval"), detail: z("给每个片段保存文档 ID、版本、更新时间和章节；从问题中提取版本，先过滤，再做语义召回。", "Store document ID, version, update time, and section with every chunk. Extract the requested version and filter before semantic retrieval.") },
      { title: z("检查候选是否足够", "Inspect candidate quality"), detail: z("看候选覆盖的是问题的哪一部分。重排只改善候选顺序，无法找回召回阶段遗漏的证据。", "Check which parts of the question candidates cover. Reranking improves ordering but cannot recover evidence the first retrieval missed.") },
      { title: z("把引用当作约束", "Treat citations as constraints"), detail: z("答案里的每个关键事实都要指向具体片段；验证引用是否存在、版本是否匹配、片段是否真正支持该句。", "Each important claim should point to a specific chunk. Check that the citation exists, matches the version, and actually supports the sentence.") },
    ],
    task: z("为“新版是否支持批量导出？”设计三条文档片段：一条 v1 肯定、一条 v2 否定、一条无关。写出检索过滤规则和最终回答的依据。", "Invent three chunks for ‘Does the new version support bulk export?’: v1 says yes, v2 says no, and one is irrelevant. Write the retrieval filter and evidence behind the final answer."),
    checks: [z("每个片段带版本和来源 ID", "Each chunk carries version and source ID"), z("旧版片段不会覆盖新版结论", "The old chunk cannot override the new conclusion"), z("证据不足时允许回答“不确定”", "Allows ‘uncertain’ when evidence is insufficient")],
    pitfall: z("只增大 Top K。候选变多可能让旧版本和无关内容进入上下文，生成答案反而更难核对。", "Only raising Top K. More candidates can add stale and irrelevant content, making generated answers harder to verify."),
  },
  "agent/tools-and-confirmation": {
    scenario: z("助手准备把整理好的故障摘要发到团队频道。生成摘要只是草稿；点击发送会通知真实的人，属于另一个风险等级。", "The assistant is about to post an incident summary to a team channel. Drafting is reversible; sending notifies real people and belongs to another risk class."),
    steps: [
      { title: z("按影响给动作分级", "Classify impact"), detail: z("把读取、私有草稿、内部写入、对外发布分开。判断依据是实际副作用，而不是工具函数名。", "Separate reads, private drafts, internal writes, and external publishing. Classify by real side effect, not function name.") },
      { title: z("冻结待确认内容", "Freeze the proposed action"), detail: z("审批卡片展示目标频道、消息全文与预计影响；确认后执行的应是同一份内容，不应悄悄重新生成。", "The approval card shows destination, exact text, and expected impact. Execute that same content after approval, not a silently regenerated version.") },
      { title: z("处理拒绝和过期", "Handle rejection and expiry"), detail: z("拒绝后回到可编辑草稿；审批等待过久应失效，避免旧确认在上下文变化后仍触发动作。", "A rejection returns to an editable draft. Long-pending approvals should expire so an old decision cannot trigger an action after context changes.") },
    ],
    task: z("设计一张“发送摘要”确认卡：列出必须展示的字段、确认按钮的效果，以及拒绝后回到哪个状态。", "Design a ‘Send summary’ approval card: list required fields, the effect of confirm, and the state reached after rejection."),
    checks: [z("用户能看见目标和最终内容", "The user sees destination and final content"), z("拒绝不会调用发送工具", "Reject never calls the send tool"), z("重复确认不会发送两次", "A repeated confirmation cannot send twice")],
    pitfall: z("只在 Prompt 中写“发送前请确认”。真正的权限边界应由程序状态和工具执行逻辑共同保证。", "Only writing ‘ask before sending’ in a prompt. The state machine and tool execution path must enforce the boundary."),
  },
  "agent/evaluation-and-recovery": {
    scenario: z("更新检索策略后，演示问题回答得更漂亮，但旧版文档误引增加了。没有固定样本和运行轨迹，很难判断修改到底改善了什么。", "After a retrieval change, the demo answer looks better, but stale citations increase. Without fixed cases and traces, it is hard to tell what improved."),
    steps: [
      { title: z("收集可重放案例", "Collect replayable cases"), detail: z("保留用户问题、目标版本、预期来源与允许的拒答情况。至少加入正常、歧义和缺资料三类样本。", "Keep the question, target version, expected sources, and acceptable refusals. Include normal, ambiguous, and missing-source cases.") },
      { title: z("比较同一组指标", "Compare the same metrics"), detail: z("对修改前后同时统计引用正确率、拒答质量、耗时和成本；不要只看模型回答是否“顺口”。", "Compare citation accuracy, refusal quality, latency, and cost before and after. Fluency alone is not enough.") },
      { title: z("从稳定节点恢复", "Resume at a stable point"), detail: z("给关键步骤保存输入、工具结果和状态版本。失败后从可信的检查点重试，并避免重复执行已发生的副作用。", "Save inputs, tool outputs, and state version at key steps. Retry from a trusted checkpoint without repeating completed side effects.") },
    ],
    task: z("写 6 个评估问题：2 个正常、2 个旧版本干扰、2 个应拒答。为每个问题标出正确来源或拒答理由。", "Write six evaluation questions: two normal, two with stale-version interference, and two requiring refusal. Label the right source or refusal reason for each."),
    checks: [z("有修改前后的同一组样本", "Uses the same cases before and after changes"), z("既测答案，也测引用和拒答", "Checks answers, citations, and refusals"), z("重试不会重复发送或写入", "Retries do not repeat sends or writes")],
    pitfall: z("把日志量当成质量。海量日志只说明记录很多；没有问题类型、期望结果和基线，就无法判断是否进步。", "Treating log volume as quality. Many logs without case types, expected results, or a baseline do not show progress."),
  },
  "fullstack/interface-state": {
    scenario: z("任务台第一次打开时没有任务；提交后网络很慢；再次提交时服务器报错。若页面只画“有任务”的理想状态，访客会看见空白、误以为按钮没反应，甚至重复创建。", "The task desk opens with no tasks, then the network is slow on submit, then the server fails. If the page only designs the happy path, users see blanks, doubt the button, and may create duplicates."),
    steps: [
      { title: z("列出所有可见状态", "List visible states"), detail: z("至少包括初始、加载、空结果、有数据、提交中和失败。把空结果当成成功的一种，而不是错误。", "Include idle, loading, empty, populated, submitting, and error. Empty data is a kind of success, not an error.") },
      { title: z("为每个状态安排动作", "Give every state an action"), detail: z("加载时说明正在等待并禁用重复提交；空结果引导创建；失败时保留输入并允许重试。", "Explain waiting and block duplicate submissions while loading. Offer creation on empty state. Preserve input and retry on failure.") },
      { title: z("用状态图检查遗漏", "Check with a state graph"), detail: z("从加载到成功、空结果、错误都应该有边；错误恢复也必须能回到某个有效状态。", "Loading must lead to success, empty, or error. Recovery from error must lead back to a valid state.") },
    ],
    task: z("为“创建任务”按钮写出至少六个状态和各状态显示的文字、按钮是否可用，以及下一步动作。", "Write at least six create-task states with visible copy, button availability, and next action for each."),
    checks: [z("提交中无法重复提交", "Submission cannot duplicate while pending"), z("失败后输入内容仍在", "Input survives failure"), z("空列表有明确的创建入口", "An empty list has a clear create action")],
    pitfall: z("用多个互不关联的布尔值表示状态，例如 isLoading、hasError、isEmpty 同时为真。互斥状态更容易检查。", "Using unrelated booleans such as isLoading, hasError, and isEmpty, which can all become true. Exclusive states are easier to reason about."),
  },
  "fullstack/api-contracts": {
    scenario: z("浏览器提交创建任务请求。前端只校验了标题非空，但有人直接调用 API 发送超长标题和别人的 ownerId。服务端如果照单全收，权限与数据都会失控。", "The browser submits a create-task request. The UI only checks that the title is not empty, while a direct API caller sends a huge title and someone else's ownerId. Trusting it breaks both access control and data quality."),
    steps: [
      { title: z("只接受允许的输入", "Accept only allowed input"), detail: z("请求体只包含标题和说明；用户 ID 来自服务器验证后的会话，不从客户端字段读取。", "The body contains only title and description. Derive user ID from a verified server session, never a client-supplied field.") },
      { title: z("给错误稳定的形状", "Give errors a stable shape"), detail: z("例如 400 表示输入错误，401 表示未登录，403 表示无权访问；响应中的 code 和 message 供界面映射。", "For example, 400 means invalid input, 401 means unauthenticated, and 403 means forbidden. A stable code and message let the UI respond.") },
      { title: z("覆盖边界测试", "Test the boundaries"), detail: z("测试空标题、超长标题、未登录、访问他人任务与重复请求。不要只测试一次成功创建。", "Test empty and oversized titles, missing login, access to another user's task, and duplicate requests, not only one happy path.") },
    ],
    task: z("写一份 POST /tasks 契约：合法请求、成功响应、三个错误响应及各自的状态码。注明 ownerId 如何确定。", "Write a POST /tasks contract: valid request, success response, three errors with status codes, and how ownerId is determined."),
    checks: [z("客户端不能指定任务所有者", "Clients cannot choose the task owner"), z("输入长度有明确限制", "Input lengths have explicit limits"), z("401 与 403 的含义不同", "401 and 403 have distinct meanings")],
    pitfall: z("把 TypeScript 类型当作运行时校验。浏览器外的调用者不会遵守前端类型，服务端必须检查实际收到的值。", "Treating TypeScript types as runtime validation. API callers outside the browser do not obey frontend types; the server must validate real values."),
  },
  "fullstack/data-models": {
    scenario: z("两位成员同时创建同名任务，或者任务所属用户已被删除。界面上的规则无法保证数据库中始终有一致的关系。", "Two members create a task with the same title at once, or its owner is deleted. UI rules alone cannot guarantee consistent database relationships."),
    steps: [
      { title: z("从事实识别实体", "Identify entities from facts"), detail: z("用户和任务是独立实体；任务保存 ownerId，状态只取允许值，并有创建时间与更新时间。", "Users and tasks are separate entities. Tasks keep ownerId, an allowed status, and creation and update times.") },
      { title: z("把不变量放进数据库", "Encode invariants in the database"), detail: z("主键、防重复约束、外键和检查约束可以在并发写入时仍保护数据。唯一规则要明确范围，例如同一用户内唯一。", "Primary keys, uniqueness, foreign keys, and check constraints protect data under concurrent writes. Specify the scope of uniqueness, such as per owner.") },
      { title: z("设计迁移与删除策略", "Plan migration and deletion"), detail: z("新增必填字段时先考虑旧数据如何补齐；删除用户时决定任务是级联删除、匿名化还是保留审计记录。", "When adding a required field, plan how old rows get a value. On user deletion, choose cascade, anonymization, or retained audit records deliberately.") },
    ],
    task: z("为 users 和 tasks 画关系图，列出主键、外键、状态约束；再写出“删除用户”时任务会发生什么。", "Draw a users/tasks relation with primary key, foreign key, and status constraints; then specify what happens to tasks when a user is deleted."),
    checks: [z("能阻止孤儿任务", "Prevents orphan tasks"), z("唯一性范围写清楚", "Uniqueness scope is explicit"), z("迁移覆盖已有数据", "Migration accounts for existing data")],
    pitfall: z("照着表单字段逐字建表。界面可能改变，但数据库应表达稳定事实和长期需要维护的关系。", "Copying form fields directly into tables. The UI may change, but the database should express stable facts and durable relationships."),
  },
  "fullstack/production-delivery": {
    scenario: z("任务台在本地工作正常，部署后却因缺少环境变量导致登录失败。构建通过只能说明代码可编译，不能证明真实访问路径可用。", "The task desk works locally but login fails in production because an environment variable is missing. A passing build proves compilation, not the real user journey."),
    steps: [
      { title: z("拆开交付门槛", "Separate release gates"), detail: z("类型检查、lint、关键路径测试、可访问性检查和生产构建各自覆盖不同问题。保留明确的失败阻断条件。", "Type checking, linting, journey tests, accessibility review, and production build catch different problems. Define which failures block release.") },
      { title: z("验证生产路径", "Verify the production journey"), detail: z("部署到预览环境后走一遍登录、创建任务、刷新、退出；核对数据库权限与环境变量是否属于该环境。", "On a preview deployment, test login, task creation, refresh, and logout. Check database permissions and environment-specific variables.") },
      { title: z("准备回滚与观测", "Prepare rollback and observation"), detail: z("记录本次版本、迁移和关键指标。出现持续错误时，知道是回滚应用、修正配置，还是需要兼容旧数据。", "Record the release, migrations, and key metrics. For recurring errors, know whether to roll back the app, fix config, or support old data.") },
    ],
    task: z("为任务台写一份上线清单：至少五个发布前检查、两个发布后信号，以及一个回滚条件。", "Write a task-desk release checklist: at least five pre-release checks, two post-release signals, and one rollback condition."),
    checks: [z("包含真实登录与权限路径", "Includes real login and authorization flow"), z("能说明环境变量缺失时的表现", "Explains missing environment variable behavior"), z("定义可执行的回滚条件", "Defines an actionable rollback condition")],
    pitfall: z("把“本地能跑”当作“生产可用”。生产域名、密钥、数据库策略和网络条件都可能不同。", "Equating ‘runs locally’ with ‘works in production.’ Domain, keys, database rules, and network conditions may differ."),
  },
  "product/define-the-problem": {
    scenario: z("团队说“想做一个 AI 助手”。这还不是产品问题。访客真正需要的是在三分钟内知道某功能是否可用，并能查看支撑结论的文档。", "The team says, ‘We want an AI assistant.’ That is not yet a product problem. Visitors actually need to learn within three minutes whether a feature is available and inspect the supporting document."),
    steps: [
      { title: z("锁定一个人和一件事", "Pick one person and task"), detail: z("写下谁在什么情境下做什么决定。范围越窄，越容易判断 Agent 是否必要。", "Describe who is making which decision in what context. A narrow scope makes it easier to decide whether an Agent is needed.") },
      { title: z("定义可观察的成功", "Define observable success"), detail: z("例如“能找到正确版本并核对引用”，而不是“回答看起来智能”。同时定义允许拒答的情况。", "Use ‘find the correct version and verify citations,’ not ‘looks intelligent.’ Define when refusal is acceptable.") },
      { title: z("写出风险边界", "State the risk boundary"), detail: z("辨别错误回答、越权读取和意外写入的损害；先确定绝不能自动做的事，再决定要不要接入工具。", "Consider harms from wrong answers, unauthorized reads, and surprise writes. Decide what must never happen automatically before adding tools.") },
    ],
    task: z("用一段话定义证据助手的目标用户、问题、成功条件和一个必须拒绝的场景。", "In one paragraph, define the evidence assistant's user, problem, success condition, and one situation requiring refusal."),
    checks: [z("目标能被真实用户任务验证", "Goal can be checked against a real user task"), z("成功不只看回答流畅度", "Success is more than fluent output"), z("有明确不能自动执行的动作", "Names an action that cannot run automatically")],
    pitfall: z("先选择模型再寻找使用场景。这容易把模型擅长展示的能力误当作访客真正需要的结果。", "Choosing the model before the use case can mistake a compelling demo for the result a visitor needs."),
  },
  "product/map-the-workflow": {
    scenario: z("访客提问后，系统可能检索不到证据、调用工具超时、等待用户确认，或已经发送了通知。把这些情况画成一条直线，会隐藏重要分支。", "After a question, retrieval may find nothing, a tool may time out, approval may be pending, or a notification may already have been sent. A straight-line diagram hides these branches."),
    steps: [
      { title: z("先画成功主线", "Draw the happy path"), detail: z("问题 → 检索 → 生成草稿 → 验证 → 展示。每个节点说明输入、输出和由谁执行。", "Question → retrieval → draft → validation → display. For each node, note input, output, and owner.") },
      { title: z("补失败与等待分支", "Add failure and waiting branches"), detail: z("没有证据就拒答，工具超时就重试或退出，有副作用的动作就暂停到明确确认。", "Refuse when evidence is missing, retry or exit on timeout, and pause before consequential actions until explicit approval.") },
      { title: z("标记可恢复节点", "Mark recovery points"), detail: z("保存关键状态，让页面刷新或进程重启后能继续。已执行的写入应有幂等标识，避免恢复时重复执行。", "Save key state so refreshes and restarts can resume. Give completed writes idempotency keys to avoid repeats on recovery.") },
    ],
    task: z("画一张至少八个节点的状态图，包含无证据、工具超时、等待确认与用户拒绝四条分支。", "Draw a graph with at least eight nodes, including no evidence, tool timeout, awaiting approval, and user rejection."),
    checks: [z("每条边有触发条件", "Every transition has a trigger"), z("副作用动作经过确认节点", "Consequential actions pass through approval"), z("失败后有明确的恢复或停止路径", "Failures have a recovery or stop path")],
    pitfall: z("把“再次询问模型”当作所有失败的恢复方案。不同失败需要不同动作，重试前先知道失败在哪一层。", "Using ‘ask the model again’ as the universal recovery. Different failures need different responses and a known failure location."),
  },
  "product/design-the-surface": {
    scenario: z("用户看见一段正确答案，却不知道依据来自哪篇文档，也不知道“继续”按钮会不会发送消息。技术上有答案，体验上仍缺少控制感。", "A user sees a correct answer but not its source or whether ‘Continue’ will send a message. The technology works while the experience lacks clarity and control."),
    steps: [
      { title: z("让状态可见", "Show the current state"), detail: z("检索中、验证中、等待确认和失败应有不同反馈。不要用持续旋转的加载符掩盖具体阶段。", "Distinguish retrieval, validation, approval, and failure. A perpetual spinner should not hide the actual stage.") },
      { title: z("让证据可回看", "Let users inspect evidence"), detail: z("在结论旁放来源标题、版本和可展开片段。无来源的推断要标出不确定性。", "Place source title, version, and expandable excerpt beside claims. Mark unsupported inference as uncertain.") },
      { title: z("让动作可撤销或确认", "Make actions reversible or confirmable"), detail: z("写入前展示具体影响和预览；执行后明确状态。失败时提供重试、编辑或退出，而不是困在死路里。", "Preview scope and effect before writes and show completion afterward. On failure, offer retry, edit, or exit rather than a dead end.") },
    ],
    task: z("为证据助手画三张屏幕草图：检索中、显示答案与证据、等待发送确认。标出每张屏幕的主动作。", "Sketch three screens: retrieving, answer with evidence, and awaiting send approval. Mark the primary action in each."),
    checks: [z("答案能回到具体来源", "Claims link to specific sources"), z("确认按钮说明实际后果", "Approval explains the actual consequence"), z("失败状态有可执行的下一步", "Failures offer an actionable next step")],
    pitfall: z("只给状态换颜色，不改变信息与动作。红色错误框如果没有原因和恢复入口，仍然无法帮助用户。", "Changing only the color of a state. A red error box without cause or recovery does not help the user."),
  },
  "product/ship-and-observe": {
    scenario: z("证据助手上线后，大部分问题都能回答，但少数问题引用错版本，且高峰时延迟变长。上线不是终点，必须知道在哪些问题上退步。", "After launch, the evidence assistant answers most questions, but a few cite the wrong version and peak-hour latency grows. Shipping is not the finish line; we need to see where it regresses."),
    steps: [
      { title: z("上线前固定评估集", "Freeze an evaluation set"), detail: z("收集真实任务类型与合成边界样本，标出期望引用、允许拒答和应阻止的动作。修改后用同一组问题比较。", "Collect real task patterns and synthetic edge cases with expected citations, acceptable refusals, and prohibited actions. Reuse the same set after each change.") },
      { title: z("上线后观察趋势", "Observe trends after launch"), detail: z("按版本看错误率、引用有效率、延迟、单次成本和确认拒绝率。聚合数据前先避免记录不必要的个人内容。", "Track error rate, valid citations, latency, per-request cost, and approval rejection by release. Avoid collecting unnecessary personal content.") },
      { title: z("决定下一轮改什么", "Choose the next change"), detail: z("从最高频或最高风险的失败开始，写下假设、改动、预期指标和回滚条件；一次只改足以归因的范围。", "Start with frequent or high-impact failures. Record hypothesis, change, expected metric, and rollback condition. Limit changes enough to attribute results.") },
    ],
    task: z("写一份一页的上线观察计划：六个评估问题、三个运行指标、一个成本上限和一个暂停发布条件。", "Write a one-page launch plan with six evaluation cases, three runtime metrics, a cost cap, and a pause condition."),
    checks: [z("指标与用户任务相关", "Metrics relate to user tasks"), z("有成本和风险阈值", "Includes cost and risk thresholds"), z("下一次修改可与基线比较", "The next change can be compared with a baseline")],
    pitfall: z("只看总调用量和点赞率。使用人数增加不等于答案可信；要把失败按类型拆开分析。", "Watching only total calls and likes. More usage does not mean trustworthy answers; break failures down by type."),
  },
};
