"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Disc3,
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
import { RadioDisc } from "@/components/site/radio-disc";
import { RadioHeroLyrics } from "@/components/site/radio-hero-lyrics";
import { RadioPureMode } from "@/components/site/radio-pure-mode";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { RADIO_TRACKS } from "@/lib/radio-data";
import {
  RADIO_AUDIO_EVENT,
  RADIO_COMMAND_EVENT,
  RADIO_STATE_EVENT,
  RADIO_STATE_REQUEST_EVENT,
  RADIO_TIME_EVENT,
  RADIO_VISUALIZER_BAR_HEIGHTS,
  type RadioAudioSignal,
  type RadioCommand,
  type RadioSignal,
  type RadioTimeSignal,
} from "@/lib/radio-signal";
import { gsap, useGSAP } from "@/lib/gsap";

function command(detail: RadioCommand) {
  window.dispatchEvent(new CustomEvent(RADIO_COMMAND_EVENT, { detail }));
}

function timeLabel(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function TrackArtwork({ cover, active }: { cover?: string; active: boolean }) {
  const [broken, setBroken] = useState(false);
  return (
    <span
      className={`relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border bg-accent/10 ${active ? "border-accent/50" : "border-line"}`}
    >
      {cover && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element -- Album art is served from the site's own cover archive.
        <img
          alt=""
          className="size-full object-cover"
          loading="lazy"
          onError={() => setBroken(true)}
          src={cover}
        />
      ) : (
        <Disc3 aria-hidden="true" className="size-5 text-accent/70" />
      )}
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-xl ring-2 ring-inset ring-accent/70"
        />
      ) : null}
    </span>
  );
}

export function RadioHall() {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const artistFilterRef = useRef<HTMLDivElement>(null);
  const artistMenuRef = useRef<HTMLDivElement>(null);
  const artistButtonRef = useRef<HTMLButtonElement>(null);
  const scrubbingRef = useRef(false);
  const scrubTimeRef = useRef(0);
  const [radio, setRadio] = useState<RadioSignal | null>(null);
  const [time, setTime] = useState<RadioTimeSignal>({
    index: 0,
    current: 0,
    duration: 0,
  });
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [artist, setArtist] = useState("");
  const [artistMenuOpen, setArtistMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<"playlist" | "lyrics">("playlist");
  const [pureMode, setPureMode] = useState(false);
  const exitPureMode = useCallback(() => setPureMode(false), []);

  useEffect(() => {
    const updateRadio = (event: Event) =>
      setRadio((event as CustomEvent<RadioSignal>).detail);
    const updateTime = (event: Event) =>
      setTime((event as CustomEvent<RadioTimeSignal>).detail);
    window.addEventListener(RADIO_STATE_EVENT, updateRadio);
    window.addEventListener(RADIO_TIME_EVENT, updateTime);
    window.dispatchEvent(new Event(RADIO_STATE_REQUEST_EVENT));
    return () => {
      window.removeEventListener(RADIO_STATE_EVENT, updateRadio);
      window.removeEventListener(RADIO_TIME_EVENT, updateTime);
    };
  }, []);

  useEffect(() => {
    const finish = () => {
      if (!scrubbingRef.current) return;
      scrubbingRef.current = false;
      command({ action: "seek", time: scrubTimeRef.current });
      setPreviewTime(null);
    };
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, []);

  useEffect(() => {
    if (!artistMenuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!artistFilterRef.current?.contains(event.target as Node))
        setArtistMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setArtistMenuOpen(false);
      artistButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [artistMenuOpen]);

  const artists = useMemo(
    () => [...new Set(RADIO_TRACKS.map((track) => track.artist))],
    [],
  );
  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return RADIO_TRACKS.map((track, index) => ({ track, index })).filter(
      ({ track }) =>
        (!artist || track.artist === artist) &&
        (!needle ||
          `${track.artist} ${track.title} ${track.note ?? ""}`
            .toLocaleLowerCase()
            .includes(needle)),
    );
  }, [artist, query]);
  const activeIndex = radio?.index ?? 0;
  const track = RADIO_TRACKS[activeIndex];
  const playing = Boolean(radio?.playing);
  const duration = time.index === activeIndex ? time.duration : 0;
  const elapsed =
    previewTime ?? (time.index === activeIndex ? time.current : 0);
  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  useGSAP(
    (_, contextSafe) => {
      const bars = rootRef.current?.querySelectorAll<HTMLElement>(
        "[data-radio-hall-wave]",
      );
      if (!bars?.length) return;
      gsap.set(bars, {
        scaleY: 0.16,
        opacity: 0.4,
        transformOrigin: "center bottom",
      });
      if (!playing || !motionEnabled) return;
      const update = (event: Event) => {
        const { bars: levels } = (event as CustomEvent<RadioAudioSignal>)
          .detail;
        bars.forEach((bar, index) => {
          const level = levels[index] ?? 0;
          gsap.to(bar, {
            scaleY: 0.16 + level * 1.03,
            opacity: 0.4 + level * 0.6,
            duration: 0.12,
            ease: "power2.out",
            overwrite: true,
          });
        });
      };
      const safeUpdate = contextSafe?.(update) ?? update;
      window.addEventListener(RADIO_AUDIO_EVENT, safeUpdate);
      return () => window.removeEventListener(RADIO_AUDIO_EVENT, safeUpdate);
    },
    {
      scope: rootRef,
      dependencies: [playing, motionEnabled],
      revertOnUpdate: true,
    },
  );

  useGSAP(
    () => {
      if (!motionEnabled) return;
      gsap.fromTo(
        "[data-radio-hall-art]",
        { autoAlpha: 0, scale: 0.9, rotate: -8 },
        {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: 0.7,
          ease: "power3.out",
        },
      );
      gsap.fromTo(
        "[data-radio-hall-title]",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" },
      );
    },
    {
      scope: rootRef,
      dependencies: [activeIndex, motionEnabled],
      revertOnUpdate: true,
    },
  );

  useGSAP(
    () => {
      const menu = artistMenuRef.current;
      if (!menu) return;
      gsap.to(menu, {
        autoAlpha: artistMenuOpen ? 1 : 0,
        y: artistMenuOpen ? 0 : -10,
        scale: artistMenuOpen ? 1 : 0.97,
        duration: motionEnabled ? (artistMenuOpen ? 0.32 : 0.2) : 0,
        ease: artistMenuOpen ? "power3.out" : "power2.in",
        overwrite: "auto",
      });
      if (artistMenuOpen && motionEnabled) {
        gsap.fromTo(
          menu.querySelectorAll("[data-artist-option]"),
          { autoAlpha: 0, x: -7 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.26,
            stagger: 0.025,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      }
    },
    { scope: rootRef, dependencies: [artistMenuOpen, motionEnabled] },
  );

  const playTrack = (index: number) =>
    window.dispatchEvent(
      new CustomEvent("field-radio:play", { detail: { index } }),
    );

  return (
    <main
      ref={rootRef}
      className="relative isolate mx-auto max-w-[1580px] px-4 pb-28 pt-8 sm:px-7 sm:pt-9 lg:px-10"
    >
      <header
        aria-hidden={pureMode}
        className={`mb-5 transition-[opacity,transform,filter] duration-[400ms] ease-out ${pureMode ? "pointer-events-none -translate-y-2 opacity-0 blur-sm" : "translate-y-0 opacity-100 blur-0"}`}
        inert={pureMode}
      >
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
            NEXTFIELD / FIELD RADIO
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[-0.055em]">
            {locale === "zh" ? "场域电台" : "Field Radio"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {locale === "zh"
              ? "挑一首歌，让此刻慢下来。"
              : "Find a song and let the moment slow down."}
          </p>
        </div>
      </header>

      <div
        aria-hidden={pureMode}
        className={`relative overflow-hidden rounded-[2rem] border border-line bg-panel shadow-[0_28px_100px_rgb(var(--liquid-deep)/0.1)] transition-[opacity,transform,filter] duration-500 ease-out ${pureMode ? "pointer-events-none scale-[0.985] opacity-0 blur-[3px]" : "scale-100 opacity-100 blur-0"}`}
        inert={pureMode}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_49%_34%,rgb(var(--liquid-foam)/0.16),transparent_31%),radial-gradient(circle_at_80%_78%,rgb(var(--liquid-mid)/0.09),transparent_33%)]"
        />
        <div className="relative grid grid-cols-[minmax(0,1fr)] lg:h-[590px] lg:grid-cols-[minmax(235px,0.95fr)_minmax(0,1.8fr)_minmax(235px,0.95fr)]">
          <section
            aria-label={locale === "zh" ? "当前歌曲" : "Current song"}
            className="order-1 flex min-w-0 flex-col items-center justify-center px-6 pb-8 pt-9 text-center sm:px-10 lg:order-2 lg:px-7 lg:py-5"
          >
            <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
              <span
                className={`size-1.5 rounded-full bg-accent ${playing ? "shadow-[0_0_12px_currentColor]" : "opacity-45"}`}
              />
              {playing
                ? locale === "zh"
                  ? "正在播放"
                  : "Now playing"
                : locale === "zh"
                  ? "准备播放"
                  : "Ready to play"}
            </p>
            <div className="relative mt-6 grid size-[min(64vw,19rem)] place-items-center sm:size-[19rem] xl:size-[19rem]">
              <span
                aria-hidden="true"
                className="absolute inset-[3%] rounded-full border border-accent/20"
              />
              <span
                aria-hidden="true"
                className="absolute inset-[11%] rounded-full border border-accent/10"
              />
              <span
                aria-hidden="true"
                className="absolute inset-[17%] rounded-full bg-accent/10 blur-[42px]"
              />
              <div
                data-radio-hall-art
                className="relative grid place-items-center"
              >
                <RadioDisc
                  artist={track?.artist}
                  className="size-[min(57vw,16rem)] sm:size-[16rem] xl:size-[17rem]"
                  cover={track?.cover}
                  playing={playing}
                  title={track?.title ?? "Field Radio"}
                />
              </div>
            </div>
            <div className="mt-5 max-w-full" aria-live="polite">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                {track?.note ||
                  (locale === "zh"
                    ? "来自场域的声音"
                    : "A sound from the field")}
              </p>
              <h2
                data-radio-hall-title
                className="mt-3 line-clamp-2 font-display text-[clamp(2.1rem,3vw,3.5rem)] leading-[1.05] tracking-[-0.05em]"
              >
                {track?.title ?? "Field Radio"}
              </h2>
              <p className="mt-3 text-sm text-muted">{track?.artist}</p>
            </div>
            <div className="mt-5 flex items-center gap-6 lg:hidden">
              <button
                aria-label={locale === "zh" ? "上一首" : "Previous track"}
                className="grid size-9 place-items-center rounded-full text-muted"
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
                className="grid size-11 place-items-center rounded-full bg-accent text-paper disabled:opacity-45"
                disabled={!track?.src}
                onClick={() => command({ action: "toggle" })}
                type="button"
              >
                {playing ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="ml-0.5 size-4" />
                )}
              </button>
              <button
                aria-label={locale === "zh" ? "下一首" : "Next track"}
                className="grid size-9 place-items-center rounded-full text-muted"
                onClick={() => command({ action: "next" })}
                type="button"
              >
                <SkipForward className="size-4" />
              </button>
            </div>
            <div
              aria-hidden="true"
              className="mt-6 flex h-10 w-full max-w-[310px] items-end gap-[3px] border-b border-line/70 pb-1 lg:mt-8"
            >
              {RADIO_VISUALIZER_BAR_HEIGHTS.map((height, index) => (
                <span
                  className="min-w-0 flex-1 rounded-t-full bg-accent/65"
                  data-radio-hall-wave
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            {track?.href && !track.src ? (
              <a
                className="mt-6 inline-flex items-center gap-1.5 text-xs text-accent underline-offset-4 hover:underline"
                href={track.href}
                rel="noreferrer"
                target="_blank"
              >
                {track.hrefLabel ??
                  (locale === "zh" ? "前往平台收听" : "Listen on platform")}
                <ArrowUpRight className="size-3.5" />
              </a>
            ) : null}
          </section>

          <div
            className="order-2 flex border-y border-line lg:hidden"
            role="tablist"
            aria-label={locale === "zh" ? "电台视图" : "Radio views"}
          >
            <button
              aria-selected={mobileTab === "playlist"}
              className={`flex-1 py-3 text-sm ${mobileTab === "playlist" ? "border-b-2 border-accent font-semibold text-accent" : "text-muted"}`}
              onClick={() => setMobileTab("playlist")}
              role="tab"
              type="button"
            >
              {locale === "zh" ? "歌单" : "Playlist"}
            </button>
            <button
              aria-selected={mobileTab === "lyrics"}
              className={`flex-1 py-3 text-sm ${mobileTab === "lyrics" ? "border-b-2 border-accent font-semibold text-accent" : "text-muted"}`}
              onClick={() => setMobileTab("lyrics")}
              role="tab"
              type="button"
            >
              {locale === "zh" ? "歌词" : "Lyrics"}
            </button>
          </div>

          <section
            aria-label={locale === "zh" ? "播放列表" : "Playlist"}
            className={`${mobileTab === "playlist" ? "flex" : "hidden"} order-3 min-h-[340px] min-w-0 flex-col px-5 py-6 sm:px-7 lg:order-1 lg:flex lg:min-h-0 lg:border-r lg:border-line lg:py-8`}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                  {locale === "zh" ? "音乐档案" : "Music archive"}
                </p>
                <h2 className="mt-2 font-display text-2xl tracking-[-0.04em]">
                  {locale === "zh" ? "播放列表" : "Playlist"}
                </h2>
              </div>
              <span className="font-mono text-[10px] text-muted">
                {matches.length} / {RADIO_TRACKS.length}
              </span>
            </div>
            <label className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-paper/60 px-3 py-2.5 focus-within:border-accent">
              <Search
                className="size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span className="sr-only">
                {locale === "zh" ? "搜索歌手或歌曲" : "Search artists or songs"}
              </span>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  locale === "zh" ? "搜索歌曲或歌手" : "Search music or artist"
                }
                type="search"
                value={query}
              />
              {query ? (
                <button
                  aria-label={locale === "zh" ? "清除搜索" : "Clear search"}
                  onClick={() => setQuery("")}
                  type="button"
                >
                  <X className="size-3.5 text-muted" />
                </button>
              ) : null}
            </label>
            <div className="mt-4 flex items-center justify-between gap-3 border-b border-line pb-4">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.17em] text-muted">
                {locale === "zh" ? "歌手" : "Artist"}
              </span>
              <div className="relative min-w-0 flex-1" ref={artistFilterRef}>
                <button
                  aria-controls="radio-artist-options"
                  aria-expanded={artistMenuOpen}
                  aria-haspopup="listbox"
                  className={`group flex w-full items-center justify-between gap-2 rounded-xl border bg-paper/70 px-3 py-2 text-left text-sm transition-[border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${artistMenuOpen ? "border-accent bg-paper shadow-[0_0_0_3px_rgb(var(--liquid-mid)/0.12)]" : "border-line hover:border-accent/60 hover:bg-paper"}`}
                  onClick={() => setArtistMenuOpen((open) => !open)}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowDown") return;
                    event.preventDefault();
                    setArtistMenuOpen(true);
                    requestAnimationFrame(() =>
                      artistMenuRef.current
                        ?.querySelector<HTMLButtonElement>(
                          '[aria-selected="true"]',
                        )
                        ?.focus(),
                    );
                  }}
                  ref={artistButtonRef}
                  type="button"
                >
                  <span className="min-w-0 truncate font-medium">
                    {artist || (locale === "zh" ? "全部歌手" : "All artists")}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-4 shrink-0 text-accent transition-transform duration-300 ${artistMenuOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                  />
                </button>
                <div
                  aria-hidden={!artistMenuOpen}
                  aria-label={locale === "zh" ? "选择歌手" : "Choose an artist"}
                  className={`absolute right-0 top-[calc(100%+0.55rem)] z-50 w-full min-w-[220px] origin-top-right overflow-hidden rounded-2xl border border-line bg-panel/95 shadow-[0_18px_48px_rgb(var(--liquid-deep)/0.18)] backdrop-blur-xl ${artistMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                  id="radio-artist-options"
                  onKeyDown={(event) => {
                    const options = Array.from(
                      artistMenuRef.current?.querySelectorAll<HTMLButtonElement>(
                        "[data-artist-option]",
                      ) ?? [],
                    );
                    const current = options.indexOf(
                      document.activeElement as HTMLButtonElement,
                    );
                    let next = current;
                    if (event.key === "ArrowDown")
                      next = (current + 1) % options.length;
                    else if (event.key === "ArrowUp")
                      next = (current - 1 + options.length) % options.length;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = options.length - 1;
                    else return;
                    event.preventDefault();
                    options[next]?.focus();
                  }}
                  ref={artistMenuRef}
                  role="listbox"
                  style={{ visibility: "hidden", opacity: 0 }}
                >
                  <p className="border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {locale === "zh" ? "选择歌手" : "Choose an artist"}
                  </p>
                  <div className="max-h-64 overflow-y-auto p-1.5 [scrollbar-width:thin]">
                    {["", ...artists].map((name) => (
                      <button
                        aria-selected={artist === name}
                        className={`group/option flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-[background-color,transform,color] duration-200 hover:translate-x-0.5 hover:bg-accent/10 focus-visible:bg-accent/10 focus-visible:outline-none ${artist === name ? "bg-accent/10 font-semibold text-accent" : "text-ink"}`}
                        data-artist-option
                        key={name || "all"}
                        onClick={() => {
                          setArtist(name);
                          setArtistMenuOpen(false);
                          artistButtonRef.current?.focus();
                        }}
                        role="option"
                        tabIndex={artistMenuOpen && artist === name ? 0 : -1}
                        type="button"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${artist === name ? "bg-accent" : "bg-accent/25 group-hover/option:bg-accent/70"}`}
                          />
                          <span className="truncate">
                            {name ||
                              (locale === "zh" ? "全部歌手" : "All artists")}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-muted">
                          {name
                            ? RADIO_TRACKS.filter(
                                (item) => item.artist === name,
                              ).length
                            : RADIO_TRACKS.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-color:rgb(var(--liquid-mid)/0.3)_transparent] [scrollbar-width:thin] lg:max-h-[455px]">
              {matches.length ? (
                <ol className="space-y-1.5">
                  {matches.map(({ track: item, index }) => (
                    <li key={`${item.src ?? item.href}-${index}`}>
                      {item.src ? (
                        <button
                          aria-current={
                            index === activeIndex ? "true" : undefined
                          }
                          className={`group flex w-full items-center gap-3 rounded-2xl border px-2 py-2 text-left transition-all duration-300 hover:border-accent/25 hover:bg-accent/5 ${index === activeIndex ? "border-accent/30 bg-accent/10" : "border-transparent"}`}
                          onClick={() => playTrack(index)}
                          type="button"
                        >
                          <TrackArtwork
                            active={index === activeIndex}
                            cover={item.cover}
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-sm ${index === activeIndex ? "font-semibold text-accent" : "text-ink"}`}
                            >
                              {item.title}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-muted">
                              {item.artist}
                              {item.note ? ` · ${item.note}` : ""}
                            </span>
                          </span>
                          <Play
                            className={`size-3.5 shrink-0 text-accent transition-opacity ${index === activeIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                            aria-hidden="true"
                          />
                        </button>
                      ) : item.href ? (
                        <a
                          className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition-colors hover:border-accent/25 hover:bg-accent/5"
                          href={item.href}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <TrackArtwork active={false} cover={item.cover} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm">
                              {item.title}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-muted">
                              {item.artist}
                              {item.note ? ` · ${item.note}` : ""}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="size-3.5 shrink-0 text-accent"
                            aria-hidden="true"
                          />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-12 text-center text-sm leading-6 text-muted">
                  {locale === "zh"
                    ? "没有找到对应歌曲，试试其他关键词。"
                    : "No songs found. Try another search."}
                </p>
              )}
            </div>
          </section>

          <section
            aria-label={locale === "zh" ? "同步歌词" : "Synchronized lyrics"}
            className={`${mobileTab === "lyrics" ? "flex" : "hidden"} order-4 min-h-[340px] min-w-0 flex-col px-5 py-6 sm:px-7 lg:order-3 lg:flex lg:min-h-0 lg:border-l lg:border-line lg:py-8`}
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                {locale === "zh" ? "随旋律流动" : "In time with music"}
              </p>
              <h2 className="mt-2 font-display text-2xl tracking-[-0.04em]">
                {locale === "zh" ? "同步歌词" : "Lyrics"}
              </h2>
            </div>
            <RadioHeroLyrics
              index={activeIndex}
              key={track?.src ?? activeIndex}
              lyrics={track?.lyrics}
              src={track?.src}
            />
          </section>
        </div>

        <div className="relative border-t border-line bg-paper/50 px-5 py-5 sm:px-7 lg:px-9">
          <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(270px,1.8fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 items-center justify-center gap-3 lg:justify-start lg:pl-32">
              <button
                aria-label={
                  locale === "zh"
                    ? pureMode
                      ? "退出纯净歌词模式"
                      : "进入纯净歌词模式"
                    : pureMode
                      ? "Exit pure lyrics mode"
                      : "Enter pure lyrics mode"
                }
                className="shrink-0 rounded-full ring-offset-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => setPureMode((value) => !value)}
                title={
                  locale === "zh"
                    ? "切换纯净歌词模式"
                    : "Toggle pure lyrics mode"
                }
                type="button"
              >
                <RadioDisc
                  artist={track?.artist}
                  className="size-12"
                  cover={track?.cover}
                  playing={playing}
                  title={track?.title ?? "Field Radio"}
                />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{track?.title}</p>
                <p className="truncate text-xs text-muted">{track?.artist}</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-accent">
                  {locale === "zh"
                    ? "唱片 · 点击进入纯净模式"
                    : "RECORD · PURE LYRICS"}
                </p>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-center gap-5">
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
                  className="grid size-12 place-items-center rounded-full bg-accent text-paper shadow-[0_8px_26px_rgb(var(--liquid-mid)/0.3)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-45"
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
              <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-muted">
                <span className="w-8 text-right">{timeLabel(elapsed)}</span>
                <input
                  aria-label={
                    locale === "zh" ? "播放进度" : "Playback progress"
                  }
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
                  value={duration > 0 ? Math.min(elapsed, duration) : 0}
                />
                <span className="w-8">
                  {duration > 0 ? timeLabel(duration) : "--:--"}
                </span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-3 lg:pl-4">
              <div className="flex items-center gap-3">
                {radio?.volume === 0 ? (
                  <VolumeX
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted"
                  />
                ) : (
                  <Volume2
                    aria-hidden="true"
                    className="size-4 shrink-0 text-accent"
                  />
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
                  value={radio?.volume ?? 0.3}
                />
                <span className="w-8 text-right font-mono text-[10px] tabular-nums text-muted">
                  {Math.round((radio?.volume ?? 0.3) * 100)}%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { mode: "single", icon: Repeat1, zh: "单曲", en: "One" },
                    { mode: "list", icon: Repeat2, zh: "列表", en: "List" },
                    {
                      mode: "random",
                      icon: Shuffle,
                      zh: "随机",
                      en: "Shuffle",
                    },
                  ] as const
                ).map(({ mode, icon: Icon, zh, en }) => (
                  <button
                    aria-label={
                      locale === "zh" ? `${zh}循环` : `${en} playback`
                    }
                    aria-pressed={(radio?.playbackMode ?? "random") === mode}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] transition-colors ${
                      (radio?.playbackMode ?? "random") === mode
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-line text-muted hover:border-accent/40 hover:text-accent"
                    }`}
                    key={mode}
                    onClick={() =>
                      command({ action: "set-playback-mode", mode })
                    }
                    type="button"
                  >
                    <Icon aria-hidden="true" className="size-3" />
                    {locale === "zh" ? zh : en}
                  </button>
                ))}
                <button
                  className="ml-auto text-[11px] text-muted transition-colors hover:text-accent"
                  onClick={() =>
                    window.dispatchEvent(new Event("field-radio:open"))
                  }
                  type="button"
                >
                  {locale === "zh" ? "悬浮歌词 ↗" : "Floating lyrics ↗"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {pureMode ? (
        <RadioPureMode
          activeIndex={activeIndex}
          currentTime={elapsed}
          duration={duration}
          onExit={exitPureMode}
          onSelectTrack={playTrack}
          playbackMode={radio?.playbackMode ?? "random"}
          playing={playing}
          track={track}
          tracks={RADIO_TRACKS}
          volume={radio?.volume ?? 0.3}
        />
      ) : null}
    </main>
  );
}
