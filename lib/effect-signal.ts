import type { ClickEffectStyle } from "@/components/site/global-effects-provider";

export const CLICK_EFFECT_PREVIEW_EVENT = "nextfield:click-effect-preview";
export type ClickEffectPreview = {
  x: number;
  y: number;
  style: ClickEffectStyle;
};
