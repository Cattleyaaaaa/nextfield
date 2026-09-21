# personalBlog — 项目长期笔记

## 是什么

Next.js 14 App Router + TypeScript + Tailwind + Framer Motion 的**静态导出**个人站（`agent-fullstack-portfolio`），定位「Agent 开发 & 全栈开发者」。**2026-09-21 起改为门户结构**：

- `/` = **门户首页**：欢迎区（三栏状态 + `siteConfig.statement` 大标题）+ 「Fragments / 片段」卡片网格。视觉只用 `AmbientGlow`（纯 CSS，0 WebGL）。
- `/about` = **八屏纵向翻页**（`fullpage-portfolio.tsx` 的 `slides`：序幕 / 首页 / 简介 / Agent 开发 / 全栈开发 / 写作 / 近况 / 联系），由 `app/about/page.tsx` 渲染。
- `/projects`、`/gallery`（占位）、`/build-log`（占位）、`/blog` + `/blog/[slug]`（MDX）、404、sitemap、robots。
- 板块清单的唯一真值是 `lib/nav.ts` 的 `navSections`（+`headerSections` 取前三），顶栏 / 页脚 / 门户卡片都从它派生，**加板块改这一处**。
- 顶栏导航直连路由并带当前板块高亮（`header-specular-button--active`）；原 `portfolio-nav-to-slide` 事件与 sessionStorage 切屏机制已删除，`/about#writing` 这类 hash 初始定位仍可用。

**屏内编号约定**（眉标 `0X / Label`，`agent-slide.tsx` 起算，改屏序时**必须同步重排**）：Agent `01 / Specialty` → 全栈 `02 / Specialty` → 写作 `03 / Writing` → 近况 `04 / Now`；简介屏写 `Profile / Overview`、联系屏写 `Contact`，两者不带编号。（2026-09-21 删掉 `01 / Experience` 经历屏、又拆走 `项目` 屏后两次重排。）

## 构建与目录约定

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器，缓存写 `.next-development` |
| `npm run build` | 生产构建 + 静态导出 |
| `npm run typecheck` / `npm run lint` | 静态检查（**不触发删除，永远可跑**） |

**⚠️ 头号坑：静态导出目录不是 `out/`，而是 `.next-production/`。**
`next.config.mjs` 用 `NODE_ENV` 三元切 `distDir`，而 Next 的实现（`next/dist/build/index.js:380-384` 的 `hasCustomExportOutput`）在 `output:'export'` 且 `distDir !== '.next'` 时会**把导出目录设为 `distDir`**，同时把构建缓存强制挪回 `.next`。实际形态：
- `.next/` = 构建缓存
- `.next-production/` = **可部署的静态产物**
- `out/` = 陈旧遗留（20:37 之前的旧产物），**不可用于部署**
- `.gitignore` 只忽略 `out` 与 `.next`，**未忽略 `.next-production`**
- README 里「静态文件输出到 `out/`」已过时

**⚠️ `npm run build` 会被本机 safe-delete 防护拦截**（Next 要清理 `.next/` 旧 chunk，单轮删除阈值 50）。报错 `[SAFE_DELETE_BULK_REJECTED]`，需用户授权 escalation；**不要在同一轮里重试**。被拦时改用：`typecheck` + `lint` + 浏览器运行时注入法验收。

**⚠️ 第二个：dev server 在跑时，绝不能再起一个 next 进程（`npm run dev` / `npm run build` 都不行）。**
两个进程共用同一个 `distDir`（`.next-development`），新进程会 `recursiveDelete` 掉正在跑的那个的缓存，而本机 safe-delete 会在删到一半时中止 → **目录残缺**（`static/chunks/main-app.js`、`polyfills.js` 消失），旧 dev server 却仍按内存 manifest 输出引用它们的 HTML → **全部 404 → 客户端 JS 永不启动**。
症状极具迷惑性：**页面 SSR 渲染完整、视觉正常，但顶栏导航点击"不跳转"（实际是退化成 `<a>` 原生锚点跳转，只改 hash 不切屏）、主题开关与分页点全都没反应**；且 `console` / `errors` **一片空白**。
定性两连（10 秒，别读业务代码、别看 console）：
```bash
agent-browser eval "JSON.stringify({r:Object.keys(document.body).filter(k=>k.startsWith('__react')).length,n:typeof window.next})"
# {"r":0,"n":"undefined"}  ⇒ 没水合
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/_next/static/chunks/main-app.js   # 404 ⇒ 铁证
```
修复（**重命名让位，不做删除**，不会撞 safe-delete）：
```bash
PID=$(netstat -ano | grep ":3000" | grep LISTEN | awk '{print $5}' | head -1); [ -n "$PID" ] && MSYS_NO_PATHCONV=1 taskkill /F /PID $PID
mv .next-development ".next-development.broken-$(date +%H%M)"; npm run dev
```
（本机 2026-09-21 11:07 因我自己多起了一个 `npm run dev` 触发过一次，残留目录 `.next-development.broken-1107` 待清理。）

## WebGL 上下文占用（改任何动效前必读）

| 组件 | 图形依赖 | 上下文数 | 出现位置 |
|---|---|---|---|
| `SpecularButton` | **ogl**，`useEffect` 内**每实例 `new Renderer()`** | **6** | 顶栏每个导航项 + ENTER STUDIO + 动效/主题开关 |
| `Particles`（`visual/ambient-particles` 动态引入） | ogl | 1 | 除序幕屏外所有屏 |
| `Lanyard` | three.js | 按需 1 | 点「ENTER STUDIO」才挂载 |
| `ParticleText` | canvas **2D** | 0 | 序幕屏 |

→ `/about` 常驻约 **7 个** WebGL 上下文（原 `/about` 页的 `SplashCursor` 已随页面删除，不再占位）。**任何新动效一律不得引入 canvas / WebGL。**
门户首页 `/` 刻意 **0 个** WebGL 上下文（只用 `AmbientGlow` 的 CSS blur），保持首屏轻量。

## 动画库归属约定（避免多库抢同一元素）

- **Framer Motion** → 换屏容器 `motion.section`（opacity/scale/y/filter）、卡片 `motion.article` 的 `whileHover={{ y }}`
- **GSAP** → 屏内元素入场（`useGSAP` + `data-*` 选择器 + `delay` 等换屏动画结束）
- **纯 CSS** → 颜色 / 边框 / 阴影 / 伪元素（`.link-line`、hover 描边）

⇒ GSAP 只碰 `data-*` 包装层，Framer 只碰 `motion.*` 内层，CSS 只碰颜色类。同层属性绝不交叉。

**⚠️ fullpage 模式下不能用 ScrollTrigger**：`html[data-fullpage=true]{overflow:hidden}` + 每屏 `h-full overflow-hidden` → 不可滚动，四屏内容全在视口内。进场时机 = 该屏被切换进来（组件挂载），不是滚动。

## React Bits 组件可用性（已全量审计 115 个）

**33 个含 canvas/WebGL/ogl/three，必须排除**（ClickSpark、PixelCard、ElectricBorder、Noise、ASCIIText、FuzzyText、ParticleText、Lanyard、SpecularButton…）。其余 **82 个可安全使用**。
- 它们普遍 `import { motion } from 'motion/react'`，本项目装的是 `framer-motion@11.15`（**没有 `motion` 包**）→ 移植时改 import 为 `framer-motion`，**无需新增依赖**
- `GlareHover`、`StarBorder` 是**纯 CSS**，零依赖零冲突，优先
- 体检用 `unzip -p <zip> <path>` 流式读取（该 zip 的 `unzip -d` 通配符解压行为异常，解不出文件）

## 顶栏导航链路（排查"点不动"时先看这张图）

`header.tsx` 的三个链接**不走 `<Link>`**，而是一条手写三段式（`HeaderSpecularButton` → `SpecularButton` 渲染成 `<a>`，点击回调是 `onLinkClick`）：

| 场景 | 行为 |
|---|---|
| 已在 `/` 且链接带 `slide`（index→`intro`、project→`projects`） | `history.replaceState` 改 hash + 派发 `window` 事件 `portfolio-nav-to-slide`；由 `fullpage-portfolio.tsx` 监听后 `goTo(index)` 切屏（**不经过路由**） |
| 在别处点 project | 先写 `sessionStorage["portfolio-nav-target"]="projects"`，再 `navigate("/#projects")`；回到首页时 mount 一次性读取并直接落到项目屏 |
| 点 about（`slide: null`） | `navigate("/about")` → `PageTransitionProvider` 走"水幕覆盖 → 500ms 后 `router.push`" |

⇒ **判据**：点 project 后 `location.hash` 必变，**且**右侧分页点的 `aria-current="step"` 必须同步挪到项目屏（九屏制下是下标 **5**）。**只有 hash 变、屏不动 = 客户端没水合**（见上面的 distDir 坑），不是导航逻辑错。

## ⚠️ CSS 陷阱（已踩）

`PixelSwap.css` 的 `.pixel-swap{...height:100%...}` 与调用方传入的 Tailwind 尺寸类**特异性相同**，而组件 CSS 加载在 `@tailwind utilities` 之后 → 后加载者胜。后果：`h-[24rem]` 被压成 `height:100%`，父级高度 auto 时解析为 0，而 PixelSwap 两层内容都是 `position:absolute`（不撑高）→ **整块塌成 0px，`overflow:hidden` 把文字全裁掉**。
⇒ **给 PixelSwap 传高度一律用 `min-h-*`。**

## 已知待办

1. `site.config.ts` 仍是占位值：`YOUR NAME` / `hello@example.com` / `https://example.com` / `location: 中国香港`。
2. 静态导出目录与 README、`.gitignore` 三者不一致。
3. `content/` 空目录；**无 `public/` 目录**，但 `studio-badge-drop.tsx` 预留了 `/me-stylized.jpg`。
4. 项目**尚未初始化 git**；目录现已五套（`.next` / `.next-development` / `.next-development.broken-1107` / `.next-production` / `out`）—— 第 3 个是 11:07 缓存损坏的残骸，可删（会超 safe-delete 单轮阈值，需授权）。
5. 孤儿文件：`components/motion/reveal.tsx`、`components/visual/section-label.tsx`（清理死代码后已无引用）。
6. `components/` 根目录堆了 11 个通用动效件，与 `site/`、`visual/`、`home/` 分组规则不一致。
7. 简介屏两层排版仍有结构性差异（标题行数随宽度变化会让正文起点差 50~58px），方案已备但用户暂缓。

## 本地预览静态产物

```bash
python -m http.server 4321 --directory .next-production
```
（`file://` 打不开——导出物用绝对路径 `/_next/...`。另注意该 server **不做 `.html` 扩展名映射**，要请求 `/about.html`。）
