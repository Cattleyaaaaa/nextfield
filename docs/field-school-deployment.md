# FIELD SCHOOL 第二阶段：Vercel + Supabase

## 已实现与边界

课程、代码练习无需登录；GitHub 登录、账户进度、私密作业、可选公开档案、服务器检查题记录需要 Supabase。课程导师和模型练习场另外需要 OpenAI 配置。数字分身继续保留，课程导师不冒充站主。

代码练习在无同源权限的 iframe + Worker 内运行，限制联网并设置超时。它是学习反馈，不是可信判题平台。项目提交仅保存 GitHub 仓库链接和复盘，不拉取仓库、不运行项目、不自动评审。学习建议按未完成课程推荐下一课，不做学习能力画像。

本地 Field Pass 是自报进度纪念卡；服务器检查题记录仅证明账户提交了正确选项。选项本来就随课程公开，不属于考试或职业认证。

## 配置步骤

1. 在 Supabase 创建项目，执行 `supabase/migrations/202609220001_field_school.sql`（一次性初始化；不要在已有同名表的数据库重复执行）。
2. 在 GitHub 创建 OAuth App。GitHub 的 Authorization callback URL 使用 Supabase 提供的 `https://<project-ref>.supabase.co/auth/v1/callback`，不是本站回调。将 Client ID/Secret 填入 Supabase Authentication → Providers → GitHub，启用该提供方。不申请仓库写权限。
3. Supabase Authentication → URL Configuration：Site URL 填正式站点地址；Redirect URLs 精确加入 `https://你的域名/auth/callback`。本地开发另加 `http://localhost:3333/auth/callback`。不要为生产配置任意域名通配符。
4. Vercel 导入此仓库，选择 Next.js，构建命令 `npm run build`。不要使用静态导出或设置输出目录为 `out`；API 需要服务端运行。
5. 按 `.env.example` 配置环境变量。服务器使用标准 HTTP 接口，无需额外 Supabase SDK：
   - `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase 项目 URL 和传统 anon key。
   - `SUPABASE_SERVICE_ROLE_KEY`：仅服务端，用于签发检查题记录、读取已公开档案和原子额度计数。**绝不能添加 NEXT_PUBLIC 前缀**。
   - `SITE_URL`：正式站点完整 origin；本地为 `http://localhost:3333`。登录必须从该地址开始。
   - `OPENAI_API_KEY`：服务端模型密钥；`OPENAI_MODEL`：你的项目可访问的、支持 Responses API 的文本模型 ID。
   - `FIELD_AI_ENABLED=false`：默认关闭。完成账单预算、监控和测试后，显式设为 `true` 并重新部署。
6. 本地把示例复制为 `.env.local`，不要提交密钥。生产在 Vercel 设置密钥，不要贴入聊天或浏览器代码。变量修改后重新部署。

## 安全与数据

- PKCE 登录，访问/刷新 token 使用 HttpOnly、SameSite=Lax cookie；生产启用 Secure。每次数据请求向 Supabase 验证用户；普通数据读写使用用户 token，受 RLS 限制。写请求检查同源 Origin。
- 访客记录不自动导入账户，需点击工作台“导入到当前账户”。退出后回到该浏览器的访客记录。
- 档案默认私密；只有显式公开后才能访问档案和验证链接。隐藏后新请求立即失效，但不能撤回别人此前保存的副本。复盘、作业链接不随档案公开。
- AI 请求仅发送提问和选定课程摘要，使用 `store:false`；这不是“第三方绝不保留数据”的保证，仍需遵守提供商数据政策。不要发送敏感信息。
- 数据库原子计数：每账户每天 10 次、全站每天 200 次（数据库日期，默认 UTC）。失败调用也占次数；超过个人限额不会继续耗尽全站额度。不能阻止多账户滥用；公开运营前应增加 WAF/反滥用、费用报警和提供商项目预算。
- 不自动删除学习数据。删除账户可通过 Supabase Auth 管理员操作，关联表外键会级联删除。正式开放前补充隐私政策、用户删除申请渠道和备份策略。

## 上线前验收（需真实云端配置）

本地编译或接口返回 401/503 不代表云端流程验收完成。

- 两个 GitHub 测试账户 A/B：登录、过期刷新、退出、重新登录；错误/缺失回调 code 不应登录。
- A 完成课程，另一设备登录 A 能读到进度；B 看不到 A 的进度、作业或私密档案。直接调用 Supabase REST 尝试写入他人的 user_id 应被 RLS 拒绝。
- 未登录提交、跨源 POST、过长请求、无效仓库、错误检查题均失败。正确检查题重复提交不应产生多条凭证。
- 公开档案后验证链接可访问；改为私密后档案/验证链接返回 404。
- AI 未开启应提示未配置；开启后核对真实文本、延迟、token 和课程链接。第 11 次请求返回 429；两个 Vercel 实例共享限制。错误请求不显示提供商密钥或响应详情。
- Chromium/Firefox/Safari 验证代码练习的通过、失败、语法错误、无限循环终止；确认无法访问本站 cookie 或联网。
- 中文/英文切换、窄屏、键盘操作、断网、禁用 localStorage 场景。

## 参考

- [Supabase PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
- [Supabase Auth REST schema](https://github.com/supabase/auth/blob/master/openapi.yaml)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OpenAI Responses](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create)
