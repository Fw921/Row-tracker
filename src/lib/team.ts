import { bucketDistance } from "@/lib/dashboard";

/**
 * Coach-side rollups, built only from data the schema already tracks:
 * roster athletes, the workouts logged for them, and the team pieces
 * (PieceGroups) they were logged under. No squads/boats/attendance here —
 * those aren't modeled yet.
 */

export type AthleteWorkout = {
  date: string; // ISO
  totalDistanceMeters: number;
  totalTimeSeconds: number;
  avgSplitSeconds500m: number;
};

export type AthleteSummary = {
  id: string;
  name: string;
  /** Most recent 2k-bucket split, if they have one. */
  current2kSeconds: number | null;
  /** Best (lowest) 2k-bucket split ever. */
  pr2kSeconds: number | null;
  /** Most recent 2k split minus the one before it — negative is faster. */
  change2kSeconds: number | null;
  totalMeters: number;
  lastWorkoutDate: string | null;
};

export function summarizeAthlete(
  id: string,
  name: string,
  workouts: AthleteWorkout[],
): AthleteSummary {
  const sorted = workouts.slice().sort((a, b) => a.date.localeCompare(b.date));
  const twoKPieces = sorted.filter((w) => bucketDistance(w.totalDistanceMeters) === 2000);

  const current2k = twoKPieces.at(-1) ?? null;
  const previous2k = twoKPieces.at(-2) ?? null;
  const pr2k = twoKPieces.reduce<AthleteWorkout | null>(
    (best, w) => (!best || w.avgSplitSeconds500m < best.avgSplitSeconds500m ? w : best),
    null,
  );

  return {
    id,
    name,
    current2kSeconds: current2k?.avgSplitSeconds500m ?? null,
    pr2kSeconds: pr2k?.avgSplitSeconds500m ?? null,
    change2kSeconds:
      current2k && previous2k ? current2k.avgSplitSeconds500m - previous2k.avgSplitSeconds500m : null,
    totalMeters: sorted.reduce((sum, w) => sum + w.totalDistanceMeters, 0),
    lastWorkoutDate: sorted.at(-1)?.date ?? null,
  };
}

export type TeamOverview = {
  athleteCount: number;
  activeThisWeek: number;
  teamMeters: number;
  workoutCount: number;
  avgSplit2kSeconds: number | null;
  prsThisSeason: number;
};

/** Monday, matching the personal dashboard's training-week convention —
 * see the comment on dashboard.ts's own startOfWeek. */
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const daysSinceMonday = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - daysSinceMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Same Sept–Aug assumption as the personal dashboard's seasonStart. */
function seasonStart(now: Date): Date {
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(year, 8, 1);
}

export function teamOverview(
  athletes: { id: string; workouts: AthleteWorkout[] }[],
  now = new Date(),
): TeamOverview {
  const weekStart = startOfWeek(now);
  const season = seasonStart(now);

  let teamMeters = 0;
  let workoutCount = 0;
  let activeThisWeek = 0;
  const twoKSplits: number[] = [];
  let prsThisSeason = 0;

  for (const athlete of athletes) {
    workoutCount += athlete.workouts.length;
    teamMeters += athlete.workouts.reduce((sum, w) => sum + w.totalDistanceMeters, 0);

    if (athlete.workouts.some((w) => new Date(w.date) >= weekStart)) activeThisWeek++;

    const twoK = athlete.workouts.filter((w) => bucketDistance(w.totalDistanceMeters) === 2000);
    if (twoK.length > 0) {
      const pr = twoK.reduce((best, w) => (w.avgSplitSeconds500m < best.avgSplitSeconds500m ? w : best));
      twoKSplits.push(pr.avgSplitSeconds500m);
      if (new Date(pr.date) >= season) prsThisSeason++;
    }
  }

  return {
    athleteCount: athletes.length,
    activeThisWeek,
    teamMeters,
    workoutCount,
    avgSplit2kSeconds: twoKSplits.length
      ? twoKSplits.reduce((a, b) => a + b, 0) / twoKSplits.length
      : null,
    prsThisSeason,
  };
}

export type TeamPieceEvent = {
  date: string; // ISO
  targetDistanceMeters: number | null;
  splits: number[]; // avgSplitSeconds500m per rower in this piece
};

export type TeamTrendPoint = { date: string; avgSplitSeconds500m: number };

/** Distinct target-distance buckets across logged team pieces. */
export function distinctTeamBuckets(events: TeamPieceEvent[]): number[] {
  const set = new Set<number>();
  for (const e of events) {
    if (e.targetDistanceMeters == null) continue;
    const bucket = bucketDistance(e.targetDistanceMeters);
    if (bucket) set.add(bucket);
  }
  return [...set].sort((a, b) => a - b);
}

/** Average split per team-piece event in a bucket, oldest first. */
export function teamPerformanceTrend(events: TeamPieceEvent[], bucket: number): TeamTrendPoint[] {
  return events
    .filter((e) => e.targetDistanceMeters != null && bucketDistance(e.targetDistanceMeters) === bucket)
    .filter((e) => e.splits.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: e.date,
      avgSplitSeconds500m: e.splits.reduce((a, b) => a + b, 0) / e.splits.length,
    }));
}
