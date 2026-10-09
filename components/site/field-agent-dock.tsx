"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/site/language-provider";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { FieldAgent, useFieldAgentSession } from "@/components/site/field-agent";
import { FIELD_AGENT_CLOSE_EVENT, FIELD_AGENT_OPEN_EVENT } from "@/lib/field-agent-events";
import "./field-agent.css";

export function FieldAgentDock() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { locale } = useLanguage();
  const { navigate, motionEnabled } = usePageTransition();
  const session = useFieldAgentSession(open, locale);
  const origin = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    const show = () => {
      if (!panel.current) origin.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    const hide = () => setOpen(false);
    window.addEventListener(FIELD_AGENT_OPEN_EVENT, show);
    window.addEventListener(FIELD_AGENT_CLOSE_EVENT, hide);
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener(FIELD_AGENT_OPEN_EVENT, show);
      window.removeEventListener(FIELD_AGENT_CLOSE_EVENT, hide);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.documentElement.style.overflow;
    if (mobile) document.documentElement.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => panel.current?.focus());
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (!mobile || event.key !== "Tab") return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>("button:not(:disabled), textarea:not(:disabled), summary, a[href]") ?? []).filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (document.activeElement === panel.current || !panel.current?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      cancelAnimationFrame(frame);
      if (mobile) document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", keydown);
      if (origin.current?.isConnected) origin.current.focus({ preventScroll: true });
    };
  }, [open, mobile]);

  if (!open) return null;
  return (
    <section
      id="field-agent-dock"
      data-motion={motionEnabled ? "on" : "off"}
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-modal={mobile}
      aria-labelledby="field-agent-title"
      className="field-agent-dock fixed inset-0 z-[110] flex overflow-hidden bg-[#080e19] text-slate-100 shadow-[-20px_0_80px_rgba(0,0,0,0.35),0_0_40px_rgba(34,211,238,0.12)] sm:inset-auto sm:bottom-4 sm:right-4 sm:top-4 sm:w-[min(32rem,calc(100vw-2rem))] sm:rounded-[1.5rem] sm:border sm:border-cyan-300/35"
    >
      <FieldAgent session={session} locale={locale} onClose={() => setOpen(false)} onNavigate={href => { setOpen(false); navigate(href); }} />
    </section>
  );
}
