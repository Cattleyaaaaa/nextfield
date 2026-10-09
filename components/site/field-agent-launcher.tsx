"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { FIELD_AGENT_OPEN_EVENT } from "@/lib/field-agent-events";
import { usePageTransition } from "@/components/site/page-transition-provider";

export function FieldAgentLauncher({ compact = false, iconOnlyOnSmall = false }: { compact?: boolean; iconOnlyOnSmall?: boolean }) {
  const { motionEnabled } = usePageTransition();
  return (
    <button
      type="button"
      data-motion={motionEnabled ? "on" : "off"}
      aria-label="打开 Field Agent"
      title="Field Agent"
      aria-haspopup="dialog"
      aria-controls="field-agent-dock"
      onClick={() => window.dispatchEvent(new Event(FIELD_AGENT_OPEN_EVENT))}
      className={`field-agent-launcher relative overflow-hidden group inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan-300/35 bg-[#091a29] font-medium text-cyan-50 shadow-[0_0_22px_rgba(34,211,238,0.2)] transition hover:border-cyan-200/70 hover:bg-[#102b3b] hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 ${compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-xs"}`}
    >
      <Sparkles aria-hidden="true" className={compact ? "size-3.5 text-cyan-300" : "size-4 text-cyan-300"} />
      <span className={iconOnlyOnSmall ? "hidden md:inline" : undefined}>Field Agent</span>
      {!compact && <ArrowUpRight aria-hidden="true" className="size-3.5 text-cyan-200/60 transition group-hover:text-cyan-100" />}
    </button>
  );
}
