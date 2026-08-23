import { formatMeters } from "@/lib/format";
import { formatSplit } from "@/lib/pace";
import {
  bestSplitForBucket,
  workoutsThisMonth,
  type DashboardWorkout,
} from "@/lib/dashboard";

export type GoalKind = "SPLIT_TARGET" | "TOTAL_METERS" | "MONTHLY_WORKOUTS";

export type GoalRecord = {
  id: string;
  type: GoalKind;
  label: string | null;
  targetDistanceMeters: number | null;
  targetSplitSeconds500m: number | null;
  targetMeters: number | null;
  targetWorkoutsPerMonth: number | null;
  createdAt: string;
};

export type GoalProgress = {
  id: string;
  type: GoalKind;
  displayLabel: string;
  currentText: string;
  targetText: string;
  /** 0–100, or null if there's no data yet to measure against. */
  progressPct: number | null;
  achieved: boolean;
};

/**
 * Turn a stored Goal target into live progress against the workout log.
 * Nothing here is persisted — re-derived from `workouts` on every render,
 * so a goal's progress bar can never go stale.
 */
export function computeGoalProgress(goal: GoalRecord, workouts: DashboardWorkout[]): GoalProgress {
  switch (goal.type) {
    case "SPLIT_TARGET": {
      const bucket = goal.targetDistanceMeters ?? 0;
      const target = goal.targetSplitSeconds500m ?? 0;
      const best = bestSplitForBucket(workouts, bucket);
      const current = best?.avgSplitSeconds500m ?? null;
      const achieved = current !== null && current <= target;
      return {
        id: goal.id,
        type: goal.type,
        displayLabel: goal.label || `Sub-${formatSplit(target)} ${bucket}m`,
        currentText: current !== null ? formatSplit(current) : "—",
        targetText: formatSplit(target),
        progressPct: current !== null ? clampPct((target / current) * 100) : null,
        achieved,
      };
    }
    case "TOTAL_METERS": {
      const target = goal.targetMeters ?? 0;
      const current = workouts.reduce((sum, w) => sum + w.totalDistanceMeters, 0);
      return {
        id: goal.id,
        type: goal.type,
        displayLabel: goal.label || `${formatMeters(target)} total`,
        currentText: formatMeters(current),
        targetText: formatMeters(target),
        progressPct: target > 0 ? clampPct((current / target) * 100) : null,
        achieved: current >= target,
      };
    }
    case "MONTHLY_WORKOUTS": {
      const target = goal.targetWorkoutsPerMonth ?? 0;
      const current = workoutsThisMonth(workouts);
      return {
        id: goal.id,
        type: goal.type,
        displayLabel: goal.label || `${target} workouts/month`,
        currentText: String(current),
        targetText: String(target),
        progressPct: target > 0 ? clampPct((current / target) * 100) : null,
        achieved: current >= target,
      };
    }
  }
}

function clampPct(pct: number): number {
  return Math.max(0, Math.min(100, Math.round(pct)));
}
