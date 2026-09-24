"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ListMusic,
  Play,
  Radio,
  Search,
  X,
} from "lucide-react";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { RadioDisc } from "@/components/site/radio-disc";
import { RadioHeroLyrics } from "@/components/site/radio-hero-lyrics";
import { TransitionLink } from "@/components/site/transition-link";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { RADIO_TRACKS } from "@/lib/radio-data";
import {
  RADIO_STATE_EVENT,
  RADIO_STATE_REQUEST_EVENT,
  type RadioSignal,
} from "@/lib/radio-signal";
import { gsap, useGSAP } from "@/lib/gsap";

const WAVE_HEIGHTS = [
  28, 58, 39, 77, 48, 91, 62, 42, 84, 52, 95, 69, 35, 73, 51, 88, 44, 64, 31,
  72, 48, 81, 37, 60,
];

/** 发行图（站内存放的 jpg/png）与本站原创视觉图（生成的 data: URI 或手绘 svg）要分开标注，不能混为一谈。 */
function isReleaseArtwork(cover?: string | null) {
  if (!cover) return false;
  return !cover.startsWith("data:") && !cover.endsWith(".svg");
}

export function RadioPageFrame() {
  const { locale } = useLanguage();

  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        Field radio / 04
      </p>
      <h1 className="mt-6 max-w-5xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.06em]">
        {locale === "zh" ? "声音不解释自己。" : "Let the sound speak."}
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">
        {locale === "zh"
          ? "按歌手浏览，或搜索歌曲；展开曲库后点击播放。播放器固定在右下角，切换页面也能继续听。"
          : "Browse by artist or search for a song, then open the library to play it. The docked player keeps going as you move between pages."}
      </p>
      <RadioLibrary />
      <div className="mt-16 border-t border-line pt-8">
        <TransitionLink
          className="group inline-flex items-center gap-2 text-sm text-muted hover:text-accent"
          href="/gallery"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          {locale === "zh" ? "回到开放实验室" : "Back to the open lab"}
        </TransitionLink>
      </div>
    </div>
  );
}

export function RadioLibrary() {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const [radio, setRadio] = useState<RadioSignal | null>(null);
  const [artist, setArtist] = useState("");
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    const update = (event: Event) =>
      setRadio((event as CustomEvent<RadioSignal>).detail);
    window.addEventListener(RADIO_STATE_EVENT, update);
    window.dispatchEvent(new Event(RADIO_STATE_REQUEST_EVENT));
    return () => window.removeEventListener(RADIO_STATE_EVENT, update);
  }, []);

  const artists = useMemo(
    () => [...new Set(RADIO_TRACKS.map((track) => track.artist))],
    [],
  );
  const results = useMemo(() => {
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
  const grouped = useMemo(
    () =>
      [...new Set(results.map(({ track }) => track.artist))].map((name) => ({
        name,
        tracks: results.filter(({ track }) => track.artist === name),
      })),
    [results],
  );
  const playing = Boolean(radio?.playing);
  const current = RADIO_TRACKS[radio?.index ?? 0];

  useGSAP(
    () => {
      const bars =
        rootRef.current?.querySelectorAll<HTMLElement>("[data-radio-wave]");
      const halo =
        rootRef.current?.querySelector<HTMLElement>("[data-radio-halo]");
      if (!bars?.length) return;
      gsap.set(bars, { scaleY: 0.28, transformOrigin: "center bottom" });
      if (!playing || !motionEnabled) return;
      gsap.to(bars, {
        scaleY: (index) => 0.55 + (index % 5) * 0.13,
        duration: (index) => 0.48 + (index % 4) * 0.1,
        stagger: { each: 0.035, from: "center" },
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      if (halo)
        gsap.fromTo(
          halo,
          { scale: 0.88, opacity: 0.24 },
          {
            scale: 1.15,
            opacity: 0.5,
            duration: 2.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          },
        );
    },
    {
      scope: rootRef,
      dependencies: [playing, motionEnabled],
      revertOnUpdate: true,
    },
  );

  const playTrack = (index: number) =>
    window.dispatchEvent(
      new CustomEvent("field-radio:play", { detail: { index } }),
    );
  const chooseArtist = (name: string) => {
    setArtist(name);
    setQuery("");
    setListOpen(true);
  };

  return (
    <div ref={rootRef}>
      <GlareHover>
        <section
          aria-label={locale === "zh" ? "当前播放" : "Now playing"}
          className="relative mt-12 overflow-hidden rounded-[2rem] border border-paper/10 bg-ink text-paper"
        >
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_76%_45%,rgb(var(--liquid-mid)/0.38),transparent_42%)]"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center xl:grid-cols-[minmax(0,1.45fr)_minmax(14rem,0.8fr)_16rem]">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-liquid-foam">
                <Radio className="size-4" aria-hidden="true" />
                {playing
                  ? locale === "zh"
                    ? "正在播放"
                    : "NOW PLAYING"
                  : locale === "zh"
                    ? "电台待命"
                    : "RADIO STANDBY"}
              </div>
              <h2
                aria-live="polite"
                className="mt-6 truncate font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.96] tracking-[-0.05em]"
              >
                {current?.title ?? "Field Radio"}
              </h2>
              <p className="mt-3 text-sm text-paper/60">
                {current?.artist}
                {current?.note ? ` · ${current.note}` : ""}
              </p>
              <div
                aria-hidden="true"
                className="mt-9 flex h-16 max-w-lg items-end gap-[3px] overflow-hidden border-b border-liquid-foam/25 pb-1"
              >
                {WAVE_HEIGHTS.map((height, index) => (
                  <span
                    className="min-w-0 flex-1 rounded-t-full bg-liquid-foam/75"
                    data-radio-wave
                    key={index}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-liquid-foam px-5 py-3 text-sm font-medium text-ink hover:bg-paper"
                  onClick={() =>
                    window.dispatchEvent(new Event("field-radio:open"))
                  }
                  type="button"
                >
                  {locale === "zh" ? "打开播放器" : "Open player"}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </button>
                <span className="text-xs text-paper/50">
                  {locale === "zh"
                    ? "播放、暂停和音量由右下角播放器控制"
                    : "Use the docked player for playback and volume"}
                </span>
              </div>
            </div>
            <RadioHeroLyrics
              index={radio?.index ?? 0}
              key={current?.src ?? radio?.index ?? 0}
              lyrics={current?.lyrics}
              src={current?.src}
            />
            <div className="relative mx-auto grid size-52 place-items-center sm:size-60 lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:col-start-3 xl:row-span-1">
              <span
                data-radio-halo
                className="absolute inset-3 rounded-full border border-liquid-foam/30 bg-liquid-foam/[0.07]"
                aria-hidden="true"
              />
              <RadioDisc
                key={current?.src}
                artist={current?.artist}
                className="size-44 sm:size-52"
                cover={current?.cover}
                playing={playing}
                title={current?.title ?? "Field Radio"}
              />
            </div>
          </div>
        </section>
      </GlareHover>

      <section aria-labelledby="artist-browser-title" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
              {locale === "zh" ? "按歌手发现" : "BROWSE BY ARTIST"}
            </p>
            <h2
              id="artist-browser-title"
              className="mt-3 font-display text-3xl tracking-[-0.04em] sm:text-4xl"
            >
              {locale === "zh" ? "先选一个声音。" : "Choose a voice."}
            </h2>
          </div>
          <span className="font-mono text-xs text-muted">
            {artists.length} {locale === "zh" ? "位歌手" : "ARTISTS"} /{" "}
            {RADIO_TRACKS.length} {locale === "zh" ? "首歌曲" : "TRACKS"}
          </span>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          <button
            aria-pressed={!artist}
            className={`rounded-full border px-4 py-2 text-sm ${!artist ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-accent hover:text-accent"}`}
            onClick={() => chooseArtist("")}
            type="button"
          >
            {locale === "zh" ? "全部歌手" : "All artists"}
          </button>
          {artists.map((name) => (
            <button
              aria-pressed={artist === name}
              className={`rounded-full border px-4 py-2 text-sm ${artist === name ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-accent hover:text-accent"}`}
              key={name}
              onClick={() => chooseArtist(name)}
              type="button"
            >
              {name}
              <span className="ml-2 font-mono text-[10px] opacity-60">
                {RADIO_TRACKS.filter((track) => track.artist === name).length}
              </span>
            </button>
          ))}
        </div>
        <label className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3">
          <Search className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="sr-only">
            {locale === "zh" ? "搜索歌手或歌曲" : "Search artists or songs"}
          </span>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            placeholder={
              locale === "zh"
                ? "输入歌手或歌曲名称"
                : "Search an artist or song"
            }
            type="search"
            value={query}
            onChange={(event) => {
              setArtist("");
              setQuery(event.target.value);
              if (event.target.value) setListOpen(true);
            }}
          />
          {query && (
            <button
              aria-label={locale === "zh" ? "清除搜索" : "Clear search"}
              onClick={() => setQuery("")}
              type="button"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </section>

      <section className="mt-10 rounded-[1.75rem] border border-line bg-panel">
        <h2>
          <button
            aria-controls="radio-all-tracks"
            aria-expanded={listOpen}
            className="flex w-full items-center justify-between gap-5 p-6 text-left sm:p-7"
            onClick={() => setListOpen((value) => !value)}
            type="button"
          >
            <span className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-full border border-line text-accent">
                <ListMusic className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display text-2xl">
                  {locale === "zh" ? "全部歌曲" : "All tracks"}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {artist || (locale === "zh" ? "所有歌手" : "Every artist")} ·{" "}
                  {results.length} {locale === "zh" ? "首结果" : "results"}
                </span>
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`size-5 shrink-0 text-accent transition-transform ${listOpen ? "rotate-180" : ""}`}
            />
          </button>
        </h2>
        <div
          hidden={!listOpen}
          id="radio-all-tracks"
          className="border-t border-line px-5 pb-6 sm:px-7"
        >
          {grouped.length ? (
            grouped.map((group) => (
              <div className="mt-7" key={group.name}>
                <div className="mb-2 flex items-center justify-between border-b border-line pb-3">
                  <h3 className="font-display text-xl">{group.name}</h3>
                  <span className="font-mono text-[10px] text-muted">
                    {group.tracks.length} {locale === "zh" ? "首" : "TRACKS"}
                  </span>
                </div>
                <ol>
                  {group.tracks.map(({ track, index }) => (
                    <li
                      className={`flex items-center gap-4 border-b border-line/60 py-3 ${radio?.index === index && playing ? "text-accent" : ""}`}
                      key={`${track.src ?? track.href}-${index}`}
                    >
                      <RadioDisc
                        artist={track.artist}
                        className="size-12"
                        cover={track.cover}
                        playing={radio?.index === index && playing}
                        title={track.title}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {track.title}
                        </span>
                        <span className="mt-1 block truncate text-xs text-muted">
                          {track.note || track.artist}
                          {isReleaseArtwork(track.cover)
                            ? ` · ${locale === "zh" ? "发行封面" : "Release artwork"}`
                            : ` · ${locale === "zh" ? "本站视觉封面" : "Original site artwork"}`}
                        </span>
                      </span>
                      <span className="hidden font-mono text-[10px] text-muted sm:block">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {track.src ? (
                        <button
                          aria-label={`${locale === "zh" ? "播放" : "Play"} ${track.title}`}
                          className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-accent hover:border-accent hover:bg-ink hover:text-paper"
                          onClick={() => playTrack(index)}
                          type="button"
                        >
                          <Play className="size-4" aria-hidden="true" />
                        </button>
                      ) : track.href ? (
                        <a
                          aria-label={`${locale === "zh" ? "在平台收听" : "Listen on platform"} ${track.title}`}
                          className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-accent"
                          href={track.href}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ArrowUpRight className="size-4" />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            ))
          ) : (
            <p className="py-8 text-sm text-muted">
              {locale === "zh"
                ? "没有找到对应歌曲。试试换一个歌手或关键词。"
                : "No matching tracks. Try another artist or search term."}
            </p>
          )}
        </div>
      </section>
      <p className="mt-4 text-xs leading-6 text-muted">
        {locale === "zh"
          ? "发行封面按 "
          : "Release artwork is matched against "}
        <a
          className="underline underline-offset-4 hover:text-accent"
          href="https://musicbrainz.org/"
          rel="noreferrer"
          target="_blank"
        >
          MusicBrainz
        </a>
        {locale === "zh"
          ? " 的发行资料核对后存放在本站，不依赖第三方图床；无法核实的曲目仍使用本站原创视觉封面。"
          : " records and served from this site; unverified tracks retain original site artwork."}
      </p>
    </div>
  );
}
