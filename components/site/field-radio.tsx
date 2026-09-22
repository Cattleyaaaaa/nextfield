"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Pause, Play, Quote, Radio, SkipForward, Volume2, X } from "lucide-react";
import { RadioLyrics } from "@/components/site/radio-lyrics";
import { TransitionLink } from "@/components/site/transition-link";
import { lyricsPathFor } from "@/lib/lrc";
import { RADIO_TRACKS } from "@/lib/radio-data";

const VOLUME_KEY = "nextfield-radio-volume";
const LYRICS_KEY = "nextfield-radio-lyrics";
/** 访客主动停过一次音乐后写 1，之后不再自动起播。 */
const SILENCE_KEY = "nextfield-radio-silence";
/** 能解锁浏览器音频自动播放的手势：滚动不算，必须是点击/触摸/按键这一类。 */
const GESTURES = ["pointerdown", "keydown", "touchend"] as const;

/** 把秒数格式化成 m:ss；时长未知时给一个占位，避免进度条乱跳。 */
function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function FieldRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  // 拖动进度条时不能被 timeupdate 抢回原位，否则滑块会一直“弹回去”。
  const [scrubbing, setScrubbing] = useState(false);
  const [lyricsVisible, setLyricsVisible] = useState(false);

  const track = RADIO_TRACKS[index];
  const hasTrack = Boolean(track);
  // 有本地音频才谈播放/进度/音量；只有外链的曲目交给平台自己放。
  const hasAudio = Boolean(track?.src);
  const progressPercent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  // 歌词默认按约定找 /lyrics/同名.lrc；曲目里写了 lyrics 就用它。
  const lyricsPath = track?.lyrics ?? lyricsPathFor(track?.src);

  // 页面上的「点歌」按钮走 window 事件（和 field-radio:open 同一套约定）。
  // 用 state 承接请求而不是 ref：事件回调只在挂载时创建一次，闭包读不到最新的 index / play。
  // token 只是为了让「连点同一首」也产生新对象，从而再次触发下面的 effect。
  const [playRequest, setPlayRequest] = useState<{ index: number; token: number } | null>(null);
  /** 这一次 play() 是自动起播，用来抑制任务事件。 */
  const silentPlayRef = useRef(false);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    // 自动起播不算“访客主动播放”，不推进对应任务
    const silent = silentPlayRef.current;
    silentPlayRef.current = false;
    setFailed(false);
    try {
      await audio.play();
      setPlaying(true);
      if (!silent) window.dispatchEvent(new CustomEvent("nextfield:mission", { detail: "radio" }));
    } catch {
      // 文件缺失、加密封装或编码不支持时 play() 会 reject，这里给出可见反馈而不是静默失败。
      setPlaying(false);
      setFailed(true);
    }
  }, [hasAudio]);

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  // 只有访客自己按的暂停/播放才写入“要不要自动起播”的偏好；
  // 播完一首、组件卸载这类被动暂停不算。
  const stopByUser = () => {
    window.localStorage.setItem(SILENCE_KEY, "1");
    pause();
  };

  const playByUser = () => {
    window.localStorage.setItem(SILENCE_KEY, "0");
    void play();
  };

  const next = () => {
    if (RADIO_TRACKS.length === 0) return;
    setIndex((value) => (value + 1) % RADIO_TRACKS.length);
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    setCurrent(value);
    if (audio && Number.isFinite(value)) audio.currentTime = value;
  };

  // 松手的位置可能在滑块外面，所以收尾监听挂在 window 上。
  useEffect(() => {
    if (!scrubbing) return;
    const stop = () => setScrubbing(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [scrubbing]);

  useEffect(() => {
    const saved = window.localStorage.getItem(VOLUME_KEY);
    if (saved) setVolume(Number(saved));
    if (window.localStorage.getItem(LYRICS_KEY) === "1") setLyricsVisible(true);
    const openRadio = () => setOpen(true);
    // 曲目清单页点某一首：切到那一首并立刻开始播
    const playTrack = (event: Event) => {
      const target = (event as CustomEvent<{ index?: number }>).detail?.index;
      setOpen(true);
      if (typeof target !== "number" || target < 0 || target >= RADIO_TRACKS.length) return;
      silentPlayRef.current = false;
      setPlayRequest({ index: target, token: Date.now() });
    };
    window.addEventListener("field-radio:open", openRadio);
    window.addEventListener("field-radio:play", playTrack);
    return () => {
      window.removeEventListener("field-radio:open", openRadio);
      window.removeEventListener("field-radio:play", playTrack);
      audioRef.current?.pause();
    };
  }, []);

  // 进入站点后随机起播一首：浏览器不允许「无交互出声」，所以只能借访客的第一次手势。
  // 手势一发生就摘掉监听、随机挑一首，并复用点歌那条路径（面板不弹开，只在右下角显示曲目名）。
  // 访客主动停过音乐（SILENCE_KEY=1）就完全不打扰。
  useEffect(() => {
    if (RADIO_TRACKS.length === 0) return;
    if (window.localStorage.getItem(SILENCE_KEY) === "1") return;

    let armed = true;
    const startRandom = () => {
      if (!armed) return;
      armed = false;
      GESTURES.forEach((name) => window.removeEventListener(name, startRandom));

      let pick = Math.floor(Math.random() * RADIO_TRACKS.length);
      // 刚进站时 index 还是 0，抽到同一首就换一首，免得每次都是列表第一首
      if (RADIO_TRACKS.length > 1 && pick === 0) pick = 1 + Math.floor(Math.random() * (RADIO_TRACKS.length - 1));

      silentPlayRef.current = true;
      setPlayRequest({ index: pick, token: Date.now() });
    };

    GESTURES.forEach((name) => window.addEventListener(name, startRandom));
    return () => {
      armed = false;
      GESTURES.forEach((name) => window.removeEventListener(name, startRandom));
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VOLUME_KEY, String(volume));
    const audio = audioRef.current;
    if (audio) audio.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  useEffect(() => {
    window.localStorage.setItem(LYRICS_KEY, lyricsVisible ? "1" : "0");
  }, [lyricsVisible]);

  // 换曲目：重新加载并从头开始。正在播时才继续播，暂停状态切歌不会自动出声。
  useEffect(() => {
    const audio = audioRef.current;
    setCurrent(0);
    setDuration(0);
    setFailed(false);
    if (!audio || !track?.src) return;
    audio.load();
    if (playing) void play();
    // 换曲目故意只依赖 index / src：把 playing 放进依赖会导致每次暂停/播放在同一首歌上重载。
    // 带上 src 是因为只有外链的曲目和本地曲目之间切换时也要把进度归零。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, track?.src]);

  // 处理「点歌」请求。索引不同就先切歌，切歌 effect 会重新加载；此时 index 还没变，直接返回，
  // 等 index 更新后这次 effect 会再跑一遍并把音乐播起来。
  useEffect(() => {
    if (!playRequest) return;
    if (playRequest.index !== index) {
      setIndex(playRequest.index);
      return;
    }
    void play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playRequest, index]);

  return (
    <aside className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6" aria-label="Field Radio 音乐播放器">
      {/* preload="none"：没点播放之前不下载音频，首屏不受影响 */}
      <audio
        className="hidden"
        onEnded={() => (RADIO_TRACKS.length > 1 ? next() : pause())}
        onError={() => { setPlaying(false); setFailed(true); }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onTimeUpdate={(event) => { if (!scrubbing) setCurrent(event.currentTarget.currentTime); }}
        preload="none"
        ref={audioRef}
        src={track?.src}
      />

      {lyricsVisible ? (
        <RadioLyrics
          className="pointer-events-auto w-[min(22rem,calc(100vw-2rem))]"
          currentTime={current}
          lyricsPath={lyricsPath}
          onClose={() => setLyricsVisible(false)}
          onSeek={seek}
          title={track ? `${track.title} · ${track.artist}` : "Field Radio"}
        />
      ) : null}

      {open ? (
        <div className="pointer-events-auto w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-paper/15 bg-ink text-paper shadow-[0_24px_80px_rgb(0_0_0/0.3)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-paper/10 px-5 py-3">
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-liquid-foam"><Radio className="size-3" /> FIELD RADIO</span>
            <button aria-label="收起播放器" className="rounded-full p-1.5 text-paper/55 hover:bg-paper/10 hover:text-paper" onClick={() => setOpen(false)} type="button"><X className="size-4" /></button>
          </div>
          <div className="p-5">
            <div className="mb-5 flex h-12 items-end gap-1" aria-hidden="true">
              {Array.from({ length: 24 }).map((_, barIndex) => <span className="radio-bar flex-1 rounded-full bg-liquid-foam/70" key={barIndex} style={{ animationDelay: `${-barIndex * 90}ms`, height: `${20 + ((barIndex * 17) % 70)}%`, animationPlayState: playing ? "running" : "paused" }} />)}
            </div>

            {hasTrack ? (
              <>
                <p className="font-display text-2xl tracking-[-0.04em]">{track.title}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">{track.artist}{track.note ? ` · ${track.note}` : ""}</p>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-paper/25 px-4 py-4 text-xs leading-5 text-paper/60">
                还没有曲目：把音频文件放进 public/audio/，再在 lib/radio-data.ts 里登记一条。
              </div>
            )}

            {hasAudio ? (
              <>
                <input
                  aria-label="播放进度"
                  className="radio-progress mt-5 block"
                  disabled={duration <= 0}
                  max={duration > 0 ? duration : 1}
                  min={0}
                  onChange={(event) => seek(Number(event.target.value))}
                  onPointerDown={() => setScrubbing(true)}
                  step="1"
                  style={{ background: `linear-gradient(to right, rgb(var(--liquid-foam)) ${progressPercent}%, rgb(var(--paper) / 0.15) ${progressPercent}%)` }}
                  type="range"
                  value={duration > 0 ? Math.min(current, duration) : 0}
                />
                <div className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.1em] text-paper/45">
                  <span>{formatTime(current)}</span>
                  <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
                </div>
              </>
            ) : hasTrack ? (
              <p className="mt-4 rounded-2xl border border-dashed border-paper/20 px-3 py-3 text-[11px] leading-5 text-paper/55">
                {track.href ? "这首只在平台上播放，本站不存音频文件。" : "这条还没有可播放的音频，也没有收听链接。"}
              </p>
            ) : null}

            {failed ? <p className="mt-3 text-[11px] leading-5 text-red-300/90">这首放不出来：文件不存在，或是加密/非标准格式（如网易云 ncm），浏览器无法解码。</p> : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <button aria-label={playing ? "暂停" : "播放"} className="grid size-11 place-items-center rounded-full bg-liquid-foam text-ink hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40" disabled={!hasAudio} onClick={playing ? stopByUser : playByUser} type="button">{playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}</button>
              <button aria-label="下一首" className="grid size-9 place-items-center rounded-full border border-paper/15 text-paper/70 hover:border-liquid-foam hover:text-liquid-foam disabled:cursor-not-allowed disabled:opacity-40" disabled={RADIO_TRACKS.length < 2} onClick={next} type="button"><SkipForward className="size-4" /></button>
              {track?.href ? (
                <a className="inline-flex items-center gap-1.5 rounded-full border border-paper/20 px-3 py-2 text-[11px] text-paper/75 transition-colors hover:border-liquid-foam hover:text-liquid-foam" href={track.href} rel="noreferrer" target="_blank">
                  {track.hrefLabel ?? "去平台收听"}<ArrowUpRight className="size-3" />
                </a>
              ) : null}
              {hasAudio ? (
                <>
                  <Volume2 className="ml-auto size-4 text-paper/50" />
                  <input aria-label="音量" className="radio-volume w-20" max="1" min="0" onChange={(event) => setVolume(Number(event.target.value))} step="0.01" type="range" value={volume} />
                </>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-paper/10 pt-3">
              <TransitionLink className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/55 hover:text-liquid-foam" href="/gallery/radio">
                全部曲目<ArrowUpRight className="size-3" />
              </TransitionLink>
              <button
                aria-pressed={lyricsVisible}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] transition-colors ${lyricsVisible ? "border-liquid-foam text-liquid-foam" : "border-paper/20 text-paper/60 hover:border-liquid-foam hover:text-liquid-foam"}`}
                onClick={() => setLyricsVisible((value) => !value)}
                type="button"
              >
                <Quote className="size-3" />歌词
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button className="group pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-paper/90 px-4 py-3 text-ink shadow-[0_16px_50px_rgb(var(--liquid-deep)/0.18)] backdrop-blur-xl hover:border-accent" onClick={() => setOpen(true)} type="button">
          <span className={`grid size-7 place-items-center rounded-full bg-ink text-paper ${playing ? "animate-spin [animation-duration:4s]" : ""}`}><Radio className="size-3.5" /></span>
          <span className="text-left"><span className="block font-mono text-[9px] tracking-[0.18em] text-accent">FIELD RADIO</span><span className="block text-xs">{playing && track ? track.title : "Play a signal"}</span></span>
          <ChevronDown className="ml-1 size-3.5 rotate-180 text-muted transition-transform group-hover:-translate-y-0.5" />
        </button>
      )}
    </aside>
  );
}
