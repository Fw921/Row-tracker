import { describe, expect, it } from "vitest";
import { bestSplitForBucket, bucketDistance, distinctBuckets, weeklyVolume } from "@/lib/dashboard";
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

describe("weeklyVolume", () => {
  it("sums distance per week starting Sunday", () => {
    const workouts = [
      makeWorkout({ date: "2024-01-01T00:00:00.000Z", totalDistanceMeters: 2000 }), // Monday
      makeWorkout({ date: "2024-01-03T00:00:00.000Z", totalDistanceMeters: 3000 }), // same week
      makeWorkout({ date: "2024-01-08T00:00:00.000Z", totalDistanceMeters: 1000 }), // next week
    ];
    const result = weeklyVolume(workouts);
    expect(result).toHaveLength(2);
    expect(result[0].meters).toBe(5000);
    expect(result[1].meters).toBe(1000);
  });
});
