"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { BackToTopButton } from "@/components/site/back-to-top-button";
import { GlobalEffectsMenu } from "@/components/site/global-effects-menu";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { TransitionLink } from "@/components/site/transition-link";
import { useStudioBadgeDrop } from "@/components/visual/studio-badge-drop";
import {
  BadgePlus,
  Github,
  GraduationCap,
  ChartNoAxesCombined,
} from "lucide-react";
import {
  LanguageToggle,
  useLanguage,
} from "@/components/site/language-provider";
import { ExploreMenu } from "@/components/site/explore-menu";
import { headerSections } from "@/lib/nav";
import { siteConfig } from "@/site.config";

// 首页已经是门户，站内导航全部走真实路由：
// /about（九屏自述）、/projects、/blog。不再依赖切屏事件。
export function Header() {
  const { locale } = useLanguage();
  const { dropBadge } = useStudioBadgeDrop();
  const { navigate } = usePageTransition();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-site items-center justify-between gap-3 px-5 py-2 sm:px-8 lg:px-12">
        <TransitionLink
          className="group flex shrink-0 items-center gap-3"
          href="/"
        >
          <span className="grid size-7 place-items-center rounded-full bg-ink text-[10px] font-bold text-paper transition-transform duration-300 group-hover:rotate-12">
            N
          </span>
          <span className="hidden text-sm font-semibold tracking-[-0.02em] sm:inline">
            {siteConfig.name}
          </span>
        </TransitionLink>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 sm:gap-2 xl:gap-4">
          <nav
            aria-label="主导航"
            className="hidden items-center gap-1 lg:flex xl:gap-3"
          >
            {headerSections.map((section) => {
              // 首页的 href 是 "/"，startsWith 会误判所有路由，根路径要特判成全等。
              const active =
                section.href === "/"
                  ? pathname === "/"
                  : pathname === section.href ||
                    pathname.startsWith(`${section.href}/`);
              return (
                <HeaderSpecularButton
                  className={
                    active
                      ? "header-specular-button--nav header-specular-button--active"
                      : "header-specular-button--nav"
                  }
                  href={section.href}
                  key={section.href}
                  onLinkClick={(event) => {
                    if (
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    event.preventDefault();
                    navigate(section.href, {
                      x: event.clientX,
                      y: event.clientY,
                    });
                  }}
                >
                  {section.eyebrow}
                </HeaderSpecularButton>
              );
            })}
          </nav>
          <HeaderSpecularButton
            ariaLabel="进入 FIELD SCHOOL"
            className={
              pathname.startsWith("/learn")
                ? "header-specular-button--studio header-specular-button--active"
                : "header-specular-button--studio"
            }
            href="/learn"
            onLinkClick={(event) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              navigate("/learn", { x: event.clientX, y: event.clientY });
            }}
          >
            <GraduationCap className="size-3.5" />
            <span className="hidden xl:inline">LEARN</span>
          </HeaderSpecularButton>
          {pathname.startsWith("/learn") && (
            <TransitionLink
              href="/learn/login"
              aria-label={locale === "zh" ? "GitHub 登录" : "GitHub sign-in"}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs text-ink hover:border-accent hover:text-accent"
            >
              <Github className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">
                {locale === "zh" ? "登录" : "Sign in"}
              </span>
            </TransitionLink>
          )}
          <HeaderSpecularButton
            ariaLabel={locale === "zh" ? "访问统计" : "Analytics"}
            title={locale === "zh" ? "访问统计" : "Analytics"}
            className={
              pathname.startsWith("/analytics")
                ? "header-specular-button--studio header-specular-button--active"
                : "header-specular-button--studio"
            }
            href="/analytics"
            onLinkClick={(event) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              navigate("/analytics", { x: event.clientX, y: event.clientY });
            }}
          >
            <ChartNoAxesCombined className="size-3.5" />
            <span className="hidden xl:inline">
              {locale === "zh" ? "统计" : "Analytics"}
            </span>
          </HeaderSpecularButton>
          <ExploreMenu />
          <HeaderSpecularButton
            ariaLabel="DROP ID · 掉落工牌"
            className="header-specular-button--studio"
            onClick={dropBadge}
            type="button"
          >
            <BadgePlus className="size-3.5" />{" "}
            <span className="hidden xl:inline">DROP ID</span>
          </HeaderSpecularButton>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <div className="hidden sm:block">
              <BackToTopButton />
            </div>
            <GlobalEffectsMenu />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
