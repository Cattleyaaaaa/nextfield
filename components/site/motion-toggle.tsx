"use client";

import { Waves } from "lucide-react";
import { usePageTransition } from "@/components/site/page-transition-provider";
import { HeaderSpecularButton } from "@/components/site/header-specular-button";

export function MotionToggle() {
  const { motionEnabled, toggleMotion } = usePageTransition();

  return (
    <HeaderSpecularButton
      ariaLabel={motionEnabled ? "关闭水波动效" : "开启水波动效"}
      ariaPressed={motionEnabled}
      className="header-specular-button--icon"
      onClick={toggleMotion}
      title={motionEnabled ? "关闭水波动效" : "开启水波动效"}
      type="button"
    >
      <Waves className={motionEnabled ? "size-4 text-accent" : "size-4"} />
    </HeaderSpecularButton>
  );
}
