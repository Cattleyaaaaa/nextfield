"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/site/language-provider";

export function LessonNotes({ lessonKey, title }: { lessonKey: string; title: string }) {
  const { locale } = useLanguage();
  const [note, setNote] = useState("");
  const [available, setAvailable] = useState(true);
  const storageKey = `field-school-note:${lessonKey}`;

  useEffect(() => {
    try { setNote(localStorage.getItem(storageKey) ?? ""); setAvailable(true); }
    catch { setNote(""); setAvailable(false); }
  }, [storageKey]);

  function update(value: string) {
    setNote(value);
    try { localStorage.setItem(storageKey, value); setAvailable(true); }
    catch { setAvailable(false); }
  }

  function download() {
    const blob = new Blob([`# ${title}\n\n${note}\n`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `field-school-${lessonKey.replace("/", "-")}.md`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="mt-8 border-t border-paper/15 pt-6">
    <label htmlFor="field-school-note" className="block text-sm text-paper">{locale === "zh" ? "写下你的方案或实验记录" : "Write your solution or experiment notes"}</label>
    <textarea id="field-school-note" maxLength={5000} rows={7} value={note} onChange={event => update(event.target.value)} placeholder={locale === "zh" ? "从你会怎样实现、如何验证开始写……" : "Start with how you would build and verify it…"} className="mt-3 w-full rounded-xl border border-paper/20 bg-paper/10 p-4 text-sm leading-7 text-paper placeholder:text-paper/40 focus:border-liquid-foam focus:outline-none" />
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-paper/55"><p role="status">{available ? (locale === "zh" ? "自动保存在当前浏览器，不会同步到账户。" : "Autosaved in this browser; it does not sync to your account.") : (locale === "zh" ? "本地保存不可用，可下载笔记。" : "Local storage is unavailable; you can download your notes.")}</p><button type="button" disabled={!note.trim()} onClick={download} className="text-liquid-foam underline disabled:opacity-40">{locale === "zh" ? "下载笔记" : "Download notes"}</button></div>
  </div>;
}
