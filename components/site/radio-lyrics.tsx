"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pin, X } from "lucide-react";
import { activeLineIndex, parseLrc, type LyricLine } from "@/lib/lrc";
import { useMotionPreference } from "@/lib/use-motion-preference";

type LyricsState = "loading" | "ready" | "missing";
type Position = { x: number; y: number };

const POSITION_KEY = "nextfield-radio-lyrics-pos";
const EDGE = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** 尺寸未知时用设计宽度的兜底值，宁可保守也别让卡片跑出屏幕抓不回来 */
function clampToViewport(position: Position, size?: { width: number; height: number }): Position {
  const width = size?.width ?? 352;
  const height = size?.height ?? 210;
  return {
    x: clamp(position.x, EDGE, Math.max(EDGE, window.innerWidth - width - EDGE)),
    y: clamp(position.y, EDGE, Math.max(EDGE, window.innerHeight - height - EDGE)),
  };
}

function readStoredPosition(): Position | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Position>;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number" || !Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return null;
    return clampToViewport({ x: parsed.x, y: parsed.y });
  } catch {
    return null;
  }
}

type RadioLyricsProps = {
  className?: string;
  title: string;
  lyricsPath: string | null;
  currentTime: number;
  onClose: () => void;
  onSeek: (time: number) => void;
};

/**
 * 悬浮歌词窗：永远 fixed 定位——没拖过时自动停靠在播放器正上方（按播放器实际高度算），
 * 标题栏可以拖到任意位置（存 localStorage），点任意一行跳到那一段。
 */
export function RadioLyrics({ className, title, lyricsPath, currentTime, onClose, onSeek }: RadioLyricsProps) {
  const reducedMotion = useMotionPreference();
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [state, setState] = useState<LyricsState>("loading");
  /** 访客拖出来的位置。null = 停靠模式，用 docked 自动计算。 */
  const [stored, setStored] = useState<Position | null>(() => readStoredPosition());
  const [docked, setDocked] = useState<Position | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const dragEndPosRef = useRef<Position | null>(null);

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

  // 停靠点 = 播放器（父容器）正上方。用 ResizeObserver 盯父容器：面板开合、窗口缩放都会重算。
  // 卡片必须永远 fixed：放在 aside 的 flex 列里时，面板一展开就会把它顶出屏幕外（实测 top:-60）。
  const cardRefForObserver = cardRef;
  const parentRefForObserver = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (stored) return;
    const card = cardRefForObserver.current;
    const parent = card?.parentElement ?? null;
    parentRefForObserver.current = parent;
    if (!card || !parent) return;

    const recompute = () => {
      // 用播放器自身的矩形对齐：右边缘对齐播放器的右边缘（而不是猜一个固定的 24px，
      // 移动端是 right-4、sm 以上是 right-6，写死就会差 8px），上边缘留出容器 gap-2 的间距。
      const parentRect = parent.getBoundingClientRect();
      setDocked(
        clampToViewport(
          { x: parentRect.right - card.offsetWidth, y: parentRect.top - card.offsetHeight - 8 },
          { width: card.offsetWidth, height: card.offsetHeight },
        ),
      );
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(parent);
    // 卡片自己也在被观察：歌词加载完成、换曲目导致高度变化时停靠点跟着走。
    observer.observe(card);
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [stored, cardRefForObserver]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    // 关闭/停靠按钮不当作拖拽把手
    if ((event.target as HTMLElement).closest("button")) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    dragRef.current = { startX: event.clientX, startY: event.clientY, baseX: rect.left, baseY: rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const card = cardRef.current;
    if (!drag || !card) return;
    const next = clampToViewport(
      { x: drag.baseX + (event.clientX - drag.startX), y: drag.baseY + (event.clientY - drag.startY) },
      { width: card.offsetWidth, height: card.offsetHeight },
    );
    dragEndPosRef.current = next;
    setStored(next);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (dragEndPosRef.current) window.localStorage.setItem(POSITION_KEY, JSON.stringify(dragEndPosRef.current));
  };

  const dock = () => {
    dragRef.current = null;
    dragEndPosRef.current = null;
    setStored(null);
    window.localStorage.removeItem(POSITION_KEY);
  };

  const position = stored ?? docked;

  // 第一帧还没有坐标时仍然按 fixed 渲染：留在文档流里会把父容器撑高，量出来的停靠点就错了。
  // 先 visibility 隐藏，useLayoutEffect 在绘制前量完并落位，所以看不到跳位。
  return (
    <div
      className={`pointer-events-auto w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-paper/15 bg-ink/95 text-paper shadow-[0_24px_80px_rgb(0_0_0/0.3)] backdrop-blur-xl ${className ?? ""}`}
      ref={cardRef}
      style={{
        position: "fixed",
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        visibility: position ? undefined : "hidden",
      }}
    >
      <div
        className="flex cursor-grab touch-none select-none items-center justify-between gap-3 border-b border-paper/10 px-4 py-2.5 active:cursor-grabbing"
        onPointerCancel={endDrag}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
      >
        <span className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-liquid-foam">{title}</span>
        <span className="flex shrink-0 items-center gap-1">
          {stored ? (
            <button aria-label="停靠回播放器上方" className="rounded-full p-1 text-paper/55 hover:bg-paper/10 hover:text-paper" onClick={dock} type="button"><Pin className="size-3.5" /></button>
          ) : null}
          <button aria-label="收起歌词" className="rounded-full p-1 text-paper/55 hover:bg-paper/10 hover:text-paper" onClick={onClose} type="button"><X className="size-3.5" /></button>
        </span>
      </div>

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
