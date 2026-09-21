"use client";

import { motion } from "framer-motion";
import { usePageTransition } from "@/components/site/page-transition-provider";

export default function Template({ children }: { children: React.ReactNode }) {
  const { motionEnabled } = usePageTransition();
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={motionEnabled ? { opacity: 0, y: 12 } : { opacity: 1 }}
      transition={{ duration: 0.34, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
