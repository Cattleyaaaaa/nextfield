"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Disc3,
  ListMusic,
  Pause,
  Play,
  Repeat1,
  Repeat2,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { RadioDisc } from "@/components/site/radio-disc";
import { RadioPureScene } from "@/components/site/radio-pure-scene";
import { activeLineIndex, parseLrc, lyricsPathFor } from "@/lib/lrc";
import {
  RADIO_COMMAND_EVENT,
  type RadioCommand,
  type RadioPlaybackMode,
} from "@/lib/radio-signal";
import type { RadioTrack } from "@/lib/radio-data";

type RadioPureModeProps = {
  track?: RadioTrack;
  tracks: readonly RadioTrack[];
  activeIndex: number;
  onSelectTrack: (index: number) => void;
  playing: boolean;
  volume: number;
  playbackMode: RadioPlaybackMode;
  currentTime: number;
  duration: number;
  onExit: () => void;
};

function command(detail: RadioCommand) {
  window.dispatchEvent(new CustomEvent(RADIO_COMMAND_EVENT, { detail }));
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function RadioPureMode({
  track,
  tracks,
  activeIndex,
  onSelectTrack,
  playing,
  volume,
  playbackMode,
  currentTime,
  duration,
  onExit,
}: RadioPureModeProps) {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const [accent, setAccent] = useState<readonly [number, number, number]>([
    93, 164, 229,
  ]);
  const [dark, setDark] = useState(false);
  const [lines, setLines] = useState<ReturnType<typeof parseLrc>>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const rootRef = useRef<HTMLElement>(null);
  const exitingRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const scrubbingRef = useRef(false);
  const scrubTimeRef = useRef(0);
  const lyricsPath = track?.lyrics ?? lyricsPathFor(track?.src);
  const active = useMemo(
    () => activeLineIndex(lines, currentTime),
    [lines, currentTime],
  );
  const focusedIndex = Math.max(active, 0);
  const displayTime = previewTime ?? currentTime;
  const filteredTracks = useMemo(() => {
    const query = menuQuery.trim().toLocaleLowerCase();
    return tracks
      .map((item, index) => ({ item, index }))
      .filter(({ item }) =>
        !query || `${item.title} ${item.artist} ${item.note ?? ""}`.toLocaleLowerCase().includes(query),
      );
  }, [tracks, menuQuery]);

  const { contextSafe } = useGSAP(
    () => {
      if (!motionEnabled || !rootRef.current) return;
      gsap.fromTo(
        rootRef.current,
        { autoAlpha: 0, y: 16, scale: 0.99, filter: "blur(5px)" },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.48,
          ease: "power3.out",
          clearProps: "filter",
        },
      );
    },
    { scope: rootRef, dependencies: [motionEnabled], revertOnUpdate: true },
  );
  const exit = contextSafe(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    if (!motionEnabled || !rootRef.current) {
      onExit();
      return;
    }
    gsap.to(rootRef.current, {
      autoAlpha: 0,
      y: -10,
      scale: 0.995,
      filter: "blur(4px)",
      duration: 0.24,
      ease: "power2.in",
      onComplete: onExit,
    });
  });

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!track?.cover) {
      setAccent([93, 164, 229]);
      return;
    }
    let cancelled = false;
    const artwork = new Image();
    artwork.onload = () => {
      if (cancelled) return;
      const sampler = document.createElement("canvas");
      sampler.width = 24;
      sampler.height = 24;
      const context = sampler.getContext("2d");
      if (!context) return;
      context.drawImage(artwork, 0, 0, 24, 24);
      const pixels = context.getImageData(0, 0, 24, 24).data;
      let red = 0;
      let green = 0;
      let blue = 0;
      let samples = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        if (
          Math.max(r, g, b) - Math.min(r, g, b) < 22 ||
          Math.max(r, g, b) < 48
        )
          continue;
        red += r;
        green += g;
        blue += b;
        samples += 1;
      }
      if (!samples) return;
      const peak = Math.max(red, green, blue) / samples;
      const gain = Math.min(2, 205 / Math.max(1, peak));
      setAccent([
        Math.min(255, Math.round((red / samples) * gain)),
        Math.min(255, Math.round((green / samples) * gain)),
        Math.min(255, Math.round((blue / samples) * gain)),
      ]);
    };
    artwork.src = track.cover;
    return () => {
      cancelled = true;
    };
  }, [track?.cover]);

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
        const parsed = parseLrc(text);
        setLines(parsed);
        setStatus(parsed.length ? "ready" : "missing");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setLines([]);
        setStatus("missing");
      });
    return () => controller.abort();
  }, [lyricsPath]);

  useEffect(() => {
    const list = listRef.current;
    const line = list?.querySelector<HTMLElement>("[data-pure-active]");
    if (!list || !line) return;
    list.scrollTo({
      top: line.offsetTop - list.clientHeight / 2 + line.clientHeight / 2,
      behavior: "smooth",
    });
  }, [active, status]);

  useEffect(() => {
    const finish = () => {
      if (!scrubbingRef.current) return;
      scrubbingRef.current = false;
      setPreviewTime(null);
      command({ action: "seek", time: scrubTimeRef.current });
    };
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false);
      else exit();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [exit, menuOpen]);

  const progress =
    duration > 0 ? Math.min(100, (displayTime / duration) * 100) : 0;
  const modes = [
    { mode: "single", Icon: Repeat1, zh: "单曲循环", en: "Single" },
    { mode: "list", Icon: Repeat2, zh: "列表循环", en: "List" },
    { mode: "random", Icon: Shuffle, zh: "随机播放", en: "Shuffle" },
  ] as const;

  return (
    <section
      ref={rootRef}
      className="fixed inset-x-0 bottom-0 top-16 z-[60] isolate flex min-h-0 flex-col overflow-hidden bg-paper text-ink"
      aria-label={locale === "zh" ? "纯净歌词模式" : "Pure lyrics mode"}
      data-radio-pure-mode
      style={
        {
          "--accent": accent.join(" "),
          "--liquid-mid": accent.join(" "),
          "--liquid-foam": accent.join(" "),
        } as CSSProperties
      }
    >
      <RadioPureScene
        accent={accent}
        dark={dark}
        motionEnabled={motionEnabled}
        playing={playing}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-[1] ${dark ? "bg-[linear-gradient(to_bottom,rgba(2,7,16,0.18),transparent_35%,rgba(2,7,16,0.12)_72%,rgba(2,7,16,0.58))]" : "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_35%,rgba(255,255,255,0.04)_72%,rgba(225,238,235,0.48))]"}`}
      />

      <div className="relative z-10 flex items-center justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label={
              locale === "zh" ? "退出纯净歌词模式" : "Exit pure lyrics mode"
            }
            className="shrink-0 rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={exit}
            type="button"
          >
            <RadioDisc
              artist={track?.artist}
              className="size-10"
              cover={track?.cover}
              playing={playing}
              title={track?.title ?? "Field Radio"}
            />
          </button>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
              FIELD RADIO / PURE LYRICS
            </p>
            <p className="mt-1 truncate text-xs text-muted">
              {track ? `${track.title} · ${track.artist}` : "Field Radio"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden font-mono text-[10px] tracking-[0.16em] text-muted sm:block">
            {locale === "zh" ? "歌词随旋律流动" : "LYRICS IN MOTION"}
          </span>
          <button
            aria-expanded={menuOpen}
            aria-label={locale === "zh" ? "打开播放列表" : "Open playlist"}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs shadow-sm backdrop-blur-md transition-colors ${menuOpen ? "border-accent/60 bg-accent/15 text-accent" : "border-line bg-panel/75 text-ink hover:border-accent/50 hover:text-accent"}`}
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <ListMusic className="size-4" />
            {locale === "zh" ? "曲目" : "Tracks"}
            <span className="font-mono text-[10px] text-muted">{tracks.length}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <button
            aria-label={locale === "zh" ? "关闭播放列表" : "Close playlist"}
            className="absolute inset-0 z-20 cursor-default bg-black/25 backdrop-blur-[2px] animate-[radio-pure-backdrop-in_220ms_ease-out_both]"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <aside
            aria-label={locale === "zh" ? "播放列表" : "Playlist"}
            aria-modal="true"
            className="absolute inset-y-0 right-0 z-30 flex w-[min(27rem,94vw)] flex-col border-l border-line/80 bg-panel/95 shadow-[-24px_0_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl animate-[radio-pure-drawer-in_300ms_cubic-bezier(.2,.8,.2,1)_both]"
            role="dialog"
          >
            <div className="border-b border-line/70 px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                    FIELD RADIO / QUEUE
                  </p>
                  <h2 className="mt-2 font-display text-2xl tracking-[-0.04em]">
                    {locale === "zh" ? "播放列表" : "Playlist"}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {locale === "zh" ? `${tracks.length} 首曲目 · 点击即刻播放` : `${tracks.length} tracks · Select to play`}
                  </p>
                </div>
                <button
                  aria-label={locale === "zh" ? "关闭播放列表" : "Close playlist"}
                  className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent"
                  onClick={() => setMenuOpen(false)}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
              <label className="mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-paper/75 px-3.5 py-2.5 focus-within:border-accent/60">
                <Search className="size-4 shrink-0 text-muted" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70"
                  onChange={(event) => setMenuQuery(event.target.value)}
                  placeholder={locale === "zh" ? "搜索歌曲或歌手" : "Search songs or artists"}
                  value={menuQuery}
                />
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
              <ol className="space-y-1.5">
                {filteredTracks.map(({ item, index }) => {
                  const selected = activeIndex === index;
                  return (
                    <li key={`${item.src ?? item.href ?? item.title}-${index}`}>
                      <button
                        aria-current={selected ? "true" : undefined}
                        className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors ${selected ? "border-accent/40 bg-accent/10" : "border-transparent hover:border-line hover:bg-paper/70"}`}
                        onClick={() => {
                          onSelectTrack(index);
                          setMenuOpen(false);
                        }}
                        type="button"
                      >
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-accent/10">
                          {item.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element -- Local radio cover art.
                            <img alt="" className="size-full object-cover" loading="lazy" src={item.cover} />
                          ) : <Disc3 className="m-auto size-5 text-accent/70" />}
                          {selected ? <span className="absolute inset-0 rounded-xl ring-2 ring-inset ring-accent/70" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm font-medium ${selected ? "text-accent" : "text-ink"}`}>{item.title}</span>
                          <span className="mt-1 block truncate text-xs text-muted">{item.artist}{item.note ? ` · ${item.note}` : ""}</span>
                        </span>
                        {selected && playing ? (
                          <span aria-label={locale === "zh" ? "正在播放" : "Playing"} className="flex h-5 items-end gap-0.5">
                            {[0, 1, 2].map((bar) => <span className="w-0.5 animate-pulse rounded-full bg-accent" key={bar} style={{ height: `${7 + bar * 3}px`, animationDelay: `${bar * 100}ms` }} />)}
                          </span>
                        ) : <Play className="size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
              {filteredTracks.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">{locale === "zh" ? "没有找到匹配的曲目" : "No matching tracks"}</p>
              ) : null}
            </div>
          </aside>
        </>
      ) : null}

      <div className="relative z-10 flex min-h-0 flex-1 items-stretch justify-center overflow-hidden px-5 py-5 sm:px-12 sm:py-8">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-1/2 h-[22rem] -translate-y-1/2 ${dark ? "bg-[radial-gradient(ellipse,rgba(2,7,17,0.54),transparent_70%)]" : "bg-[radial-gradient(ellipse,rgba(247,253,252,0.48),transparent_70%)]"}`}
        />
        {status === "loading" ? (
          <div className="m-auto text-center text-sm text-muted">
            {locale === "zh" ? "正在读取歌词…" : "Loading lyrics…"}
          </div>
        ) : status === "missing" ? (
          <div className="m-auto flex max-w-xl flex-col items-center text-center">
            {track?.cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- Album artwork in empty-lyrics state.
              <img
                alt=""
                className="size-24 rounded-full border border-white/20 object-cover shadow-[0_16px_60px_rgba(0,0,0,0.5)] sm:size-32"
                src={track.cover}
              />
            ) : (
              <Disc3 className="size-24 text-accent/70" />
            )}
            <h1 className="mt-8 font-display text-3xl tracking-[-0.04em] sm:text-5xl">
              {track?.title ?? "Field Radio"}
            </h1>
            <p className="mt-3 text-sm text-muted">{track?.artist}</p>
            <p className="mt-7 rounded-full border border-line bg-panel/70 px-5 py-2.5 text-xs text-muted">
              {locale === "zh"
                ? "这首歌曲暂时没有歌词"
                : "Lyrics are not available for this track yet"}
            </p>
          </div>
        ) : (
          <div
            ref={listRef}
            className="relative w-full max-w-4xl overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-live="off"
          >
            <div className="flex min-h-full flex-col items-center justify-center gap-7 py-[38vh] sm:gap-9">
              {lines.map((line, index) => {
                const distance = Math.abs(index - focusedIndex);
                const focused = index === focusedIndex;
                return (
                  <button
                    aria-current={focused ? "true" : undefined}
                    className={`max-w-full text-center font-display leading-[1.45] transition-[opacity,transform,color,font-size] duration-700 ease-out ${dark ? "[text-shadow:0_3px_28px_rgba(0,0,0,0.9)]" : "[text-shadow:0_1px_18px_rgba(255,255,255,0.65)]"} ${focused ? "scale-100 text-[clamp(1.8rem,5vw,3.8rem)] font-medium text-ink" : distance === 1 ? "scale-[0.94] text-[clamp(1.2rem,3vw,2rem)] text-muted/65 hover:text-ink" : "scale-[0.88] text-[clamp(1rem,2.5vw,1.5rem)] text-muted/30"}`}
                    data-pure-active={focused ? "" : undefined}
                    key={`${line.time}-${index}`}
                    onClick={() => command({ action: "seek", time: line.time })}
                    type="button"
                  >
                    {line.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 border-t border-line/60 bg-panel/85 px-5 py-4 backdrop-blur-xl sm:px-10">
        <div className="mx-auto grid max-w-5xl items-center gap-x-8 gap-y-4 lg:grid-cols-[1fr_1.3fr_1fr]">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label={
                locale === "zh" ? "退出纯净歌词模式" : "Exit pure lyrics mode"
              }
              className="shrink-0 rounded-full ring-offset-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={exit}
              type="button"
            >
              {track?.cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- Clickable album disc exits pure lyrics mode.
                <span className="relative grid size-12 place-items-center overflow-hidden rounded-full border border-accent/45 bg-ink shadow-[0_5px_25px_rgb(var(--liquid-deep)/0.22)]">
                  <img
                    alt=""
                    className="absolute inset-[18%] size-[64%] rounded-full object-cover"
                    src={track.cover}
                  />
                  <span className="absolute size-2 rounded-full border border-white/70 bg-ink/80" />
                </span>
              ) : (
                <Disc3 className="size-12 text-accent" />
              )}
            </button>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium">
                {track?.title ?? "Field Radio"}
              </p>
              <p className="truncate text-xs text-muted">
                {track?.artist ?? ""}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-center gap-4">
              <button
                aria-label={locale === "zh" ? "上一首" : "Previous track"}
                className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                onClick={() => command({ action: "previous" })}
                type="button"
              >
                <SkipBack className="size-4" />
              </button>
              <button
                aria-label={
                  playing
                    ? locale === "zh"
                      ? "暂停"
                      : "Pause"
                    : locale === "zh"
                      ? "播放"
                      : "Play"
                }
                className="grid size-12 place-items-center rounded-full bg-accent text-paper shadow-[0_8px_26px_rgb(var(--liquid-mid)/0.3)] transition-transform hover:scale-105 disabled:opacity-45"
                disabled={!track?.src}
                onClick={() => command({ action: "toggle" })}
                type="button"
              >
                {playing ? (
                  <Pause className="size-5" />
                ) : (
                  <Play className="ml-0.5 size-5" />
                )}
              </button>
              <button
                aria-label={locale === "zh" ? "下一首" : "Next track"}
                className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                onClick={() => command({ action: "next" })}
                type="button"
              >
                <SkipForward className="size-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 font-mono text-[9px] text-muted">
              <span>{formatTime(displayTime)}</span>
              <input
                aria-label={locale === "zh" ? "播放进度" : "Playback progress"}
                className="radio-progress block min-w-0 flex-1"
                disabled={!track?.src || duration <= 0}
                max={duration > 0 ? duration : 1}
                min={0}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  scrubTimeRef.current = value;
                  if (scrubbingRef.current) setPreviewTime(value);
                  else command({ action: "seek", time: value });
                }}
                onPointerDown={(event) => {
                  scrubbingRef.current = true;
                  scrubTimeRef.current = Number(event.currentTarget.value);
                }}
                step="1"
                style={{
                  background: `linear-gradient(to right, rgb(var(--liquid-mid)) ${progress}%, rgb(var(--liquid-mid) / 0.16) ${progress}%)`,
                }}
                type="range"
                value={duration > 0 ? Math.min(displayTime, duration) : 0}
              />
              <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2 lg:pl-3">
            <div className="flex items-center gap-2">
              {volume === 0 ? (
                <VolumeX className="size-4 shrink-0 text-muted" />
              ) : (
                <Volume2 className="size-4 shrink-0 text-accent" />
              )}
              <input
                aria-label={locale === "zh" ? "音量" : "Volume"}
                className="radio-volume min-w-0 flex-1"
                max="1"
                min="0"
                onChange={(event) =>
                  command({
                    action: "set-volume",
                    volume: Number(event.target.value),
                  })
                }
                step="0.01"
                type="range"
                value={volume}
              />
              <span className="w-8 text-right font-mono text-[10px] tabular-nums text-muted">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {modes.map(({ mode, Icon, zh, en }) => (
                <button
                  aria-pressed={playbackMode === mode}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] transition-colors ${playbackMode === mode ? "border-accent/50 bg-accent/10 text-accent" : "border-line text-muted hover:border-accent/40 hover:text-accent"}`}
                  key={mode}
                  onClick={() => command({ action: "set-playback-mode", mode })}
                  type="button"
                >
                  <Icon className="size-3" />
                  {locale === "zh" ? zh : en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
