"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { usePathname, useRouter } from "next/navigation";

type TransitionOrigin = { x: number; y: number };
type PageTransitionContextValue = {
  navigate: (href: string, origin?: TransitionOrigin) => void;
  isTransitioning: boolean;
  motionEnabled: boolean;
  toggleMotion: () => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useMotionPreference();
  const [motionSetting, setMotionSetting] = useState<"system" | "on" | "off">("system");
  const [phase, setPhase] = useState<"idle" | "covering" | "revealing">("idle");
  const targetRef = useRef<string | null>(null);
  const motionEnabled = motionSetting === "on" || (motionSetting === "system" && !reducedMotion);

  useEffect(() => {
    const savedSetting = window.localStorage.getItem("water-motion-setting");
    if (savedSetting === "on" || savedSetting === "off") setMotionSetting(savedSetting);
  }, []);

  const toggleMotion = useCallback(() => {
    setMotionSetting(() => {
      const next = motionEnabled ? "off" : "on";
      window.localStorage.setItem("water-motion-setting", next);
      return next;
    });
  }, [motionEnabled]);

  const navigate = useCallback((href: string, origin?: TransitionOrigin) => {
    if (href === pathname || targetRef.current || !motionEnabled) {
      if (href !== pathname) router.push(href);
      return;
    }
    targetRef.current = href;
    window.dispatchEvent(new CustomEvent("water-ripple", { detail: origin }));
    setPhase("covering");
    window.setTimeout(() => router.push(href), 500);
  }, [motionEnabled, pathname, router]);

  useEffect(() => {
    const targetPathname = targetRef.current?.split("#")[0];
    if (phase === "covering" && targetPathname === pathname) {
      requestAnimationFrame(() => setPhase("revealing"));
    }
  }, [pathname, phase]);

  const finishTransition = () => {
    if (phase === "revealing") {
      targetRef.current = null;
      setPhase("idle");
    }
  };

  return (
    <PageTransitionContext.Provider value={{ navigate, isTransitioning: phase !== "idle", motionEnabled, toggleMotion }}>
      {children}
      {motionEnabled && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
          <motion.div
            className="liquid-curtain absolute inset-x-[-12%] bottom-[-10%] h-[125%]"
            initial={{ y: "115%" }}
            animate={phase === "covering" ? { y: "0%" } : phase === "revealing" ? { y: "-110%" } : { y: "115%" }}
            transition={{ duration: phase === "covering" ? 0.48 : 0.56, ease: [0.65, 0, 0.25, 1] }}
            onAnimationComplete={finishTransition}
          />
          <motion.div
            className="absolute inset-x-[-14%] bottom-[-12%] h-[126%] rounded-t-[48%] bg-liquid-foam/20"
            initial={{ y: "120%" }}
            animate={phase === "covering" ? { y: "4%" } : phase === "revealing" ? { y: "-106%" } : { y: "120%" }}
            transition={{ duration: phase === "covering" ? 0.46 : 0.58, delay: phase === "covering" ? 0.04 : 0, ease: [0.65, 0, 0.25, 1] }}
          />
        </div>
      )}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) throw new Error("usePageTransition must be used within PageTransitionProvider");
  return context;
}
