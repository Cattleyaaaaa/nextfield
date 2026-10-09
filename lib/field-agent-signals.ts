import manifest from "@/lib/generated/field-agent-signals.json";

export const SIGNAL_TOPICS = {
  projects: { label: { zh: "项目", en: "Projects" }, color: [56, 189, 248] },
  writing: { label: { zh: "文章", en: "Writing" }, color: [167, 139, 250] },
  build: { label: { zh: "建站纪事", en: "Build log" }, color: [45, 212, 191] },
  craft: { label: { zh: "制作说明", en: "Colophon" }, color: [103, 232, 249] },
  essays: { label: { zh: "随笔", en: "Essays" }, color: [216, 140, 238] },
} as const;
export type SignalTopic = keyof typeof SIGNAL_TOPICS;
type Text = { zh: string; en: string };
export type FieldAgentSignal = { id: string; topic: SignalTopic; href: string; title: Text; summary: Text; question: Text };
export const FIELD_AGENT_SIGNALS = manifest as FieldAgentSignal[];

export function signalForCell(x: number, z: number): FieldAgentSignal {
  const topic: SignalTopic = z < -1 ? "projects" : z === -1 ? "writing" : z === 0 ? "build" : z === 1 ? "craft" : "essays";
  const signals = FIELD_AGENT_SIGNALS.filter(signal => signal.topic === topic);
  return signals[(x + 3 + (z + 3) % 2) % signals.length];
}
