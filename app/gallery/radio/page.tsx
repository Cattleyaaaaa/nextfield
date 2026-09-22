import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { RadioTrackList } from "@/components/site/radio-track-list";
import { TransitionLink } from "@/components/site/transition-link";

export const metadata: Metadata = {
  title: "电台",
  description: "Field Radio 的曲目清单：本地音频直接播，VIP 曲目跳去平台收听。",
};

export default function GalleryRadioPage() {
  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-20 sm:px-8 sm:pt-28 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Field radio / 04</p>
      <h1 className="mt-6 max-w-5xl text-balance font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.06em]">声音不解释自己。</h1>
      <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">
        点任意一首就开始播，播放器固定在右下角，换页面也不会停。没有本地文件的曲目会带一个跳转按钮，播放在平台那边完成。
      </p>

      <RadioTrackList />

      <div className="mt-16 border-t border-line pt-8">
        <TransitionLink className="group inline-flex items-center gap-2 text-sm text-muted hover:text-accent" href="/gallery">
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          回到开放实验室
        </TransitionLink>
      </div>
    </div>
  );
}
