import { DISTANCE_PRESETS } from "@/lib/constants";
import { classifyPacing, type PacingResult } from "@/lib/pace";

export type DashboardSplit = {
  index: number;
  distanceMeters: number;
  timeSeconds: number;
  splitSeconds500m: number;
  avgStrokeRate: number | null;
};

export type DashboardWorkout = {
  id: string;
  date: string; // ISO
  type: string;
  title: string | null;
  totalDistanceMeters: number;
  totalTimeSeconds: number;
  avgSplitSeconds500m: number;
  avgHeartRate: number | null;
  splits: DashboardSplit[];
};

/** Snap a distance to the nearest standard erg test distance (2k, 5k, ...)
 * when it's within 8%, so PRs/trends group "2000m" and "2003m" together. */
export function bucketDistance(meters: number): number | null {
  for (const preset of DISTANCE_PRESETS) {
    if (Math.abs(meters - preset) / preset <= 0.08) return preset;
  }
  return null;
}

export function distinctBuckets(workouts: DashboardWorkout[]): number[] {
  const set = new Set<number>();
  for (const w of workouts) {
    const bucket = bucketDistance(w.totalDistanceMeters);
    if (bucket) set.add(bucket);
  }
  return [...set].sort((a, b) => a - b);
}

/** Start (Monday, 00:00) of the training week containing `date`. Shared by
 * volumeSummary and dailyVolumeThisWeek so "this week" always means the
 * same seven days in both — a training week runs Monday through Sunday,
 * not the JS-default Sunday-through-Saturday. */
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const daysSinceMonday = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - daysSinceMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Best (lowest) split for a given distance bucket — the PR card. */
export function bestSplitForBucket(
  workouts: DashboardWorkout[],
  bucket: number,
): DashboardWorkout | null {
  const inBucket = workouts.filter((w) => bucketDistance(w.totalDistanceMeters) === bucket);
  if (inBucket.length === 0) return null;
  return inBucket.reduce((best, w) =>
    w.avgSplitSeconds500m < best.avgSplitSeconds500m ? w : best,
  );
}

/** Every workout in a distance bucket, oldest first — the trend-chart series. */
export function workoutsInBucket(workouts: DashboardWorkout[], bucket: number): DashboardWorkout[] {
  return workouts
    .filter((w) => bucketDistance(w.totalDistanceMeters) === bucket)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Most recent result in a bucket — "Current 2K", as opposed to the PR. */
export function mostRecentInBucket(
  workouts: DashboardWorkout[],
  bucket: number,
): DashboardWorkout | null {
  const inBucket = workoutsInBucket(workouts, bucket);
  return inBucket.length ? inBucket[inBucket.length - 1] : null;
}

/**
 * Best fixed-time effort (e.g. a 30' test) by distance covered — the one
 * case where the PR metric is "more meters", not "lower split", so it can't
 * share bucketDistance/bestSplitForBucket. `toleranceRatio` matches
 * bucketDistance's 8% snap so a 29:50 test still counts as a 30' piece.
 */
export function bestFixedTimeEffort(
  workouts: DashboardWorkout[],
  targetSeconds: number,
  toleranceRatio = 0.08,
): DashboardWorkout | null {
  const near = workouts.filter(
    (w) =>
      w.type === "SINGLE_TIME" &&
      Math.abs(w.totalTimeSeconds - targetSeconds) / targetSeconds <= toleranceRatio,
  );
  if (near.length === 0) return null;
  return near.reduce((best, w) => (w.totalDistanceMeters > best.totalDistanceMeters ? w : best));
}

const BUCKET_LABELS: Record<number, string> = {
  500: "500m",
  1000: "1K",
  2000: "2K",
  5000: "5K",
  6000: "6K",
  10000: "10K",
};

/** Short display name for a distance bucket, e.g. 2000 -> "2K". */
export function bucketLabel(meters: number): string {
  return BUCKET_LABELS[meters] ?? `${meters}m`;
}

export type PersonalRecord = { bucket: number; workout: DashboardWorkout };

/** One PR per distance bucket actually present in the log. */
export function personalRecords(workouts: DashboardWorkout[]): PersonalRecord[] {
  return distinctBuckets(workouts)
    .map((bucket) => {
      const workout = bestSplitForBucket(workouts, bucket);
      return workout ? { bucket, workout } : null;
    })
    .filter((r): r is PersonalRecord => r !== null);
}

/** Count of workouts logged in the given calendar month (local time). */
export function workoutsThisMonth(workouts: DashboardWorkout[], now = new Date()): number {
  return workouts.filter((w) => {
    const d = new Date(w.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

/**
 * Start of the current "season". Row Tracker doesn't model explicit seasons
 * yet, so this assumes the common scholastic/club calendar of a Sept–Aug
 * training year (fall season through summer racing) rather than a plain
 * calendar year.
 */
export function seasonStart(now = new Date()): Date {
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1; // Sept = month 8
  return new Date(year, 8, 1);
}

export type VolumeSummary = {
  weekMeters: number;
  monthMeters: number;
  seasonMeters: number;
  workoutCount: number;
  avgWorkoutMeters: number;
};

/** Training-volume rollups for the Training Volume card. */
export function volumeSummary(workouts: DashboardWorkout[], now = new Date()): VolumeSummary {
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const season = seasonStart(now);

  let weekMeters = 0;
  let monthMeters = 0;
  let seasonMeters = 0;

  for (const w of workouts) {
    const d = new Date(w.date);
    if (d >= weekStart) weekMeters += w.totalDistanceMeters;
    if (d >= monthStart) monthMeters += w.totalDistanceMeters;
    if (d >= season) seasonMeters += w.totalDistanceMeters;
  }

  return {
    weekMeters,
    monthMeters,
    seasonMeters,
    workoutCount: workouts.length,
    avgWorkoutMeters: workouts.length
      ? workouts.reduce((sum, w) => sum + w.totalDistanceMeters, 0) / workouts.length
      : 0,
  };
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Meters per day for the current week, Monday through Sunday. */
export function dailyVolumeThisWeek(
  workouts: DashboardWorkout[],
  now = new Date(),
): { day: string; meters: number }[] {
  const mondayStart = startOfWeek(now);
  const nextMonday = new Date(mondayStart);
  nextMonday.setDate(nextMonday.getDate() + 7);

  const meters = new Array(7).fill(0) as number[];
  for (const w of workouts) {
    const d = new Date(w.date);
    if (d < mondayStart || d >= nextMonday) continue;
    const dayIndex = (Math.floor((d.getTime() - mondayStart.getTime()) / 86_400_000) + 7) % 7;
    meters[dayIndex] += w.totalDistanceMeters;
  }

  return DAY_LABELS.map((day, i) => ({ day, meters: meters[i] }));
}

/** Most recent personal piece with enough splits to analyze pacing. */
export function latestPacedPiece(workouts: DashboardWorkout[]): DashboardWorkout | null {
  const withSplits = workouts.filter((w) => w.splits.length >= 2);
  if (withSplits.length === 0) return null;
  return withSplits.reduce((latest, w) => (w.date > latest.date ? w : latest));
}

export type PacingRange = {
  index: number;
  startMeters: number;
  endMeters: number;
  splitSeconds500m: number;
};

export type PacingSummary = {
  ranges: PacingRange[];
  fastest: PacingRange;
  slowest: PacingRange;
  averageSplitSeconds500m: number;
  pacing: PacingResult;
  strokeRateChange: number | null; // last split's rate minus first's, if both logged
};

/** Fastest/slowest/average split plus overall pacing shape for one piece. */
export function pacingSummary(splits: DashboardSplit[]): PacingSummary | null {
  if (splits.length < 2) return null;

  let cursor = 0;
  const ranges: PacingRange[] = splits
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((s) => {
      const range = {
        index: s.index,
        startMeters: cursor,
        endMeters: cursor + s.distanceMeters,
        splitSeconds500m: s.splitSeconds500m,
      };
      cursor = range.endMeters;
      return range;
    });

  const fastest = ranges.reduce((a, b) => (b.splitSeconds500m < a.splitSeconds500m ? b : a));
  const slowest = ranges.reduce((a, b) => (b.splitSeconds500m > a.splitSeconds500m ? b : a));
  const averageSplitSeconds500m =
    ranges.reduce((sum, r) => sum + r.splitSeconds500m, 0) / ranges.length;

  const rates = splits
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((s) => s.avgStrokeRate);
  const firstRate = rates[0];
  const lastRate = rates[rates.length - 1];
  const strokeRateChange =
    firstRate !== null && lastRate !== null ? lastRate - firstRate : null;

  return {
    ranges,
    fastest,
    slowest,
    averageSplitSeconds500m,
    pacing: classifyPacing(splits.map((s) => s.splitSeconds500m)),
    strokeRateChange,
  };
}

/** Simple least-squares fit, used to draw a trend line through a split series. */
export function linearRegression(values: number[]): (index: number) => number {
  const n = values.length;
  if (n === 0) return () => 0;
  if (n === 1) return () => values[0];

  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  return (index: number) => slope * index + intercept;
}

export type Insight = { id: string; text: string };

/**
 * Data-backed observations for the Training Insights card. Every string
 * here is computed from the actual log — there's no "you're crushing it"
 * filler when there isn't enough data to say so.
 */
export function buildInsights(workouts: DashboardWorkout[], now = new Date()): Insight[] {
  const insights: Insight[] = [];

  // 1. Split trend on whichever distance bucket has the most data.
  const buckets = distinctBuckets(workouts);
  const primaryBucket = buckets
    .map((b) => ({ b, pieces: workoutsInBucket(workouts, b) }))
    .sort((a, b) => b.pieces.length - a.pieces.length)[0];

  if (primaryBucket && primaryBucket.pieces.length >= 4) {
    const pieces = primaryBucket.pieces;
    const mid = Math.floor(pieces.length / 2);
    const firstHalfAvg = average(pieces.slice(0, mid).map((w) => w.avgSplitSeconds500m));
    const secondHalfAvg = average(pieces.slice(mid).map((w) => w.avgSplitSeconds500m));
    const diff = firstHalfAvg - secondHalfAvg; // positive = got faster

    if (Math.abs(diff) >= 0.3) {
      insights.push({
        id: "split-trend",
        text: `Your average ${primaryBucket.b}m split has ${diff > 0 ? "improved" : "slipped"} by ${Math.abs(diff).toFixed(1)}s over your last ${pieces.length} pieces at that distance.`,
      });
    } else {
      insights.push({
        id: "split-trend",
        text: `Your average ${primaryBucket.b}m split has held steady across your last ${pieces.length} pieces at that distance.`,
      });
    }
  }

  // 2. Volume trend, trailing 7 days vs the 7 days before that.
  const last7 = sumSince(workouts, daysAgo(now, 7), now);
  const prev7 = sumSince(workouts, daysAgo(now, 14), daysAgo(now, 7));
  if (prev7 > 0) {
    const pctChange = ((last7 - prev7) / prev7) * 100;
    if (Math.abs(pctChange) >= 5) {
      insights.push({
        id: "volume-trend",
        text: `Training volume: you've logged ${formatKm(last7)} in the last 7 days, ${pctChange > 0 ? "up" : "down"} ${Math.abs(pctChange).toFixed(0)}% from the week before.`,
      });
    }
  }

  // 3. Pacing shape across recent multi-split pieces.
  const pacedPieces = workouts.filter((w) => w.splits.length >= 2).slice(-6);
  if (pacedPieces.length >= 2) {
    const finishDiffs = pacedPieces.map((w) => {
      const sorted = w.splits.slice().sort((a, b) => a.index - b.index);
      return sorted[0].splitSeconds500m - sorted[sorted.length - 1].splitSeconds500m; // positive = finished faster
    });
    const avgFinishDiff = average(finishDiffs);
    if (Math.abs(avgFinishDiff) >= 0.3) {
      insights.push({
        id: "pacing-shape",
        text:
          avgFinishDiff > 0
            ? `Your last ${pacedPieces.length} multi-split pieces averaged a ${avgFinishDiff.toFixed(1)}s negative split — you're finishing stronger than you start.`
            : `Your last ${pacedPieces.length} multi-split pieces averaged a ${Math.abs(avgFinishDiff).toFixed(1)}s positive split — you're fading toward the end.`,
      });
    }
  }

  return insights;
}

function average(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function daysAgo(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d;
}

function sumSince(workouts: DashboardWorkout[], start: Date, end: Date): number {
  return workouts
    .filter((w) => {
      const d = new Date(w.date);
      return d >= start && d < end;
    })
    .reduce((sum, w) => sum + w.totalDistanceMeters, 0);
}

function formatKm(meters: number): string {
  return `${(meters / 1000).toFixed(1)}km`;
}
