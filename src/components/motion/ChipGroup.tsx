"use client";

import clsx from "clsx";
import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Wraps a row of `Chip`s (src/components/ui.tsx, rendered with `bare`) in
 * a shared sliding pill instead of each chip toggling its own background
 * fill on click — adapted from transitions.dev's "tabs sliding" transition
 * (`npx skills add Jakubantalik/transitions.dev`; `.t-tabs-pill` in
 * globals.css owns the CSS tween). Reads each chip's `data-active`
 * attribute to find the active one and measures its offsetLeft/
 * offsetWidth onto the pill.
 *
 * Only meant for a small, single-row, mutually-exclusive set (a distance
 * bucket toggle, a view switcher) — the pill tracks X position only, so
 * with more chips than fit one line it'll look off once they wrap.
 */
export function ChipGroup({ children, className }: { children: ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const mountedRef = useRef(false);

  function place(snap: boolean) {
    const container = containerRef.current;
    const pill = pillRef.current;
    if (!container || !pill) return;
    const active = container.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) {
      pill.style.width = "0px";
      return;
    }
    if (snap) {
      // First paint and resize: suspend the transition so the pill
      // snaps straight to position instead of visibly sliding in from
      // translateX(0) / width: 0.
      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
      void pill.offsetWidth; // force reflow
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
    }
  }

  // Reposition on every render — cheap for a handful of buttons, and the
  // only reliable way to catch "the active chip changed" without asking
  // callers to pass the active value in separately.
  useLayoutEffect(() => {
    place(!mountedRef.current);
    mountedRef.current = true;
  });

  useLayoutEffect(() => {
    const onResize = () => place(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div ref={containerRef} className={clsx("t-tabs relative inline-flex flex-wrap items-center gap-1.5", className)}>
      <span ref={pillRef} aria-hidden className="t-tabs-pill rounded-full bg-accent-soft" />
      {children}
    </div>
  );
}
