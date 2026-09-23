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
    slug: "the-radio-got-a-record", date: "2026 · 09 · 22", eyebrow: "Build log / 01", tags: ["Audio", "CSS", "Layout"], minutes: 5,
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
    slug: "a-page-each-for-images-and-sound", date: "2026 · 09 · 22", eyebrow: "Build log / 02", tags: ["Content", "Audio", "Navigation"], minutes: 4,
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
    slug: "a-field-with-a-voice", date: "2026 · 09 · 21", eyebrow: "Build log / 03", tags: ["Audio", "Interaction", "Content"], minutes: 5,
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
    slug: "depth-with-restraint", date: "2026 · 09 · 21", eyebrow: "Build log / 04", tags: ["GSAP", "3D", "A11y"], minutes: 4,
    title: { zh: "为平面增加一点深度", en: "Adding depth to a flat surface" },
    summary: { zh: "用克制的倾斜、Z 轴分层和指针反馈建立空间感，同时保留触屏与减少动态效果模式。", en: "Restrained tilt, Z-axis layers and pointer feedback create depth while preserving touch and reduced-motion experiences." },
    sections: [
      { heading: { zh: "深度不是更多动画", en: "Depth is not more animation" }, paragraphs: [{ zh: "空间感主要来自层级关系：标题、装饰、高光和交互表面处于不同深度。只有关键入口响应指针，其他内容保持稳定。", en: "Depth comes from hierarchy: titles, decoration, highlights and interactive surfaces occupy distinct layers. Only key entrances respond to the pointer; the rest stays stable." }]},
      { heading: { zh: "性能边界", en: "Performance boundaries" }, paragraphs: [{ zh: "交互只修改 transform 和 opacity，高频指针输入复用 tween，不在每一帧创建新动画。离开组件后立即清理监听器和上下文。", en: "Interactions change only transforms and opacity. High-frequency pointer input reuses tweens instead of creating new animation each frame, and every listener and context is cleaned up on exit." }]},
      { heading: { zh: "安静版本同样完整", en: "The quiet version is complete" }, paragraphs: [{ zh: "触屏设备不依赖悬浮状态；系统开启减少动态效果后，信息顺序、链接和视觉层级仍然完整。降级不是删除内容，而是删除非必要运动。", en: "Touch devices do not depend on hover. With reduced motion enabled, information order, links and visual hierarchy remain complete. The fallback removes unnecessary movement, not content." }]},
    ],
  },
  {
    slug: "rebuilding-the-home-story", date: "2026 · 09 · 20", eyebrow: "Build log / 05", tags: ["Design", "Index"], minutes: 5,
    title: { zh: "重做首页叙事", en: "Rewriting the homepage narrative" },
    summary: { zh: "用开放索引替代传统自我介绍，让作品、笔记与实验成为站点主角。", en: "An open index replaced the conventional biography and made work, notes and experiments the protagonists." },
    sections: [
      { heading: { zh: "旧首页的问题", en: "What the old homepage got wrong" }, paragraphs: [{ zh: "旧结构花了太多篇幅解释“我是谁”，却让真正能证明能力的项目和判断排在后面。两个连续 Hero 还重复承担了开场任务。", en: "The old structure spent too much space explaining who I was while pushing evidence and decisions down the page. Two consecutive hero sections also repeated the same opening job." }]},
      { heading: { zh: "让内容自己建立身份", en: "Let the content establish identity" }, paragraphs: [{ zh: "新版先给出方向，再让项目、笔记、实验和失败记录从不同角度证明它。访客不必按固定顺序阅读，也能迅速形成判断。", en: "The new version states a direction, then lets projects, notes, experiments and failure records prove it from different angles. Visitors can form a judgment without following one prescribed path." }]},
      { heading: { zh: "首页是一张地图", en: "The homepage is a map" }, paragraphs: [{ zh: "地图意味着任何节点都可以成为入口，也意味着新内容可以插入、移动或被重新编组，而不需要重写整段自我介绍。", en: "A map allows any node to become an entrance. New material can be inserted, moved or regrouped without rewriting an entire biography." }]},
    ],
  },
  {
    slug: "the-first-foundation", date: "2026 · 09 · 18", eyebrow: "Build log / 06", tags: ["Next.js", "System"], minutes: 4,
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
    slug: "how-the-record-is-made", date: "2026 · 09", eyebrow: "Colophon / 01", tags: ["Audio", "Craft"], minutes: 4,
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
    slug: "why-nextfield", date: "2026 · 09", eyebrow: "Colophon / 02", tags: ["Identity", "Direction"], minutes: 4,
    title: { zh: "为什么叫 NEXTFIELD", en: "Why NEXTFIELD" },
    summary: { zh: "名字不是包装，而是内容结构和更新方式的约束。", en: "The name is not packaging; it constrains the content structure and how the site evolves." },
    sections: [
      { heading: { zh: "下一次尝试", en: "The next attempt" }, paragraphs: [{ zh: "NEXT 指向尚未完成的下一次实验。它允许项目有版本、观点会变化，也允许失败成为公开内容的一部分。", en: "NEXT points to the next unfinished experiment. Projects can have versions, opinions can change, and failure can remain part of the public record." }]},
      { heading: { zh: "一块场域", en: "A field" }, paragraphs: [{ zh: "FIELD 不是作品陈列柜，而是项目、笔记、声音、工具和访客痕迹共同存在的空间。不同完成度的内容都能找到位置。", en: "FIELD is not a showcase cabinet but a space where projects, notes, sound, tools and visitor traces coexist. Work at different levels of completion can all belong." }]},
      { heading: { zh: "名字如何影响界面", en: "How the name shapes the interface" }, paragraphs: [{ zh: "导航被设计成地图，首页允许多入口，系统页公开证据，建站纪事保留变化。名字最终变成了信息架构。", en: "Navigation behaves like a map, the homepage supports multiple entrances, systems publish evidence and the build log preserves change. The name eventually became information architecture." }]},
    ],
  },
  {
    slug: "content-before-decoration", date: "2026 · 09", eyebrow: "Colophon / 03", tags: ["Content", "Design"], minutes: 4,
    title: { zh: "内容先于装饰", en: "Content before decoration" },
    summary: { zh: "每一种视觉效果都必须帮助理解、建立层次或提供反馈。", en: "Every visual effect must support understanding, hierarchy or feedback." },
    sections: [
      { heading: { zh: "先删除效果", en: "Remove the effect first" }, paragraphs: [{ zh: "设计一个区域时，先确认没有动画它是否仍然成立。标题、说明、入口和状态必须先组成清楚的静态页面。", en: "When designing a section, first ask whether it still works without animation. Titles, explanations, entrances and states must form a clear static page before anything moves." }]},
      { heading: { zh: "运动承担什么职责", en: "What motion is responsible for" }, paragraphs: [{ zh: "转场解释页面切换，倾斜反馈可交互表面，滚动入场提示阅读顺序。无法说清职责的动效不会进入最终版本。", en: "Transitions explain navigation, tilt signals an interactive surface, and scroll reveals suggest reading order. Motion without a clear job does not enter the final version." }]},
      { heading: { zh: "装饰也有预算", en: "Decoration has a budget" }, paragraphs: [{ zh: "同一屏不会让所有卡片同时运动。视觉焦点数量、WebGL 上下文和持续动画都会被限制，确保内容始终先被看到。", en: "Not every card moves at once. Visual focal points, WebGL contexts and continuous animation are all limited so content is always seen first." }]},
    ],
  },
  {
    slug: "motion-with-an-exit", date: "2026 · 09", eyebrow: "Colophon / 04", tags: ["Motion", "A11y"], minutes: 4,
    title: { zh: "动态效果必须有出口", en: "Motion with an exit" },
    summary: { zh: "持续动画可以关闭，复杂交互可以降级，核心内容不能依赖运动存在。", en: "Continuous animation can be stopped, complex interaction can fall back, and core content never depends on movement." },
    sections: [
      { heading: { zh: "退出不是例外", en: "Exit is not an exception" }, paragraphs: [{ zh: "全站提供动态效果开关，并尊重系统的 reduced-motion 偏好。声音不在访客出手之前响起：第一次交互后随机开始，随时可以暂停，停过之后不会再自动开始。", en: "The site provides a motion control and respects the system reduced-motion preference. Sound does not play before the visitor acts: it starts randomly after the first interaction, can be paused at any time, and stays silent on later visits once it has been stopped." }]},
      { heading: { zh: "降级后的完整性", en: "Complete after fallback" }, paragraphs: [{ zh: "Canvas、粒子和 3D 反馈不可用时，访客仍能读取同样的信息、访问同样的链接、完成同样的任务。", en: "When Canvas, particles or 3D feedback are unavailable, visitors can still read the same information, follow the same links and complete the same tasks." }]},
      { heading: { zh: "控制权属于访客", en: "Control belongs to the visitor" }, paragraphs: [{ zh: "网站可以表达个性，但不应该迫使任何人等待演出结束。交互增强体验，控制权始终留在用户手中。", en: "A site may express personality, but it should never force anyone to wait for a performance. Interaction enhances the experience while control stays with the visitor." }]},
    ],
  },
  {
    slug: "the-system-underneath", date: "2026 · 09", eyebrow: "Colophon / 05", tags: ["Stack", "Delivery"], minutes: 5,
    title: { zh: "界面下面的系统", en: "The system beneath the interface" },
    summary: { zh: "从内容管线、设计令牌到静态交付，说明这个场域如何保持可维护。", en: "From content pipelines and design tokens to static delivery, this explains how the field stays maintainable." },
    sections: [
      { heading: { zh: "内容管线", en: "Content pipeline" }, paragraphs: [{ zh: "长文使用 MDX，项目、证据模块、图片档案、曲目清单与歌词使用结构化数据，页面组件不持有重复内容。新增文章、图片或曲目时，导航、列表和 sitemap 都从同一来源生成。", en: "Long-form writing uses MDX, while projects, evidence modules, the image archive, the track list and lyrics use structured data. Page components do not own duplicate content, so navigation, indexes and the sitemap all derive from the same sources." }]},
      { heading: { zh: "界面系统", en: "Interface system" }, paragraphs: [{ zh: "Next.js 和 React 负责结构，TypeScript 约束数据边界，Tailwind CSS 与设计令牌统一主题，GSAP 只处理需要明确编排的运动；声音交给浏览器原生 audio，不做任何绕过授权限制的处理。", en: "Next.js and React provide structure, TypeScript constrains data boundaries, Tailwind CSS and tokens unify themes, and GSAP handles only motion that needs explicit choreography. Sound uses the browser's native audio element, with nothing that would bypass licensing limits." }]},
      { heading: { zh: "静态交付", en: "Static delivery" }, paragraphs: [{ zh: "站点以静态页面交付，核心内容不依赖服务器运行。构建过程同时验证类型、路由和内容入口，让发布结果可以被检查和复现。", en: "The site ships as static pages, so core content does not depend on a running server. The build validates types, routes and content entrances, keeping releases inspectable and reproducible." }]},
    ],
  },
];

export const ESSAY_ARTICLES: EditorialArticle[] = [
  {
    slug: "leave-room-for-the-unnamed", date: "2026 · 09 · 22", eyebrow: "Essay / 01", tags: ["Field note"], minutes: 3,
    title: { zh: "给尚未命名的东西留一个位置", en: "Leave a place for what has no name yet" },
    summary: { zh: "不是每个想法都需要立刻成为项目、文章或产品。", en: "Not every idea needs to become a project, article or product immediately." },
    sections: [
      { heading: { zh: "分类往往来得太早", en: "Categories often arrive too early" }, paragraphs: [{ zh: "当一个想法刚出现时，我们习惯问它属于什么：项目、文章、实验，还是一个可以交付的功能。这个问题看似帮助整理，实际上也可能过早关闭可能性。", en: "When an idea first appears, we ask what it belongs to: a project, an article, an experiment or a shippable feature. The question seems organizational, but it can close possibilities too early." }]},
      { heading: { zh: "先允许它存在", en: "Let it exist first" }, paragraphs: [{ zh: "一个持续生长的网站应该允许半成品、问题和没有结论的观察存在。它们不必伪装成完成的作品，只需要留下足够清楚的痕迹，等待下一次连接。", en: "A living website should allow fragments, questions and unresolved observations to exist. They do not need to pretend to be finished; they only need to leave a clear enough trace for the next connection." }]},
    ],
  },
  {
    slug: "interfaces-are-promises", date: "2026 · 09 · 21", eyebrow: "Essay / 02", tags: ["Interface"], minutes: 3,
    title: { zh: "界面也是一种承诺", en: "An interface is also a promise" },
    summary: { zh: "按钮、进度和确认状态，都在告诉用户系统接下来会怎样行动。", en: "Buttons, progress and confirmation states all tell people how the system will act next." },
    sections: [
      { heading: { zh: "每个状态都在建立预期", en: "Every state creates an expectation" }, paragraphs: [{ zh: "按钮写着“保存”，就承诺结果不会悄悄丢失；进度条开始移动，就承诺系统知道任务走到了哪里；请求确认，则承诺用户仍然拥有最终控制权。", en: "A button labeled save promises the result will not quietly disappear. A moving progress bar promises the system knows where the task stands. A confirmation request promises the user still has final control." }]},
      { heading: { zh: "错误不是承诺的终点", en: "Failure is not the end of the promise" }, paragraphs: [{ zh: "真正可靠的界面不只展示成功。它会说明哪里失败、已经发生什么、是否可以重试，以及下一步由谁决定。", en: "A reliable interface does not only display success. It explains what failed, what already happened, whether retry is possible and who decides the next step." }]},
    ],
  },
  {
    slug: "a-quiet-kind-of-progress", date: "2026 · 09 · 20", eyebrow: "Essay / 03", tags: ["Process"], minutes: 3,
    title: { zh: "一种安静的进度", en: "A quiet kind of progress" },
    summary: { zh: "并非所有进展都需要发布一个新功能，有时只是让系统少一个意外。", en: "Not every improvement needs a new feature; sometimes progress is simply one fewer surprise." },
    sections: [
      { heading: { zh: "看不见的工作", en: "Invisible work" }, paragraphs: [{ zh: "类型更清楚、错误更可恢复、页面在慢设备上少一次卡顿，这些变化很难成为醒目的发布说明，却会持续改变产品被信任的方式。", en: "Clearer types, recoverable failures and one fewer pause on a slow device rarely make dramatic release notes, yet they steadily change how a product earns trust." }]},
      { heading: { zh: "把稳定也记录下来", en: "Record stability too" }, paragraphs: [{ zh: "记录不应该只追逐新功能。写下约束、删除的复杂度和没有发生的事故，才能看见系统真正变好的轨迹。", en: "A record should not chase new features alone. Writing down constraints, removed complexity and incidents that did not happen reveals how a system is genuinely improving." }]},
    ],
  },
];

export function findEditorialArticle(collection: readonly EditorialArticle[], slug: string) {
  return collection.find((article) => article.slug === slug);
}
