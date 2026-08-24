import { describe, expect, it } from "vitest";
import {
  distinctTeamBuckets,
  summarizeAthlete,
  teamOverview,
  teamPerformanceTrend,
  type AthleteWorkout,
  type TeamPieceEvent,
} from "@/lib/team";

function makeAthleteWorkout(overrides: Partial<AthleteWorkout>): AthleteWorkout {
  return {
    date: "2024-01-01T00:00:00.000Z",
    totalDistanceMeters: 2000,
    totalTimeSeconds: 420,
    avgSplitSeconds500m: 105,
    ...overrides,
  };
}

describe("summarizeAthlete", () => {
  it("reports current/PR/change from 2k-bucket pieces only", () => {
    const workouts = [
      makeAthleteWorkout({ date: "2024-01-01T00:00:00.000Z", avgSplitSeconds500m: 110 }),
      makeAthleteWorkout({ date: "2024-02-01T00:00:00.000Z", avgSplitSeconds500m: 104 }),
      makeAthleteWorkout({ date: "2024-03-01T00:00:00.000Z", avgSplitSeconds500m: 106 }),
      makeAthleteWorkout({ date: "2024-03-15T00:00:00.000Z", totalDistanceMeters: 5000, avgSplitSeconds500m: 100 }),
    ];
    const summary = summarizeAthlete("a1", "Jordan", workouts);

    expect(summary.current2kSeconds).toBe(106); // most recent 2k piece
    expect(summary.pr2kSeconds).toBe(104);
    expect(summary.change2kSeconds).toBe(2); // 106 - 104, got slower
    expect(summary.totalMeters).toBe(11000);
    expect(summary.lastWorkoutDate).toBe("2024-03-15T00:00:00.000Z");
  });

  it("returns nulls when the athlete has no workouts", () => {
    const summary = summarizeAthlete("a2", "Sam", []);
    expect(summary.current2kSeconds).toBeNull();
    expect(summary.pr2kSeconds).toBeNull();
    expect(summary.change2kSeconds).toBeNull();
    expect(summary.lastWorkoutDate).toBeNull();
    expect(summary.totalMeters).toBe(0);
  });
});

describe("teamOverview", () => {
  it("rolls up athlete count, activity, meters, and 2k average", () => {
    const now = new Date("2024-09-10T00:00:00.000Z");
    const athletes = [
      {
        id: "a1",
        workouts: [
          makeAthleteWorkout({ date: "2024-09-09T00:00:00.000Z", avgSplitSeconds500m: 100 }),
        ],
      },
      {
        id: "a2",
        workouts: [
          makeAthleteWorkout({ date: "2024-01-01T00:00:00.000Z", avgSplitSeconds500m: 110 }),
        ],
      },
      { id: "a3", workouts: [] },
    ];

    const overview = teamOverview(athletes, now);
    expect(overview.athleteCount).toBe(3);
    expect(overview.activeThisWeek).toBe(1); // only a1's workout is in this week
    expect(overview.workoutCount).toBe(2);
    expect(overview.teamMeters).toBe(4000);
    expect(overview.avgSplit2kSeconds).toBe(105); // (100 + 110) / 2
    expect(overview.prsThisSeason).toBe(1); // only a1's PR falls after Sept 1
  });

  it("returns a null average when nobody has a 2k result", () => {
    const overview = teamOverview([{ id: "a1", workouts: [] }]);
    expect(overview.avgSplit2kSeconds).toBeNull();
  });
});

describe("distinctTeamBuckets / teamPerformanceTrend", () => {
  const events: TeamPieceEvent[] = [
    { date: "2024-01-01T00:00:00.000Z", targetDistanceMeters: 2000, splits: [100, 110] },
    { date: "2024-02-01T00:00:00.000Z", targetDistanceMeters: 2010, splits: [98, 104] },
    { date: "2024-02-15T00:00:00.000Z", targetDistanceMeters: 5000, splits: [108] },
  ];

  it("finds the distinct buckets present in the team pieces", () => {
    expect(distinctTeamBuckets(events)).toEqual([2000, 5000]);
  });

  it("averages splits per event within a bucket, oldest first", () => {
    const trend = teamPerformanceTrend(events, 2000);
    expect(trend).toEqual([
      { date: "2024-01-01T00:00:00.000Z", avgSplitSeconds500m: 105 },
      { date: "2024-02-01T00:00:00.000Z", avgSplitSeconds500m: 101 },
    ]);
  });
});
