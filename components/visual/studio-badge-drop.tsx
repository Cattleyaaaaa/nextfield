"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const Lanyard = dynamic(() => import("@/components/Lanyard"), {
  ssr: false,
  loading: () => <div className="h-screen w-full" aria-hidden="true" />,
});

type StudioBadgeContextValue = {
  dropBadge: () => void;
};

const StudioBadgeContext = createContext<StudioBadgeContextValue | null>(null);

// Add public/me-stylized.jpg, then change this to "/me-stylized.jpg" to replace the fallback portrait.
const CARD_FRONT_IMAGE: string | null = null;

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
            <Lanyard
              frontImage={CARD_FRONT_IMAGE}
              gravity={reducedMotion ? [0, 0, 0] : [0, -40, 0]}
              position={[0, 0, 20]}
              transparent
            />
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
