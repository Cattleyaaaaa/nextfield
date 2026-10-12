"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Search, X } from "lucide-react";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { TransitionLink } from "@/components/site/transition-link";
import type { FieldBookEntry } from "@/types/field-book";

type Chapter = "writing" | "essay";
const TOPICS = ["技术", "工程", "产品", "Agent", "前端", "交互", "设计", "哲学"];
const TOPIC_EN: Record<string, string> = {
  技术: "Technology", 工程: "Engineering", 产品: "Product", Agent: "Agent",
  前端: "Frontend", 交互: "Interaction", 设计: "Design", 哲学: "Philosophy",
};

export function FieldNotesBook({ entries }: { entries: FieldBookEntry[] }) {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const [stage, setStage] = useState<"cover" | "opening" | "open" | "closing">("cover");
  const [chapter, setChapter] = useState<Chapter>("writing");
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const firstTabRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("chapter") === "essays") {
      setChapter("essay");
      setStage("open");
    }
    const updateSize = () => setPageSize(window.innerWidth < 768 ? 5 : 8);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const writingCount = entries.filter((entry) => entry.kind === "writing").length;
  const essayCount = entries.length - writingCount;
  const topics = useMemo(() => {
    const available = [...new Set(entries.filter((entry) => entry.kind === "writing").map((entry) => entry.category))];
    return [...TOPICS.filter((item) => available.includes(item)), ...available.filter((item) => !TOPICS.includes(item))];
  }, [entries]);
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return entries.filter((entry) => entry.kind === chapter &&
      (chapter === "essay" || topic === "all" || entry.category === topic) &&
      (!term || `${entry.title.zh} ${entry.title.en} ${entry.summary.zh} ${entry.summary.en} ${entry.category} ${TOPIC_EN[entry.category] ?? ""}`.toLocaleLowerCase().includes(term)));
  }, [entries, chapter, topic, query]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageEntries = visible.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const renderEntry = (entry: FieldBookEntry, index: number) => <TransitionLink className="fieldbook-entry fieldbook-entry-card" href={entry.href} key={entry.href}>
    <span className="fieldbook-entry-number">{String(currentPage * pageSize + index + 1).padStart(2, "0")}</span>
    <span className="fieldbook-entry-copy"><strong>{entry.title[locale]}</strong><small>{entry.date} <span aria-hidden="true">/</span> {entry.minutes[locale]} {locale === "zh" ? "分钟" : "min"}</small>{entry.kind === "writing" && Boolean(entry.tags?.[locale].length) && <span className="fieldbook-entry-tags" aria-label={locale === "zh" ? "文章标签" : "Article tags"}>{entry.tags?.[locale].map((tag) => <span key={tag}>{tag}</span>)}</span>}<span className="fieldbook-entry-summary">{entry.summary[locale]}</span></span>
    <ArrowRight size={16} aria-hidden="true" />
  </TransitionLink>;

  const openBook = () => {
    if (stage !== "cover") return;
    if (!motionEnabled) {
      setStage("open");
      requestAnimationFrame(() => firstTabRef.current?.focus());
      return;
    }
    setStage("opening");
    timerRef.current = setTimeout(() => {
      setStage("open");
      requestAnimationFrame(() => firstTabRef.current?.focus());
    }, 820);
  };
  const closeBook = () => {
    if (stage !== "open") return;
    if (!motionEnabled) {
      setStage("cover");
      setPage(0);
      return;
    }
    setStage("closing");
    timerRef.current = setTimeout(() => {
      setStage("cover");
      setPage(0);
    }, 720);
  };
  const setActiveChapter = (next: Chapter) => {
    setChapter(next);
    setTopic("all");
    setQuery("");
    setPage(0);
  };

  return (
    <div className="fieldbook-scene relative isolate mx-auto max-w-[90rem] px-4 pb-24 pt-12 sm:px-8 sm:pt-20 lg:px-12" data-motion={motionEnabled ? "on" : "off"}>
      <div className="fieldbook-ambient" aria-hidden="true"><span /><span /><span /></div>
      <div className="relative z-10 mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-12">
        <div>
          <p className="fieldbook-kicker">NEXTFIELD / FIELD NOTES / VOL. 01</p>
          <h1 className="mt-3 font-display text-3xl tracking-[-0.05em] sm:text-5xl">{locale === "zh" ? "场域手记" : "Field Notes"}</h1>
        </div>
        <p className="max-w-xs text-sm leading-6 text-muted">{locale === "zh"
          ? `写作 ${writingCount} 篇 · 随笔 ${essayCount} 篇。一本持续写下去的书。`
          : `${writingCount} articles · ${essayCount} essays. A book still being written.`}</p>
      </div>

      <div className={`fieldbook-canvas relative z-10 ${stage === "cover" ? "fieldbook-canvas--cover" : "fieldbook-canvas--open"}`}>
        {stage !== "cover" && <div className={`fieldbook-directory ${stage === "opening" ? "fieldbook-directory--entering" : ""} ${stage === "closing" ? "fieldbook-directory--closing" : ""}`}>
          <div className="fieldbook-toolbar">
            <div className="fieldbook-chapter-tabs" role="tablist" aria-label={locale === "zh" ? "书的篇章" : "Book chapters"}>
              <button ref={firstTabRef} type="button" role="tab" aria-selected={chapter === "writing"} onClick={() => setActiveChapter("writing")}>
                <span className="fieldbook-tab-number">01</span><span className="fieldbook-tab-label">{locale === "zh" ? "写作" : "Writing"}</span><span className="fieldbook-tab-count">{String(writingCount).padStart(2, "0")}</span>
              </button>
              <button type="button" role="tab" aria-selected={chapter === "essay"} onClick={() => setActiveChapter("essay")}>
                <span className="fieldbook-tab-number">02</span><span className="fieldbook-tab-label">{locale === "zh" ? "随笔" : "Essays"}</span><span className="fieldbook-tab-count">{String(essayCount).padStart(2, "0")}</span>
              </button>
            </div>
            <div className="fieldbook-toolbar-end">
              <label className="fieldbook-search fieldbook-search--toolbar">
                <Search size={16} aria-hidden="true" />
                <span className="sr-only">{locale === "zh" ? "搜索手记" : "Search field notes"}</span>
                <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder={locale === "zh" ? "搜索文章" : "Search entries"} />
                {query && <button type="button" aria-label={locale === "zh" ? "清除搜索" : "Clear search"} onClick={() => { setQuery(""); setPage(0); }}><X size={15} /></button>}
              </label>
              <button className="fieldbook-quiet-button" type="button" onClick={closeBook} disabled={stage !== "open"}>
                <BookOpen size={16} aria-hidden="true" />{locale === "zh" ? "合上书" : "Close book"}
              </button>
            </div>
          </div>
          <div className="fieldbook-spread fieldbook-digital-spread" key={chapter}>
            <header className="fieldbook-directory-hero">
              <p className="fieldbook-folio">FIELD NOTES <span>/</span> {chapter === "writing" ? "01 — WRITING" : "02 — ESSAYS"}</p>
              <h2>{chapter === "writing" ? (locale === "zh" ? "写作" : "Writing") : (locale === "zh" ? "随笔" : "Essays")}</h2>
              <p>{chapter === "writing"
                ? (locale === "zh" ? "关于技术、产品与建造过程的长期记录。" : "Notes on technology, product and the work of making.")
                : (locale === "zh" ? "日常中的片刻、感受与未完成的想法。" : "Passing moments, observations and unfinished thoughts.")}</p>
            </header>
            {chapter === "writing" && <div className="fieldbook-topics" aria-label={locale === "zh" ? "按主题筛选" : "Filter by topic"}>
              <button type="button" aria-pressed={topic === "all"} onClick={() => { setTopic("all"); setPage(0); }}>{locale === "zh" ? "全部" : "All"}</button>
              {topics.map((item) => <button type="button" aria-pressed={topic === item} key={item} onClick={() => { setTopic(item); setPage(0); }}>{locale === "zh" ? item : TOPIC_EN[item] ?? item}</button>)}
            </div>}
            <div className="fieldbook-directory-heading"><span>{locale === "zh" ? "本章文章" : "IN THIS CHAPTER"}</span><span>{String(visible.length).padStart(2, "0")} / {String(currentPage + 1).padStart(2, "0")}</span></div>
            <div className="fieldbook-entry-grid">
              {pageEntries.length ? pageEntries.map(renderEntry) : <p className="fieldbook-empty">{locale === "zh" ? "没有找到相关内容，试试其他主题或关键词。" : "No matching entries. Try another subject or keyword."}</p>}
            </div>
            <div className="fieldbook-directory-pagination">
              <span>{chapter === "writing" ? "I" : "II"} <span aria-hidden="true">/</span> {String(currentPage + 1).padStart(2, "0")} OF {String(pageCount).padStart(2, "0")}</span>
              <div>
                <button type="button" aria-label={locale === "zh" ? "上一页目录" : "Previous contents page"} disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}><ArrowLeft size={17} /></button>
                <button type="button" aria-label={locale === "zh" ? "下一页目录" : "Next contents page"} disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}><ArrowRight size={17} /></button>
              </div>
            </div>
          </div>
        </div>}

        {stage !== "open" && <button className={`fieldbook-cover ${stage === "opening" ? "fieldbook-cover--opening" : ""} ${stage === "closing" ? "fieldbook-cover--closing" : ""}`} type="button" onClick={openBook} disabled={stage !== "cover"} aria-label={locale === "zh" ? "打开《场域手记》" : "Open Field Notes"}>
          <span className="fieldbook-cover-spine" aria-hidden="true" />
          <span className="fieldbook-cover-grid" aria-hidden="true" />
          <span className="fieldbook-cover-art" aria-hidden="true">
            <span className="fieldbook-cover-art-number">01</span>
            <span className="fieldbook-cover-signal">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</span>
          </span>
          <span className="fieldbook-cover-content">
            <span className="fieldbook-cover-top"><span className="fieldbook-cover-overline">NEXTFIELD / FIELD NOTES</span><span className="fieldbook-cover-volume">VOL. 01</span></span>
            <span className="fieldbook-cover-headline">
              <span className="fieldbook-cover-eyebrow">{locale === "zh" ? "写作与随笔的开放档案" : "AN OPEN ARCHIVE OF WRITING"}</span>
              <span className="fieldbook-cover-title">{locale === "zh" ? <>场域<br />手记</> : <>FIELD<br />NOTES</>}</span>
              <span className="fieldbook-cover-caption">{locale === "zh" ? "记录建造、观察，以及那些还没有定论的想法。" : "Notes on making, noticing, and ideas still taking shape."}</span>
            </span>
            <span className="fieldbook-cover-bottom"><span>{locale === "zh" ? `${writingCount} 篇写作 / ${essayCount} 篇随笔` : `${writingCount} ARTICLES / ${essayCount} ESSAYS`}</span><span className="fieldbook-cover-open-label">{locale === "zh" ? "打开阅读" : "OPEN TO READ"}<ArrowRight size={15} aria-hidden="true" /></span></span>
          </span>
        </button>}
      </div>
      <p className="relative z-10 mt-8 text-center font-mono text-[10px] tracking-[0.18em] text-muted">{stage === "cover" ? (locale === "zh" ? "点击封面，进入这本仍在写的书" : "OPEN THE COVER TO ENTER") : (locale === "zh" ? "选一篇手记，继续翻阅" : "CHOOSE AN ENTRY TO BEGIN READING")}</p>
    </div>
  );
}
