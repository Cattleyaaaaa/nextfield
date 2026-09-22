"use client";

import { useEffect, useState } from "react";

type Period = "morning" | "day" | "evening" | "night";

function getPeriod(hour: number): Period {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 18) return "day";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export function FieldAtmosphere() {
  const [period, setPeriod] = useState<Period>("day");
  useEffect(() => {
    const update = () => {
      const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Hong_Kong", hour: "2-digit", hour12: false }).format(new Date()));
      const next = getPeriod(hour % 24);
      setPeriod(next);
      document.documentElement.dataset.fieldTime = next;
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => { window.clearInterval(timer); delete document.documentElement.dataset.fieldTime; };
  }, []);
  return <div aria-hidden="true" className={`field-atmosphere field-atmosphere--${period}`} />;
}
