"use client";

import { useTheme } from "next-themes";
import SpecularButton, { type SpecularButtonProps } from "@/components/SpecularButton";

// Shared header settings. Colors match the light/dark tokens in app/globals.css.
const HEADER_SPECULAR_CONFIG = {
  size: "sm" as const,
  radius: 18,
  tint: "#ffffff",
  tintOpacity: 0,
  blur: 0,
  textColor: "rgb(var(--ink))",
  intensity: 2,
  shineSize: 18,
  shineFade: 40,
  thickness: 1.75,
  speed: 0.35,
  followMouse: true,
  proximity: 375,
  autoAnimate: false,
};

const HEADER_SPECULAR_COLORS = {
  light: { lineColor: "#2a97a5", baseColor: "#9cbfc3" },
  dark: { lineColor: "#a1e6df", baseColor: "#4b7981" },
};

type HeaderSpecularButtonProps = Omit<SpecularButtonProps, keyof typeof HEADER_SPECULAR_CONFIG | "lineColor" | "baseColor">;

export function HeaderSpecularButton({ className = "", ...props }: HeaderSpecularButtonProps) {
  const { resolvedTheme } = useTheme();
  const colors = HEADER_SPECULAR_COLORS[resolvedTheme === "dark" ? "dark" : "light"];

  return (
    <SpecularButton
      {...HEADER_SPECULAR_CONFIG}
      {...colors}
      {...props}
      className={`header-specular-button ${className}`.trim()}
    />
  );
}
