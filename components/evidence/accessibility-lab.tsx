"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Keyboard, MousePointer2, Waves } from "lucide-react";

const CHECKS = [
  { icon: Eye, title: "Contrast", text: "Core text and controls use design tokens that remain legible in both themes." },
  { icon: Keyboard, title: "Keyboard", text: "Navigation, dialogs, filters and experiments remain available without a pointer." },
  { icon: Waves, title: "Motion", text: "Continuous and spatial effects respect reduced-motion preferences and touch devices." },
  { icon: MousePointer2, title: "Fallback", text: "Content remains understandable when Canvas, WebGL, audio or JavaScript enhancement is unavailable." },
] as const;

export function AccessibilityLab() {
  const [contrast, setContrast] = useState<"soft" | "high">("soft");
  const [focusStep, setFocusStep] = useState(0);
  return <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_22rem]"><section className={`rounded-[2rem] border p-6 sm:p-10 ${contrast === "high" ? "border-white bg-black text-white" : "border-line bg-panel text-ink"}`}><div className="flex flex-wrap items-center justify-between gap-4"><p className="font-mono text-[10px] tracking-[.16em] text-accent">INTERACTIVE CONTRAST TEST</p><div className="flex rounded-full border border-current/20 p-1"><button className={`rounded-full px-3 py-1.5 text-xs ${contrast === "soft" ? "bg-accent text-white" : ""}`} onClick={() => setContrast("soft")} type="button">Token mode</button><button className={`rounded-full px-3 py-1.5 text-xs ${contrast === "high" ? "bg-white text-black" : ""}`} onClick={() => setContrast("high")} type="button">High contrast</button></div></div><h2 className="mt-16 max-w-2xl font-display text-5xl leading-[.92] tracking-[-.055em]">Can the interface stay clear when preferences change?</h2><p className={`mt-6 max-w-xl text-sm leading-7 ${contrast === "high" ? "text-white/75" : "text-muted"}`}>This panel demonstrates that hierarchy, focus and controls do not depend on a single color treatment.</p><div className="mt-12"><p className="font-mono text-[9px] tracking-[.16em] opacity-60">KEYBOARD FOCUS PATH</p><div className="mt-4 flex flex-wrap gap-3">{["Start", "Inspect", "Confirm"].map((label, index) => <button className={`rounded-full border px-4 py-2 text-sm outline-none ${focusStep === index ? "ring-2 ring-accent ring-offset-2 ring-offset-transparent" : "border-current/25"}`} key={label} onClick={() => setFocusStep(index)} onFocus={() => setFocusStep(index)} type="button">{label}</button>)}</div></div></section><aside className="space-y-3">{CHECKS.map(({ icon: Icon, title, text }) => <article className="rounded-2xl border border-line bg-panel p-5" key={title}><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-accent/10 text-accent"><Icon className="size-4" /></span><h3 className="text-sm font-medium">{title}</h3><CheckCircle2 className="ml-auto size-4 text-accent" /></div><p className="mt-4 text-xs leading-6 text-muted">{text}</p></article>)}</aside></div>;
}
