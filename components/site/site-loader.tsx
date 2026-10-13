"use client";

import { useEffect, useState } from "react";

type LoaderPhase = "visible" | "leaving" | "hidden";

export function SiteLoader() {
  const [phase, setPhase] = useState<LoaderPhase>("visible");

  useEffect(() => {
    let minimumElapsed = false;
    let pageLoaded = document.readyState === "complete";
    let finished = false;

    const dismiss = () => {
      if (finished || !minimumElapsed || !pageLoaded) return;
      finished = true;
      setPhase("leaving");
      window.setTimeout(() => setPhase("hidden"), 400);
    };

    const onLoad = () => {
      pageLoaded = true;
      dismiss();
    };

    window.addEventListener("load", onLoad, { once: true });
    const minimumTimer = window.setTimeout(() => {
      minimumElapsed = true;
      dismiss();
    }, 420);
    const safetyTimer = window.setTimeout(() => {
      pageLoaded = true;
      minimumElapsed = true;
      dismiss();
    }, 4500);

    dismiss();

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(safetyTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-label="Loading NEXTFIELD"
      aria-live="polite"
      className={`site-loader${phase === "leaving" ? " site-loader--leaving" : ""}`}
      role="status"
    >
      <LoaderMark caption="FIELD SIGNAL / CONNECTING" />
    </div>
  );
}

function LoaderMark({ caption }: { caption: string }) {
  return (
    <div aria-hidden="true" className="site-loader__content">
      <div className="site-loader__field">
        <span className="site-loader__orbit site-loader__orbit--outer" />
        <span className="site-loader__orbit site-loader__orbit--inner" />
        <span className="site-loader__latitude" />
        <span className="site-loader__core" />
      </div>
      <div className="site-loader__wordmark">NEXTFIELD</div>
      <div className="site-loader__progress"><span /></div>
      <p className="site-loader__caption">{caption}</p>
    </div>
  );
}
