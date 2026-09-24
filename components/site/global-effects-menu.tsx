"use client";

import { useEffect, useRef, useState } from "react";
import { MousePointerClick, SlidersHorizontal, Waves, X } from "lucide-react";
import {
  useGlobalEffects,
  type ClickEffectStyle,
} from "@/components/site/global-effects-provider";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import {
  CLICK_EFFECT_PREVIEW_EVENT,
  type ClickEffectPreview,
} from "@/lib/effect-signal";

const clickStyles: { value: ClickEffectStyle; zh: string; en: string }[] = [
  { value: "spark", zh: "火花", en: "Sparks" },
  { value: "confetti", zh: "彩纸", en: "Confetti" },
  { value: "rings", zh: "光环", en: "Rings" },
];

export function GlobalEffectsMenu() {
  const { locale } = useLanguage();
  const { motionEnabled, toggleMotion } = usePageTransition();
  const effects = useGlobalEffects();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const toggleClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition-colors ${active ? "border-accent bg-accent text-white" : "border-line text-muted hover:border-accent hover:text-accent"}`;

  return (
    <div className="relative" data-effect-controls ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={locale === "zh" ? "全站特效设置" : "Site effect settings"}
        className={`grid size-9 place-items-center rounded-full border transition-colors ${open ? "border-accent bg-accent text-white" : "border-line bg-paper/70 text-ink hover:border-accent hover:text-accent"}`}
        onClick={() => setOpen((value) => !value)}
        title={locale === "zh" ? "全站特效设置" : "Site effect settings"}
        type="button"
      >
        {open ? (
          <X className="size-4" />
        ) : (
          <SlidersHorizontal className="size-4" />
        )}
      </button>
      {open && (
        <div
          aria-label={locale === "zh" ? "全站特效设置" : "Site effect settings"}
          className="fixed inset-x-3 top-[4.5rem] z-50 max-h-[calc(100svh-5.25rem)] overflow-y-auto rounded-[1.5rem] border border-line bg-paper/95 p-5 shadow-2xl backdrop-blur-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80"
          role="dialog"
        >
          <p className="font-mono text-[10px] tracking-[0.15em] text-accent">
            {locale === "zh" ? "全站特效" : "SITE EFFECTS"}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted">
            {motionEnabled
              ? locale === "zh"
                ? "这里的调整会同步到所有页面与开放实验室。"
                : "Changes apply across the site and the open lab."
              : locale === "zh"
                ? "动态效果总开关已关闭；可先调整参数，开启后生效。"
                : "Motion is off; settings will apply when you turn it on."}
          </p>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-line bg-panel p-3">
            <span className="text-sm font-medium">
              {locale === "zh" ? "动态效果总开关" : "All motion"}
            </span>
            <button
              aria-pressed={motionEnabled}
              className={toggleClass(motionEnabled)}
              onClick={toggleMotion}
              type="button"
            >
              {motionEnabled
                ? locale === "zh"
                  ? "开启"
                  : "On"
                : locale === "zh"
                  ? "关闭"
                  : "Off"}
            </button>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <Waves className="size-4 text-accent" />
                {locale === "zh" ? "滑动水波" : "Water trail"}
              </span>
              <button
                aria-pressed={effects.rippleEnabled}
                className={toggleClass(effects.rippleEnabled)}
                onClick={() =>
                  effects.updateEffects({
                    rippleEnabled: !effects.rippleEnabled,
                  })
                }
                type="button"
              >
                {effects.rippleEnabled
                  ? locale === "zh"
                    ? "开启"
                    : "On"
                  : locale === "zh"
                    ? "关闭"
                    : "Off"}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs text-muted">
                {locale === "zh" ? "力度" : "Strength"} ·{" "}
                {effects.rippleStrength}
                <input
                  className="radio-volume mt-2 block w-full"
                  min="1"
                  max="5"
                  onChange={(event) =>
                    effects.updateEffects({
                      rippleStrength: Number(event.target.value),
                    })
                  }
                  type="range"
                  value={effects.rippleStrength}
                />
              </label>
              <label className="text-xs text-muted">
                {locale === "zh" ? "密度" : "Density"} · {effects.rippleDensity}
                <input
                  className="radio-volume mt-2 block w-full"
                  min="1"
                  max="5"
                  onChange={(event) =>
                    effects.updateEffects({
                      rippleDensity: Number(event.target.value),
                    })
                  }
                  type="range"
                  value={effects.rippleDensity}
                />
              </label>
            </div>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <MousePointerClick className="size-4 text-accent" />
                {locale === "zh" ? "点击反应" : "Click response"}
              </span>
              <button
                aria-pressed={effects.clickEnabled}
                className={toggleClass(effects.clickEnabled)}
                onClick={() =>
                  effects.updateEffects({ clickEnabled: !effects.clickEnabled })
                }
                type="button"
              >
                {effects.clickEnabled
                  ? locale === "zh"
                    ? "开启"
                    : "On"
                  : locale === "zh"
                    ? "关闭"
                    : "Off"}
              </button>
            </div>
            <div
              aria-label={
                locale === "zh" ? "点击特效样式" : "Click effect style"
              }
              className="mt-4 flex flex-wrap gap-1.5"
            >
              {clickStyles.map((style) => (
                <button
                  aria-pressed={effects.clickStyle === style.value}
                  className={toggleClass(effects.clickStyle === style.value)}
                  key={style.value}
                  onClick={() =>
                    effects.updateEffects({ clickStyle: style.value })
                  }
                  type="button"
                >
                  {style[locale]}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs text-muted">
              {locale === "zh" ? "数量" : "Amount"} · {effects.clickAmount}
              <input
                className="radio-volume mt-2 block w-full"
                min="1"
                max="5"
                onChange={(event) =>
                  effects.updateEffects({
                    clickAmount: Number(event.target.value),
                  })
                }
                type="range"
                value={effects.clickAmount}
              />
            </label>
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!motionEnabled || !effects.clickEnabled}
              onClick={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                window.dispatchEvent(
                  new CustomEvent<ClickEffectPreview>(
                    CLICK_EFFECT_PREVIEW_EVENT,
                    {
                      detail: {
                        x: bounds.left + bounds.width / 2,
                        y: bounds.top + bounds.height / 2,
                        style: effects.clickStyle,
                      },
                    },
                  ),
                );
              }}
              type="button"
            >
              <MousePointerClick className="size-3.5" aria-hidden="true" />
              {locale === "zh" ? "预览当前效果" : "Preview effect"}
            </button>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              {locale === "zh"
                ? "也可以关闭面板，点击页面任意位置。"
                : "Or close this panel and click anywhere on the page."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
