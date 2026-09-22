"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { INDEX_INITIAL_THEME, THEME_USER_SELECTION_KEY } from "@/lib/theme-preference";

// 客户端路由回到首页时，内联脚本不会再次执行；这个守卫负责保持同一规则。
export function IndexThemeInitializer() {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (window.localStorage.getItem(THEME_USER_SELECTION_KEY) !== "true") {
      setTheme(INDEX_INITIAL_THEME);
    }
  }, [setTheme]);

  return null;
}
