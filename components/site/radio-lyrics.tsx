"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Disc3, Pin, Radio, X } from "lucide-react";
import { activeLineIndex, parseLrc, type LyricLine } from "@/lib/lrc";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { useLanguage } from "@/components/site/language-provider";
import { RadioDisc } from "@/components/site/radio-disc";

type LyricsState = "loading" | "ready" | "missing";
type Position = { x: number; y: number };

const POSITION_KEY = "nextfield-radio-lyrics-pos";
const EDGE = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** 尺寸未知时用设计宽度的兜底值，宁可保守也别让卡片跑出屏幕抓不回来 */
function clampToViewport(
  position: Position,
  size?: { width: number; height: number },
): Position {
  const width = size?.width ?? 384;
  const height = size?.height ?? 250;
  return {
    x: clamp(
      position.x,
      EDGE,
      Math.max(EDGE, window.innerWidth - width - EDGE),
    ),
    y: clamp(
      position.y,
      EDGE,
      Math.max(EDGE, window.innerHeight - height - EDGE),
    ),
  };
}

function readStoredPosition(): Position | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Position>;
    if (
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number" ||
      !Number.isFinite(parsed.x) ||
      !Number.isFinite(parsed.y)
    )
      return null;
    return clampToViewport({ x: parsed.x, y: parsed.y });
  } catch {
    return null;
  }
}

type RadioLyricsProps = {
  className?: string;
  title: string;
  artist?: string;
  cover?: string;
  playing: boolean;
  lyricsPath: string | null;
  currentTime: number;
  duration: number;
  onClose: () => void;
  onSeek: (time: number) => void;
};

/**
 * 悬浮歌词窗：永远 fixed 定位——没拖过时自动停靠在播放器正上方（按播放器实际高度算），
 * 标题栏可以拖到任意位置（存 localStorage），点任意一行跳到那一段。
 */
export function RadioLyrics({
  className,
  title,
  artist,
  cover,
  playing,
  lyricsPath,
  currentTime,
  duration,
  onClose,
  onSeek,
}: RadioLyricsProps) {
  const { locale } = useLanguage();
  const zh = locale === "zh";
  const reducedMotion = useMotionPreference();
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [state, setState] = useState<LyricsState>("loading");
  /** 访客拖出来的位置。null = 停靠模式，用 docked 自动计算。 */
  const [stored, setStored] = useState<Position | null>(() =>
    readStoredPosition(),
  );
  const [docked, setDocked] = useState<Position | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);
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
      .then((response) =>
        response.ok
          ? response.text()
          : Promise.reject(new Error(String(response.status))),
      )
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

  const active = useMemo(
    () => activeLineIndex(lines, currentTime),
    [lines, currentTime],
  );
  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  useEffect(() => {
    const box = boxRef.current;
    const row = activeRef.current;
    if (!box || !row) return;
    box.scrollTo({
      top: row.offsetTop - box.clientHeight / 2 + row.clientHeight / 2,
      behavior: reducedMotion ? "auto" : "smooth",
    });
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
          {
            x: parentRect.right - card.offsetWidth,
            y: parentRect.top - card.offsetHeight - 8,
          },
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
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: rect.left,
      baseY: rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const card = cardRef.current;
    if (!drag || !card) return;
    const next = clampToViewport(
      {
        x: drag.baseX + (event.clientX - drag.startX),
        y: drag.baseY + (event.clientY - drag.startY),
      },
      { width: card.offsetWidth, height: card.offsetHeight },
    );
    dragEndPosRef.current = next;
    setStored(next);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (dragEndPosRef.current)
      window.localStorage.setItem(
        POSITION_KEY,
        JSON.stringify(dragEndPosRef.current),
      );
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
      className={`pointer-events-auto w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[1.65rem] border border-line/80 bg-panel/95 text-ink shadow-[0_28px_90px_rgba(4,22,28,0.25)] backdrop-blur-2xl ${className ?? ""}`}
      ref={cardRef}
      style={{
        position: "fixed",
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        visibility: position ? undefined : "hidden",
      }}
    >
      <div
        className="relative flex cursor-grab touch-none select-none items-center justify-between gap-3 border-b border-line/70 px-4 py-3 active:cursor-grabbing"
        onPointerCancel={endDrag}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
        />
        <span className="flex min-w-0 items-center gap-3">
          {cover ? (
            <RadioDisc
              artist={artist}
              className="size-10"
              cover={cover}
              playing={playing}
              title={title}
            />
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-accent/20 bg-accent/5 text-accent">
              <Disc3 className="size-4" />
            </span>
          )}
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-accent">
              <Radio className="size-3" />{" "}
              {zh ? "场域电台 · 同步歌词" : "FIELD RADIO · LIVE LYRICS"}
            </span>
            <span className="mt-1 block truncate text-[11px] font-medium text-ink/75">
              {title}
              {artist ? ` · ${artist}` : ""}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {stored ? (
            <button
              aria-label={zh ? "停靠回播放器上方" : "Dock above the player"}
              title={zh ? "停靠回播放器上方" : "Dock above the player"}
              className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-accent/10 hover:text-accent"
              onClick={dock}
              type="button"
            >
              <Pin className="size-3.5" />
            </button>
          ) : null}
          <button
            aria-label={zh ? "收起歌词" : "Close lyrics"}
            title={zh ? "收起歌词" : "Close lyrics"}
            className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-accent/10 hover:text-accent"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </span>
      </div>

      <div
        className="radio-lyrics-scroll relative h-40 overflow-y-auto px-5 py-4"
        ref={boxRef}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgb(var(--accent)/0.07),transparent_68%)]"
        />
        {state === "loading" ? (
          <p className="relative grid h-full place-items-center text-center text-xs text-muted">
            {zh ? "正在读取歌词…" : "Loading lyrics…"}
          </p>
        ) : null}
        {state === "missing" ? (
          <p className="relative grid h-full place-items-center text-center text-xs leading-6 text-muted">
            {zh
              ? "这首歌曲暂时没有歌词"
              : "Lyrics are not available for this track yet"}
          </p>
        ) : null}
        {state === "ready" && lines.length === 0 ? (
          <p className="relative grid h-full place-items-center text-center text-xs leading-6 text-muted">
            {zh
              ? "歌词文件里没有可显示的内容"
              : "No readable lines in this lyric file"}
          </p>
        ) : null}
        {state === "ready" && lines.length > 0 ? (
          <ul className="relative space-y-3.5 py-5">
            {lines.map((line, index) => {
              const isActive = index === active;
              return (
                <li key={`${line.time}-${index}`}>
                  <button
                    className={`block w-full text-center leading-6 transition-[color,opacity,transform,font-size] duration-500 ${isActive ? "scale-[1.02] text-[15px] font-semibold text-accent" : "text-[12px] text-muted/65 hover:text-ink/75"}`}
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
      <div className="h-1 bg-line/45" aria-hidden="true">
        <span
          className="block h-full bg-accent/80 transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between px-4 py-2 font-mono text-[9px] tracking-[0.08em] text-muted">
        <span>
          {zh
            ? "点击歌词跳转 · 拖动标题栏移动"
            : "CLICK TO SEEK · DRAG HEADER TO MOVE"}
        </span>
        <span>{formatTime(currentTime)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
