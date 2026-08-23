"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// One consistent reveal recipe for the whole app — small fade + slight
// upward movement, ~350ms, triggers once as content enters the viewport.
// Deliberately the *only* scroll-reveal style in use (see instructions:
// consistency over variety), so every section/list reads as one system
// rather than a different effect per component.
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const REVEAL_TRANSITION = { duration: 0.35, ease: "easeOut" as const };
const REVEAL_VIEWPORT = { once: true, margin: "-40px" as const };

// A `whileInView` reveal depends on an IntersectionObserver actually firing
// — which never happens for `prefers-reduced-motion` (where we don't want
// the animation anyway) or scroll-less contexts like printing. Starting
// from "visible" instead of "hidden" for reduced-motion users means the
// content just renders normally with no animation, rather than depending
// on a trigger that may never come. `[data-reveal]` in globals.css is the
// second line of defense, forcing full opacity for print regardless.
function useInitialState(): "hidden" | "visible" {
  return useReducedMotion() ? "visible" : "hidden";
}

/** Wraps a single block (a dashboard section, a card) in the standard reveal. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={useInitialState()}
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={fadeUp}
      transition={{ ...REVEAL_TRANSITION, delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};

// RevealList/RevealTableBody used to own a single `whileInView` trigger
// (`once: true`) and fan its "visible" state out to children via inherited
// variants — a plain <ul>/<tbody> wrapper, no motion of its own. That broke
// the moment a list could grow after its first paint: a roster add, a new
// boat, a new goal, anything landing via router.refresh() rather than a
// full reload mounts into a container whose one-time trigger already fired
// and will never fire again, so the new item inherits nothing and never
// gets told to animate — stuck at `initial: hidden` (opacity 0) forever,
// present in the DOM but invisible, until a hard reload remounts
// everything from scratch. (Found live: adding a second roster athlete
// left it invisible on screen despite being saved correctly.)
//
// The fix is each RevealListItem/RevealRow driving its own `whileInView`
// instead of depending on a parent orchestration that can only fire once
// for whatever exists at that moment — so a newly-mounted item always gets
// its own fresh trigger, whenever it appears. The one-time deliberate
// staggerChildren cadence between items is the tradeoff: everything already
// in view now fades in at once rather than cascading, which is a small
// price for "the row you just added is actually visible."
export function RevealList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={className}>{children}</ul>;
}

export function RevealListItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.li
      data-reveal
      className={className}
      initial={useInitialState()}
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={staggerItem}
    >
      {children}
    </motion.li>
  );
}

/** <tbody> version of the same per-row reveal, for table rows. */
export function RevealTableBody({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={className}>{children}</tbody>;
}

export function RevealRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.tr
      data-reveal
      className={className}
      initial={useInitialState()}
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={staggerItem}
    >
      {children}
    </motion.tr>
  );
}
