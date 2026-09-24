import { KineticHero } from "@/components/home/kinetic-hero";
import { ZentryHome } from "@/components/home/zentry-home";
import { ProjectConstellation } from "@/components/home/project-constellation";
import { OpenExperiments } from "@/components/home/open-experiments";
import { SelectedNotes } from "@/components/home/selected-notes";
import { CapabilityMap, DailyField, FieldChannels, VisitorTrace } from "@/components/home/field-systems";
import { TransitionLink } from "@/components/site/transition-link";
import { ArrowUpRight } from "lucide-react";
import { IndexThemeInitializer } from "@/components/site/index-theme-initializer";
import { INDEX_INITIAL_THEME, THEME_STORAGE_KEY, THEME_USER_SELECTION_KEY } from "@/lib/theme-preference";
import { getPublishedPosts } from "@/lib/posts";
import { FieldSchoolCallout } from "@/components/home/field-school-callout";
import { StartHere } from "@/components/home/start-here";
import { BuildJourney } from "@/components/home/build-journey";

// 首页采用大字叙事、滚动舞台与能力卡片；只使用 CSS / GSAP / React Bits 微交互。
const INDEX_THEME_BOOTSTRAP = `try {
  if (window.localStorage.getItem("${THEME_USER_SELECTION_KEY}") !== "true") {
    window.localStorage.setItem("${THEME_STORAGE_KEY}", "${INDEX_INITIAL_THEME}");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("${INDEX_INITIAL_THEME}");
    document.documentElement.style.colorScheme = "${INDEX_INITIAL_THEME}";
  }
} catch {}`;

export default function HomePage() {
  const selectedPosts = getPublishedPosts().slice(0, 3);
  const dateParts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Hong_Kong", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((item) => item.type === type)?.value ?? "00";
  const dayKey = `${part("year")}-${part("month")}-${part("day")}`;

  return (
    <div className="relative isolate">
      <script dangerouslySetInnerHTML={{ __html: INDEX_THEME_BOOTSTRAP }} />
      <IndexThemeInitializer />
      <KineticHero />
      <ZentryHome />
      <StartHere />
      <FieldSchoolCallout />
      <ProjectConstellation />
      <BuildJourney />
      <DailyField dayKey={dayKey} />
      <FieldChannels />
      <OpenExperiments />
      <CapabilityMap />
      <SelectedNotes posts={selectedPosts} />
      <VisitorTrace />
      <section className="mx-auto max-w-site px-5 py-24 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] bg-ink px-7 py-14 text-paper sm:px-12 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-liquid-foam">Colophon / 07</p>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><h2 className="max-w-4xl font-display text-[clamp(3rem,6vw,6rem)] leading-[0.86] tracking-[-0.06em]">BUILT IN THE OPEN.<br /><span className="text-paper/45">ALWAYS IN PROGRESS.</span></h2><TransitionLink className="inline-flex items-center gap-3 rounded-full bg-paper px-6 py-4 text-sm font-medium text-ink hover:bg-liquid-foam" href="/colophon">阅读制作说明 <ArrowUpRight className="size-4" /></TransitionLink></div>
        </div>
      </section>
    </div>
  );
}
