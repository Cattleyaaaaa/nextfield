"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reducedMotion ? 0 : 0.08, delayChildren: 0.08 } },
  };

  return (
    <motion.div className={cn(className)} initial="hidden" animate="show" variants={variants}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  const variants: Variants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(7px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return <motion.div className={cn(className)} variants={variants}>{children}</motion.div>;
}
