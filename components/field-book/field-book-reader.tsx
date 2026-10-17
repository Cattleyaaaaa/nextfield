"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, List, ScrollText, Search, X } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { TransitionLink } from "@/components/site/transition-link";
import type { FieldBookEntry } from "@/types/field-book";

type Mode = "pages" | "scroll";
type Direction = "next" | "previous" | null;
const TOPIC_EN: Record<string, string> = { 技术: "Technology", 工程: "Engineering", 产品: "Product", 前端: "Frontend", 交互: "Interaction", 设计: "Design", 哲学: "Philosophy" };

export function FieldBookReader({ entry, entries, contentZh, contentEn }: {
  entry: FieldBookEntry;
  entries: FieldBookEntry[];
  contentZh: ReactNode;
  contentEn?: ReactNode;
}) {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const [mode, setMode] = useState<Mode>("scroll");
  const [spread, setSpread] = useState(0);
  const [spreadCount, setSpreadCount] = useState(1);
  const [columnWidth, setColumnWidth] = useState(420);
  const [gutter, setGutter] = useState(40);
  const [direction, setDirection] = useState<Direction>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerChapter, setDrawerChapter] = useState<"writing" | "essay">(entry.kind);
  const [drawerQuery, setDrawerQuery] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentsButtonRef = useRef<HTMLButtonElement>(null);
  const turnTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const progressRef = useRef(0);
  const spreadRef = useRef(0);
  const countRef = useRef(1);
  const restoreScrollRef = useRef(false);

  const displayedLocale = locale === "en" && contentEn ? "en" : "zh";
  const body = displayedLocale === "en" ? contentEn : contentZh;
  const filteredEntries = useMemo(() => {
    const term = drawerQuery.trim().toLocaleLowerCase();
    return entries.filter((item) => item.kind === drawerChapter &&
      (!term || `${item.title.zh} ${item.title.en} ${item.category} ${TOPIC_EN[item.category] ?? ""} ${item.summary.zh} ${item.summary.en}`.toLocaleLowerCase().includes(term)));
  }, [entries, drawerChapter, drawerQuery]);

  const syncViewport = useCallback((target: number, width: number, gap: number, count: number) => {
    if (!viewportRef.current) return;
    const columns = 1;
    const offset = target * columns * (width + gap);
    viewportRef.current.scrollLeft = offset;
    spreadRef.current = target;
    countRef.current = count;
    setSpread(target);
    setSpreadCount(count);
  }, []);

  useLayoutEffect(() => {
    if (mode !== "pages") return;
    const viewport = viewportRef.current;
    const flow = flowRef.current;
    if (!viewport || !flow) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = viewport.clientWidth;
        if (!width) return;
        const columns = 1;
        const gap = 0;
        const pageWidth = (width - gap * (columns - 1)) / columns;
        flow.style.width = `${width}px`;
        flow.style.columnWidth = `${pageWidth}px`;
        flow.style.columnGap = `${gap}px`;
        setColumnWidth(pageWidth);
        setGutter(gap);
        // CSS columns overflow horizontally once the fixed reading height is full.
        const pageCount = Math.max(1, Math.ceil((flow.scrollWidth + gap) / (pageWidth + gap) - 0.01));
        const count = Math.max(1, Math.ceil(pageCount / columns));
        const target = Math.min(count - 1, Math.round(progressRef.current * Math.max(0, count - 1)));
        syncViewport(target, pageWidth, gap, count);
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(flow);
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [mode, displayedLocale, entry.href, syncViewport]);

  useLayoutEffect(() => {
    if (mode !== "scroll" || !restoreScrollRef.current) return;
    restoreScrollRef.current = false;
    if (progressRef.current <= 0.01) return;
    const frame = requestAnimationFrame(() => {
      const pane = scrollRef.current;
      if (!pane) return;
      const top = pane.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + progressRef.current * Math.max(0, pane.scrollHeight - window.innerHeight) });
    });
    return () => cancelAnimationFrame(frame);
  }, [mode, displayedLocale]);

  useEffect(() => () => { turnTimersRef.current.forEach(clearTimeout); }, []);
  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        contentsButtonRef.current?.focus();
      }
      if (event.key === "Tab" && drawerRef.current) {
        const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => { document.removeEventListener("keydown", onEscape); document.body.style.overflow = previousOverflow; };
  }, [drawerOpen]);

  const turn = useCallback((delta: number) => {
    if (mode !== "pages" || direction) return;
    const next = Math.max(0, Math.min(countRef.current - 1, spreadRef.current + delta));
    if (next === spreadRef.current) return;
    const commit = () => {
      syncViewport(next, columnWidth, gutter, countRef.current);
      progressRef.current = countRef.current > 1 ? next / (countRef.current - 1) : 0;
    };
    if (!motionEnabled) { commit(); return; }
    setDirection(delta > 0 ? "next" : "previous");
    turnTimersRef.current.push(setTimeout(commit, 220));
    turnTimersRef.current.push(setTimeout(() => setDirection(null), 520));
  }, [mode, direction, columnWidth, gutter, motionEnabled, syncViewport]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (mode === "scroll") {
      const pane = scrollRef.current;
      if (pane) {
        const top = pane.getBoundingClientRect().top + window.scrollY;
        progressRef.current = Math.max(0, Math.min(1, (window.scrollY - top) / Math.max(1, pane.scrollHeight - window.innerHeight)));
      }
    } else {
      progressRef.current = spreadCount > 1 ? spread / (spreadCount - 1) : 0;
      restoreScrollRef.current = true;
    }
    setMode(next);
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => { touchStartRef.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (start === null || mode !== "pages") return;
    const delta = (event.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(delta) > 55) turn(delta < 0 ? 1 : -1);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (mode !== "pages" || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); turn(1); }
    if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); turn(-1); }
  };

  const categoryLabel = entry.kind === "essay" ? (locale === "zh" ? "随笔" : "Essays") : (locale === "zh" ? entry.category : TOPIC_EN[entry.category] ?? entry.category);
  const chapterEntries = entries.filter((item) => item.kind === entry.kind);
  const entryNumber = chapterEntries.findIndex((item) => item.href === entry.href) + 1;
  const nextEntry = chapterEntries[chapterEntries.findIndex((item) => item.href === entry.href) + 1];
  const bookDirectoryHref = `/blog?open=1&chapter=${entry.kind === "essay" ? "essays" : "writing"}`;
  const content = <article className="fieldbook-reading-content" lang={displayedLocale === "zh" ? "zh-CN" : "en"}>
    <header className="fieldbook-reading-header">
      <div className="fieldbook-reading-overline">
        <span>{entry.kind === "writing" ? "CHAPTER 01 / WRITING" : "CHAPTER 02 / ESSAYS"}</span>
        <span>FIELD NOTE {String(Math.max(1, entryNumber)).padStart(2, "0")}</span>
      </div>
      <h1>{entry.title[locale]}</h1>
      <p className="fieldbook-reading-summary">{entry.summary[locale]}</p>
      <div className="fieldbook-reading-meta"><span>{categoryLabel}</span><span>{entry.date}</span><span>{entry.minutes[locale]} {locale === "zh" ? "分钟阅读" : "min read"}</span></div>
      {mode === "scroll" && <p className="fieldbook-reading-cue"><ArrowDown size={14} aria-hidden="true" />{locale === "zh" ? "向下阅读" : "Continue reading"}</p>}
    </header>
    {body}
    <nav className="fieldbook-reading-next" aria-label={locale === "zh" ? "继续阅读" : "Continue reading"}>
      <span className="fieldbook-folio">{locale === "zh" ? "下一篇" : "UP NEXT"}</span>
      <TransitionLink href={nextEntry?.href ?? bookDirectoryHref}><span><strong>{nextEntry ? nextEntry.title[locale] : (locale === "zh" ? "回到《场域手记》" : "Back to Field Notes")}</strong>{nextEntry && <small>{nextEntry.summary[locale]}</small>}</span><ArrowRight size={18} aria-hidden="true" /></TransitionLink>
    </nav>
  </article>;

  return <div className="fieldbook-scene fieldbook-reader-scene relative isolate mx-auto max-w-[90rem] px-4 pb-24 pt-8 sm:px-8 sm:pt-14 lg:px-12" data-motion={motionEnabled ? "on" : "off"}>
    <div className="fieldbook-ambient" aria-hidden="true"><span /><span /><span /></div>
    <div className="fieldbook-reader-toolbar relative z-10">
      <TransitionLink className="fieldbook-back" href={bookDirectoryHref}><ArrowLeft size={17} aria-hidden="true" />{locale === "zh" ? "场域手记" : "Field Notes"}</TransitionLink>
      <div className="fieldbook-reader-actions">
        {mode === "pages" && <div className="fieldbook-reader-page-nav">
          <button type="button" disabled={spread === 0 || Boolean(direction)} onClick={() => turn(-1)} aria-label={locale === "zh" ? "上一页" : "Previous page"}><ArrowLeft size={17} aria-hidden="true" /><span>{locale === "zh" ? "上一页" : "Previous"}</span></button>
          <span aria-live="polite">{String(spread + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {String(spreadCount).padStart(2, "0")}</span>
          <button type="button" disabled={spread >= spreadCount - 1 || Boolean(direction)} onClick={() => turn(1)} aria-label={locale === "zh" ? "下一页" : "Next page"}><span>{locale === "zh" ? "下一页" : "Next"}</span><ArrowRight size={17} aria-hidden="true" /></button>
        </div>}
        <div className="fieldbook-mode-toggle" role="group" aria-label={locale === "zh" ? "阅读方式" : "Reading mode"}>
          <button type="button" aria-pressed={mode === "scroll"} onClick={() => switchMode("scroll")} title={locale === "zh" ? "连续下滑" : "Scroll mode"}><ScrollText size={16} aria-hidden="true" /><span>{locale === "zh" ? "下滑" : "Scroll"}</span></button>
          <button type="button" aria-pressed={mode === "pages"} onClick={() => switchMode("pages")} title={locale === "zh" ? "翻页阅读" : "Page mode"}><BookOpen size={16} aria-hidden="true" /><span>{locale === "zh" ? "翻页" : "Pages"}</span></button>
        </div>
        <button ref={contentsButtonRef} type="button" className="fieldbook-reader-contents" onClick={() => { setDrawerChapter(entry.kind); setDrawerOpen(true); }}><List size={16} aria-hidden="true" /><span>{locale === "zh" ? "目录" : "Contents"}</span></button>
      </div>
    </div>

    <div className="fieldbook-reader relative z-10" data-mode={mode} onKeyDown={onKeyDown} tabIndex={0} aria-label={locale === "zh" ? "场域手记阅读器" : "Field Notes reader"}>
      <div className="fieldbook-reader-topline"><span>NEXTFIELD / FIELD NOTES</span><span>{entry.kind === "writing" ? "I" : "II"} — {categoryLabel}</span></div>
      {mode === "pages" ? <>
        <div className="fieldbook-reading-viewport" ref={viewportRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="fieldbook-reading-flow" ref={flowRef} style={{ columnWidth, columnGap: gutter }}>{content}</div>
          {direction && <span className={`fieldbook-turn-layer fieldbook-turn-layer--${direction}`} aria-hidden="true" />}
        </div>
      </> : <div className="fieldbook-scroll-pane" ref={scrollRef}>{content}</div>}
    </div>

    {drawerOpen && <div className="fieldbook-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDrawerOpen(false); }}>
      <aside ref={drawerRef} className="fieldbook-drawer" role="dialog" aria-modal="true" aria-label={locale === "zh" ? "场域手记目录" : "Field Notes contents"}>
        <div className="fieldbook-drawer-header"><div><p className="fieldbook-kicker">FIELD NOTES / INDEX</p><h2>{locale === "zh" ? "目录" : "Contents"}</h2></div><button ref={closeButtonRef} type="button" aria-label={locale === "zh" ? "关闭目录" : "Close contents"} onClick={() => { setDrawerOpen(false); contentsButtonRef.current?.focus(); }}><X size={20} /></button></div>
        <div className="fieldbook-chapter-tabs" role="tablist" aria-label={locale === "zh" ? "目录篇章" : "Contents chapters"}>
          <button type="button" role="tab" aria-selected={drawerChapter === "writing"} onClick={() => setDrawerChapter("writing")}>{locale === "zh" ? "写作" : "Writing"}</button>
          <button type="button" role="tab" aria-selected={drawerChapter === "essay"} onClick={() => setDrawerChapter("essay")}>{locale === "zh" ? "随笔" : "Essays"}</button>
        </div>
        <label className="fieldbook-search"><Search size={17} aria-hidden="true" /><span className="sr-only">{locale === "zh" ? "搜索目录" : "Search contents"}</span><input type="search" value={drawerQuery} onChange={(event) => setDrawerQuery(event.target.value)} placeholder={locale === "zh" ? "搜索标题和主题" : "Search titles and topics"} /></label>
        <div className="fieldbook-drawer-list">{filteredEntries.map((item) => <TransitionLink className={`fieldbook-drawer-entry ${item.href === entry.href ? "fieldbook-drawer-entry--active" : ""}`} key={item.href} href={item.href}><span>{item.title[locale]}</span><small>{item.date} · {item.category}</small></TransitionLink>)}</div>
        <TransitionLink className="fieldbook-drawer-index" href="/blog">{locale === "zh" ? "返回封面与完整目录" : "Back to cover and full index"}<ArrowRight size={17} /></TransitionLink>
      </aside>
    </div>}
  </div>;
}
