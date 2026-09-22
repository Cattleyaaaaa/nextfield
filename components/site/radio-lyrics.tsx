"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { activeLineIndex, parseLrc, type LyricLine } from "@/lib/lrc";
import { useMotionPreference } from "@/lib/use-motion-preference";

type LyricsState = "loading" | "ready" | "missing";

type RadioLyricsProps = {
  className?: string;
  title: string;
  lyricsPath: string | null;
  currentTime: number;
  onClose: () => void;
  onSeek: (time: number) => void;
};

/** 悬浮歌词窗：点任意一行可以跳到那一段。行高不一致也不影响定位，靠 offsetTop 算。 */
export function RadioLyrics({ className, title, lyricsPath, currentTime, onClose, onSeek }: RadioLyricsProps) {
  const reducedMotion = useMotionPreference();
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [state, setState] = useState<LyricsState>("loading");
  const boxRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!lyricsPath) {
      setLines([]);
      setState("missing");
      return;
    }

    let cancelled = false;
    setState("loading");
    setLines([]);

    fetch(lyricsPath)
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error(String(response.status)))))
      .then((text) => {
        if (cancelled) return;
        setLines(parseLrc(text));
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setLines([]);
        setState("missing");
      });

    return () => {
      cancelled = true;
    };
  }, [lyricsPath]);

  const active = useMemo(() => activeLineIndex(lines, currentTime), [lines, currentTime]);

  useEffect(() => {
    const box = boxRef.current;
    const row = activeRef.current;
    if (!box || !row) return;
    box.scrollTo({ top: row.offsetTop - box.clientHeight / 2 + row.clientHeight / 2, behavior: reducedMotion ? "auto" : "smooth" });
  }, [active, state, reducedMotion]);

  return (
    <div className={`overflow-hidden rounded-[1.5rem] border border-paper/15 bg-ink/95 text-paper shadow-[0_24px_80px_rgb(0_0_0/0.3)] backdrop-blur-xl ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3 border-b border-paper/10 px-4 py-2.5">
        <span className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-liquid-foam">{title}</span>
        <button aria-label="收起歌词" className="shrink-0 rounded-full p-1 text-paper/55 hover:bg-paper/10 hover:text-paper" onClick={onClose} type="button"><X className="size-3.5" /></button>
      </div>

      {/* relative 不能省：offsetTop 是相对最近的定位祖先算的，少了它当前行会偏到顶部 */}
      <div className="radio-lyrics-scroll relative h-36 overflow-y-auto px-4 py-3" ref={boxRef}>
        {state === "loading" ? <p className="text-xs leading-5 text-paper/50">正在读取歌词…</p> : null}
        {state === "missing" ? <p className="text-xs leading-5 text-paper/50">这首没有歌词。把同名的 .lrc 放进 public/lyrics/ 就会出现。</p> : null}
        {state === "ready" && lines.length === 0 ? <p className="text-xs leading-5 text-paper/50">这个 .lrc 里没有可显示的行。</p> : null}
        {state === "ready" && lines.length > 0 ? (
          <ul className="space-y-2.5">
            {lines.map((line, index) => {
              const isActive = index === active;
              return (
                <li key={`${line.time}-${index}`}>
                  <button
                    className={`block w-full text-left text-[13px] leading-6 transition-colors duration-300 ${isActive ? "font-medium text-liquid-foam" : "text-paper/40 hover:text-paper/70"}`}
                    onClick={() => onSeek(line.time)}
                    ref={isActive ? activeRef : undefined}
                    type="button"
                  >
                    {line.text}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
