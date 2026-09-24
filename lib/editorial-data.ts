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
    summary: { zh: "从内容管线、设计令牌到静态交付，说明这个场域如何保持可维护。", en: "From content pipelines and design tokens to static delivery, this explains how the field stays maintainable." },
    sections: [
      { heading: { zh: "内容管线", en: "Content pipeline" }, paragraphs: [{ zh: "长文使用 MDX，项目、证据模块、图片档案、曲目清单与歌词使用结构化数据，页面组件不持有重复内容。新增文章、图片或曲目时，导航、列表和 sitemap 都从同一来源生成。", en: "Long-form writing uses MDX, while projects, evidence modules, the image archive, the track list and lyrics use structured data. Page components do not own duplicate content, so navigation, indexes and the sitemap all derive from the same sources." }]},
      { heading: { zh: "界面系统", en: "Interface system" }, paragraphs: [{ zh: "Next.js 和 React 负责结构，TypeScript 约束数据边界，Tailwind CSS 与设计令牌统一主题，GSAP 只处理需要明确编排的运动；声音交给浏览器原生 audio，不做任何绕过授权限制的处理。", en: "Next.js and React provide structure, TypeScript constrains data boundaries, Tailwind CSS and tokens unify themes, and GSAP handles only motion that needs explicit choreography. Sound uses the browser's native audio element, with nothing that would bypass licensing limits." }]},
      { heading: { zh: "静态交付", en: "Static delivery" }, paragraphs: [{ zh: "站点以静态页面交付，核心内容不依赖服务器运行。构建过程同时验证类型、路由和内容入口，让发布结果可以被检查和复现。", en: "The site ships as static pages, so core content does not depend on a running server. The build validates types, routes and content entrances, keeping releases inspectable and reproducible." }]},
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
