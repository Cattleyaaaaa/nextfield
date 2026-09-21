"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { usePageTransition } from "@/components/site/page-transition-provider";

type TransitionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function TransitionLink({ href, onClick, ...props }: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || href.startsWith("#") || !href.startsWith("/")) return;
    event.preventDefault();
    navigate(href, { x: event.clientX, y: event.clientY });
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
