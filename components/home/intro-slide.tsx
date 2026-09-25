"use client";

import ParticleText from "@/components/visual/ParticleText";
import { useTheme } from "next-themes";

// All React Bits ParticleText settings for the opening screen.
export const INTRO_CONFIG = {
  text: "Sky is not the limit",
  particleSize: 2, density: 4, scatter: 180, gatherDuration: 1600, stagger: 420,
  pointerRepel: 40, repelRadius: 120, idleDrift: 0.7, trigger: "mount" as const,
  fontSize: "clamp(3rem, 12vw, 8rem)", fontWeight: 800, fontFamily: "inherit", glow: true,
  lightColor: "#0d252c", darkColor: "#ffffff", lightHighlight: "#227783", darkHighlight: "#70c3bd",
};

export function IntroSlide() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <div className="h-full min-h-[calc(100svh-4rem)]" style={{ background: "rgb(var(--paper))" }}>
      <ParticleText
        {...INTRO_CONFIG}
        color={dark ? INTRO_CONFIG.darkColor : INTRO_CONFIG.lightColor}
        highlightColor={dark ? INTRO_CONFIG.darkHighlight : INTRO_CONFIG.lightHighlight}
        className="intro-particle-text"
      />
    </div>
  );
}
