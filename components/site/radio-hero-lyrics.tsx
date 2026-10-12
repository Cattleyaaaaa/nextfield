"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  activeLineIndex,
  lyricsPathFor,
  parseLrc,
  type LyricLine,
} from "@/lib/lrc";
import {
  RADIO_COMMAND_EVENT,
  RADIO_STATE_REQUEST_EVENT,
  RADIO_TIME_EVENT,
  type RadioCommand,
  type RadioTimeSignal,
} from "@/lib/radio-signal";
import { useLanguage } from "@/components/site/language-provider";

type RadioHeroLyricsProps = {
  index: number;
  src?: string;
  lyrics?: string;
};

/** 电台主视觉里的精简歌词窗，跟悬浮歌词共用 LRC 时间轴。 */
export function RadioHeroLyrics({ index, src, lyrics }: RadioHeroLyricsProps) {
  const { locale } = useLanguage();
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [currentTime, setCurrentTime] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const lyricsPath = lyrics ?? lyricsPathFor(src);

  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent<RadioTimeSignal>).detail;
      if (detail?.index === index) setCurrentTime(detail.current);
    };
    window.addEventListener(RADIO_TIME_EVENT, update);
    window.dispatchEvent(new Event(RADIO_STATE_REQUEST_EVENT));
    return () => window.removeEventListener(RADIO_TIME_EVENT, update);
  }, [index]);

  useEffect(() => {
    if (!lyricsPath) {
      setLines([]);
      setStatus("missing");
      return;
    }

    const controller = new AbortController();
    setLines([]);
    setStatus("loading");
    fetch(lyricsPath, { signal: controller.signal })
      .then((response) =>
        response.ok
          ? response.text()
          : Promise.reject(new Error(String(response.status))),
      )
      .then((text) => {
        setLines(parseLrc(text));
        setStatus("ready");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setLines([]);
        setStatus("missing");
      });
    return () => controller.abort();
  }, [lyricsPath]);

  const active = useMemo(
    () => activeLineIndex(lines, currentTime),
    [lines, currentTime],
  );
  const shown = active < 0 ? 0 : active;

  useEffect(() => {
    const list = listRef.current;
    const line = list?.querySelector<HTMLElement>("[data-active-lyric]");
    if (!list || !line) return;
    list.scrollTo({
      top: line.offsetTop - list.clientHeight * 0.42,
      behavior: "smooth",
    });
  }, [shown, status]);

  return (
    <div className="relative mt-7 flex min-h-0 flex-1 flex-col border-t border-line pt-5">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        <span className="h-px w-5 bg-accent/60" aria-hidden="true" />
        {locale === "zh" ? "点击歌词可跳转" : "CLICK A LINE TO SEEK"}
      </div>
      <div
        ref={listRef}
        className="relative mt-5 min-h-[210px] flex-1 overflow-y-auto pr-2 [scrollbar-color:rgb(var(--liquid-mid)/0.3)_transparent] [scrollbar-width:thin] lg:max-h-[480px]"
        aria-live="off"
      >
        {status === "loading" ? (
          <p className="text-sm text-muted">
            {locale === "zh" ? "正在读取歌词…" : "Loading lyrics…"}
          </p>
        ) : status === "missing" || lines.length === 0 ? (
          <p className="text-sm leading-7 text-muted">
            {locale === "zh"
              ? "歌词仍在整理，先让旋律说话。"
              : "Lyrics are on their way. Let the music speak for now."}
          </p>
        ) : (
          <div className="space-y-5 py-20">
            {lines.map((line, lineIndex) => (
              <button
                aria-current={lineIndex === shown ? "true" : undefined}
                className={`block w-full text-left leading-relaxed transition-all duration-300 ${lineIndex === shown ? "font-display text-xl font-medium text-accent sm:text-2xl" : "text-sm text-muted/70 hover:text-ink"}`}
                data-active-lyric={lineIndex === shown ? "" : undefined}
                key={`${line.time}-${lineIndex}`}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent<RadioCommand>(RADIO_COMMAND_EVENT, {
                      detail: { action: "seek", time: line.time },
                    }),
                  )
                }
                type="button"
              >
                {line.text || "♪"}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-4 border-t border-line pt-4 font-mono text-[10px] tracking-[0.12em] text-muted">
        {locale === "zh" ? "歌词随播放进度更新" : "SYNCED TO PLAYBACK"}
      </p>
    </div>
  );
}
