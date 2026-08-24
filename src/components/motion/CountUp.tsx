"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Animates a number counting up to `value` (formatted with `format`, e.g.
 * formatDuration/formatMeters/formatSplit — all already pure `number ->
 * string` functions, so this works for split times, distances, and plain
 * counts alike) the first time it scrolls into view, and again if `value`
 * changes afterward (a goal's progress updating, a bucket toggle changing
 * which PR is shown, etc).
 *
 * Uses framer-motion's `animate()` (requestAnimationFrame-driven), not
 * setTimeout/setInterval. For `prefers-reduced-motion`, skips the
 * IntersectionObserver dependency entirely and just shows the real value —
 * unlike Reveal.tsx's opacity (which stays visually correct either way),
 * a stat tile stuck waiting on an observer that never fires would show a
 * *wrong* number (0m instead of the real total), not just an invisible one.
 */
export function CountUp({
  value,
  format,
  duration = 0.8,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(() => format(0));
  const lastValue = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion || !inView) return;
    const from = lastValue.current;
    const controls = animate(from, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(format(v)),
      onComplete: () => {
        lastValue.current = value;
      },
    });
    return () => controls.stop();
  }, [prefersReducedMotion, inView, value, duration, format]);

  // Reduced motion renders the live value directly rather than through
  // `display` state, so it's never at the mercy of the IntersectionObserver
  // that drives the animated path ever firing.
  return <span ref={ref}>{prefersReducedMotion ? format(value) : display}</span>;
}
