"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Compass, X } from "lucide-react";
import { TransitionLink } from "@/components/site/transition-link";
import { fieldSections, navSections } from "@/lib/nav";

export function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  // 底部快捷入口（首页在 JSX 里单独写，所以计数要 +1）。数字从数据推出来，加一项不用手改。
  const quickLinks = navSections.slice(0, 3);
  const entryCount = fieldSections.length + quickLinks.length + 1;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const closeOnOutside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutside);
    return () => { document.removeEventListener("keydown", closeOnEscape); document.removeEventListener("pointerdown", closeOnOutside); };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button aria-expanded={open} aria-haspopup="dialog" className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 font-mono text-[10px] font-semibold tracking-[0.1em] transition-colors ${open ? "border-accent bg-accent text-white" : "border-line bg-paper/70 hover:border-accent hover:text-accent"}`} onClick={() => setOpen((value) => !value)} type="button">
        {open ? <X className="size-3.5" /> : <Compass className="size-3.5" />}
        <span className="hidden sm:inline">EXPLORE</span>
        <ChevronDown className={`hidden size-3 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div aria-label="全站探索菜单" className="fixed inset-x-3 top-[4.5rem] z-50 max-h-[calc(100svh-5.25rem)] overflow-y-auto rounded-[1.5rem] border border-line bg-paper/95 p-3 shadow-2xl backdrop-blur-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[42rem]" role="dialog">
          <div className="flex items-center justify-between px-3 py-3">
            <div><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent">Field map</p><p className="mt-1 text-xs text-muted">从任何页面进入正在发生的工作与证据。</p></div>
            <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[8px] tracking-[0.12em] text-muted">{entryCount} ENTRIES</span>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {fieldSections.map((item, index) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return <TransitionLink aria-current={active ? "page" : undefined} className={`group rounded-2xl border p-4 transition-colors ${active ? "border-accent bg-accent/[0.07]" : "border-line bg-panel/70 hover:border-accent"}`} href={item.href} key={item.href} onClick={() => setOpen(false)}><span className="flex items-center justify-between"><span className="font-mono text-[8px] uppercase tracking-[0.15em] text-accent">0{index + 1} / {item.eyebrow}</span><ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span><strong className="mt-5 block font-display text-2xl font-normal tracking-[-0.035em]">{item.label}</strong><span className="mt-2 block text-xs leading-5 text-muted">{item.description}</span></TransitionLink>;
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-3 pb-2 pt-4 text-xs text-muted">
            <TransitionLink className="hover:text-accent" href="/" onClick={() => setOpen(false)}>首页</TransitionLink>
            {quickLinks.map((item) => <TransitionLink className="hover:text-accent" href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</TransitionLink>)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
