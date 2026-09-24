"use client";

import { useEffect, useMemo, useState } from "react";
import { activeLineIndex, lyricsPathFor, parseLrc, type LyricLine } from "@/lib/lrc";
import {
  RADIO_STATE_REQUEST_EVENT,
  RADIO_TIME_EVENT,
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
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [currentTime, setCurrentTime] = useState(0);
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
      .then((response) => response.ok ? response.text() : Promise.reject(new Error(String(response.status))))
      .then((text) => {
        setLines(parseLrc(text));
        setStatus("ready");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLines([]);
        setStatus("missing");
      });
    return () => controller.abort();
  }, [lyricsPath]);

  const active = useMemo(() => activeLineIndex(lines, currentTime), [lines, currentTime]);
  const shown = active < 0 ? 0 : active;
  const currentLine = lines[shown];
  const previousLine = shown > 0 ? lines[shown - 1] : null;
  const nextLine = lines[shown + 1];

  return (
    <div className="relative flex min-w-0 flex-col justify-center border-t border-liquid-foam/20 pt-6 lg:col-start-1 lg:row-start-2 lg:border-t-0 lg:pt-0 xl:col-start-2 xl:row-start-1 xl:min-h-52 xl:border-l xl:border-liquid-foam/20 xl:pl-8">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-liquid-foam/70">
        <span className="h-px w-5 bg-liquid-foam/60" aria-hidden="true" />
        {locale === "zh" ? "同步歌词" : "LIVE LYRICS"}
      </div>
      <div className="mt-5 flex min-h-32 flex-col justify-center gap-3" aria-live="off">
        {status === "loading" ? (
          <p className="text-sm text-paper/50">{locale === "zh" ? "正在读取歌词…" : "Loading lyrics…"}</p>
        ) : status === "missing" || lines.length === 0 ? (
          <p className="text-sm leading-7 text-paper/50">
            {locale === "zh" ? "歌词仍在整理，先让旋律说话。" : "Lyrics are on their way. Let the music speak for now."}
          </p>
        ) : (
          <>
            <p className="min-h-5 truncate text-xs leading-5 text-paper/35">{previousLine?.text ?? "\u00a0"}</p>
            <p key={`${index}-${shown}`} className="line-clamp-3 text-balance font-display text-xl leading-snug text-liquid-foam sm:text-2xl">
              {currentLine?.text}
            </p>
            <p className="line-clamp-2 min-h-5 text-xs leading-5 text-paper/45">{nextLine?.text ?? "\u00a0"}</p>
          </>
        )}
      </div>
      <p className="mt-4 font-mono text-[10px] tracking-[0.12em] text-paper/35">
        {locale === "zh" ? "随播放进度更新" : "SYNCED TO PLAYBACK"}
      </p>
    </div>
  );
}
