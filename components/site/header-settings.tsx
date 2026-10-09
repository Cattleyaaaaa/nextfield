"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BadgePlus, Settings2, X } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { GlobalEffectsMenu } from "@/components/site/global-effects-menu";
import { BackToTopButton } from "@/components/site/back-to-top-button";
import { HeaderAccountControl } from "@/components/site/header-account-control";
import { useStudioBadgeDrop } from "@/components/visual/studio-badge-drop";

export function HeaderSettings() {
  const [open, setOpen] = useState(false);
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const { dropBadge } = useStudioBadgeDrop();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    const frame = requestAnimationFrame(() => root.current?.querySelector<HTMLElement>("[role=dialog] button")?.focus());
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="relative" ref={root}>
    <button ref={trigger} type="button" aria-label={zh ? "打开网站设置" : "Open site settings"} title={zh ? "网站设置" : "Site settings"} aria-expanded={open} aria-controls="header-settings" aria-haspopup="dialog" onClick={() => setOpen(value => !value)} className={`grid size-9 place-items-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${open ? "border-accent bg-accent text-white" : "border-line bg-paper/70 text-ink hover:border-accent hover:text-accent"}`}>{open ? <X className="size-4" /> : <Settings2 className="size-4" />}</button>
    {open && <div id="header-settings" role="dialog" aria-label={zh ? "网站设置" : "Site settings"} className="absolute right-0 top-12 z-50 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-line bg-paper/95 p-4 shadow-xl">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{zh ? "网站设置" : "SITE SETTINGS"}</p>
      <div className="flex items-center justify-between gap-3 border-t border-line py-3"><span className="text-xs text-muted">{zh ? "动效与点击反馈" : "Motion & click effects"}</span><GlobalEffectsMenu /></div>
      <div className="flex items-center justify-between gap-3 border-t border-line py-3"><span className="text-xs text-muted">{zh ? "页面快捷操作" : "Page shortcuts"}</span><div className="flex items-center gap-2"><BackToTopButton /><button type="button" aria-label={zh ? "掉落工牌" : "Drop a badge"} title={zh ? "掉落工牌" : "Drop a badge"} onClick={() => { setOpen(false); dropBadge(); }} className="grid size-9 place-items-center rounded-full border border-line text-ink hover:border-accent hover:text-accent"><BadgePlus className="size-4" /></button></div></div>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-3"><span className="text-xs text-muted">{zh ? "账户" : "Account"}</span><HeaderAccountControl /></div>
    </div>}
  </div>;
}
