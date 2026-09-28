"use client";

import { useEffect, useState } from "react";
import { Github, LogOut } from "lucide-react";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";
import { useLanguage } from "@/components/site/language-provider";
import { getSchoolSession, type SchoolSession } from "@/lib/school-client";

export function HeaderAccountControl() {
  const { locale } = useLanguage();
  const [session, setSession] = useState<SchoolSession | null>(null);

  useEffect(() => {
    let active = true;
    getSchoolSession().then((value) => { if (active) setSession(value); }).catch(() => {
      if (active) setSession({ configured: false, user: null });
    });
    return () => { active = false; };
  }, []);

  async function signOut() {
    try {
      await fetch("/api/school/session", { method: "DELETE" });
    } finally {
      window.location.reload();
    }
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-1">
        <HeaderSpecularButton href="/learn/dashboard" ariaLabel={`${locale === "zh" ? "已登录" : "Signed in"}: ${session.user.name}`} title={session.user.name} className="header-specular-button--studio">
          <Github className="size-3.5" />
          <span className="hidden max-w-20 truncate sm:inline">{session.user.name}</span>
        </HeaderSpecularButton>
        <HeaderSpecularButton type="button" onClick={signOut} ariaLabel={locale === "zh" ? "退出登录" : "Sign out"} title={locale === "zh" ? "退出登录" : "Sign out"} className="header-specular-button--studio">
          <LogOut className="size-3.5" />
        </HeaderSpecularButton>
      </div>
    );
  }

  return (
    <HeaderSpecularButton href="/learn/login" ariaLabel={locale === "zh" ? "使用 GitHub 登录" : "Sign in with GitHub"} title={locale === "zh" ? "使用 GitHub 登录" : "Sign in with GitHub"} className="header-specular-button--studio">
      <Github className="size-3.5" />
      <span className="hidden sm:inline">{locale === "zh" ? "登录" : "Sign in"}</span>
    </HeaderSpecularButton>
  );
}
