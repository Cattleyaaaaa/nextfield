"use client";

import dynamic from "next/dynamic";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const Particles = dynamic(() => import("@/components/Particles"), { ssr: false });

// Particle size / hover radius / hover displacement are measured in CSS pixels.
export const PARTICLE_CONFIG = {
  desktopCount: 400,
  mobileCount: 200,
  mobileBreakpoint: 768,
  size: 2,
  opacity: 0.24,
  introOpacity: 0.15,
  speed: 0.025,
  moveParticlesOnHover: true,
  hoverStrength: 4,
  hoverRadius: 100,
  hoverSmoothing: 0.08,
  pixelRatio: 1.5,
  lightColor: "#7eaaa9",
  darkColor: "#b3ceca",
  opacityTransitionMs: 900,
};

const LIGHT_COLORS = [PARTICLE_CONFIG.lightColor];
const DARK_COLORS = [PARTICLE_CONFIG.darkColor];

export function AmbientParticles({ quiet = false, fixed = false }: { quiet?: boolean; fixed?: boolean }) {
  const reducedMotion = useMotionPreference();
  const { resolvedTheme } = useTheme();
  const [mobile, setMobile] = useState(true);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${PARTICLE_CONFIG.mobileBreakpoint - 1}px)`);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 z-0 overflow-hidden`}
      style={{
        opacity: quiet ? PARTICLE_CONFIG.introOpacity : PARTICLE_CONFIG.opacity,
        transition: reducedMotion ? "none" : `opacity ${PARTICLE_CONFIG.opacityTransitionMs}ms ease`,
        // Keep the reading area quieter without placing an overlay on the content.
        maskImage: "radial-gradient(ellipse 52% 34% at 50% 48%, rgba(0,0,0,0.25), rgba(0,0,0,0.65) 65%, #000 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 52% 34% at 50% 48%, rgba(0,0,0,0.25), rgba(0,0,0,0.65) 65%, #000 100%)",
      }}
    >
      <Particles
        particleCount={mobile ? PARTICLE_CONFIG.mobileCount : PARTICLE_CONFIG.desktopCount}
        particleBaseSize={PARTICLE_CONFIG.size}
        particleColors={resolvedTheme === "dark" ? DARK_COLORS : LIGHT_COLORS}
        speed={PARTICLE_CONFIG.speed}
        moveParticlesOnHover={!mobile && !reducedMotion && PARTICLE_CONFIG.moveParticlesOnHover}
        particleHoverFactor={PARTICLE_CONFIG.hoverStrength}
        hoverRadius={PARTICLE_CONFIG.hoverRadius}
        hoverSmoothing={PARTICLE_CONFIG.hoverSmoothing}
        pixelRatio={PARTICLE_CONFIG.pixelRatio}
        paused={!!reducedMotion}
      />
    </div>
  );
}
