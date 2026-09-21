"use client";

// React Bits PixelSwap, TS + CSS variant, tuned for a smaller per-click DOM cost.
import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import "./PixelSwap.css";

export interface PixelSwapProps {
  firstContent: ReactNode;
  secondContent: ReactNode;
  pixelSize?: number;
  gap?: number;
  pixelRadius?: number;
  pixelSpin?: number;
  pixelScale?: number;
  fade?: boolean;
  duration?: number;
  pixelDuration?: number;
  pattern?: "random" | "spiral";
  randomness?: number;
  easing?: string;
  trigger?: "hover" | "click";
  aspectRatio?: string;
  className?: string;
  style?: CSSProperties;
}

type Pixel = { left: number; top: number; offset: number; size: number };
type PixelGrid = { pixels: Pixel[]; width: number; height: number };

const PIXEL_SWAP_CONFIG = {
  targetPixelCount: 150,
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
};

const noise = (value: number) => {
  const result = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return result - Math.floor(result);
};

export default function PixelSwap({
  firstContent,
  secondContent,
  pixelSize = 64,
  gap = 0,
  pixelRadius = 8,
  pixelSpin = 0,
  pixelScale = 0.35,
  fade = true,
  duration = 1400,
  pixelDuration = 450,
  pattern = "random",
  randomness = 0.28,
  easing = "cubic-bezier(0.22, 1, 0.36, 1)",
  trigger = "click",
  aspectRatio = "auto",
  className = "",
  style,
}: PixelSwapProps) {
  const [active, setActive] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstLayerRef = useRef<HTMLDivElement>(null);
  const secondLayerRef = useRef<HTMLDivElement>(null);
  const pixelRefs = useRef<(HTMLDivElement | null)[]>([]);
  // 像素网格与它对应的容器尺寸必须成对保存：切换时读的是这一份快照，
  // 而不是渲染用的 state，否则尺寸变化后会拿到"旧像素 + 新尺寸"这种不匹配的组合。
  const gridRef = useRef<PixelGrid>({ pixels: [], width: 0, height: 0 });
  const timerRef = useRef(0);

  const makeGrid = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const { width, height } = root.getBoundingClientRect();
    if (!width || !height) return;

    const minimumSize = Math.ceil(Math.sqrt((width * height) / PIXEL_SWAP_CONFIG.targetPixelCount));
    const size = Math.max(pixelSize, minimumSize);
    const columns = Math.ceil((width + gap) / (size + gap));
    const rows = Math.ceil((height + gap) / (size + gap));
    const horizontalOffset = (width - (columns * (size + gap) - gap)) / 2;
    const verticalOffset = (height - (rows * (size + gap) - gap)) / 2;
    const result: Pixel[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const id = row * columns + column;
        const x = columns === 1 ? 0.5 : column / (columns - 1);
        const y = rows === 1 ? 0.5 : row / (rows - 1);
        const spiral = (Math.atan2(y - 0.5, x - 0.5) + Math.PI) / (Math.PI * 2) + Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2;
        const base = pattern === "spiral" ? spiral % 1 : noise(id + 1);
        result.push({
          left: horizontalOffset + column * (size + gap),
          top: verticalOffset + row * (size + gap),
          offset: base * (1 - randomness) + noise(id + 17) * randomness,
          size,
        });
      }
    }

    gridRef.current = { pixels: result, width, height };
    pixelRefs.current = [];
    setPixels(result);
  }, [gap, pattern, pixelSize, randomness]);

  useEffect(() => {
    const observer = new ResizeObserver(makeGrid);
    if (rootRef.current) observer.observe(rootRef.current);
    makeGrid();
    return () => observer.disconnect();
  }, [makeGrid]);

  const toggle = () => {
    if (transitioning) return;
    if (window.matchMedia(PIXEL_SWAP_CONFIG.reducedMotionQuery).matches) {
      setActive((value) => !value);
      return;
    }

    const next = !active;
    const incoming = next ? secondLayerRef.current : firstLayerRef.current;
    const root = rootRef.current;
    if (!incoming || !root) return;

    // 容器尺寸可能在 ResizeObserver 回调之前就已经变了（例如全屏模式移除滚动条会让宽度增加）。
    // 这种情况下缓存的网格与当前尺寸不匹配，克隆会被按旧尺寸排布，换行点跟真实内容对不上，
    // 所以先重建网格，保证像素与尺寸来自同一次测量。
    const { width: currentWidth, height: currentHeight } = root.getBoundingClientRect();
    if (
      Math.abs(currentWidth - gridRef.current.width) > 0.5 ||
      Math.abs(currentHeight - gridRef.current.height) > 0.5
    ) {
      makeGrid();
    }

    const { pixels: grid, width, height } = gridRef.current;
    if (!width || !height || !grid.length) return;

    setTransitioning(true);
    requestAnimationFrame(() => {
      pixelRefs.current.forEach((pixel, index) => {
        const item = grid[index];
        if (!pixel || !item) return;

        pixel.animate(
          [
            { opacity: fade ? 0 : 1, transform: `rotate(${pixelSpin}deg) scale(${pixelScale})` },
            { opacity: 1, transform: "rotate(0deg) scale(1)" },
          ],
          { duration: pixelDuration, delay: item.offset * Math.max(0, duration - pixelDuration), easing, fill: "both" },
        );

        const clone = incoming.cloneNode(true) as HTMLElement;
        clone.dataset.visible = "true";
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        const content = document.createElement("div");
        content.className = "pixel-swap__pixel-content";
        // item.left / item.top 在网格大于容器时是负值，必须先把数值取负再拼单位。
        // 写成 `-${item.left}px` 会得到 "--11.53px" 这种非法值，整条声明会被浏览器丢弃，
        // 像素块就失去位置补偿，克隆内容会整体偏移。
        content.style.left = `${-item.left}px`;
        content.style.top = `${-item.top}px`;
        content.append(clone);
        pixel.replaceChildren(content);
      });
    });

    timerRef.current = window.setTimeout(() => {
      setActive(next);
      setTransitioning(false);
    }, duration);
  };

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const events = trigger === "hover"
    ? { onMouseEnter: toggle, onFocus: toggle, onMouseLeave: toggle, onBlur: toggle, tabIndex: 0 }
    : {
      onClick: toggle,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      },
      role: "button",
      tabIndex: 0,
    };

  const layer = (content: ReactNode, shown: boolean, ref?: React.RefObject<HTMLDivElement>) => (
    <div ref={ref} className="pixel-swap__layer" data-visible={shown && !transitioning} style={{ zIndex: shown ? 2 : 1 }}>
      {content}
    </div>
  );

  return (
    <div ref={rootRef} className={`pixel-swap ${className}`} style={{ aspectRatio, ...style }} {...events}>
      {layer(firstContent, !active, firstLayerRef)}
      {layer(secondContent, active, secondLayerRef)}
      {transitioning && <div className="pixel-swap__grid">{pixels.map((pixel, index) => (
        <div className="pixel-swap__pixel" key={`${pixel.left}-${pixel.top}`} ref={(element) => { pixelRefs.current[index] = element; }} style={{ left: pixel.left, top: pixel.top, width: pixel.size, height: pixel.size, borderRadius: pixelRadius }} />
      ))}</div>}
    </div>
  );
}
