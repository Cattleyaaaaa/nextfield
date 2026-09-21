import { ArrowLeft } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";

export default function NotFound() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-site items-center overflow-hidden px-5 py-24 sm:px-8 lg:px-12">
      <div className="absolute right-0 top-1/2 -z-10 -translate-y-1/2 font-display text-[42vw] leading-none tracking-[-0.1em] text-ink/[0.035] sm:text-[26vw]">
        404
      </div>
      <div>
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-accent">Error / 404</p>
        <h1 className="max-w-3xl text-balance font-display text-[clamp(3.5rem,9vw,7rem)] leading-[0.9] tracking-[-0.06em]">
          这一页，暂时不在纸上。
        </h1>
        <p className="mt-8 max-w-md text-base leading-7 text-muted">链接可能已经移动，或者它还只是一个没有写下来的念头。</p>
        <TransitionLink className="group mt-10 inline-flex items-center gap-3 rounded-full border border-line px-5 py-3 text-sm font-medium hover:border-accent hover:text-accent" href="/">
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          回到首页
        </TransitionLink>
      </div>
    </div>
  );
}
