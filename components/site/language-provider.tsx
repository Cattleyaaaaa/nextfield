"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";
import { localizeText } from "@/lib/translations";

export type Locale = "zh" | "en";
const LanguageContext = createContext<{ locale: Locale; toggle: () => void }>({ locale: "zh", toggle: () => {} });
const textStates = new WeakMap<Text, { source: string; rendered: string }>();
const attributeStates = new WeakMap<Element, Map<string, { source: string; rendered: string }>>();

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
  useEffect(() => { const saved = window.localStorage.getItem("nextfield-language"); if (saved === "en") setLocale("en"); }, []);
  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
    document.documentElement.dataset.locale = locale;
    window.localStorage.setItem("nextfield-language", locale);
    translateTree(document.body, locale);
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => {
      if (mutation.type === "characterData") translateNode(mutation.target as Text, locale);
      if (mutation.type === "attributes") translateAttributes(mutation.target as Element, locale);
      mutation.addedNodes.forEach((node) => translateTree(node, locale));
    }));
    observer.observe(document.body, { attributes: true, attributeFilter: ["placeholder", "title", "aria-label"], characterData: true, childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);
  return <LanguageContext.Provider value={{ locale, toggle: () => setLocale((value) => value === "zh" ? "en" : "zh") }}>{children}</LanguageContext.Provider>;
}

export function LanguageToggle({ footer = false }: { footer?: boolean }) {
  const { locale, toggle } = useContext(LanguageContext);
  if (footer) return <button className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent" onClick={toggle} type="button"><Languages className="size-3.5" />{locale === "zh" ? "EN" : "中文"}</button>;
  return <HeaderSpecularButton ariaLabel={locale === "zh" ? "Switch site to English" : "将网站切换为中文"} className="header-specular-button--icon" onClick={toggle} title={locale === "zh" ? "English" : "中文"} type="button"><span className="font-mono text-[9px] font-semibold">{locale === "zh" ? "EN" : "中"}</span></HeaderSpecularButton>;
}
