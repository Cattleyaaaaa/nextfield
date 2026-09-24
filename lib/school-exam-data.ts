import "server-only";
import { createHash } from "node:crypto";
import type { LocalizedText } from "@/lib/editorial-data";
import type { LearningTrack } from "@/lib/learn-data";

type TrackSlug = LearningTrack["slug"];
export type ExamQuestion = { id: string; prompt: LocalizedText; options: LocalizedText[]; answer: number; explanation: LocalizedText };
const z = (zh: string, en: string): LocalizedText => ({ zh, en });
const q = (id: string, prompt: LocalizedText, options: LocalizedText[], answer: number, explanation: LocalizedText): ExamQuestion => ({ id, prompt, options, answer, explanation });

export const PASSING_SCORE = 5;
export const EXAM_QUESTIONS: Record<TrackSlug, ExamQuestion[]> = {
  agent: [
    q("a1", z("证据助手连续两次检索不到相关资料，最合理的下一步是什么？", "The evidence assistant finds no relevant source after two searches. What next?"), [z("继续无限次检索", "Search indefinitely"), z("说明证据不足，并停止或请人补充资料", "Explain the evidence gap and stop or request more information"), z("编造一个最可能的答案", "Invent the most likely answer"), z("直接写入知识库", "Write to the knowledge base")], 1, z("Agent 需要停止条件和证据不足的出口。", "An Agent needs a stopping rule and an exit for insufficient evidence.")),
    q("a2", z("问题明确询问 v2，检索结果同时含 v1 和 v2。第一步应如何处理？", "A question asks about v2, but retrieval returns v1 and v2. What should happen first?"), [z("只按文本长度排序", "Sort by text length"), z("先按版本元数据过滤，再判断相关性", "Filter by version metadata before relevance ranking"), z("把所有片段直接发给模型", "Send every chunk to the model"), z("删掉文档版本字段", "Remove version metadata")], 1, z("版本属于证据约束，不能交给模型猜。", "Version is an evidence constraint, not something the model should guess.")),
    q("a3", z("重排器能否找回初次召回阶段完全遗漏的文档？", "Can a reranker recover a document missing from the initial retrieval?"), [z("可以，重排会重新搜索整个知识库", "Yes, reranking searches the whole corpus"), z("不可以，它只能重排已有候选", "No, it only reorders existing candidates"), z("可以，只要增大模型温度", "Yes, if model temperature increases"), z("可以，前提是答案足够长", "Yes, if the answer is long enough")], 1, z("召回与重排是不同阶段；候选缺失要修复召回。", "Retrieval and reranking are distinct; a missing candidate requires fixing retrieval.")),
    q("a4", z("助手准备向客户发送邮件。确认界面最重要的是展示什么？", "An assistant is about to email a customer. What matters most in the approval UI?"), [z("模型使用的温度值", "The model temperature"), z("收件人、最终内容和发送后果", "Recipient, final content, and the effect of sending"), z("上一次提示词长度", "The previous prompt length"), z("随机的成功动画", "A celebratory animation")], 1, z("确认必须对应即将发生的真实动作。", "Approval must describe the actual action about to happen.")),
    q("a5", z("工具超时后重试一次写入，怎样降低重复写入风险？", "A write times out. How can a retry avoid duplicate writes?"), [z("把超时时间调成零", "Set timeout to zero"), z("为该动作使用稳定的幂等标识", "Use a stable idempotency key for the action"), z("删除所有运行日志", "Delete all run logs"), z("只让模型口头承诺不重复", "Ask the model to promise not to repeat")], 1, z("相同动作复用幂等标识，服务端才能识别重试。", "A stable idempotency key lets the server recognize a retry.")),
    q("a6", z("修改 RAG 管线后，哪种方法更能判断质量是否提升？", "After changing a RAG pipeline, how do you tell whether quality improved?"), [z("只看一次精彩演示", "Watch one impressive demo"), z("用固定问题集比较答案、引用和拒答", "Compare answers, citations, and refusals on a fixed set"), z("只统计代码行数", "Count lines of code"), z("只统计生成速度", "Measure generation speed only")], 1, z("固定样本和多维指标让前后变化可比较。", "Fixed cases and multiple metrics make before-and-after changes comparable.")),
  ],
  fullstack: [
    q("f1", z("任务列表请求成功，但返回空数组。界面应显示什么状态？", "A task-list request succeeds with an empty array. What state should the UI show?"), [z("服务器故障", "Server failure"), z("空结果，并提供创建任务的入口", "An empty state with an action to create a task"), z("无限加载", "Endless loading"), z("直接隐藏整个页面", "Hide the whole page")], 1, z("空结果是成功响应的一种，不是故障。", "An empty result is a successful response, not a failure.")),
    q("f2", z("客户端传入 ownerId=他人账户。创建任务时，服务端应该如何确定所有者？", "A client sends another person's ownerId. How should the server choose the task owner?"), [z("照单全收", "Use the supplied value"), z("从已经验证的登录会话获取用户 ID", "Use the user ID from a verified session"), z("从标题中推测", "Guess from the title"), z("从浏览器语言推测", "Guess from browser language")], 1, z("所有权由服务端验证的身份决定，不能信任请求体。", "Ownership comes from server-verified identity, not the request body.")),
    q("f3", z("未登录与已登录但无权读取他人任务，通常应分别返回什么？", "What responses typically distinguish no login from logged-in access to another user's task?"), [z("都返回 200", "Both return 200"), z("401 和 403", "401 and 403"), z("403 和 401", "403 and 401"), z("都返回 500", "Both return 500")], 1, z("401 表示未认证，403 表示身份已知但没有权限。", "401 is unauthenticated; 403 is authenticated but forbidden.")),
    q("f4", z("两个请求同时创建相同用户名，最终唯一性应由哪一层保证？", "Two requests create the same username at once. Which layer must guarantee uniqueness?"), [z("按钮禁用状态", "Disabled button state"), z("数据库唯一约束", "Database unique constraint"), z("浏览器缓存", "Browser cache"), z("文案提示", "A UI hint")], 1, z("数据库约束能在并发写入时守住不变量。", "A database constraint protects the invariant under concurrent writes.")),
    q("f5", z("要给现有任务表新增非空字段，迁移前最需要考虑什么？", "Before adding a required field to an existing tasks table, what must you plan?"), [z("只修改新任务表单", "Only change the new-task form"), z("已有行如何获得有效值", "How existing rows receive a valid value"), z("是否能删除全部旧任务", "Whether all old tasks can be deleted"), z("按钮改成什么颜色", "The button color")], 1, z("迁移必须照顾已有数据，避免上线时约束失败。", "A migration must account for existing rows to avoid constraint failures.")),
    q("f6", z("构建通过以后，最能验证 GitHub 登录真实可用的步骤是什么？", "After a successful build, what best verifies that GitHub login actually works?"), [z("只看 TypeScript 无错误", "Only check TypeScript"), z("在预览环境走完登录、刷新和退出路径", "Complete sign-in, refresh, and sign-out on a preview deployment"), z("只检查首页截图", "Only inspect a homepage screenshot"), z("只看依赖版本", "Only inspect dependency versions")], 1, z("真实 OAuth 依赖域名、回调与部署环境配置。", "Real OAuth depends on domains, callbacks, and deployment settings.")),
  ],
  product: [
    q("p1", z("团队说“做一个 AI 助手”，下一步应先写清什么？", "A team says, ‘Build an AI assistant.’ What should be clarified first?"), [z("模型参数数量", "Model parameter count"), z("具体用户、任务和可观察的成功条件", "Specific user, task, and observable success criteria"), z("按钮的阴影大小", "Button shadow size"), z("尽可能多的工具清单", "The longest possible tool list")], 1, z("产品应从用户要完成的任务开始。", "A product starts with the task the user needs to complete.")),
    q("p2", z("工作流检索不到证据时，流程图应怎样表达？", "How should a workflow represent missing evidence?"), [z("省略这个情况", "Omit the case"), z("加入拒答或请求补充资料的分支", "Add a refusal or request-for-information branch"), z("永远继续生成", "Keep generating forever"), z("自动发布答案", "Publish an answer automatically")], 1, z("无证据是明确状态，不能隐藏在成功主线里。", "No evidence is an explicit state, not a hidden happy-path variant.")),
    q("p3", z("用户查看答案时，哪种设计更便于核对？", "Which answer design makes verification easier?"), [z("只显示一段流畅文字", "Show only fluent prose"), z("把关键结论连到来源和版本", "Link key claims to sources and versions"), z("隐藏所有引用", "Hide all citations"), z("只显示模型名称", "Show only the model name")], 1, z("证据应与结论并列，方便用户检查。", "Evidence should sit beside the claim so users can inspect it.")),
    q("p4", z("确认发送消息时，用户点“拒绝”后应发生什么？", "When the user rejects a send action, what should happen?"), [z("仍然发送", "Send anyway"), z("回到可编辑草稿，且不调用发送工具", "Return to an editable draft without calling the send tool"), z("清空所有资料且无提示", "Erase everything without explanation"), z("改由模型替用户确认", "Let the model approve for the user")], 1, z("拒绝必须阻止副作用，同时保留恢复路径。", "Rejection must block the side effect while preserving a recovery path.")),
    q("p5", z("引用错误率升高，但总调用量也上升。该如何判断产品是否变好？", "Citation errors rise while total usage grows. How should quality be judged?"), [z("只看调用量", "Look only at usage"), z("按问题类型查看错误、引用有效率与运行轨迹", "Inspect errors, citation validity, and traces by task type"), z("只看点赞数", "Look only at likes"), z("删除失败日志", "Delete failure logs")], 1, z("使用量与质量不是同一指标，必须定位失败类型。", "Usage and quality are different measures; inspect failure types.")),
    q("p6", z("高风险新功能准备上线，最稳妥的迭代方式是什么？", "A high-impact new feature is ready to ship. What rollout supports learning?"), [z("直接全量发布且不监控", "Release everywhere without monitoring"), z("小范围发布，记录基线、指标和暂停条件", "Roll out narrowly with a baseline, metrics, and a pause condition"), z("只依赖一次内部演示", "Rely on one internal demo"), z("关闭所有确认步骤", "Remove every approval step")], 1, z("小范围验证能更早发现问题，并明确何时暂停。", "A limited rollout finds problems earlier and defines when to pause.")),
  ],
};

function examOrder(question: ExamQuestion, userId: string) {
  const offset = createHash("sha256").update(`${userId}:${question.id}`).digest()[0] % question.options.length;
  return {
    options: [...question.options.slice(offset), ...question.options.slice(0, offset)],
    correctIndex: (question.answer - offset + question.options.length) % question.options.length,
  };
}

export function publicExamQuestions(track: TrackSlug, userId: string) {
  return EXAM_QUESTIONS[track].map(({ id, prompt, ...question }) => ({ id, prompt, options: examOrder({ id, prompt, ...question }, userId).options }));
}

export function gradeExam(track: TrackSlug, userId: string, answers: number[]) {
  const questions = EXAM_QUESTIONS[track];
  return questions.map((question, index) => ({
    id: question.id,
    correct: answers[index] === examOrder(question, userId).correctIndex,
    explanation: question.explanation,
  }));
}
