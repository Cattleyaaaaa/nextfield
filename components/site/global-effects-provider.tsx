"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ClickEffectStyle = "spark" | "confetti" | "rings";
type EffectSettings = {
  rippleEnabled: boolean;
  rippleStrength: number;
  rippleDensity: number;
  clickEnabled: boolean;
  clickStyle: ClickEffectStyle;
  clickAmount: number;
};
type EffectContextValue = EffectSettings & {
  updateEffects: (change: Partial<EffectSettings>) => void;
};

const STORAGE_KEY = "nextfield-global-effects-v1";
const defaults: EffectSettings = {
  rippleEnabled: true,
  rippleStrength: 3,
  rippleDensity: 3,
  clickEnabled: true,
  clickStyle: "spark",
  clickAmount: 3,
};
const EffectContext = createContext<EffectContextValue | null>(null);
const level = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.min(5, Math.round(value)))
    : fallback;

export function GlobalEffectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? "null",
      ) as Partial<EffectSettings> | null;
      if (saved)
        setSettings({
          rippleEnabled:
            typeof saved.rippleEnabled === "boolean"
              ? saved.rippleEnabled
              : defaults.rippleEnabled,
          rippleStrength: level(saved.rippleStrength, defaults.rippleStrength),
          rippleDensity: level(saved.rippleDensity, defaults.rippleDensity),
          clickEnabled:
            typeof saved.clickEnabled === "boolean"
              ? saved.clickEnabled
              : defaults.clickEnabled,
          clickStyle:
            saved.clickStyle === "confetti" || saved.clickStyle === "rings"
              ? saved.clickStyle
              : "spark",
          clickAmount: level(saved.clickAmount, defaults.clickAmount),
        });
    } catch {
      /* Keep usable defaults if local storage is unavailable or invalid. */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* Effects still work for this visit. */
    }
  }, [loaded, settings]);

  const updateEffects = (change: Partial<EffectSettings>) =>
    setSettings((current) => ({ ...current, ...change }));

  return (
    <EffectContext.Provider value={{ ...settings, updateEffects }}>
      {children}
    </EffectContext.Provider>
  );
}

export function useGlobalEffects() {
  const context = useContext(EffectContext);
  if (!context)
    throw new Error(
      "useGlobalEffects must be used within GlobalEffectsProvider",
    );
  return context;
}
