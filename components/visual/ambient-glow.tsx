"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AmbientGlow() {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -right-[10%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-accent/15 blur-[100px] sm:h-[34rem] sm:w-[34rem]"
        animate={reducedMotion ? undefined : { x: [0, -35, 10, 0], y: [0, 24, -12, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-[12%] bottom-[-25%] h-[22rem] w-[22rem] rounded-full bg-amber-300/10 blur-[110px] dark:bg-amber-200/[0.06] sm:h-[30rem] sm:w-[30rem]"
        animate={reducedMotion ? undefined : { x: [0, 28, -8, 0], y: [0, -18, 12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
