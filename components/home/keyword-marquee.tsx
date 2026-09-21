// 关键词跑马灯：对应 gsap.com 的 Brands 区。
// 纯 CSS 动画（globals.css 里的 marquee 关键帧），内容复制两份以实现无缝循环。
const KEYWORDS = [
  "Agent",
  "RAG",
  "LangGraph",
  "Next.js",
  "TypeScript",
  "Streaming",
  "检索",
  "工具调用",
  "可观测",
  "PostgreSQL",
  "部署",
];

export function KeywordMarquee() {
  const row = [...KEYWORDS, ...KEYWORDS];

  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-line py-6">
      <div className="marquee-track flex w-max items-center">
        {row.map((keyword, index) => (
          <span className="flex items-center" key={`${keyword}-${index}`}>
            <span className="whitespace-nowrap font-display text-3xl tracking-[-0.03em] text-muted">{keyword}</span>
            <span className="px-7 text-sm text-accent/70">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
