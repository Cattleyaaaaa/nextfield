"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Radio } from "lucide-react";
import { RadioDisc } from "@/components/site/radio-disc";
import { useLanguage } from "@/components/site/language-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { RADIO_STATE_EVENT, RADIO_STATE_REQUEST_EVENT, type RadioSignal } from "@/lib/radio-signal";
import { useMotionPreference } from "@/lib/use-motion-preference";

const HEIGHTS = Array.from({ length: 34 }, (_, index) => 24 + ((index * 31 + index * index * 7) % 69));

export function RadioVisualizer() {
  const { locale } = useLanguage();
  const reducedMotion = useMotionPreference();
  const [radio, setRadio] = useState<RadioSignal | null>(null);

  useEffect(() => {
    const update = (event: Event) => setRadio((event as CustomEvent<RadioSignal>).detail);
    window.addEventListener(RADIO_STATE_EVENT, update);
    window.dispatchEvent(new Event(RADIO_STATE_REQUEST_EVENT));
    return () => window.removeEventListener(RADIO_STATE_EVENT, update);
  }, []);

  const playing = Boolean(radio?.playing);
  const openRadio = () => window.dispatchEvent(new Event("field-radio:open"));

  return <section aria-labelledby="radio-visualizer-title" className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:px-12">
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-end"><p className="font-mono text-[10px] tracking-[0.18em] text-accent">FIELD RADIO / SIGNAL</p><div><h2 id="radio-visualizer-title" className="font-display text-[clamp(2.75rem,5vw,5rem)] leading-[0.92] tracking-[-0.055em]">{locale === "zh" ? "此刻的声音，有了形状。" : "A shape for the sound."}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{locale === "zh" ? "这里跟随电台的播放状态呼吸。声音仍由右下角的播放器控制。" : "This surface follows the radio's play state. Sound remains under the docked player's control."}</p></div></div>
    <div className="relative mt-9 grid min-h-72 overflow-hidden rounded-[1.75rem] border border-paper/10 bg-ink text-paper sm:grid-cols-[minmax(0,1fr)_minmax(17rem,0.8fr)]">
      <div className="relative flex min-h-56 items-end gap-1.5 overflow-hidden px-6 pb-9 pt-14 sm:gap-2 sm:px-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_50%,rgb(var(--accent)/0.28),transparent_58%)]" />
        <span className="absolute left-8 top-7 font-mono text-[9px] tracking-[0.18em] text-liquid-foam/70">SIGNAL / {String((radio?.index ?? 0) + 1).padStart(2, "0")}</span>
        {HEIGHTS.map((height, index) => <span className="radio-bar relative z-10 min-w-0 flex-1 rounded-t-full bg-liquid-foam/80" key={index} style={{ height: `${height * 1.6}px`, animationDelay: `${-index * 83}ms`, animationDuration: `${1.1 + (index % 5) * 0.13}s`, animationPlayState: playing && !reducedMotion ? "running" : "paused" }} />)}
        <span className="absolute inset-x-0 bottom-9 z-20 h-px bg-liquid-foam/50" />
      </div>
      <div className="relative flex flex-col border-t border-paper/15 p-7 sm:border-l sm:border-t-0 sm:p-9">
        <div className="flex items-center gap-4"><RadioDisc className="size-16" cover={radio?.cover} title={radio?.title ?? "Field Radio"} artist={radio?.artist} playing={playing} /><span className="min-w-0"><span aria-live="polite" className="block font-mono text-[10px] tracking-[0.15em] text-liquid-foam">{playing ? (locale === "zh" ? "正在播放" : "NOW PLAYING") : (locale === "zh" ? "电台待命" : "RADIO STANDBY")}</span><strong className="mt-2 block truncate font-display text-xl font-normal">{radio?.title ?? "Field Radio"}</strong><span className="mt-1 block truncate text-xs text-paper/55">{radio?.artist}</span></span></div>
        <p className="mt-7 max-w-xs text-xs leading-6 text-paper/50">{locale === "zh" ? "图形表示播放状态与节奏感，并非实时音频频谱。" : "The motion reflects playback state and rhythm; it is not a live audio spectrum."}</p>
        <div className="mt-auto flex flex-wrap items-center gap-5 pt-7"><button className="inline-flex items-center gap-2 rounded-full bg-liquid-foam px-5 py-3 text-xs font-medium text-ink hover:bg-paper" onClick={openRadio} type="button"><Radio className="size-4" aria-hidden="true" />{locale === "zh" ? "打开电台" : "Open radio"}</button><TransitionLink className="inline-flex items-center gap-1.5 text-xs text-paper/70 hover:text-paper" href="/gallery/radio">{locale === "zh" ? "查看曲目" : "View tracks"}<ArrowUpRight className="size-4" aria-hidden="true" /></TransitionLink></div>
      </div>
    </div>
  </section>;
}
