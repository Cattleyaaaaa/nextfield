export type LocalizedText = { zh: string; en: string };
export type EditorialSection = { heading: LocalizedText; paragraphs: LocalizedText[] };
export type EditorialArticle = {
  slug: string;
  date: string;
  title: LocalizedText;
  summary: LocalizedText;
  eyebrow: string;
  tags: string[];
  minutes: number;
  sections: EditorialSection[];
};

export const BUILD_LOG_ARTICLES: EditorialArticle[] = [
  {
    slug: "field-agent-from-chat-to-site-guide", date: "2026 · 10 · 08", eyebrow: "Build log / Field Agent", tags: ["Field Agent", "DeepSeek", "Streaming", "Retrieval"], minutes: 6,
    title: { zh: "让 Field Agent 成为站内向导", en: "Turning Field Agent into a site guide" },
    summary: { zh: "V2.0.0 从真实流式问答走向可点击的全息信号矩阵：让项目、文章与随笔成为内容信号，再用问题种子连接站内问答。记录这一版的交互、资料与设计取舍。", en: "V2.0.0 connects real streamed answers with a clickable holographic signal matrix: projects, writing and essays become content signals, with question seeds leading into site-grounded chat. This records the release's interaction, sources and design choices." },
    sections: [
      { heading: { zh: "先让入口和状态可见", en: "Make entry points and state visible" }, paragraphs: [
        { zh: "Field Agent 的入口放在顶部导航与左下角常驻按钮中，Command Field 也保留入口。桌面打开右侧助手面板，手机使用全屏布局。内容区单独滚动，输入区固定在底部；关闭面板或切换站内页面后，对话保留在当前页面会话，刷新后清空。", en: "Field Agent opens from the header, a persistent lower-left button or Command Field. It uses a right-side panel on desktop and a full-screen view on phones. The conversation scrolls separately from the fixed composer. Closing the panel or navigating within the site preserves the current page session; refreshing clears it." },
        { zh: "面板把连接、查阅资料、生成回答、失败与额度用完分开显示。免登录意味着访客可以直接提问，但不意味着无限调用：第一版每 IP 每日 5 次，全站每日 100 次，共用网络可能共用额度。", en: "The panel distinguishes connecting, reading sources, writing, failure and exhausted quota. Visitors can ask without signing in, within initial limits of five requests per IP and 100 site-wide daily. People on a shared network may share the same quota." },
      ]},
      { heading: { zh: "让文字在生成时出现", en: "Show text as it is generated" }, paragraphs: [
        { zh: "回答通过服务端连接 DeepSeek，随着模型返回的增量逐段显示。界面先呈现生成中的文字，完成后才把校验过的来源卡片和回答写入对话历史；连接中断或引用编号无效时，临时回答被移除，问题保留供重试。", en: "A server connection to DeepSeek delivers text incrementally. The interface shows the answer in progress, then commits it and the checked source cards to conversation history on completion. If the connection breaks or a citation ID is invalid, the temporary answer is removed and the question remains available for retry." },
        { zh: "正文隐藏了原来的 [2] 一类引用标识，来源卡片只显示文章标题。引用编号仍在服务端参与检查。回答也不再统一压到 200 字：介绍、解释和推荐类问题在资料充分时展开到约 300–600 字，简单问题保持简短。", en: "Inline markers such as [2] are hidden, and source cards show article titles. Citation IDs remain part of server checks. Answers are no longer uniformly capped at 200 Chinese characters: introductions, explanations and recommendations aim for about 300–600 when the sources support that depth, while simple questions stay short." },
      ]},
      { heading: { zh: "两次拒答暴露了资料入口的问题", en: "Two refusals exposed missing source paths" }, paragraphs: [
        { zh: "“介绍这个网站”属于本站问题，却被误判为资料不足。检索过滤了“介绍”“这个”“网站”等词，短问题又自动继承上一轮 Neptune 的关键词。修正后，网站概览直接读取首页配置和公开栏目说明，只有明确追问才借用上一轮关键词，并增强原话题标题的权重。", en: "“Introduce this website” was incorrectly refused. Retrieval filtered out common introduction and site terms, while short questions automatically inherited Neptune keywords from the previous turn. Site overview questions now read the homepage configuration and public navigation descriptions directly. Only explicit follow-ups reuse prior keywords, with stronger weighting for the original topic title." },
        { zh: "“介绍作者”则暴露了另一处遗漏：索引只有“关于我”的入口说明，没有完整自述。现在构建过程从实际页面提取简介、Agent 工作流与全栈能力说明，并识别作者、站长、博主等问法。资料不足仍会说明；扩充回答不等于补写未经公开的履历。", en: "“Introduce the author” revealed another omission: the index contained the About navigation summary but not the biography. The build now extracts the actual profile, Agent workflow and full-stack capability descriptions and recognises author and site-owner questions. Missing information is still acknowledged; a fuller answer does not invent an unpublished biography." },
      ]},
      { heading: { zh: "把动效集中在控制台", en: "Concentrate motion in the console" }, paragraphs: [
        { zh: "新版使用青紫光晕、7×7 全息信号矩阵、背景粒子与网格。待机光柱保持静止，鼠标指向的光柱及紧邻光柱才升起；选中光柱增加亮白顶面、发光描边与局部光晕，移开后平滑恢复，避免整片矩阵跟着运动。生成回答时，对话区出现缩小的波动矩阵。绘制限制为每秒 30 帧，页面隐藏或面板卸载时停止；关闭动效时保留静态画面和内容入口。", en: "The console combines cyan-and-violet glows, a 7×7 signal matrix, background particles and a grid. Idle columns stay still; only the pointed column and its immediate neighbors rise. A bright cap, illuminated edges and a local glow make selection visible, then settle smoothly on exit. A compact matrix pulses during answer generation. Rendering is capped at 30 frames per second and stops when hidden or unmounted. Disabling motion retains the static composition and content entry points." },
      ]},
      { heading: { zh: "让光柱成为内容入口", en: "Turn columns into content entry points" }, paragraphs: [
        { zh: "矩阵分为项目、文章、建站纪事、制作说明与随笔五类颜色区域，首版每类接入两条真实站内内容。悬停显示主题，点击展开标题、简介和建议问题；卡片可以打开原文，也可以换一条同主题内容。标题、简介和站内地址从公开知识资料生成，不交给模型临时编造。", en: "The matrix has five color regions: projects, writing, build logs, colophon notes and essays, each initially containing two real site entries. Hover shows the topic; clicking opens a title, summary and suggested question. A card can open its source or show another entry in the same topic. Titles, summaries and internal addresses are generated from public site sources rather than invented by the model." },
        { zh: "“问问 Field Agent”先把问题种子放进输入框，由访客确认发送。发现、切换或阅读内容卡片不调用模型，也不消耗提问次数。手机可以点光柱或使用主题按钮，键盘可以使用方向键与 Enter；关闭动效时这些入口仍然可用。", en: "Ask Field Agent fills a question seed into the composer for the visitor to send. Discovering, switching or reading cards makes no model request and consumes no quota. Phones can tap columns or topic buttons; keyboard users can use arrow keys and Enter. These entry points also work with motion disabled." },
      ]},
      { heading: { zh: "本地验证与上线状态", en: "Local verification and release status" }, paragraphs: [
        { zh: "此前本地检修已覆盖真实 DeepSeek 流式问答、网站概览、作者介绍、连续追问、引用隐藏，以及断线、截断和服务商错误处理。此次将版本整理为 V2.0.0，同步双语纪事、制作说明、十月文章收录清单及部署文档。类型检查、Cloudflare 构建和 Worker 打包预演通过。正式问答使用服务端模型密钥与 Durable Object 共享额度，实际部署与验收结果在版本说明中单独保存。", en: "Earlier local checks covered real DeepSeek streaming, site and author introductions, follow-ups, hidden citations, interrupted and truncated streams and provider errors. This revision prepares V2.0.0 with bilingual editorial notes, an October article inclusion manifest and deployment documentation. TypeScript, Cloudflare build and Worker packaging checks pass. Public chat uses a server-side model secret and shared Durable Object quotas. Deployment records and review results are maintained separately in the release notes." },
      ]},
    ],
  },
  {
    slug: "v1-3-1-radio-in-motion", date: "2026 · 09 · 28", eyebrow: "Build log / V1.3.1", tags: ["Field Radio", "Web Audio", "Playback"], minutes: 4,
    title: { zh: "让电台跟着音乐起伏", en: "Letting the radio move with the music" },
    summary: { zh: "电台加入上一首、随机下一首和三种播放模式；均衡器读取真实音频频谱，声波圈随低音扩散。", en: "Field Radio gains previous and random next controls plus three playback modes. Its equalizer follows the live spectrum, while sound rings expand with the bass." },
    sections: [
      { heading: { zh: "让声音驱动画面", en: "Let sound drive the visuals" }, paragraphs: [
        { zh: "此前均衡器柱和背景光环只按固定动画循环，与歌曲无关。现在播放器用 Web Audio API 分析本站直接播放的音频：频谱区间驱动均衡器柱高度，低频能量推动声波圈扩散。采样只在电台页面需要动效时开启，高频数据更新也不会触发 React 重绘。", en: "The equalizer and halo used to loop at fixed intervals, unrelated to the song. The player now analyses locally hosted audio through the Web Audio API: spectrum bands drive the bar heights, and low-frequency energy expands the sound rings. Sampling runs only when the radio page needs it, without high-rate React re-renders." },
        { zh: "暂停时柱形回落、声波停止扩散；系统开启减少动态效果时，两种动效保持静止。外部平台播放的曲目不经过本站播放器，因此不参与分析。", en: "When playback pauses, the bars settle and the rings stop. Both effects stay still when reduced motion is enabled. Tracks played on external platforms do not pass through this player, so they are not analysed." },
      ]},
      { heading: { zh: "切歌与循环有了明确语义", en: "Clearer track and repeat controls" }, paragraphs: [
        { zh: "控制顺序调整为上一首、播放/暂停、下一首。上一首回到实际听过的曲目；随机模式下下一首避开当前曲目，列表循环按曲库顺序前进。单曲循环在播放结束后重播当前歌曲，另外两种模式则按顺序或随机方式续播。播放模式保存在当前浏览器。", en: "The controls now read previous, play/pause, next. Previous returns to the last heard track; next avoids the current track in shuffle mode and follows library order in repeat-all mode. Repeat-one restarts the current song; the other modes continue sequentially or randomly. The selected mode is saved in the browser." },
        { zh: "黑胶唱片去掉了中心白点，让封面保持完整；电台页标语换成“让旋律，接住此刻”。", en: "The white spindle dot was removed so the artwork stays unobstructed, and the radio page received a new line: “A soundtrack for this moment.”" },
      ]},
    ],
  },
  {
    slug: "v1-3-guestbook-and-two-languages", date: "2026 · 09 · 28", eyebrow: "Build log / V1.3.0", tags: ["Guestbook", "Supabase", "i18n"], minutes: 5,
    title: { zh: "让访客留下话，也让文章说两种语言", en: "A guestbook and writing in two languages" },
    summary: { zh: "顶栏常驻 GitHub 登录，新增可匿名的留言板；访客痕迹移至留言页，写作索引与 23 篇正文补齐英文。", en: "GitHub sign-in stays in the header, the guestbook allows anonymous display, the visitor trace moves beside it, and all 23 articles gain English versions." },
    sections: [
      { heading: { zh: "留言先有身份边界", en: "A clear identity boundary for messages" }, paragraphs: [
        { zh: "留言必须先经 GitHub 和 Supabase 登录；匿名只影响公开署名，不等于绕开身份校验。服务端通过登录会话写入，数据库的行级安全策略限制只能为自己发言。公开列表只返回展示所需字段，不暴露内部用户 ID。", en: "Posting requires GitHub sign-in through Supabase. Anonymity changes only the public byline; it does not bypass identity checks. The server writes with the signed-in session, row-level security limits writes to the user's own identity, and the public feed omits internal user IDs." },
        { zh: "访客痕迹从首页移到留言页。它与真正的留言不同：信号仅保存在当前浏览器，不上传身份或浏览记录。两种表达放在同一区域，但清楚区分持久化留言和本地状态。", en: "Visitor Trace moved from the homepage to the guestbook. Unlike a message, a signal remains in the current browser and uploads neither identity nor browsing history. Both forms of expression now share a place without pretending they have the same persistence." },
      ]},
      { heading: { zh: "英文不只是导航按钮", en: "English means more than translated navigation" }, paragraphs: [
        { zh: "之前语言开关能改变导航和部分标题，却留下中文的访客痕迹与文章正文。现在写作列表从同一份文章元数据取英文标题、摘要和标签，每篇 MDX 另有英文正文；详情页随语言状态切换，并分别计算阅读时间。", en: "The language switch previously changed navigation and some headings but left Visitor Trace and article bodies in Chinese. The writing index now reads English titles, summaries and tags from article metadata; each MDX article has an English body, and detail pages switch with the same locale and estimate reading time separately." },
      ]},
      { heading: { zh: "发布前的边界", en: "Release boundaries" }, paragraphs: [
        { zh: "留言表结构与匿名署名规则记录在 Supabase 迁移文件中。浏览器可见的公开键和服务端密钥分开配置；.env.local、Cloudflare 本地凭据及 public/audio 不进入 Git。上线前还需要确认数据库迁移已执行。", en: "Supabase migrations record the guestbook schema and anonymous byline rule. Browser-safe keys and server secrets are configured separately; .env.local, local Cloudflare credentials and public/audio stay out of Git. The database migrations must be applied before the new feature can work online." },
      ]},
    ],
  },
  {
    slug: "v1-2-open-analytics", date: "2026 · 09 · 26", eyebrow: "Build log / V1.2.0", tags: ["Analytics", "Cloudflare", "Privacy"], minutes: 4,
    title: { zh: "把访问趋势公开，但不公开访客", en: "Showing traffic trends without exposing visitors" },
    summary: { zh: "新增独立统计页，读取 Cloudflare 的汇总趋势；只呈现聚合指标，不展示访客 IP 或个人明细。", en: "A standalone analytics page reads aggregated Cloudflare trends without publishing visitor IPs or personal records." },
    sections: [
      { heading: { zh: "真实数据与空状态", en: "Real data and honest empty states" }, paragraphs: [
        { zh: "统计页提供多种时间范围、趋势图和汇总卡片。数据由服务端使用只读令牌向 Cloudflare 查询，浏览器拿不到令牌；接口不可用时显示明确的无数据状态，而不是填上看似真实的示例数字。", en: "The dashboard offers time ranges, trends and summary cards. A server endpoint queries Cloudflare with a read-only token that never reaches the browser. When the source is unavailable, the UI shows an explicit empty state rather than realistic-looking invented numbers." },
      ]},
      { heading: { zh: "公开的边界", en: "The public boundary" }, paragraphs: [
        { zh: "导航为统计留了独立入口，不再塞进探索菜单。公开页面只展示全站聚合结果，不提供识别单个访客的明细；令牌权限维持只读。", en: "Analytics has its own main-navigation entry rather than another tile in Explore. The public page contains site-level aggregates, not individually identifying visitor details, and the token remains read-only." },
      ]},
    ],
  },
  {
    slug: "v1-1-field-school", date: "2026 · 09 · 26", eyebrow: "Build log / V1.1.0", tags: ["Learning", "Supabase", "Curriculum"], minutes: 4,
    title: { zh: "从课程列表到学习路径", en: "From a lesson list to learning paths" },
    summary: { zh: "重构 FIELD SCHOOL：Agent、全栈与产品课程从概念逐步深入，并保留考试、练习和 GitHub 登录。", en: "FIELD SCHOOL grew into progressive Agent, full-stack and product tracks, while keeping exercises, exams and GitHub sign-in." },
    sections: [
      { heading: { zh: "先解释，再深入", en: "Explain first, then go deeper" }, paragraphs: [
        { zh: "原有学习页内容不足以支撑连续学习。新版按主题组织课程，从基础概念走向实现与判断，并让练习、复习和考试成为同一条路径上的节点。", en: "The earlier learning page was too thin for sustained study. The new curriculum groups lessons by track, moving from foundational ideas to implementation and judgment, with practice, review and exams on the same path." },
      ]},
      { heading: { zh: "阅读开放，进度需要身份", en: "Open reading, signed-in progress" }, paragraphs: [
        { zh: "课程可以直接阅读；登录后，进度与正式考试结果通过 Supabase 保存并跨设备同步。身份来自 GitHub OAuth，前端不保存服务端密钥。", en: "Lessons remain readable without signing in. With GitHub OAuth, progress and formal exam results are stored through Supabase and can sync across devices; server secrets stay out of client code." },
      ]},
    ],
  },
  {
    slug: "making-the-hero-move", date: "2026 · 09 · 23", eyebrow: "Build log / 01", tags: ["Motion", "GSAP", "Typography"], minutes: 5,
    title: { zh: "让首屏动起来，同时站得住", en: "Making the hero move without falling apart" },
    summary: { zh: "给标语加上悬停起伏、给弹簧线和花朵加上循环动效，并在过程中修掉两处只在浏览器里现形的排版问题。", en: "Hover waves for the headline, looping motion for the spring and the flower, plus two layout bugs that only surfaced in a real browser." },
    sections: [
      { heading: { zh: "装饰要有一个坐标系", en: "Decorations need a coordinate system" }, paragraphs: [
        { zh: "弹簧线原本用百分比定位。文字按视口宽度缩放，百分比锚点按容器缩放，两者比例不同——换个窗口宽度，装饰就压到了别的字母上。现在行容器收缩到文字实际宽度，装饰锚在最后一个字母右侧，尺寸用 em 跟着字号走。", en: "The spring used to be positioned by percentage. The headline scales with the viewport while a percentage anchor scales with the container, so at another window width the decoration landed on a different letter. The line now shrink-wraps the word, the decoration anchors to the right of the last letter, and its size is set in em so it scales with the type." },
      ]},
      { heading: { zh: "裁切层会吃掉字母的尾巴", en: "The clip layer eats descenders" }, paragraphs: [
        { zh: "逐字入场靠「裁切层 + 内层字母」实现，裁切层要留一点底部空白。之前给的是 0.06em，对没有下伸部的字母够用，却把 y 和 g 的尾巴切平了。留白改成按字体的 descender 深度给（0.26em），入场位移同步加大，否则动画开始前会露出字头。", en: "The per-letter entrance relies on a clip layer plus an inner span, and the clip needs bottom padding. It had 0.06em — enough for letters without descenders, but it flattened the tails of y and g. Padding now follows the font's descender depth (0.26em) and the entrance offset grew with it, otherwise a sliver of the letter showed before the animation started." },
      ]},
      { heading: { zh: "循环动效不能挤进入场", en: "Looping motion cannot join the entrance" }, paragraphs: [
        { zh: "弹簧线的呼吸和花朵的自转都是无限循环，只能作为独立动画排在入场之后启动：一旦放进入场时间轴，时长被撑成无限，后面所有带负偏移的插入点都到不了，副题和按钮会静默失效。", en: "The spring's breathing and the flower's slow spin are infinite loops, so they run as separate tweens scheduled after the entrance. Inside the entrance timeline they would stretch its duration to infinity, and every later negative-offset insertion point would be unreachable — the subtitle and the button would silently never animate." },
      ]},
      { heading: { zh: "给交互留一道门", en: "A gate for interaction" }, paragraphs: [
        { zh: "入场还没播完时划过标语，悬停动画会把入场进度覆盖掉，字母冻在半空。现在入场完成前悬停不生效；悬停只动 scale、循环只动 rotate，两者互不打断。", en: "Hovering while the entrance is still running overwrites its progress and freezes letters mid-air. Hover is now ignored until the entrance completes, and hover only touches scale while the loop only touches rotate, so neither interrupts the other." },
      ]},
    ],
  },
  {
    slug: "the-radio-got-a-record", date: "2026 · 09 · 22", eyebrow: "Build log / 02", tags: ["Audio", "CSS", "Layout"], minutes: 5,
    title: { zh: "电台有了一张会转的唱片", en: "The radio got a spinning record" },
    summary: { zh: "给场域电台换上真实专辑封面和绕心旋转的黑胶，顺手修正悬浮歌词的停靠对齐；一次视觉改造背后是三个排版细节。", en: "The Field Radio gained real album covers and a centre-spun vinyl, and the floating lyrics learned to dock precisely. Behind the visual pass sit three layout details." },
    sections: [
      { heading: { zh: "封面是内容的一部分", en: "Covers are content" }, paragraphs: [
        { zh: "唱片不只是装饰：切换曲目时，封面帮助访客确认「现在放的是这首」。封面通过音乐商店的公开接口抓取，并且只相信歌手与歌名同时匹配的结果——商店里有不少同名的翻唱与伴奏，只看标题就会抓错。优先录音室版本，现场与伴奏只作兜底。", en: "The disc is not just decoration: when tracks change, the cover confirms what is playing. Covers are fetched through the music store's public API, trusting only results where artist and title both match — the store is full of same-named covers and instrumentals, and title-only matching grabs the wrong art. Studio versions come first; live takes are a fallback." },
        { zh: "有两首独立发行的曲目在商店里查不到，它们继续使用程序生成的占位图。占位不是权宜之计：它保证任何曲目都有确定的视觉，不会留白。", en: "Two independently released tracks cannot be found in the store and keep generated placeholder art. Placeholders are not a stopgap: they guarantee every track has a definite visual instead of a blank." },
      ]},
      { heading: { zh: "旋转要绕着圆心", en: "Rotation must spin around the centre" }, paragraphs: [
        { zh: "旋转由一段 CSS 关键帧完成，组件只切换 animation-play-state：播放时 running，暂停时 paused，再次播放从停住的角度继续，而不是回到起点。纹路、封面与中心孔画在同一层里绕圆心转，高光留在外面不随盘转动——像固定光源下的反光。", en: "The spin is one CSS keyframe; the component only toggles animation-play-state — running while playing, paused otherwise, resuming from the angle where it stopped rather than restarting. Grooves, cover and spindle hole sit in one layer rotating around the centre, while the highlight stays outside the rotation like a reflection under a fixed light." },
      ]},
      { heading: { zh: "img 是替换元素", en: "An img is a replaced element" }, paragraphs: [
        { zh: "第一版封面的位置偏在左上角。原因写在 CSS 规范里：img 这类替换元素不会被绝对定位的 inset 拉伸，只会保持固有尺寸、锚定在左上角；div 和 span 才会按 inset 铺满。修法是让普通容器负责定位，图片只负责填满容器。这类问题不实际跑起来看很难发现。", en: "The first version put the cover in the top-left corner. The reason is in the CSS spec: replaced elements such as img are not stretched by absolute-position insets — they keep their intrinsic size anchored top-left, while div and span do fill the insets. The fix hands positioning to an ordinary container and lets the image only fill it. This kind of bug is hard to see without running the page." },
      ]},
      { heading: { zh: "歌词的停靠点", en: "Where the lyrics dock" }, paragraphs: [
        { zh: "悬浮歌词默认停在播放器正上方。此前停靠点写死了 24px 的右边距，移动端会差出 8px；卡片首帧留在文档流里还会把容器撑高，量出来的位置必然不对。现在改为按播放器实测矩形对齐右缘，测量完成前先隐藏，量完再落位——跳位就看不见了。", en: "Floating lyrics dock right above the player. The docked spot used to hardcode a 24px right margin — 8px off on mobile — and the card's first frame stayed in the document flow, inflating the container and guaranteeing a wrong measurement. It now aligns to the player's measured rect, hides until measured, and lands before first paint, so the jump is invisible." },
      ]},
    ],
  },
  {
    slug: "a-page-each-for-images-and-sound", date: "2026 · 09 · 22", eyebrow: "Build log / 03", tags: ["Content", "Audio", "Navigation"], minutes: 4,
    title: { zh: "给画廊和电台各自一个页面", en: "A page each for the gallery and the radio" },
    summary: { zh: "图片档案与曲目清单变成独立页面并接入探索入口；电台补上跟随播放的歌词，音频统一压成 MP3。", en: "The image archive and the track list became standalone pages reachable from site-wide exploration, while the radio gained synced lyrics and audio was recompressed to MP3." },
    sections: [
      { heading: { zh: "常驻功能也需要地址", en: "A docked feature still needs an address" }, paragraphs: [
        { zh: "播放器和悬浮入口可以出现在每一页，但它们承载的内容需要自己的地址：能被收藏、被分享、被搜索收录。画廊与电台因此各自获得一个页面，并在全站探索菜单里留下入口。", en: "A player or a docked entrance can appear on every page, but the content it carries needs an address of its own: something to bookmark, share and index. The gallery and the radio therefore each got a page, with a permanent entrance in the site-wide explore menu." },
      ]},
      { heading: { zh: "音频只有两种选择", en: "Audio only had two choices" }, paragraphs: [
        { zh: "自托管音频要同时付出体积和版权的代价。无损文件先被压成约 190kbps 的 MP3，体积降到五分之一；没有本地文件的曲目只留一个跳转按钮，播放在授权平台上完成。这不是技术妥协，而是把边界写进界面。", en: "Self-hosted audio costs both size and rights. Lossless files were recompressed to roughly 190kbps MP3, cutting them to a fifth; tracks without a local file keep only a link button and play on the licensing platform. That is not a technical compromise — it writes the boundary into the interface." },
      ]},
      { heading: { zh: "歌词是时间的另一个刻度", en: "Lyrics are another scale of time" }, paragraphs: [
        { zh: "歌词不是装饰。当前行停在视野中央，点任意一行就能跳到那一段；没有歌词的曲目会明确说明，而不是留一片空白。歌词直接取自音频文件自身的标签，不必另外维护一份文本。", en: "Lyrics are not decoration. The current line stays centred, clicking any line jumps to that moment, and tracks without lyrics say so instead of leaving a blank. The lyrics come from the audio files' own tags, so no separate copy needs maintaining." },
      ]},
      { heading: { zh: "声音不该埋伏访客", en: "Sound should not ambush anyone" }, paragraphs: [
        { zh: "浏览器不允许无交互出声，这恰好和站点原有的规则一致。于是自动起播被收缩成一个更小的动作：借访客的第一次点击或按键随机播一首，面板不弹开，只在角落里显示曲目名；主动停过一次，之后就不再自动开始。", en: "Browsers refuse to play audio without interaction, which happens to match the rule the site already had. Autoplay was therefore reduced to something smaller: borrow the visitor's first click or keypress to start one random track, never force the panel open, only show the title in the corner, and stay quiet on later visits once it has been stopped." },
      ]},
    ],
  },
  {
    slug: "a-field-with-a-voice", date: "2026 · 09 · 21", eyebrow: "Build log / 04", tags: ["Audio", "Interaction", "Content"], minutes: 5,
    title: { zh: "NEXTFIELD 有了自己的声音", en: "NEXTFIELD found its voice" },
    summary: { zh: "加入 Field Radio、项目星图与开放实验室，把首页从内容目录改造成可以探索的数字场域。", en: "Field Radio, a project constellation and open experiments turned the homepage from a directory into a field to explore." },
    sections: [
      { heading: { zh: "为什么需要声音", en: "Why sound belonged here" }, paragraphs: [
        { zh: "页面已经有运动和空间，但它仍然像一组被排好的内容。声音提供了一条不依赖滚动的连续线索，让不同区域更像处于同一个场域。", en: "The site already had motion and depth, yet still felt like arranged content. Sound adds a continuous cue independent of scrolling and makes separate sections feel part of one field." },
        { zh: "Field Radio 不会在访客出手之前出声——浏览器本身也不允许没有交互的自动播放。访客第一次点击或按键之后，它会随机播一首；主动停过一次，之后就不再自动开始。", en: "Field Radio never makes a sound before the visitor acts — browsers do not allow audible autoplay without interaction anyway. After the first click or keypress it picks a random track, and once someone stops it explicitly it will not start on its own again." },
      ]},
      { heading: { zh: "从目录到探索", en: "From directory to exploration" }, paragraphs: [
        { zh: "项目星图把作品之间共享的能力和问题显示出来；开放实验室则允许访客直接触碰尚未成为产品的想法。首页因此不再只是通往其他页面的中转站。", en: "The project constellation reveals shared capabilities and questions, while the open lab lets visitors touch ideas before they become products. The homepage is no longer merely a transfer point." },
      ]},
      { heading: { zh: "留下的约束", en: "Constraints that stayed" }, paragraphs: [
        { zh: "声音必须可关闭，Canvas 必须有静态语义，探索入口不能隐藏核心导航。这三条约束比效果本身更重要。", en: "Sound must be dismissible, Canvas must retain static meaning, and exploratory entrances must never hide core navigation. Those constraints matter more than the effects themselves." },
      ]},
    ],
  },
  {
    slug: "depth-with-restraint", date: "2026 · 09 · 21", eyebrow: "Build log / 05", tags: ["GSAP", "3D", "A11y"], minutes: 4,
    title: { zh: "为平面增加一点深度", en: "Adding depth to a flat surface" },
    summary: { zh: "用克制的倾斜、Z 轴分层和指针反馈建立空间感，同时保留触屏与减少动态效果模式。", en: "Restrained tilt, Z-axis layers and pointer feedback create depth while preserving touch and reduced-motion experiences." },
    sections: [
      { heading: { zh: "深度不是更多动画", en: "Depth is not more animation" }, paragraphs: [{ zh: "空间感主要来自层级关系：标题、装饰、高光和交互表面处于不同深度。只有关键入口响应指针，其他内容保持稳定。", en: "Depth comes from hierarchy: titles, decoration, highlights and interactive surfaces occupy distinct layers. Only key entrances respond to the pointer; the rest stays stable." }]},
      { heading: { zh: "性能边界", en: "Performance boundaries" }, paragraphs: [{ zh: "交互只修改 transform 和 opacity，高频指针输入复用 tween，不在每一帧创建新动画。离开组件后立即清理监听器和上下文。", en: "Interactions change only transforms and opacity. High-frequency pointer input reuses tweens instead of creating new animation each frame, and every listener and context is cleaned up on exit." }]},
      { heading: { zh: "安静版本同样完整", en: "The quiet version is complete" }, paragraphs: [{ zh: "触屏设备不依赖悬浮状态；系统开启减少动态效果后，信息顺序、链接和视觉层级仍然完整。降级不是删除内容，而是删除非必要运动。", en: "Touch devices do not depend on hover. With reduced motion enabled, information order, links and visual hierarchy remain complete. The fallback removes unnecessary movement, not content." }]},
    ],
  },
  {
    slug: "rebuilding-the-home-story", date: "2026 · 09 · 20", eyebrow: "Build log / 06", tags: ["Design", "Index"], minutes: 5,
    title: { zh: "重做首页叙事", en: "Rewriting the homepage narrative" },
    summary: { zh: "用开放索引替代传统自我介绍，让作品、笔记与实验成为站点主角。", en: "An open index replaced the conventional biography and made work, notes and experiments the protagonists." },
    sections: [
      { heading: { zh: "旧首页的问题", en: "What the old homepage got wrong" }, paragraphs: [{ zh: "旧结构花了太多篇幅解释“我是谁”，却让真正能证明能力的项目和判断排在后面。两个连续 Hero 还重复承担了开场任务。", en: "The old structure spent too much space explaining who I was while pushing evidence and decisions down the page. Two consecutive hero sections also repeated the same opening job." }]},
      { heading: { zh: "让内容自己建立身份", en: "Let the content establish identity" }, paragraphs: [{ zh: "新版先给出方向，再让项目、笔记、实验和失败记录从不同角度证明它。访客不必按固定顺序阅读，也能迅速形成判断。", en: "The new version states a direction, then lets projects, notes, experiments and failure records prove it from different angles. Visitors can form a judgment without following one prescribed path." }]},
      { heading: { zh: "首页是一张地图", en: "The homepage is a map" }, paragraphs: [{ zh: "地图意味着任何节点都可以成为入口，也意味着新内容可以插入、移动或被重新编组，而不需要重写整段自我介绍。", en: "A map allows any node to become an entrance. New material can be inserted, moved or regrouped without rewriting an entire biography." }]},
    ],
  },
  {
    slug: "the-first-foundation", date: "2026 · 09 · 18", eyebrow: "Build log / 07", tags: ["Next.js", "System"], minutes: 4,
    title: { zh: "第一块地基", en: "The first foundation" },
    summary: { zh: "建立 Next.js、MDX、主题系统和页面转场，确定墨色、液态青与纸张色组成的视觉语言。", en: "Next.js, MDX, theming and page transitions formed the first foundation, alongside an ink, liquid-cyan and paper palette." },
    sections: [
      { heading: { zh: "先建立可以变化的结构", en: "Build for change first" }, paragraphs: [{ zh: "项目最初的目标不是完成一张首页，而是让以后新增文章、实验和项目时不必重新搭建导航、主题与内容管线。", en: "The first goal was not to finish a homepage, but to make future notes, experiments and projects possible without rebuilding navigation, themes or the content pipeline." }]},
      { heading: { zh: "内容与界面分开", en: "Separate content from interface" }, paragraphs: [{ zh: "MDX 负责长文，结构化数据负责项目与系统入口，组件只处理呈现和交互。这个边界让内容增长不会直接增加界面维护成本。", en: "MDX owns long-form writing, structured data owns projects and system entrances, and components handle presentation and interaction. This boundary keeps content growth from multiplying interface maintenance." }]},
      { heading: { zh: "视觉令牌先于页面", en: "Tokens before pages" }, paragraphs: [{ zh: "颜色、边框、纸张和墨色先被定义为令牌，再进入具体页面。深色模式因此不是另一套设计，而是同一套关系的重新映射。", en: "Color, borders, paper and ink were defined as tokens before entering pages. Dark mode therefore became a remapping of the same relationships rather than a separate design." }]},
    ],
  },
];

export const COLOPHON_ARTICLES: EditorialArticle[] = [
  {
    slug: "field-agent-sources-streaming-and-limits", date: "2026 · 10 · 08", eyebrow: "Colophon / Field Agent", tags: ["Retrieval", "Streaming", "Privacy", "Motion"], minutes: 6,
    title: { zh: "Field Agent 的资料、流式回答与使用边界", en: "Field Agent: sources, streaming and limits" },
    summary: { zh: "说明内容信号与问题种子如何连接公开资料、站内检索和流式回答，以及匿名额度、键盘入口与动效生命周期怎样协作。对应 V2.0.0。", en: "How content signals and question seeds connect public sources, retrieval and streamed answers, alongside anonymous quotas, keyboard access and animation lifecycles. This describes V2.0.0." },
    sections: [
      { heading: { zh: "资料来自实际内容", en: "Sources come from actual content" }, paragraphs: [
        { zh: "构建脚本读取站点配置、导航、公开页面简介、项目介绍、建站纪事、制作说明、随笔、失败记录及已跟踪的非草稿、非示例文章，生成站内知识索引。此次新增的十三篇双语文章通过明确收录清单进入索引，清单不自动扩展到其他本地文件。作者资料从“关于我”的简介、Agent 与全栈能力区域提取；课程目前收录公开入口说明。", en: "The build indexes site configuration, navigation, public page descriptions, project descriptions, build logs, colophon notes, essays, failure records and tracked articles that are neither drafts nor samples. An explicit inclusion manifest adds this release's thirteen bilingual articles without automatically admitting other local files. Author sources come from the About biography and Agent and full-stack capability sections; courses currently contribute their public entry descriptions." },
        { zh: "当前检索使用关键词与中文双字片段评分，结合标题、正文和语言筛选，并不是向量数据库检索。网站概览、作者介绍和本站技术栈有明确资料入口；留言、统计、电台、课程等站内功能优先匹配对应页面，再补充相关文章。一般问题最多提供五份资料，只有明确的追问才使用上轮问题关键词。", en: "Retrieval scores keywords and Chinese character pairs against titles, bodies and locale; it is not a vector database search. Site overview, author introduction and the site's stack have explicit source paths. Questions about messages, analytics, radio and lessons prioritize the matching page before related articles. General questions receive up to five sources, and only explicit follow-ups reuse the previous question's keywords." },
      ]},
      { heading: { zh: "增量文字与最终来源分开处理", en: "Handle incremental text and final sources separately" }, paragraphs: [
        { zh: "浏览器只请求本站 API，DeepSeek 密钥留在服务端。服务端解析模型的 SSE 文字增量，以 NDJSON 发送额度、文字、完成和错误事件。前端按增量更新临时回答，完成后再提交到历史；取消请求会中止上游连接。", en: "The browser calls only the site's API; the DeepSeek key stays on the server. The server parses the provider's SSE text deltas and sends quota, text, completion and error events as NDJSON. The client updates a temporary answer incrementally and commits it only after completion. Cancelling the request aborts the upstream connection." },
        { zh: "服务端检查引用编号是否属于本次检索资料，拒绝模型自行生成的链接，来源卡片的地址由检索结果提供。正文不显示编号，流式分块中的未完成标识也会隐藏。编号校验能约束来源范围，但不等于自动证明每一句事实都被资料支持。", en: "The server checks that citation IDs belong to the retrieved sources, rejects model-generated links and takes source-card addresses from retrieval results. The body hides citation IDs, including partial markers across streaming chunks. ID validation constrains the source set; it does not automatically prove that every sentence is supported." },
      ]},
      { heading: { zh: "免登录的额度与数据去向", en: "Anonymous quotas and data flow" }, paragraphs: [
        { zh: "每 IP 每日 15 次、全站每日 300 次，相邻请求至少间隔 5 秒，北京时间 00:00 重置；失败请求也计入额度。生产计数由 Cloudflare Durable Object 持久化事务保存，本地开发使用进程内计数。生产缺少对应绑定时拒绝提问。", en: "Limits are 15 requests per IP and 300 site-wide daily, at least five seconds apart, resetting at 00:00 UTC+8. Failed requests also count. Production counters use persistent Cloudflare Durable Object transactions; local development uses in-process counters. Production requests are rejected if the binding is missing." },
        { zh: "限流存储使用经 HMAC 处理的访客标识，不保存原始 IP；这不代表共用网络中的每个人都有独立额度。问题、最近三轮对话和相关站内资料会发送至 DeepSeek。对话目前只保留在页面会话中，没有写入浏览器持久存储或本站数据库。", en: "Quota storage uses an HMAC-derived visitor identifier rather than retaining the raw IP. This does not give each person on a shared network a separate allowance. Questions, the last three conversation rounds and relevant site excerpts are sent to DeepSeek. Conversation state currently lives only in the page session, not persistent browser storage or the site's database." },
      ]},
      { heading: { zh: "界面、状态与动效的生命周期", en: "Interface, state and animation lifecycles" }, paragraphs: [
        { zh: "全站会话与面板显示分开管理，因此关闭助手或站内导航不会清空对话。桌面面板不锁定背景页面，手机全屏面板管理焦点与页面滚动；两种布局都固定输入区，让长回答在内容区内滚动。", en: "The global session is separate from panel visibility, so closing it or navigating internally does not clear the conversation. The desktop panel leaves the background page available; the full-screen mobile dialog manages focus and page scrolling. Both keep the composer fixed while long answers scroll within the conversation." },
        { zh: "GSAP 负责面板内容入场，CSS 负责光晕与卡片反馈，Canvas 绘制等距投影的信号矩阵。指针命中前方可见柱面，升起过程中保持选择稳定；局部影响有明确边界，待机不加入整片起伏。矩阵每秒最多 30 帧，页面隐藏、面板卸载时停止；关闭动效时静态矩阵仍可点击。此说明对应 V2.0.0 的实现。", en: "GSAP handles entrances, CSS handles glows and card feedback, and Canvas draws the isometric matrix. Pointer picking targets visible frontmost column faces and keeps selection stable as a column rises. Hover has a finite local boundary, and idle columns do not wave. Rendering is capped at 30 frames per second and stops when hidden or unmounted. The static matrix remains clickable with motion off. This describes the V2.0.0 implementation." },
      ]},
      { heading: { zh: "发现内容与发送问题分开", en: "Separate discovery from sending a question" }, paragraphs: [
        { zh: "构建时从知识索引生成十条轻量双语内容信号，按五个主题映射到四十九根光柱；客户端只载入标题、简介、地址和问题种子，不需要带上完整问答语料。来源缺失时构建会报错，避免卡片悄悄指向不存在的内容。", en: "At build time, the knowledge index produces ten lightweight bilingual content signals mapped by five topics across forty-nine columns. The client loads titles, summaries, addresses and question seeds without the full question-answer corpus. Missing sources fail generation so cards cannot silently point to absent content." },
        { zh: "点击光柱或主题按钮只改变本地卡片状态；“换一条”轮换同主题内容，“打开原文”使用实际站内地址。“问问 Field Agent”只预填问题，访客点击发送才进入服务端检索、模型调用与额度流程。额度用完时仍可以发现和阅读内容；键盘使用方向键选择光柱，Enter 打开卡片，关闭卡片后焦点返回矩阵。", en: "Column and topic clicks only change local card state. Another rotates within the topic, and Open source uses the actual site address. Ask Field Agent only fills the composer; sending starts server retrieval, model generation and quota handling. Discovery and reading still work when the quota is exhausted. Arrow keys select columns, Enter opens a card, and closing it returns focus to the matrix." },
      ]},
    ],
  },
  {
    slug: "data-identity-and-delivery", date: "2026 · 09 · 28", eyebrow: "Colophon / V1.3.0", tags: ["Architecture", "Privacy", "Cloudflare"], minutes: 5,
    title: { zh: "公开内容与私人状态如何共存", en: "How public content and private state coexist" },
    summary: { zh: "从 Cloudflare Worker、Supabase 登录到公开统计与留言板，解释动态能力的边界和密钥去向。", en: "Cloudflare Workers, Supabase sign-in, public analytics and the guestbook: where dynamic features end and secrets belong." },
    sections: [
      { heading: { zh: "静态内容，动态服务", en: "Static content, dynamic services" }, paragraphs: [
        { zh: "文章、项目和课程内容由 Next.js 构建为可直接交付的页面；登录会话、学习进度、考试与留言需要请求时运行的 API。Cloudflare Worker 承担这些服务端路由，因而本站不是纯静态站。", en: "Next.js builds articles, projects and lessons into pages that can be served directly. Sign-in sessions, learning progress, exams and messages require request-time APIs. A Cloudflare Worker runs those server routes, so the site is no longer purely static." },
      ]},
      { heading: { zh: "公开键与私密令牌", en: "Public keys and private tokens" }, paragraphs: [
        { zh: "Supabase 的公开项目地址与匿名键可供浏览器使用，但不能取代行级安全策略；Cloudflare 统计的只读令牌与任何服务端密钥只能留在服务端环境。仓库忽略 .env.local、.dev.vars 与本地音频目录，发布前还需核对实际部署环境的变量。", en: "The Supabase project URL and publishable key may be used by the browser, but they do not replace row-level security. The read-only Cloudflare analytics token and any server secrets belong only in server-side configuration. The repository ignores .env.local, .dev.vars and local audio; deployment variables still need checking before release." },
      ]},
      { heading: { zh: "匿名是一种展示选择", en: "Anonymity is a display choice" }, paragraphs: [
        { zh: "留言者必须登录，才能提交内容；选择匿名后，公开记录显示匿名访客而不是 GitHub 昵称。访客痕迹与它不同，只写当前浏览器的本地存储。两者的说明都应把保存位置说清楚。", en: "A visitor must sign in to submit a message. Choosing anonymity replaces the GitHub byline in the public record. Visitor Trace is different: it writes only to local storage in that browser. Both interfaces should explain where their data lives." },
      ]},
    ],
  },
  {
    slug: "decoration-follows-content", date: "2026 · 09", eyebrow: "Colophon / 01", tags: ["Typography", "Motion"], minutes: 4,
    title: { zh: "装饰跟着内容走", en: "Decoration follows content" },
    summary: { zh: "花朵、弹簧线、唱片这些装饰都不能自己决定位置：它们的位置必须由文字、尺寸和状态推导出来。", en: "Flowers, springs and records never decide their own position: it is derived from the type, the size and the state they belong to." },
    sections: [
      { heading: { zh: "位置是一种关系", en: "Position is a relationship" }, paragraphs: [
        { zh: "装饰最容易坏的地方是「坐标来自哪里」。用容器百分比去猜词尾，等于假设装饰和文字按同一个比例缩放——一旦文字随视口缩放，这个假设就不成立。装饰的位置应当由它要陪伴的内容推导：行容器收缩到词宽，装饰锚在词尾，尺寸用 em 跟随字号。", en: "The fragile part of a decoration is where its coordinates come from. Guessing the end of a word with container percentages assumes the decoration and the type scale by the same ratio — false as soon as the type scales with the viewport. A decoration's position should be derived from the content it accompanies: shrink-wrap the line, anchor to the word end, size in em." },
      ]},
      { heading: { zh: "尺寸用 em，不用 rem", en: "Size in em, not rem" }, paragraphs: [
        { zh: "只要装饰和文字有关，它的尺寸就该用 em。改用 rem 意味着某个断点之后装饰不再跟着字号变化，同一个组件在小屏和大屏上会长成两种关系。", en: "Whenever a decoration relates to type, its size belongs in em. Switching to rem means that past some breakpoint the decoration stops tracking the type, and one component grows into two different relationships on small and large screens." },
      ]},
      { heading: { zh: "装饰也要能被替换", en: "Decoration must be replaceable" }, paragraphs: [
        { zh: "封面、占位图和配色都放在确定的位置，替换它们不需要改组件。装饰可以有默认值，但默认值必须诚实——查不到封面的曲目就明确使用占位图，而不是假装那是一张专辑封面。", en: "Covers, placeholders and palettes live in fixed places and can be replaced without touching components. Decorations may have defaults, but defaults must be honest — a track with no artwork explicitly uses a placeholder instead of pretending to have a real cover." },
      ]},
    ],
  },
  {
    slug: "how-the-record-is-made", date: "2026 · 09", eyebrow: "Colophon / 02", tags: ["Audio", "Craft"], minutes: 4,
    title: { zh: "一张唱片的制作说明", en: "How the record is made" },
    summary: { zh: "从封面来源、旋转实现到安静模式，说明电台唱片背后的取材规则与技术约束。", en: "From cover sourcing and the spin implementation to quiet modes, the rules and constraints behind the radio's vinyl." },
    sections: [
      { heading: { zh: "封面的来源与替换", en: "Where covers come from" }, paragraphs: [
        { zh: "封面图存放在 public/covers/，来自音乐商店的公开接口，只保存商店返回的标准缩略图。想换成自己的图，用同名文件覆盖即可，不需要改任何代码；商店里查不到的独立发行曲目使用程序生成的占位图，保证每首歌都有确定的视觉。", en: "Cover images live in public/covers/, fetched from the music store's public API and saved at the store's standard thumbnail size. To use your own art, replace the file under the same name — no code changes needed. Tracks the store cannot find keep generated placeholder art, so every song has a definite visual." },
      ]},
      { heading: { zh: "旋转的实现与边界", en: "How the spin is built, and where it stops" }, paragraphs: [
        { zh: "旋转由一段 CSS 关键帧完成，组件只切换 animation-play-state。这样暂停不会丢失角度，再次播放从原处继续；系统开启减少动态效果时，整个动画可以直接停用而不影响布局。唱片对读屏是装饰，曲目名始终以文字形式存在于旁边。", en: "The spin is a single CSS keyframe; the component only toggles animation-play-state. Pausing keeps the angle, replay resumes from it, and when the system asks for reduced motion the whole animation switches off without affecting layout. The disc is decoration to screen readers — the track title always exists as text beside it." },
      ]},
      { heading: { zh: "组件的边界", en: "Boundaries of the component" }, paragraphs: [
        { zh: "唱片组件不知道播放器的存在：它只接收封面、标题和播放状态。尺寸由使用方决定——展开的面板里是大盘，收起的入口里是小事。同一份结构在两个尺寸下都成立，是因为所有比例都用百分比声明，没有一处写死像素。", en: "The disc component knows nothing about the player: it receives a cover, a title and a playing state. Size belongs to the caller — a large disc in the open panel, a small one in the collapsed entrance. One structure works at both sizes because every proportion is declared in percentages, with no hardcoded pixels." },
      ]},
    ],
  },
  {
    slug: "why-nextfield", date: "2026 · 09", eyebrow: "Colophon / 03", tags: ["Identity", "Direction"], minutes: 4,
    title: { zh: "为什么叫 NEXTFIELD", en: "Why NEXTFIELD" },
    summary: { zh: "名字不是包装，而是内容结构和更新方式的约束。", en: "The name is not packaging; it constrains the content structure and how the site evolves." },
    sections: [
      { heading: { zh: "下一次尝试", en: "The next attempt" }, paragraphs: [{ zh: "NEXT 指向尚未完成的下一次实验。它允许项目有版本、观点会变化，也允许失败成为公开内容的一部分。", en: "NEXT points to the next unfinished experiment. Projects can have versions, opinions can change, and failure can remain part of the public record." }]},
      { heading: { zh: "一块场域", en: "A field" }, paragraphs: [{ zh: "FIELD 不是作品陈列柜，而是项目、笔记、声音、工具和访客痕迹共同存在的空间。不同完成度的内容都能找到位置。", en: "FIELD is not a showcase cabinet but a space where projects, notes, sound, tools and visitor traces coexist. Work at different levels of completion can all belong." }]},
      { heading: { zh: "名字如何影响界面", en: "How the name shapes the interface" }, paragraphs: [{ zh: "导航被设计成地图，首页允许多入口，系统页公开证据，建站纪事保留变化。名字最终变成了信息架构。", en: "Navigation behaves like a map, the homepage supports multiple entrances, systems publish evidence and the build log preserves change. The name eventually became information architecture." }]},
    ],
  },
  {
    slug: "content-before-decoration", date: "2026 · 09", eyebrow: "Colophon / 04", tags: ["Content", "Design"], minutes: 4,
    title: { zh: "内容先于装饰", en: "Content before decoration" },
    summary: { zh: "每一种视觉效果都必须帮助理解、建立层次或提供反馈。", en: "Every visual effect must support understanding, hierarchy or feedback." },
    sections: [
      { heading: { zh: "先删除效果", en: "Remove the effect first" }, paragraphs: [{ zh: "设计一个区域时，先确认没有动画它是否仍然成立。标题、说明、入口和状态必须先组成清楚的静态页面。", en: "When designing a section, first ask whether it still works without animation. Titles, explanations, entrances and states must form a clear static page before anything moves." }]},
      { heading: { zh: "运动承担什么职责", en: "What motion is responsible for" }, paragraphs: [{ zh: "转场解释页面切换，倾斜反馈可交互表面，滚动入场提示阅读顺序。无法说清职责的动效不会进入最终版本。", en: "Transitions explain navigation, tilt signals an interactive surface, and scroll reveals suggest reading order. Motion without a clear job does not enter the final version." }]},
      { heading: { zh: "装饰也有预算", en: "Decoration has a budget" }, paragraphs: [{ zh: "同一屏不会让所有卡片同时运动。视觉焦点数量、WebGL 上下文和持续动画都会被限制，确保内容始终先被看到。", en: "Not every card moves at once. Visual focal points, WebGL contexts and continuous animation are all limited so content is always seen first." }]},
    ],
  },
  {
    slug: "motion-with-an-exit", date: "2026 · 09", eyebrow: "Colophon / 05", tags: ["Motion", "A11y"], minutes: 4,
    title: { zh: "动态效果必须有出口", en: "Motion with an exit" },
    summary: { zh: "持续动画可以关闭，复杂交互可以降级，核心内容不能依赖运动存在。", en: "Continuous animation can be stopped, complex interaction can fall back, and core content never depends on movement." },
    sections: [
      { heading: { zh: "退出不是例外", en: "Exit is not an exception" }, paragraphs: [{ zh: "全站提供动态效果开关，并尊重系统的 reduced-motion 偏好。声音不在访客出手之前响起：第一次交互后随机开始，随时可以暂停，停过之后不会再自动开始。", en: "The site provides a motion control and respects the system reduced-motion preference. Sound does not play before the visitor acts: it starts randomly after the first interaction, can be paused at any time, and stays silent on later visits once it has been stopped." }]},
      { heading: { zh: "降级后的完整性", en: "Complete after fallback" }, paragraphs: [{ zh: "Canvas、粒子和 3D 反馈不可用时，访客仍能读取同样的信息、访问同样的链接、完成同样的任务。", en: "When Canvas, particles or 3D feedback are unavailable, visitors can still read the same information, follow the same links and complete the same tasks." }]},
      { heading: { zh: "控制权属于访客", en: "Control belongs to the visitor" }, paragraphs: [{ zh: "网站可以表达个性，但不应该迫使任何人等待演出结束。交互增强体验，控制权始终留在用户手中。", en: "A site may express personality, but it should never force anyone to wait for a performance. Interaction enhances the experience while control stays with the visitor." }]},
    ],
  },
  {
    slug: "the-system-underneath", date: "2026 · 09", eyebrow: "Colophon / 06", tags: ["Stack", "Delivery"], minutes: 5,
    title: { zh: "界面下面的系统", en: "The system beneath the interface" },
    summary: { zh: "从内容管线、设计令牌到 Cloudflare 交付，说明这个场域如何保持可维护。", en: "From content pipelines and design tokens to Cloudflare delivery, this explains how the field stays maintainable." },
    sections: [
      { heading: { zh: "本站实际使用的技术", en: "Technology used on this site" }, paragraphs: [{ zh: "NEXTFIELD 当前使用 Next.js、React 和 TypeScript 构建页面与服务端路由，Tailwind CSS 管理样式，MDX 承载长文；GSAP、Framer Motion、OGL 与 Three.js 用于不同的交互动效。网站通过 OpenNext 部署到 Cloudflare Workers，部分登录与数据功能接入 Supabase，Field Agent 使用 DeepSeek API 生成站内回答，并由 Cloudflare Durable Object 管理共享提问额度。这份清单描述本站当前实现，不等同于作者个人技术能力展示中的所有工具。", en: "NEXTFIELD currently uses Next.js, React and TypeScript for pages and server routes, Tailwind CSS for styling, and MDX for long-form writing. GSAP, Framer Motion, OGL and Three.js power different interactions. OpenNext deploys the site to Cloudflare Workers. Some sign-in and data features use Supabase; Field Agent uses the DeepSeek API for site answers and a Cloudflare Durable Object for shared question limits. This describes the site's current implementation, rather than every tool shown in the author's skills profile." }]},
      { heading: { zh: "内容管线", en: "Content pipeline" }, paragraphs: [{ zh: "长文使用 MDX，项目、证据模块、图片档案、曲目清单与歌词使用结构化数据，页面组件不持有重复内容。新增文章、图片或曲目时，导航、列表和 sitemap 都从同一来源生成。", en: "Long-form writing uses MDX, while projects, evidence modules, the image archive, the track list and lyrics use structured data. Page components do not own duplicate content, so navigation, indexes and the sitemap all derive from the same sources." }]},
      { heading: { zh: "界面系统", en: "Interface system" }, paragraphs: [{ zh: "Next.js 和 React 负责结构，TypeScript 约束数据边界，Tailwind CSS 与设计令牌统一主题，GSAP 只处理需要明确编排的运动；声音交给浏览器原生 audio，不做任何绕过授权限制的处理。", en: "Next.js and React provide structure, TypeScript constrains data boundaries, Tailwind CSS and tokens unify themes, and GSAP handles only motion that needs explicit choreography. Sound uses the browser's native audio element, with nothing that would bypass licensing limits." }]},
      { heading: { zh: "混合交付", en: "Hybrid delivery" }, paragraphs: [{ zh: "文章等核心内容在构建时预渲染，登录、考试、留言与访问统计由 Cloudflare Worker 的服务端路由处理。构建过程验证类型、路由和内容入口；上线后仍需分别检查外部 API、密钥与数据库状态。", en: "Core content such as articles is prerendered at build time, while sign-in, exams, messages and analytics use server routes on a Cloudflare Worker. The build validates types, routes and content entrances; external APIs, secrets and database state still need separate checks after deployment." }]},
    ],
  },
];

// 改法：把每条 title / summary / sections 里的 zh 与 en 换成自己的文字。
//   · slug 不要改 —— 它决定网址 /essays/<slug>，改了旧链接会 404
//   · 想加一篇：照抄一条，换 slug 与文案；想删一篇：整条删掉
//   · eyebrow 惯例：最新一篇是 01，往下递增

/*
格式示例
{
    slug: "a-quiet-kind-of-progress", date: "2026 · 09 · 20", eyebrow: "Essay / 04", tags: ["待写"], minutes: 1,
    title: { zh: "随笔占位 · 04", en: "Placeholder · 04" },
    summary: { zh: "这里留给还没写下的随笔。替换标题、摘要与正文即可，网址不变。", en: "Reserved for a note not yet written. Replace the title, summary and body — the URL stays the same." },
    sections: [
      { heading: { zh: "待写", en: "To be written" }, paragraphs: [
        { zh: "这是占位段落。把这一段换成你的内容：一个段落一个对象，英文版写在 en 字段里；再加一节就往 sections 数组里补一条。", en: "Placeholder paragraph. Replace it with your own text: one object per paragraph, English in the en field; add another section by appending to the sections array." },
      ]},
    ],
  },
*/

export const ESSAY_ARTICLES: EditorialArticle[] = [
{
  "slug": "after-closing-the-laptop",
  "date": "2026 · 10 · 08",
  "eyebrow": "Essay / October",
  "tags": [
    "日常",
    "注意力",
    "边界"
  ],
  "minutes": 2,
  "title": {
    "zh": "合上电脑之后",
    "en": "After Closing the Laptop"
  },
  "summary": {
    "zh": "工作可以暂时结束，脑子里的窗口却不一定一起关闭。给一天安排一个小小的收尾，让未完成的事留在纸上，让自己回到眼前。",
    "en": "Work can pause before the windows in the mind do. A small ending leaves unfinished tasks on paper and brings attention back to the room."
  },
  "sections": [
    {
      "heading": {
        "zh": "屏幕暗下来",
        "en": "The screen goes dark"
      },
      "paragraphs": [
        {
          "zh": "合上电脑之后，房间里的声音会慢慢变得清楚。窗外的车，桌上的杯子，椅子挪动时的一点响动，刚才都在那里，只是没有进入注意力。屏幕暗下来，好像也替这些普通的东西腾出了一点位置。",
          "en": "After closing the laptop, the room becomes audible again: traffic outside, a cup on the desk, the chair moving. They were there all along, outside attention. The dark screen gives ordinary things a little more room."
        },
        {
          "zh": "可脑子里的窗口不总会一起关闭。还有一段文字没有改好，一个问题没有弄明白，一个计划刚刚想到新的做法。人已经离开桌子，注意力却还留在另一处。",
          "en": "The windows in the mind do not always close with it. A paragraph needs another edit, a question remains unresolved, a plan has just acquired a new possibility. The body leaves the desk while attention stays behind."
        }
      ]
    },
    {
      "heading": {
        "zh": "把下一步写下来",
        "en": "Write down the next step"
      },
      "paragraphs": [
        {
          "zh": "有时候，我会先把下一步写在纸上。不是一张完整的任务清单，只留一句具体的话：明天先看哪个文件，先改哪一段，或者先确认什么。把它从脑子里挪出来之后，事情没有完成，却不必反复提醒自己别忘记。",
          "en": "Sometimes I write one next step on paper. Not a complete task list, just a concrete sentence: which file to open, which paragraph to revise or what to confirm first. The work remains unfinished, but it no longer requires repeated mental reminders."
        },
        {
          "zh": "这样的收尾很小，也不保证明天一定顺利。但它给今天划了一条线：我知道事情停在哪里，也知道回来时从哪里开始。休息因此不再像是突然丢下了一切。",
          "en": "It is a small ending and no guarantee of a smooth tomorrow. It marks where today stops and where returning can begin. Rest feels less like abandoning everything without a trace."
        }
      ]
    },
    {
      "heading": {
        "zh": "回到眼前",
        "en": "Return to what is here"
      },
      "paragraphs": [
        {
          "zh": "接下来可以倒一杯水，走到窗边，或者什么也不做。生活里这些没有进度条的时间，不需要另外找一个用途才能成立。看见天色变暗，听见一首歌结束，也是在认真过完一天。",
          "en": "Then there can be water, a moment by the window or no activity at all. Time without a progress bar does not need an additional purpose. Noticing the evening darken or a song end is also a way to live the day attentively."
        },
        {
          "zh": "电脑明天还会打开，事情也会继续。今晚先让它们留在那张纸上，让自己回到这个安静的房间。能够重新开始的人，也应该有一段不必继续的时间。",
          "en": "The laptop will open tomorrow and the work will continue. Tonight it can remain on that page while attention returns to a quiet room. A person who can begin again should also have time when continuing is unnecessary."
        }
      ]
    }
  ]
},
{
  "slug": "an-unfinished-afternoon",
  "date": "2026 · 10 · 05",
  "eyebrow": "Essay / October",
  "tags": [
    "时间",
    "日常",
    "未完成"
  ],
  "minutes": 2,
  "title": {
    "zh": "一个没有完成的下午",
    "en": "An Unfinished Afternoon"
  },
  "summary": {
    "zh": "有些下午没有交出计划中的成果，却留下了更清楚的问题。把没有完成与没有发生分开，也许能对自己的时间温和一点。",
    "en": "Some afternoons leave a clearer question instead of the planned result. Distinguishing unfinished work from empty time can make us gentler with the day."
  },
  "sections": [
    {
      "heading": {
        "zh": "计划里的下午",
        "en": "The afternoon in the plan"
      },
      "paragraphs": [
        {
          "zh": "开始之前，一个下午总显得很完整。几小时可以读完几页，写好一段，再处理一些零碎的事情。把这些安排写下来时，它们之间没有缝隙，好像只要按顺序去做，时间就会自然变成成果。",
          "en": "Before it begins, an afternoon looks complete. A few hours can hold some reading, a paragraph and several small tasks. On paper there are no gaps, as though following the sequence will turn time naturally into results."
        },
        {
          "zh": "实际发生的下午却常常不同。一个句子卡住，一处细节需要重新确认，原本想快速跳过的问题，偏偏让人多看了很久。等到窗外的光变了，清单上的勾仍然不多。",
          "en": "The actual afternoon often differs. A sentence resists, a detail needs checking, a supposedly simple question asks for another look. By the time the light changes, few boxes have been ticked."
        }
      ]
    },
    {
      "heading": {
        "zh": "没有完成的部分",
        "en": "What remains unfinished"
      },
      "paragraphs": [
        {
          "zh": "我会下意识地把这样的时间称为浪费。后来又觉得，这个判断有点太快。有时正是因为没有顺利写下去，才发现自己对一个概念并不清楚；因为一个方案没做完，才看见它原来依赖那么多还没确定的条件。",
          "en": "I am quick to call that time wasted. The judgment may be too quick. Difficulty writing can reveal an unclear concept; an unfinished approach can expose the unresolved assumptions supporting it."
        },
        {
          "zh": "这些发现不容易展示，也没有一个漂亮的结束。但问题变得具体了，下一次回来时，至少不必从同一片模糊里重新出发。一个下午没有完成计划，也可能已经改变了计划。",
          "en": "Those discoveries are hard to display and provide no neat ending. Yet the question becomes more specific. Returning need not begin in the same fog. An afternoon that did not complete the plan may have changed it."
        }
      ]
    },
    {
      "heading": {
        "zh": "留下一点余地",
        "en": "Leave some room"
      },
      "paragraphs": [
        {
          "zh": "当然，也有真的没有做什么的时候。发呆，反复看消息，或者只是累了。我不想替每一分钟都找到一个成长理由。人可以有状态不好的下午，而不必把它包装成另一种收获。",
          "en": "Some afternoons really contain little work: drifting, repeatedly checking messages or simply feeling tired. Every minute does not need a story about growth. A difficult day can remain difficult without being repackaged as a benefit."
        },
        {
          "zh": "也许可以做的是更准确地说出这一天：有的事情没做完，有的地方想明白了一点，还有一些时间只是过去了。然后关掉清单，准备晚饭。明天还有新的下午，不必让今天替它们全部交出答案。",
          "en": "Perhaps the task is to describe the day accurately: unfinished things, a little understanding and some time that simply passed. Then close the list and think about dinner. Tomorrow has another afternoon; today need not answer for all of them."
        }
      ]
    }
  ]
},
{
  "slug": "an-evening-page",
  "date": "2026 · 10 · 02",
  "eyebrow": "Essay / October",
  "tags": [
    "写作",
    "日常",
    "慢下来"
  ],
  "minutes": 2,
  "title": {
    "zh": "把傍晚留给一页纸",
    "en": "An Evening Page"
  },
  "summary": {
    "zh": "不用写出一篇文章，也不用马上得到结论。把一天里还没有安顿好的念头写下来，一页纸就可以成为短暂的停靠。",
    "en": "An evening page need not become an article or reach a conclusion. It can give the day’s unsettled thoughts somewhere to rest."
  },
  "sections": [
    {
      "heading": {
        "zh": "不急着写成文章",
        "en": "No need to make an article"
      },
      "paragraphs": [
        {
          "zh": "有时傍晚坐下来，想写一点东西，却又不知道标题应该是什么。白天发生的事情并不特别，几个念头也还没有形成清楚的关系。若一开始就要求它们成为文章，往往连第一句都很难留下。",
          "en": "Sometimes I sit down in the evening wanting to write without knowing a title. Nothing dramatic happened; a few thoughts have not found their relationship. Requiring an article at once can prevent even the first sentence."
        },
        {
          "zh": "所以先写一页纸。可以从一件很小的事开始：今天听见的一句话，路边多出来的一盆植物，或者某个一直没想明白的问题。它们不用立刻证明自己的价值，也不用排列成完整的论点。",
          "en": "So begin with a page. A sentence heard, a new plant beside a path or an unresolved question is enough. None needs to prove its value immediately or form a complete argument."
        }
      ]
    },
    {
      "heading": {
        "zh": "写下来以后",
        "en": "After putting it down"
      },
      "paragraphs": [
        {
          "zh": "写下来之后，念头会和刚才有一点不同。留在脑子里时，它们总是一起出现；变成几行字之后，哪些是事实，哪些只是担心，哪些还需要继续确认，反而更容易分开。",
          "en": "Thoughts change a little on the page. In the mind they arrive together. In a few lines, facts, worries and things needing confirmation become easier to separate."
        },
        {
          "zh": "纸也不会催着我立刻回答。写到一半停下来，第二天再看，或者一直没有继续，都可以。不是每段文字都要被发布，私人笔记可以保留它尚未整理好的样子。",
          "en": "The page does not demand an immediate answer. Stopping halfway, returning tomorrow or never continuing are all possible. Not every passage needs publication; a private note can remain unarranged."
        }
      ]
    },
    {
      "heading": {
        "zh": "傍晚慢下来",
        "en": "The evening slows"
      },
      "paragraphs": [
        {
          "zh": "写完抬头时，窗外通常又暗了一些。一页纸没有让生活变得井然有序，但它替那些反复出现的念头找到了一个位置。今晚不用继续把它们带到每一件事里。",
          "en": "Looking up, the window is often darker. One page has not organised life, but it has given recurring thoughts a place. They need not accompany every remaining activity tonight."
        },
        {
          "zh": "也许写作最轻的一种用处，就是这样：不急着说服别人，也不急着解释自己，只把眼前这一小段时间认真留住。明天再翻开时，那里会有一行字告诉我，曾经怎样度过这个傍晚。",
          "en": "Perhaps this is writing at its lightest: neither persuading others nor explaining oneself, simply keeping a small stretch of time. Tomorrow a line can recall how this evening was lived."
        }
      ]
    }
  ]
},
{
  slug: "the-breeze-tonight",     
  date: "2026 · 09 · 20",
  eyebrow: "Essay / 01",              
  tags: ["大学生活", "慢下来", "成长"],
  minutes: 2,                         
  title: { zh: "慢慢走，也没关系", en: "It's Okay to Walk Slowly" },
  summary: {
    zh: "傍晚下课后走回宿舍，看着操场上快慢不一的身影，忽然明白：每个人都有自己的节奏，偶尔慢一点也没关系。",
    en: "Walking back to the dorm after an evening class, watching runners move at different paces, I realized everyone has their own rhythm — and it's okay to slow down sometimes."
  },
  sections: [
    { heading: { zh: "傍晚的路", en: "An Evening Walk" }, paragraphs: [
      { zh: "傍晚下课，我一个人走在回宿舍的路上。", en: "After an evening class, I walked back to the dorm alone." },
      { zh: "天还没有完全暗下来，夕阳从教学楼之间斜斜地落下来，把路边的树影拉得很长。有人骑着自行车匆匆经过，有人和朋友讨论晚上吃什么，还有人戴着耳机，低着头慢慢走。这样的场景每天都会出现，普通得让人很少注意。", en: "The sky had not yet fully darkened. The setting sun fell slantwise between the teaching buildings, stretching the shadows of the trees long along the road. Someone cycled past in a hurry, someone discussed dinner with a friend, and someone else, wearing earphones, walked slowly with their head down. Scenes like this appear every day, so ordinary that people rarely notice them." },
    ]},
    { heading: { zh: "越来越着急的我们", en: "Always in a Hurry" }, paragraphs: [
      { zh: "不知道从什么时候开始，我们好像越来越着急了。", en: "I don't know when it started, but we seem to be in a hurry more and more." },
      { zh: "上大学以后，总觉得自己应该做很多事情：考试要考好，证书要拿到，比赛要参加，还要考虑实习和未来。打开朋友圈，看见有人获奖，有人旅行，有人已经开始为工作做准备，再看看自己，好像还在为明天交什么作业发愁。偶尔也会忍不住怀疑，是不是自己走得太慢了。", en: "Since starting university, I've always felt I should be doing so many things: do well on exams, earn certificates, join competitions, and think about internships and the future. Opening my social feed, I see someone winning an award, someone traveling, someone already preparing for work. Then I look at myself, still worrying about which assignment is due tomorrow. Sometimes I can't help wondering — am I walking too slowly?" },
    ]},
    { heading: { zh: "操场上的一圈又一圈", en: "Laps Around the Track" }, paragraphs: [
      { zh: "经过操场时，我看到有人正在跑步。有人跑得很快，一圈接着一圈；也有人跑得很慢，累了就停下来走几步。但过了一会儿，他们依然会从我面前经过。", en: "Passing the sports field, I saw people running. Some ran fast, lap after lap; others ran slowly, stopping to walk a few steps when tired. But after a while, they would still pass in front of me again." },
      { zh: "那一刻我突然想到，其实生活也是这样。", en: "In that moment it struck me — life is like this too." },
      { zh: "每个人都有自己的节奏。有人很早就知道自己想要什么，有人却需要走很多弯路才能找到方向。我们总是习惯和别人比较，却忘了每个人想去的地方本来就不一样。", en: "Everyone has their own rhythm. Some know early what they want; others need many detours before finding their direction. We are always used to comparing ourselves with others, forgetting that the places we want to go were never the same to begin with." },
    ]},
    { heading: { zh: "普通的日子", en: "Ordinary Days" }, paragraphs: [
      { zh: "大学生活也许没有想象中那么轰轰烈烈。更多时候，不过是上课、吃饭、写作业，再和朋友说一些没什么意义的话。但或许多年以后，真正让我们怀念的，恰恰就是这些普通的日子。", en: "University life may not be as dramatic as we imagined. More often, it's just classes, meals, homework, and meaningless chats with friends. But perhaps years later, what we truly miss will be exactly these ordinary days." },
      { zh: "所以，偶尔慢一点也没关系。累了就休息，迷茫的时候就先把今天过好。未来没有想清楚，也不必急着找到答案。", en: "So it's okay to slow down once in a while. Rest when tired; when lost, just live today well first. If the future isn't clear yet, there's no need to rush to find the answer." },
    ]},
    { heading: { zh: "路灯亮起", en: "The Streetlights Come On" }, paragraphs: [
      { zh: "走到宿舍楼下时，天已经黑了，路灯一盏一盏亮起来。", en: "By the time I reached the dorm, it was dark, and the streetlights were coming on one by one." },
      { zh: "明天大概还是普通的一天。", en: "Tomorrow will probably be just another ordinary day." },
      { zh: "但今晚的风很舒服，而我正慢慢走在自己的路上。", en: "But tonight's breeze is pleasant, and I am walking slowly along my own path." },
    ]},
  ],
},
  {
  slug: "when-the-rain-falls",        
  date: "2026 · 09 · 21",
  eyebrow: "Essay / 02",              
  tags: ["随笔", "慢下来", "生活"],
  minutes: 2,                         
  title: { zh: "雨落下来的时候", en: "When the Rain Falls" },
  summary: {
    zh: "一场不急不慢的小雨，让喧闹的城市安静下来，也让我想起小时候踩水坑的自己。或许人也该偶尔停下来，像雨一样，让世界慢一点。",
    en: "A gentle rain quiets the noisy city and reminds me of the child who loved splashing in puddles. Perhaps we too should pause sometimes — let the world slow down, the way rain does."
  },
  sections: [
    { heading: { zh: "一场小雨", en: "A Gentle Rain" }, paragraphs: [
      { zh: "我喜欢下雨天。", en: "I like rainy days." },
      { zh: "尤其是那种不急不慢的小雨。雨点落在窗台上，发出轻轻的声音，街上的行人撑着伞匆匆走过，路边的树叶被雨水洗得发亮。平日里喧闹的城市，也像忽然安静了下来。", en: "Especially the kind of gentle rain that neither hurries nor lingers. Raindrops fall on the windowsill with a soft sound; pedestrians pass by under umbrellas in a hurry; the leaves along the street are washed bright by the rain. The city, usually so noisy, seems to fall suddenly quiet." },
    ]},
    { heading: { zh: "坐在窗边发呆", en: "Lost in Thought by the Window" }, paragraphs: [
      { zh: "下雨的时候，我总喜欢坐在窗边发呆。看着玻璃上的水珠慢慢滑落，心里那些乱七八糟的事情，好像也会一点点平静下来。", en: "When it rains, I like to sit by the window and let my mind drift. Watching the droplets slide slowly down the glass, all the tangled things in my heart seem to settle, bit by bit." },
    ]},
    { heading: { zh: "想起小时候", en: "Thinking of Childhood" }, paragraphs: [
      { zh: "有时候，我会想起小时候。那时最喜欢踩水坑，就算鞋子湿了也不在乎。长大以后，我们开始习惯绕开积水，也越来越少做那些看起来“没意义”的事。", en: "Sometimes I think back to childhood. Back then I loved splashing in puddles, not caring if my shoes got wet. Growing up, we learn to walk around the water, and we do fewer and fewer of those things that seem to have no point." },
    ]},
    { heading: { zh: "偶尔也该停下来", en: "Sometimes We Should Pause" }, paragraphs: [
      { zh: "其实，人偶尔也该停下来。", en: "In truth, we should pause once in a while." },
      { zh: "不必总想着学习、工作和未来，也不用时时刻刻催着自己往前走。就像一场雨，它什么也没有说，却能让整个世界慢下来。", en: "We don't have to keep thinking about study, work, and the future, nor push ourselves forward every single moment. Like a rain — it says nothing at all, yet it can slow the whole world down." },
    ]},
    { heading: { zh: "等雨停了", en: "When the Rain Stops" }, paragraphs: [
      { zh: "等雨停了，天会重新变亮，而我们也可以带着更轻松的心情，再继续出发。", en: "When the rain stops, the sky will brighten again, and we can set off once more with a lighter heart." },
    ]},
  ],
},
  {
  slug: "things-we-cannot-throw-away",  
  date: "2026 · 09 · 23",
  eyebrow: "Essay / 03",                 
  tags: ["随笔", "旧物", "时间"],
  minutes: 1,                            
  title: { zh: "舍不得扔的，其实不是东西", en: "What We Can't Throw Away Isn't the Thing Itself" },
  summary: {
    zh: "整理房间时翻出的旧物，总让人犹豫再三。后来才明白，舍不得的从来不是那件东西，而是和它有关的那段时间。",
    en: "Sorting through old belongings always makes us hesitate. Only later do we realize it was never the object we couldn't let go of, but the time attached to it."
  },
  sections: [
    { heading: { zh: "翻出旧东西", en: "Finding Old Things" }, paragraphs: [
      { zh: "整理房间的时候，我经常会翻出一些很久没用过的东西。", en: "When I tidy my room, I often come across things I haven't used in a long time." },
      { zh: "可能是一张以前的车票，也可能是一支已经写不出字的笔，或者是一件早就不穿的衣服。它们看起来都没什么用，甚至有点占地方，但真正准备扔掉的时候，我又总会犹豫。", en: "Maybe an old ticket, maybe a pen that no longer writes, or a piece of clothing I stopped wearing long ago. They all seem useless, even a bit of a burden in space — yet when I'm about to throw them away, I always hesitate." },
    ]},
    { heading: { zh: "过去的痕迹", en: "Traces of the Past" }, paragraphs: [
      { zh: "因为这些东西好像都带着一点过去的痕迹。", en: "Because these things seem to carry a trace of the past." },
      { zh: "看到一张旧照片，会想起当时和谁在一起；看到一本写满字的本子，会突然记起以前认真做过的事。很多记忆平时根本不会想起，却会因为一个小东西一下子重新出现。", en: "An old photo brings back who I was with; a notebook filled with writing suddenly recalls the things I once did with care. Memories that never surface in daily life reappear all at once, because of a small object." },
    ]},
    { heading: { zh: "舍不得的是什么", en: "What We Hold Onto" }, paragraphs: [
      { zh: "后来我发现，人舍不得的可能并不是这些物品本身，而是和它们有关的那段时间。", en: "Later I realized: what we can't let go of may not be the object itself, but the stretch of time connected to it." },
    ]},
    { heading: { zh: "被收起的自己", en: "The Self Tucked Away" }, paragraphs: [
      { zh: "东西会旧，很多事情也会慢慢过去。但偶尔翻到这些旧物，还是会让人觉得，原来以前的自己一直没有真正消失，只是被时间轻轻地收了起来。", en: "Things grow old, and many things pass. But now and then, stumbling on these old belongings makes you feel that the person you once were never truly disappeared — only gently tucked away by time." },
    ]},
  ],
},
  {
  slug: "the-meaning-of-life",
  date: "2026 · 09 · 24",
  eyebrow: "Essay / 04",
  tags: ["生命", "思考"],
  minutes: 2,

  title: {
    zh: "生命",
    en: "Life"
  },

  summary: {
    zh: "生命或许没有标准答案，它的意义藏在不断流逝的时间、人与人的相遇，以及每一个真正活过的瞬间里。",
    en: "Life may not have a single answer. Its meaning can be found in passing time, human encounters, and every moment we truly experience."
  },

  sections: [
    {
      heading: {
        zh: "关于生命",
        en: "On Life"
      },
      paragraphs: [
        {
          zh: "生命到底是什么，我想了很久，也没有一个准确的答案。",
          en: "I have thought for a long time about what life really is, yet I still do not have a definite answer."
        },
        {
          zh: "有时候觉得，生命像一条不断向前的河流。我们站在其中，被时间推着往前走，无法停下，也无法回头。很多当时以为会永远记得的事情，后来渐渐模糊；很多以为不会失去的人，也可能在某个时刻走散。",
          en: "Sometimes life feels like a river that never stops moving forward. We stand within it, carried onward by time, unable to pause or return. Many things we once believed we would remember forever slowly fade, and some people we thought would always remain may eventually drift away."
        },
        {
          zh: "正因为如此，生命才显得珍贵。",
          en: "Perhaps that is exactly why life feels so precious."
        }
      ]
    },

    {
      heading: {
        zh: "有限与意义",
        en: "Finitude and Meaning"
      },
      paragraphs: [
        {
          zh: "一片叶子的落下，并不意味着世界停止；一个人的离开，也不会让时间暂停。我们终究只是漫长岁月中的一小段，却可以在有限的时间里留下属于自己的痕迹。",
          en: "The falling of a leaf does not stop the world, nor does a person's departure pause time. We are only a brief moment in the vast flow of years, yet within that limited time, we can still leave traces that belong to us."
        },
        {
          zh: "也许生命的意义，并不是找到一个标准答案，而是在一次次经历中慢慢明白自己想成为什么样的人。有人追求远方，有人珍惜眼前，其实都没有错。",
          en: "Perhaps the meaning of life is not about finding a standard answer, but about gradually understanding, through experience, what kind of person we want to become. Some people pursue distant dreams, while others treasure what is already before them. Neither path is wrong."
        }
      ]
    },

    {
      heading: {
        zh: "正在发生的此刻",
        en: "The Present Moment"
      },
      paragraphs: [
        {
          zh: "我渐渐觉得，生命最重要的不是长度，而是我们是否真正感受过它。认真爱过，努力过，失落过，也重新站起来过，这些看似普通的瞬间，或许正是生命本身。",
          en: "I have gradually come to believe that what matters most about life is not its length, but whether we have truly felt it. To love sincerely, to struggle, to lose, and to stand up again — these seemingly ordinary moments may be life itself."
        },
        {
          zh: "时间一直向前，而我们能做的，就是尽量不辜负每一个正在发生的此刻。",
          en: "Time keeps moving forward, and perhaps all we can do is try not to waste the moment that is unfolding before us."
        }
      ]
    }
  ]
}
];

export function findEditorialArticle(collection: readonly EditorialArticle[], slug: string) {
  return collection.find((article) => article.slug === slug);
}
