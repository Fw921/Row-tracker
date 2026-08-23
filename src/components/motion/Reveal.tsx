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

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};

/** <ul> that staggers its <RevealListItem> children in as it enters view. */
export function RevealList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.ul
      data-reveal
      className={className}
      initial={useInitialState()}
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={staggerContainer}
    >
      {children}
    </motion.ul>
  );
}

export function RevealListItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.li data-reveal className={className} variants={staggerItem}>
      {children}
    </motion.li>
  );
}

/** <tbody> version of the same stagger, for table rows. */
export function RevealTableBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.tbody
      data-reveal
      className={className}
      initial={useInitialState()}
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={staggerContainer}
    >
      {children}
    </motion.tbody>
  );
}

export function RevealRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.tr data-reveal className={className} variants={staggerItem}>
      {children}
    </motion.tr>
  );
}
