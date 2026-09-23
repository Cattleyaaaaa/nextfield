"use client";

import { useState } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";

type RadioDiscProps = {
  /** 封面图：public 下的路径。缺失或 404 时回退成按标题算出来的底色 */
  cover?: string | null;
  /** 用于兜底色相 */
  title: string;
  artist?: string;
  playing: boolean;
  /** 尺寸，Tailwind 的 size-* 之类，如 "size-20" */
  className?: string;
};

/** 同一个标题永远得到同一个底色，换曲目前后不会忽明忽暗 */
function hueFor(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) % 360;
  return hash;
}

/**
 * 黑胶唱片：整张盘（纹路/封面/中心孔）作为一层绕自己的中心匀速旋转。
 * 播放时转、暂停就地停住（animation-play-state，不重置角度），尊重 reduced-motion。
 */
export function RadioDisc({ cover, title, artist, playing, className }: RadioDiscProps) {
  const reducedMotion = useMotionPreference();
  const [broken, setBroken] = useState(false);
  const showCover = Boolean(cover) && !broken;
  const hue = hueFor(`${title}${artist ?? ""}`);

  return (
    // 唱片是装饰性的：曲目名在旁边就有文字，不用再给读屏念一遍
    <div aria-hidden="true" className={`relative shrink-0 ${className ?? "size-20"}`}>
      <div
        className="radio-disc absolute inset-0 overflow-hidden rounded-full border border-white/10 bg-[#0c1417] shadow-[0_10px_24px_rgb(0_0_0/0.35)]"
        style={{ animationPlayState: playing && !reducedMotion ? "running" : "paused" }}
      >
        {/* 纹路：细密同心圆，转起来才看得出在动 */}
        <span className="absolute inset-0 rounded-full opacity-80 [background-image:repeating-radial-gradient(circle_at_50%_50%,rgb(255_255_255/0.07)_0_1px,transparent_1px_4px)]" />
        {/* 封面容器必须是普通元素：img 这类替换元素绝对定位时不会被 inset 拉伸，
            会保持固有尺寸锚在左上角，永远对不准圆心 */}
        <span className="absolute inset-[22%] overflow-hidden rounded-full">
          {showCover ? (
            // eslint-disable-next-line @next/next/no-img-element -- 封面是 public 下的静态图，走 next/image 反而要为每个尺寸配一次
            <img alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} src={cover ?? undefined} />
          ) : (
            <span
              className="block h-full w-full"
              style={{ backgroundImage: `linear-gradient(140deg, hsl(${hue} 62% 54%), hsl(${(hue + 52) % 360} 58% 30%))` }}
            />
          )}
        </span>
        {/* 中心孔也画在盘面里：整盘绕中心转，中心永远是同一个点 */}
        <span className="absolute inset-[45%] rounded-full bg-white/70" />
      </div>
    </div>
  );
}
