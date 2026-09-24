"use client";

import { useEffect, useRef } from "react";
import { MousePointerClick, Waves } from "lucide-react";
import { GlareHover } from "@/components/react-bits/glare-hover";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import {
  useGlobalEffects,
  type ClickEffectStyle,
} from "@/components/site/global-effects-provider";

type Ripple = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
};
type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  angle: number;
  spin: number;
  color: string;
};
type Ring = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
};

function fitCanvas(
  canvas: HTMLCanvasElement,
  surface: HTMLElement,
  context: CanvasRenderingContext2D,
) {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const width = surface.clientWidth;
  const height = surface.clientHeight;
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  context.setTransform(scale, 0, 0, scale, 0, 0);
  return { width, height };
}

function WaterTrail() {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const {
    rippleEnabled,
    rippleStrength: strength,
    rippleDensity: spacing,
    updateEffects,
  } = useGlobalEffects();
  const surfaceRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!surface || !canvas || !context || !motionEnabled || !rippleEnabled)
      return;
    let size = fitCanvas(canvas, surface, context);
    let ripples: Ripple[] = [];
    let frame = 0;
    let lastX = -Infinity;
    let lastY = -Infinity;
    let lastTime = 0;

    const draw = () => {
      context.clearRect(0, 0, size.width, size.height);
      ripples = ripples.filter((item) => item.alpha > 0.015);
      for (const item of ripples) {
        context.beginPath();
        context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(157, 229, 226, ${item.alpha})`;
        context.lineWidth = Math.max(0.7, strength * 0.52);
        context.stroke();
        item.radius += item.speed;
        item.alpha *= 0.966;
      }
      frame = ripples.length ? requestAnimationFrame(draw) : 0;
    };
    const add = (x: number, y: number, emphasis = false) => {
      const count = emphasis ? 3 : Math.max(1, Math.ceil(strength / 2));
      for (let index = 0; index < count; index += 1) {
        ripples.push({
          x,
          y,
          radius: 4 + index * 9,
          alpha: (emphasis ? 0.62 : 0.38) - index * 0.08,
          speed: 1.2 + strength * 0.45 + index * 0.2,
        });
      }
      if (ripples.length > 72) ripples = ripples.slice(-72);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const point = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const move = (event: PointerEvent) => {
      const { x, y } = point(event);
      const now = performance.now();
      if (
        Math.hypot(x - lastX, y - lastY) < 60 - spacing * 10 ||
        now - lastTime < 28
      )
        return;
      lastX = x;
      lastY = y;
      lastTime = now;
      add(x, y);
    };
    const press = (event: PointerEvent) => {
      const { x, y } = point(event);
      add(x, y, true);
    };
    const click = (event: MouseEvent) => {
      if (event.detail === 0) add(size.width / 2, size.height / 2, true);
    };
    const observer = new ResizeObserver(() => {
      size = fitCanvas(canvas, surface, context);
    });
    observer.observe(surface);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerdown", press);
    surface.addEventListener("click", click);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerdown", press);
      surface.removeEventListener("click", click);
    };
  }, [motionEnabled, rippleEnabled, strength, spacing]);

  return (
    <GlareHover className="h-full">
      <article
        data-effect-lab
        className="flex h-full flex-col rounded-[1.75rem] border border-line bg-panel p-6 sm:p-7"
      >
        <div className="flex items-center justify-between">
          <Waves className="size-5 text-accent" aria-hidden="true" />
          <span className="font-mono text-[10px] text-muted">
            08 / {locale === "zh" ? "水波" : "WATER"}
          </span>
        </div>
        <h3 className="mt-5 font-display text-3xl">
          {locale === "zh" ? "滑动水波" : "Water trail"}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted">
          {locale === "zh"
            ? "在画面上移动、滑动或点击；调整水波的力度与密度。"
            : "Move, drag or tap across the surface. Tune the wave strength and density."}
        </p>
        <button
          aria-label={
            locale === "zh"
              ? "水波实验区域：滑动或点击生成水波"
              : "Water experiment: move or click to create ripples"
          }
          className="relative my-6 h-60 w-full touch-none overflow-hidden rounded-2xl border border-paper/15 bg-[radial-gradient(circle_at_50%_46%,#21606a,#102a36_65%,#091921)] text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          ref={surfaceRef}
          type="button"
        >
          <span className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgb(255_255_255/.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/.05)_1px,transparent_1px)] [background-size:28px_28px]" />
          <canvas
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full"
            ref={canvasRef}
          />
          <span className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.12em] text-white/60">
            {motionEnabled && rippleEnabled
              ? locale === "zh"
                ? "在这里滑动"
                : "DRAG HERE"
              : locale === "zh"
                ? "水波效果已关闭"
                : "WATER TRAIL IS OFF"}
          </span>
        </button>
        <button
          aria-pressed={rippleEnabled}
          className="mb-4 self-start rounded-full border border-line px-4 py-2 text-xs hover:border-accent"
          onClick={() => updateEffects({ rippleEnabled: !rippleEnabled })}
          type="button"
        >
          {rippleEnabled
            ? locale === "zh"
              ? "全站水波：已开启"
              : "Site water trail: on"
            : locale === "zh"
              ? "全站水波：已关闭"
              : "Site water trail: off"}
        </button>
        <div className="mt-auto grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-muted">
            {locale === "zh" ? "力度" : "Strength"} · {strength}
            <input
              aria-label={locale === "zh" ? "水波力度" : "Ripple strength"}
              className="radio-volume mt-2 block w-full"
              min="1"
              max="5"
              type="range"
              value={strength}
              onChange={(event) =>
                updateEffects({ rippleStrength: Number(event.target.value) })
              }
            />
          </label>
          <label className="text-xs text-muted">
            {locale === "zh" ? "密度" : "Density"} · {spacing}
            <input
              aria-label={locale === "zh" ? "水波密度" : "Ripple density"}
              className="radio-volume mt-2 block w-full"
              min="1"
              max="5"
              type="range"
              value={spacing}
              onChange={(event) =>
                updateEffects({ rippleDensity: Number(event.target.value) })
              }
            />
          </label>
        </div>
      </article>
    </GlareHover>
  );
}

function ClickBurst() {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  const {
    clickEnabled,
    clickStyle: style,
    clickAmount: amount,
    updateEffects,
  } = useGlobalEffects();
  const surfaceRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!surface || !canvas || !context || !motionEnabled || !clickEnabled)
      return;
    let size = fitCanvas(canvas, surface, context);
    let sparks: Spark[] = [];
    let rings: Ring[] = [];
    let frame = 0;
    const palette = [
      "157, 229, 226",
      "255, 255, 255",
      "233, 189, 99",
      "236, 139, 120",
    ];

    const draw = () => {
      context.clearRect(0, 0, size.width, size.height);
      sparks = sparks.filter((item) => item.life > 0);
      for (const item of sparks) {
        item.life -= 1;
        item.x += item.vx;
        item.y += item.vy;
        item.vx *= 0.98;
        item.vy = item.vy * 0.98 + (style === "confetti" ? 0.055 : 0.025);
        item.angle += item.spin;
        const alpha = Math.max(0, item.life / item.maxLife);
        context.fillStyle = `rgba(${item.color}, ${alpha})`;
        if (style === "confetti") {
          context.save();
          context.translate(item.x, item.y);
          context.rotate(item.angle);
          context.fillRect(
            -item.size,
            -item.size / 2,
            item.size * 2,
            item.size,
          );
          context.restore();
        } else {
          context.beginPath();
          context.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2);
          context.fill();
        }
      }
      rings = rings.filter((item) => item.alpha > 0.015);
      for (const item of rings) {
        context.beginPath();
        context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(157, 229, 226, ${item.alpha})`;
        context.lineWidth = Math.max(1.5, item.alpha * 3);
        context.stroke();
        item.radius += item.speed;
        item.alpha *= 0.965;
      }
      frame = sparks.length || rings.length ? requestAnimationFrame(draw) : 0;
    };
    const burst = (x: number, y: number) => {
      const count = style === "rings" ? 0 : 8 + amount * 8;
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.3;
        const speed = 1.6 + Math.random() * (2 + amount);
        const life = 30 + Math.random() * 24;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          maxLife: life,
          size:
            style === "confetti"
              ? 2 + Math.random() * 3
              : 2 + Math.random() * 2,
          angle,
          spin: (Math.random() - 0.5) * 0.14,
          color: palette[index % palette.length],
        });
      }
      const ringCount = style === "rings" ? amount : 1;
      for (let index = 0; index < ringCount; index += 1)
        rings.push({
          x,
          y,
          radius: 4 + index * 15,
          alpha: 0.88 - index * 0.08,
          speed: 2.4 + amount * 0.35,
        });
      if (sparks.length > 240) sparks = sparks.slice(-240);
      if (rings.length > 24) rings = rings.slice(-24);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const press = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      burst(event.clientX - rect.left, event.clientY - rect.top);
    };
    const click = (event: MouseEvent) => {
      if (event.detail === 0) burst(size.width / 2, size.height / 2);
    };
    const observer = new ResizeObserver(() => {
      size = fitCanvas(canvas, surface, context);
    });
    observer.observe(surface);
    surface.addEventListener("pointerdown", press);
    surface.addEventListener("click", click);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      surface.removeEventListener("pointerdown", press);
      surface.removeEventListener("click", click);
    };
  }, [motionEnabled, clickEnabled, style, amount]);

  const styles: { key: ClickEffectStyle; zh: string; en: string }[] = [
    { key: "spark", zh: "火花", en: "Sparks" },
    { key: "confetti", zh: "彩纸", en: "Confetti" },
    { key: "rings", zh: "光环", en: "Rings" },
  ];
  return (
    <GlareHover className="h-full">
      <article
        data-effect-lab
        className="flex h-full flex-col rounded-[1.75rem] border border-line bg-panel p-6 sm:p-7"
      >
        <div className="flex items-center justify-between">
          <MousePointerClick
            className="size-5 text-accent"
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] text-muted">
            09 / {locale === "zh" ? "点击" : "CLICK"}
          </span>
        </div>
        <h3 className="mt-5 font-display text-3xl">
          {locale === "zh" ? "点击反应" : "Click response"}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted">
          {locale === "zh"
            ? "点按画面，试试三种反馈；用数量滑杆控制规模。"
            : "Tap the surface, switch between three reactions and tune their intensity."}
        </p>
        <button
          aria-label={
            locale === "zh"
              ? "点击特效实验区域：点击或按回车触发效果"
              : "Click effect experiment: click or press Enter to trigger"
          }
          className="relative my-6 h-60 w-full overflow-hidden rounded-2xl border border-paper/15 bg-[radial-gradient(circle_at_50%_50%,#274f61,#101b2e_70%)] text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          ref={surfaceRef}
          type="button"
        >
          <span className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgb(255_255_255/.13)_1px,transparent_1px)] [background-size:23px_23px]" />
          <canvas
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full"
            ref={canvasRef}
          />
          <span className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.12em] text-white/60">
            {motionEnabled && clickEnabled
              ? locale === "zh"
                ? "点击任意位置"
                : "CLICK ANYWHERE"
              : locale === "zh"
                ? "点击效果已关闭"
                : "CLICK RESPONSE IS OFF"}
          </span>
        </button>
        <button
          aria-pressed={clickEnabled}
          className="mb-4 self-start rounded-full border border-line px-4 py-2 text-xs hover:border-accent"
          onClick={() => updateEffects({ clickEnabled: !clickEnabled })}
          type="button"
        >
          {clickEnabled
            ? locale === "zh"
              ? "全站点击反应：已开启"
              : "Site click response: on"
            : locale === "zh"
              ? "全站点击反应：已关闭"
              : "Site click response: off"}
        </button>
        <div
          aria-label={locale === "zh" ? "点击特效样式" : "Click effect style"}
          className="flex flex-wrap gap-2"
        >
          {styles.map((item) => (
            <button
              aria-pressed={style === item.key}
              className={`rounded-full border px-4 py-2 text-xs ${style === item.key ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-accent"}`}
              key={item.key}
              onClick={() => updateEffects({ clickStyle: item.key })}
              type="button"
            >
              {item[locale]}
            </button>
          ))}
        </div>
        <label className="mt-5 block text-xs text-muted">
          {locale === "zh" ? "数量" : "Amount"} · {amount}
          <input
            aria-label={
              locale === "zh" ? "点击特效数量" : "Click effect amount"
            }
            className="radio-volume mt-2 block w-full"
            min="1"
            max="5"
            type="range"
            value={amount}
            onChange={(event) =>
              updateEffects({ clickAmount: Number(event.target.value) })
            }
          />
        </label>
      </article>
    </GlareHover>
  );
}

export function PointerEffectsLab() {
  const { locale } = useLanguage();
  const { motionEnabled } = usePageTransition();
  return (
    <section
      aria-labelledby="pointer-effects-title"
      className="mt-16 border-t border-line pt-10"
    >
      <div className="mb-7 grid gap-4 lg:grid-cols-[1fr_2fr] lg:items-end">
        <p className="font-mono text-[10px] tracking-[0.18em] text-accent">
          {locale === "zh" ? "指针实验 / 08–09" : "POINTER STUDIES / 08–09"}
        </p>
        <div>
          <h2
            id="pointer-effects-title"
            className="font-display text-4xl tracking-[-0.05em] sm:text-5xl"
          >
            {locale === "zh" ? "让动作留下痕迹。" : "Let motion leave a trace."}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            {locale === "zh"
              ? "在这里调节水波与点击反馈；参数会同步到顶栏，并作用于全站。右上角的动态效果开关仍可一键暂停全部动效。"
              : "Tune water and click reactions here; settings sync with the header and apply site-wide. The header motion switch can pause all effects."}
          </p>
        </div>
      </div>
      {!motionEnabled && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-line bg-panel p-4 text-sm text-muted"
        >
          {locale === "zh"
            ? "动态效果已关闭。开启顶栏动态效果后即可体验；页面内容与控件仍可阅读。"
            : "Motion is off. Use the header motion control to try these effects; content and controls remain readable."}
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <WaterTrail />
        <ClickBurst />
      </div>
    </section>
  );
}
