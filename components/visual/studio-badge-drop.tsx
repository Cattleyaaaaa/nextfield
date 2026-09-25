"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Component, createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const Lanyard = dynamic(() => import("@/components/visual/Lanyard"), {
  ssr: false,
  loading: () => <div className="h-screen w-full" aria-hidden="true" />,
});

type StudioBadgeContextValue = {
  dropBadge: () => void;
};

const StudioBadgeContext = createContext<StudioBadgeContextValue | null>(null);

// Add public/me-stylized.jpg, then change this to "/me-stylized.jpg" to replace the fallback portrait.
const CARD_FRONT_IMAGE: string | null = null;

class BadgeRenderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full items-center justify-center px-6">
          <div className="w-full max-w-xs rotate-[-3deg] rounded-[1.5rem] border border-white/20 bg-[#101b20] p-7 text-white shadow-2xl">
            <p className="font-mono text-[10px] tracking-[0.28em] text-[#a9e4df]">NEXTFIELD / STUDIO ACCESS</p>
            <p className="mt-12 font-display text-5xl tracking-[-0.07em]">peng-12</p>
            <p className="mt-2 text-xs tracking-[0.2em] text-white/60">AGENT & FULL-STACK DEVELOPER</p>
            <div className="my-8 h-px bg-white/20" />
            <p className="text-sm">Shin</p>
            <p className="mt-10 font-mono text-[10px] tracking-[0.2em] text-white/50">PG-013-26</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function StudioBadgeDropProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const dropBadge = useCallback(() => {
    setIsOpen(true);
  }, []);

  const contextValue = useMemo(() => ({ dropBadge }), [dropBadge]);

  return (
    <StudioBadgeContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            aria-label="可拖动的 3D 工作证"
            className="fixed inset-0 z-[35] overflow-hidden bg-paper/10 backdrop-blur-[2px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            role="dialog"
            transition={{ duration: reducedMotion ? 0 : 0.24 }}
          >
            <BadgeRenderBoundary>
              <Lanyard
                frontImage={CARD_FRONT_IMAGE}
                gravity={reducedMotion ? [0, 0, 0] : [0, -40, 0]}
                position={[0, 0, 20]}
                transparent
              />
            </BadgeRenderBoundary>
            <button
              aria-label="关闭工作证"
              className="absolute right-5 top-20 z-10 grid size-10 place-items-center rounded-full border border-line bg-paper/90 text-ink shadow-soft backdrop-blur transition-colors hover:border-accent hover:text-accent"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </StudioBadgeContext.Provider>
  );
}

export function useStudioBadgeDrop() {
  const context = useContext(StudioBadgeContext);
  if (!context) {
    throw new Error("useStudioBadgeDrop must be used within StudioBadgeDropProvider");
  }
  return context;
}
