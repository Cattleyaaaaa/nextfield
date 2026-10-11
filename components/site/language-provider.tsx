"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";
import { localizeText } from "@/lib/translations";

export type Locale = "zh" | "en";
const LanguageContext = createContext<{ locale: Locale; toggle: () => void }>({ locale: "zh", toggle: () => {} });
const LANGUAGE_PREFERENCE_KEY = "nextfield-language-preference";
const textStates = new WeakMap<Text, { source: string; rendered: string }>();
const attributeStates = new WeakMap<Element, Map<string, { source: string; rendered: string }>>();

function getBrowserLocale(): Locale {
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const preference of preferences) {
    const language = preference.toLowerCase();
    if (language.startsWith("zh")) return "zh";
    if (language.startsWith("en")) return "en";
  }
  return "en";
}

function getSavedLocale(value: string | null): Locale | null {
  return value === "zh" || value === "en" ? value : null;
}

function translateNode(node: Text, locale: Locale) {
  const raw = node.nodeValue ?? "";
  if (!raw.trim() || node.parentElement?.closest("script,style,noscript,code,pre")) return;
  const previous = textStates.get(node);
  const source = previous && raw === previous.rendered ? previous.source : raw;
  const trimmed = source.trim();
  const localized = localizeText(trimmed, locale);
  const rendered = localized === trimmed ? source : source.replace(trimmed, localized);
  textStates.set(node, { source, rendered });
  if (raw !== rendered) node.nodeValue = rendered;
}

function translateAttributes(element: Element, locale: Locale) {
  const states = attributeStates.get(element) ?? new Map<string, { source: string; rendered: string }>();
  ["placeholder", "title", "aria-label"].forEach((attribute) => {
    const raw = element.getAttribute(attribute); if (!raw) return;
    const previous = states.get(attribute);
    const source = previous && raw === previous.rendered ? previous.source : raw;
    const rendered = localizeText(source, locale);
    states.set(attribute, { source, rendered });
    if (raw !== rendered) element.setAttribute(attribute, rendered);
  });
  if (states.size) attributeStates.set(element, states);
}

function translateTree(root: Node, locale: Locale) {
  if (root.nodeType === Node.TEXT_NODE) { translateNode(root as Text, locale); return; }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) { translateNode(node as Text, locale); node = walker.nextNode(); }
  if (root instanceof Element) {
    const elements = [root, ...Array.from(root.querySelectorAll("[placeholder],[title],[aria-label]"))];
    elements.forEach((element) => translateAttributes(element, locale));
  }
}

export function useLanguage() { return useContext(LanguageContext); }

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");
  useEffect(() => {
    try {
      const savedPreference = window.localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
      setLocale(getSavedLocale(savedPreference) ?? getBrowserLocale());
    } catch {
      setLocale(getBrowserLocale());
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.locale = locale;
    translateTree(document.body, locale);
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => {
      if (mutation.type === "characterData") translateNode(mutation.target as Text, locale);
      if (mutation.type === "attributes") translateAttributes(mutation.target as Element, locale);
      mutation.addedNodes.forEach((node) => translateTree(node, locale));
    }));
    observer.observe(document.body, { attributes: true, attributeFilter: ["placeholder", "title", "aria-label"], characterData: true, childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);
  const chooseLocale = (next: Locale) => {
    setLocale(next);
    try {
      window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, next);
    } catch { /* Keep the current-session selection even if Storage is unavailable. */ }
  };
  const toggle = () => chooseLocale(locale === "zh" ? "en" : "zh");
  return <LanguageContext.Provider value={{ locale, toggle }}>{children}</LanguageContext.Provider>;
}

export function LanguageToggle({ footer = false }: { footer?: boolean }) {
  const { locale, toggle } = useContext(LanguageContext);
  if (footer) return <button className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent" onClick={toggle} type="button"><Languages className="size-3.5" />{locale === "zh" ? "EN" : "中文"}</button>;
  return <HeaderSpecularButton ariaLabel={locale === "zh" ? "Switch site to English" : "将网站切换为中文"} className="header-specular-button--icon" onClick={toggle} title={locale === "zh" ? "English" : "中文"} type="button"><span className="font-mono text-[9px] font-semibold">{locale === "zh" ? "EN" : "中文"}</span></HeaderSpecularButton>;
}
