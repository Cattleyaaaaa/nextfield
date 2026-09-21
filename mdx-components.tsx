import type { MDXComponents } from "mdx/types";

// 文章正文的排版约定。刻意只和站点的既有语言对齐：
// 衬线大标题（font-display）、墨色正文、青色强调、两档字重（400 / 500）。
export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-16 mb-6 font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.05em]" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-14 mb-5 font-display text-[clamp(1.7rem,2.8vw,2.35rem)] leading-[1.15] tracking-[-0.04em]" {...props} />
  ),
  h3: (props) => <h3 className="mt-10 mb-3 font-display text-xl leading-snug tracking-[-0.03em]" {...props} />,
  h4: (props) => <h4 className="mt-8 mb-2 text-base font-medium tracking-[-0.01em]" {...props} />,

  p: (props) => <p className="my-5 text-lg leading-9 text-ink/88" {...props} />,

  a: (props) => <a className="link-line font-medium text-ink hover:text-accent" {...props} />,

  ul: (props) => <ul className="my-6 list-disc space-y-2 pl-5 marker:text-accent/60" {...props} />,
  ol: (props) => <ol className="my-6 list-decimal space-y-2 pl-5 marker:text-accent/60" {...props} />,
  li: (props) => <li className="text-lg leading-9 text-ink/88" {...props} />,

  blockquote: (props) => <blockquote className="my-7 border-l-2 border-accent/60 pl-5 text-lg leading-9 text-muted" {...props} />,

  strong: (props) => <strong className="font-medium text-ink" {...props} />,

  code: (props) => <code className="rounded-md bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[0.9em] text-ink" {...props} />,
  pre: (props) => (
    <pre
      className="my-7 overflow-x-auto rounded-2xl border border-line bg-panel p-5 text-[13px] leading-6 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-[13px] [&_code]:text-ink"
      {...props}
    />
  ),

  hr: (props) => <hr className="my-12 border-line" {...props} />,

  // 包一层横向滚动容器：表格列多时在小屏幕上不至于被压扁。
  table: (props) => (
    <div className="my-7 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b border-line" {...props} />,
  th: (props) => <th className="py-2.5 pr-4 font-medium text-ink" {...props} />,
  td: (props) => <td className="border-b border-line/60 py-2.5 pr-4 align-top text-ink/88" {...props} />,

  img: (props) => <img className="my-7 w-full rounded-2xl border border-line" {...props} />,
};

export function useMDXComponents(): MDXComponents {
  return mdxComponents;
}
