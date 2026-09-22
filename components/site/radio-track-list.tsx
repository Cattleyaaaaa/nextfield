"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { RADIO_TRACKS } from "@/lib/radio-data";

/** 曲目清单：点「播放」把请求交给常驻在右下角的 Field Radio 播放器。 */
export function RadioTrackList() {
  if (RADIO_TRACKS.length === 0) {
    return (
      <p className="border-t border-line pt-6 text-sm leading-6 text-muted">
        还没有曲目：把音频文件放进 public/audio/，再在 lib/radio-data.ts 里登记一条。
      </p>
    );
  }

  return (
    <ol className="mt-12 border-t border-line">
      {RADIO_TRACKS.map((track, index) => (
        <li className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line py-5" key={`${track.title}-${index}`}>
          <span className="font-mono text-xs tracking-[0.06em] text-accent">{String(index + 1).padStart(2, "0")}</span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl leading-tight tracking-[-0.03em]">{track.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{track.artist}{track.note ? ` · ${track.note}` : ""}</p>
          </div>
          {track.src ? (
            <button
              aria-label={`播放 ${track.title}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
              onClick={() => window.dispatchEvent(new CustomEvent("field-radio:play", { detail: { index } }))}
              type="button"
            >
              <Play className="size-3.5" />
              播放
            </button>
          ) : null}
          {track.href ? (
            <a className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs text-muted transition-colors hover:border-accent hover:text-accent" href={track.href} rel="noreferrer" target="_blank">
              {track.hrefLabel ?? "去平台收听"}
              <ArrowUpRight className="size-3.5" />
            </a>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
