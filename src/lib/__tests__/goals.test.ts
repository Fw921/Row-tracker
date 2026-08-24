import { describe, expect, it } from "vitest";
import { computeGoalProgress, type GoalRecord } from "@/lib/goals";
import type { DashboardWorkout } from "@/lib/dashboard";

function makeWorkout(overrides: Partial<DashboardWorkout>): DashboardWorkout {
  return {
    id: Math.random().toString(36),
    date: "2024-01-01T00:00:00.000Z",
    type: "SINGLE_DISTANCE",
    title: null,
    totalDistanceMeters: 2000,
    totalTimeSeconds: 420,
    avgSplitSeconds500m: 105,
    avgHeartRate: null,
    splits: [],
    ...overrides,
  };
}

function makeGoal(overrides: Partial<GoalRecord>): GoalRecord {
  return {
    id: "goal-1",
    type: "SPLIT_TARGET",
    label: null,
    targetDistanceMeters: null,
    targetSplitSeconds500m: null,
    targetMeters: null,
    targetWorkoutsPerMonth: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeGoalProgress", () => {
  it("computes SPLIT_TARGET progress from the best split in that bucket", () => {
    const goal = makeGoal({
      type: "SPLIT_TARGET",
      targetDistanceMeters: 2000,
      targetSplitSeconds500m: 105, // sub 7:00 2k
    });
    const workouts = [makeWorkout({ avgSplitSeconds500m: 110 })];

    const progress = computeGoalProgress(goal, workouts);
    expect(progress.progressPct).toBe(95); // 105/110
    expect(progress.achieved).toBe(false);
  });

  it("marks a SPLIT_TARGET goal achieved once the PR beats it, capped at 100%", () => {
    const goal = makeGoal({
      type: "SPLIT_TARGET",
      targetDistanceMeters: 2000,
      targetSplitSeconds500m: 105,
    });
    const workouts = [makeWorkout({ avgSplitSeconds500m: 100 })];

    const progress = computeGoalProgress(goal, workouts);
    expect(progress.achieved).toBe(true);
    expect(progress.progressPct).toBe(100);
  });

  it("returns null progress when there's no data for the bucket yet", () => {
    const goal = makeGoal({ type: "SPLIT_TARGET", targetDistanceMeters: 2000, targetSplitSeconds500m: 105 });
    const progress = computeGoalProgress(goal, []);
    expect(progress.progressPct).toBeNull();
    expect(progress.currentText).toBe("—");
  });

  it("computes TOTAL_METERS progress against cumulative distance", () => {
    const goal = makeGoal({ type: "TOTAL_METERS", targetMeters: 10_000 });
    const workouts = [
      makeWorkout({ totalDistanceMeters: 4000 }),
      makeWorkout({ totalDistanceMeters: 1000 }),
    ];
    const progress = computeGoalProgress(goal, workouts);
    expect(progress.progressPct).toBe(50);
    expect(progress.achieved).toBe(false);
  });

  it("computes MONTHLY_WORKOUTS progress against this calendar month's count", () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const goal = makeGoal({ type: "MONTHLY_WORKOUTS", targetWorkoutsPerMonth: 4 });
    const workouts = [makeWorkout({ date: thisMonth }), makeWorkout({ date: thisMonth })];

    const progress = computeGoalProgress(goal, workouts);
    expect(progress.progressPct).toBe(50);
    expect(progress.currentText).toBe("2");
  });
});
