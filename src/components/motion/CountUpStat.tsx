"use client";

import { CountUp } from "@/components/motion/CountUp";
import { formatCount, formatMeters } from "@/lib/format";
import { formatDuration, formatSplit } from "@/lib/pace";

const FORMATTERS = {
  meters: formatMeters,
  duration: formatDuration,
  split: formatSplit,
  count: formatCount,
  bpm: (n: number) => `${formatCount(n)} bpm`,
  watts: (n: number) => `${formatCount(n)}W`,
  strokeRate: (n: number) => `${formatCount(n)}/min`,
} as const;

export type StatFormatKind = keyof typeof FORMATTERS;

/**
 * Same job as CountUp, but for callers on the server side of the RSC
 * boundary — a Server Component page (workouts/[id], profile) can't hand a
 * `format` *function* to a Client Component prop (React can only send
 * serializable data across that boundary; a function isn't). Passing a
 * `kind` string instead and resolving it to a real formatter in here, where
 * everything is already client-side, sidesteps that restriction entirely.
 *
 * Client Components that already hold a real function in hand (the charts,
 * GoalsCard, etc.) don't need this — they render CountUp directly, since
 * for them the function never has to cross a server/client boundary.
 */
export function CountUpStat({ value, kind }: { value: number; kind: StatFormatKind }) {
  return <CountUp value={value} format={FORMATTERS[kind]} />;
}
