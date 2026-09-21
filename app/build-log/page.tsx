import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "建站纪事",
  description: "这个站是怎么一版一版搭起来的：页面怎么改、交互怎么调、细节怎么磨。",
};

// 占位时间线 —— 每一版改了什么，按时间倒着记即可。
const entries: { date: string; title: string; body: string }[] = [];

export default function BuildLogPage() {
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Log / 05</p>
      <h1 className="mt-6 max-w-4xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[-0.06em]">
        建站纪事。
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">
        这里记这个站一路搭起来的过程：页面怎么改、交互怎么调、细节怎么慢慢磨出来。
      </p>

      {entries.length === 0 ? (
        <div className="mt-14 border-t border-line pt-10">
          <p className="text-sm leading-6 text-muted">
            还没有条目。把每一版改了什么加进{" "}
            <span className="font-mono text-ink">app/build-log/page.tsx</span> 顶部的{" "}
            <span className="font-mono text-ink">entries</span> 数组即可，最新的排在最前面。
          </p>
          <p className="mt-4 rounded-2xl border border-dashed border-accent/50 bg-accent/[0.06] px-5 py-4 text-sm leading-6 text-ink">
            这一页是占位页。参考站的做法是按时间倒序记一条条短更新，配上日期。
          </p>
        </div>
      ) : (
        <ol className="mt-14 space-y-10 border-t border-line pt-10">
          {entries.map((entry) => (
            <li className="grid gap-3 border-b border-line pb-10 sm:grid-cols-12 sm:gap-6" key={entry.date + entry.title}>
              <span className="font-mono text-xs tracking-[0.06em] text-accent sm:col-span-2">{entry.date}</span>
              <div className="sm:col-span-10">
                <h2 className="font-display text-2xl leading-tight tracking-[-0.03em]">{entry.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{entry.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
