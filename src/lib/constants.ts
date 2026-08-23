import type { WorkoutType } from "@/generated/prisma/enums";

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  SINGLE_DISTANCE: "Fixed distance (e.g. 2k test)",
  SINGLE_TIME: "Fixed time (e.g. 30' steady state)",
  INTERVALS: "Intervals",
  STEADY_STATE: "Steady state",
  OTHER: "Other",
};

export const DISTANCE_PRESETS = [500, 1000, 2000, 5000, 6000, 10000] as const;

export const PACING_LABELS: Record<string, string> = {
  negative: "Negative split (finished faster)",
  positive: "Positive split (faded)",
  even: "Even split",
  unknown: "Not enough splits",
};
