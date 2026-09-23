import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { FieldRadio } from "@/components/site/field-radio";
import { ClickFireworks } from "@/components/site/click-fireworks";
import { NextfieldOS } from "@/components/site/nextfield-os";
import { FieldAtmosphere } from "@/components/site/field-atmosphere";
import { InkDrift } from "@/components/site/ink-drift";
import { MissionTracker } from "@/components/evidence/local-systems";
import { LanguageProvider } from "@/components/site/language-provider";
import { Header } from "@/components/site/header";
import { PageTransitionProvider } from "@/components/site/page-transition-provider";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Grain } from "@/components/visual/grain";
import { WaterRipple } from "@/components/visual/water-ripple";
import { StudioBadgeDropProvider } from "@/components/visual/studio-badge-drop";
import { siteConfig } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <Grain />
            <FieldAtmosphere />
            <StudioBadgeDropProvider>
              <PageTransitionProvider>
                <WaterRipple />
                <InkDrift />
                <ClickFireworks />
                <FieldRadio />
                <NextfieldOS />
                <MissionTracker />
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </PageTransitionProvider>
            </StudioBadgeDropProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
