import { describe, expect, it } from "vitest";
import {
  bestFixedTimeEffort,
  bestSplitForBucket,
  bucketDistance,
  bucketLabel,
  buildInsights,
  dailyVolumeThisWeek,
  distinctBuckets,
  latestPacedPiece,
  linearRegression,
  mostRecentInBucket,
  pacingSummary,
  personalRecords,
  volumeSummary,
  workoutsInBucket,
  workoutsThisMonth,
} from "@/lib/dashboard";
import type { DashboardSplit, DashboardWorkout } from "@/lib/dashboard";

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

function makeSplit(overrides: Partial<DashboardSplit>): DashboardSplit {
  return {
    index: 1,
    distanceMeters: 500,
    timeSeconds: 105,
    splitSeconds500m: 105,
    avgStrokeRate: null,
    ...overrides,
  };
}

describe("bucketDistance", () => {
  it("snaps close distances to the standard preset", () => {
    expect(bucketDistance(2000)).toBe(2000);
    expect(bucketDistance(2015)).toBe(2000);
    expect(bucketDistance(1980)).toBe(2000);
  });

  it("returns null for distances far from any preset", () => {
    expect(bucketDistance(3300)).toBeNull();
  });
});

describe("distinctBuckets", () => {
  it("collects unique buckets present in the data, sorted", () => {
    const workouts = [
      makeWorkout({ totalDistanceMeters: 5000 }),
      makeWorkout({ totalDistanceMeters: 2010 }),
      makeWorkout({ totalDistanceMeters: 2000 }),
    ];
    expect(distinctBuckets(workouts)).toEqual([2000, 5000]);
  });
});

describe("bestSplitForBucket", () => {
  it("returns the workout with the lowest split in the bucket", () => {
    const fast = makeWorkout({ avgSplitSeconds500m: 100 });
    const slow = makeWorkout({ avgSplitSeconds500m: 110 });
    expect(bestSplitForBucket([slow, fast], 2000)).toBe(fast);
  });

  it("returns null when the bucket is empty", () => {
    expect(bestSplitForBucket([makeWorkout({ totalDistanceMeters: 5000 })], 2000)).toBeNull();
  });
});

describe("bucketLabel", () => {
  it("shortens standard presets", () => {
    expect(bucketLabel(2000)).toBe("2K");
    expect(bucketLabel(500)).toBe("500m");
  });

  it("falls back to raw meters for an unrecognized bucket", () => {
    expect(bucketLabel(3000)).toBe("3000m");
  });
});

describe("workoutsInBucket / mostRecentInBucket", () => {
  it("returns the bucket's workouts oldest-first and the latest one", () => {
    const older = makeWorkout({ date: "2024-01-01T00:00:00.000Z", avgSplitSeconds500m: 110 });
    const newer = makeWorkout({ date: "2024-02-01T00:00:00.000Z", avgSplitSeconds500m: 105 });
    const workouts = [newer, older];

    expect(workoutsInBucket(workouts, 2000)).toEqual([older, newer]);
    expect(mostRecentInBucket(workouts, 2000)).toBe(newer);
  });

  it("returns null when nothing is in the bucket", () => {
    expect(mostRecentInBucket([makeWorkout({ totalDistanceMeters: 5000 })], 2000)).toBeNull();
  });
});

describe("bestFixedTimeEffort", () => {
  it("returns the SINGLE_TIME workout with the most distance near the target time", () => {
    const near = makeWorkout({
      type: "SINGLE_TIME",
      totalTimeSeconds: 1795,
      totalDistanceMeters: 8420,
    });
    const shorter = makeWorkout({
      type: "SINGLE_TIME",
      totalTimeSeconds: 1200,
      totalDistanceMeters: 5600,
    });
    const distancePiece = makeWorkout({ type: "SINGLE_DISTANCE", totalTimeSeconds: 1800 });

    expect(bestFixedTimeEffort([near, shorter, distancePiece], 1800)).toBe(near);
  });

  it("returns null when no piece is near the target time", () => {
    expect(bestFixedTimeEffort([makeWorkout({ type: "SINGLE_TIME", totalTimeSeconds: 300 })], 1800)).toBeNull();
  });
});

describe("personalRecords", () => {
  it("returns one PR per bucket present in the log", () => {
    const fast2k = makeWorkout({ totalDistanceMeters: 2000, avgSplitSeconds500m: 100 });
    const slow2k = makeWorkout({ totalDistanceMeters: 2010, avgSplitSeconds500m: 110 });
    const only5k = makeWorkout({ totalDistanceMeters: 5000, avgSplitSeconds500m: 108 });

    const records = personalRecords([fast2k, slow2k, only5k]);
    expect(records).toEqual([
      { bucket: 2000, workout: fast2k },
      { bucket: 5000, workout: only5k },
    ]);
  });
});

describe("workoutsThisMonth", () => {
  it("counts only workouts in the given month", () => {
    const now = new Date("2024-06-15T00:00:00.000Z");
    const workouts = [
      makeWorkout({ date: "2024-06-01T00:00:00.000Z" }),
      makeWorkout({ date: "2024-06-20T00:00:00.000Z" }),
      makeWorkout({ date: "2024-05-30T00:00:00.000Z" }),
    ];
    expect(workoutsThisMonth(workouts, now)).toBe(2);
  });
});

describe("volumeSummary", () => {
  it("rolls up week/month/season meters and averages", () => {
    const now = new Date("2024-09-10T00:00:00.000Z"); // Tuesday, into the new season
    const workouts = [
      makeWorkout({ date: "2024-09-10T00:00:00.000Z", totalDistanceMeters: 2000 }), // this week
      makeWorkout({ date: "2024-09-02T00:00:00.000Z", totalDistanceMeters: 3000 }), // this month, not this week
      makeWorkout({ date: "2024-01-01T00:00:00.000Z", totalDistanceMeters: 4000 }), // before this season
    ];
    const summary = volumeSummary(workouts, now);
    expect(summary.weekMeters).toBe(2000);
    expect(summary.monthMeters).toBe(5000);
    expect(summary.seasonMeters).toBe(5000);
    expect(summary.workoutCount).toBe(3);
    expect(summary.avgWorkoutMeters).toBeCloseTo(3000);
  });
});

describe("dailyVolumeThisWeek", () => {
  it("buckets meters by weekday, Monday first", () => {
    const now = new Date("2024-01-03T00:00:00.000Z"); // Wednesday
    const workouts = [
      makeWorkout({ date: "2024-01-01T00:00:00.000Z", totalDistanceMeters: 1000 }), // Monday
      makeWorkout({ date: "2024-01-03T00:00:00.000Z", totalDistanceMeters: 2000 }), // Wednesday
    ];
    const days = dailyVolumeThisWeek(workouts, now);
    expect(days.map((d) => d.day)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(days[0].meters).toBe(1000);
    expect(days[2].meters).toBe(2000);
    expect(days[1].meters).toBe(0);
  });

  it("still finds today when today is a Sunday", () => {
    // 2024-01-07 is a Sunday — the last day of its Mon-Sun week, not the
    // first day of the next one.
    const now = new Date("2024-01-07T00:00:00.000Z");
    const workouts = [makeWorkout({ date: "2024-01-07T00:00:00.000Z", totalDistanceMeters: 1500 })];
    const days = dailyVolumeThisWeek(workouts, now);
    expect(days[6]).toEqual({ day: "Sun", meters: 1500 });
    expect(days.slice(0, 6).every((d) => d.meters === 0)).toBe(true);
  });
});

describe("latestPacedPiece / pacingSummary", () => {
  it("picks the most recent workout with 2+ splits and summarizes it", () => {
    const withSplits = makeWorkout({
      date: "2024-02-01T00:00:00.000Z",
      splits: [
        makeSplit({ index: 1, distanceMeters: 500, splitSeconds500m: 106, avgStrokeRate: 30 }),
        makeSplit({ index: 2, distanceMeters: 500, splitSeconds500m: 104, avgStrokeRate: 32 }),
      ],
    });
    const withoutSplits = makeWorkout({ date: "2024-03-01T00:00:00.000Z", splits: [] });

    expect(latestPacedPiece([withSplits, withoutSplits])).toBe(withSplits);

    const summary = pacingSummary(withSplits.splits);
    expect(summary?.fastest.index).toBe(2);
    expect(summary?.slowest.index).toBe(1);
    expect(summary?.averageSplitSeconds500m).toBe(105);
    expect(summary?.pacing).toBe("negative");
    expect(summary?.strokeRateChange).toBe(2);
    expect(summary?.ranges[1]).toMatchObject({ startMeters: 500, endMeters: 1000 });
  });

  it("returns null for fewer than 2 splits", () => {
    expect(pacingSummary([makeSplit({})])).toBeNull();
  });
});

describe("linearRegression", () => {
  it("fits a line through the values", () => {
    const trend = linearRegression([10, 8, 6, 4]);
    expect(trend(0)).toBeCloseTo(10);
    expect(trend(3)).toBeCloseTo(4);
  });

  it("handles a single value without throwing", () => {
    const trend = linearRegression([42]);
    expect(trend(0)).toBe(42);
  });
});

describe("buildInsights", () => {
  it("returns nothing when there isn't enough data", () => {
    expect(buildInsights([makeWorkout({})])).toEqual([]);
  });

  it("reports a split-trend insight once there's a real, sustained change", () => {
    const now = new Date("2024-03-01T00:00:00.000Z");
    const pieces = [110, 109, 100, 99].map((split, i) =>
      makeWorkout({ date: `2024-01-0${i + 1}T00:00:00.000Z`, avgSplitSeconds500m: split }),
    );
    const insights = buildInsights(pieces, now);
    expect(insights.some((i) => i.id === "split-trend" && i.text.includes("improved"))).toBe(true);
  });
});
