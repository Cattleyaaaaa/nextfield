# NEXTFIELD / 下一场域

一个持续生长的项目、笔记与实验索引。它包含 NEXTFIELD OS 命令中心、90 秒快速介绍、项目回放、失败博物馆、开放实验室、Field Radio、每日生成封面、能力证据图和 Live Studio，并输出为纯静态网站。

## 技术栈

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React 图标
- next-themes 深浅主题
- GSAP 滚动与 3D 交互
- Web Audio API 程序化环境声
- Canvas / OGL 视觉实验

## 安装与运行

需要 Node.js 18.17 或更高版本。

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

执行生产检查：

```bash
npm run typecheck
npm run lint
npm run build
```

静态文件输出到 `out/`。

## 修改个人资料

编辑根目录的 `site.config.ts`：

- `name`：你的姓名或个人品牌
- `role`：职业定位
- `statement`：首页主视觉文案
- `description`：网站描述
- `url`：部署后的正式域名
- `socials`：联系方式（当前仅保留 GitHub）

项目展示占位内容位于 `components/home/project-showcase.tsx`；替换项目名、描述、技术标签和链接即可。

技术栈内容位于 `components/home/tech-stack.tsx`，分为 Agent 开发与全栈开发两组。

## 目录说明

```text
app/                 首页、关于页、404、Sitemap 和全局样式
components/home/     Hero、技术栈、项目展示
components/motion/   Framer Motion 动效原语
components/site/     导航、页脚和主题切换
components/visual/   光晕、噪点与分区标题
lib/                 通用工具函数
site.config.ts       个人资料与站点配置
```

## 部署到 Vercel

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 中选择 **Add New → Project** 并导入仓库。
3. Framework Preset 选择 **Next.js**。
4. Build Command 使用 `npm run build`。
5. 点击 Deploy。

项目会构建为静态资源。设置自定义域名后，将该地址写入 `site.config.ts` 的 `url` 并重新部署。

## 设计与动效

网站沿用暖米白、炭黑和朱橙色的视觉系统。技术栈与项目卡片使用统一圆角、细边框、hover 上浮和 Framer Motion 视口渐显，并尊重系统的 `prefers-reduced-motion` 设置。
