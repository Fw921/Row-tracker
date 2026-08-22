import { DISTANCE_PRESETS } from "@/lib/constants";

export type DashboardWorkout = {
  id: string;
  date: string; // ISO
  type: string;
  title: string | null;
  totalDistanceMeters: number;
  totalTimeSeconds: number;
  avgSplitSeconds500m: number;
  avgHeartRate: number | null;
  splits: { index: number; splitSeconds500m: number }[];
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

/** Weekly training volume in meters, oldest week first. */
export function weeklyVolume(
  workouts: DashboardWorkout[],
): { weekStart: string; meters: number }[] {
  const buckets = new Map<string, number>();

  for (const w of workouts) {
    const date = new Date(w.date);
    const weekStart = startOfWeek(date);
    const key = weekStart.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + w.totalDistanceMeters);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, meters]) => ({ weekStart, meters }));
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
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
