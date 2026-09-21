"use client";

// React Bits · Animations/GlareHover（纯 CSS，无 Canvas / WebGL）
//
// 与原版的两处差异：
//   1. 不强制 background / border / border-radius，只负责扫光本身，这样可以直接套在
//      已经有卡片样式的元素外层，不必再叠一层视觉外壳
//   2. glareColor 接受任意合法 CSS 颜色（原版只解析 3/6 位 hex），
//      这里直接用项目调色板的 rgb(var(--accent) / α)
import { type CSSProperties, type ReactNode } from "react";
import "./glare-hover.css";

export const GLARE_HOVER_CONFIG = {
  glareColor: "rgb(var(--accent) / 0.16)",
  glareAngle: -45,
  glareSize: 250,
  duration: 650,
};

export interface GlareHoverProps {
  children: ReactNode;
  glareColor?: string;
  glareAngle?: number;
  glareSize?: number;
  duration?: number;
  className?: string;
}

export function GlareHover({
  children,
  glareColor = GLARE_HOVER_CONFIG.glareColor,
  glareAngle = GLARE_HOVER_CONFIG.glareAngle,
  glareSize = GLARE_HOVER_CONFIG.glareSize,
  duration = GLARE_HOVER_CONFIG.duration,
  className = "",
}: GlareHoverProps) {
  const vars = {
    "--rb-glare-color": glareColor,
    "--rb-glare-angle": `${glareAngle}deg`,
    "--rb-glare-size": `${glareSize}%`,
    "--rb-glare-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <div className={`rb-glare ${className}`.trim()} style={vars}>
      {children}
    </div>
  );
}

export default GlareHover;
