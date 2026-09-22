"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { THEME_USER_SELECTION_KEY } from "@/lib/theme-preference";

// 圆形揭示的时长 —— 通过 CSS 变量传给 globals.css 里的 ::view-transition-new，
// 这样 JS 与 CSS 只有一处真值。
const THEME_WIPE_DURATION = 620;
// 兜底路径：临时给所有元素补上颜色过渡的 class 与时长
const THEME_FALLBACK_CLASS = "theme-transition";
const THEME_FALLBACK_DURATION = 480;

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reducedMotion = useMotionPreference();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 兜底路径：只改 body / a / button / section 的过渡不够，正文与边框会直接跳，
  // 所以先临时把颜色过渡补给所有元素，切完再摘掉。
  const applyThemeDirectly = useCallback((next: "light" | "dark") => {
    const root = document.documentElement;
    root.classList.add(THEME_FALLBACK_CLASS);
    window.setTimeout(() => root.classList.remove(THEME_FALLBACK_CLASS), THEME_FALLBACK_DURATION);
    setTheme(next);
  }, [setTheme]);

  const onToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    // 首页只在用户从未选过主题时固定浅色；首次主动切换后始终尊重该选择。
    window.localStorage.setItem(THEME_USER_SELECTION_KEY, "true");
    const viewTransitionDocument = document as unknown as ViewTransitionDocument;
    const startViewTransition = viewTransitionDocument.startViewTransition;

    // 不支持 View Transitions（Firefox 等）或用户要求减弱动效时，退回统一交叉淡入。
    if (reducedMotion || typeof startViewTransition !== "function") {
      applyThemeDirectly(next);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    root.style.setProperty("--theme-wipe-x", `${rect.left + rect.width / 2}px`);
    root.style.setProperty("--theme-wipe-y", `${rect.top + rect.height / 2}px`);
    root.style.setProperty("--theme-wipe-duration", `${THEME_WIPE_DURATION}ms`);
    root.classList.remove(THEME_FALLBACK_CLASS);

    startViewTransition.call(document, () => {
      // 必须同步改 DOM：圆形揭示的「新」快照在这一帧就拍完了，
      // 而 next-themes 的 setTheme 是异步提交，赶不上这一帧。
      root.classList.toggle("dark", next === "dark");
      setTheme(next);
    });
  };

  return (
    <HeaderSpecularButton
      ariaLabel={mounted && resolvedTheme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      className="header-specular-button--icon"
      onClick={onToggle}
      type="button"
    >
      <Sun className="size-4 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
    </HeaderSpecularButton>
  );
}
