export function formatMeters(meters: number): string {
  return `${Math.round(meters).toLocaleString()}m`;
}

/** Plain integer count (workouts, athletes, ...) — mainly exists so it has
 * the same `number -> string` shape as formatMeters/formatDuration/
 * formatSplit, for passing to StatTile's count-up `format` prop. */
export function formatCount(n: number): string {
  return String(Math.round(n));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** "Today"/"Yesterday" for recent dates, falling back to formatDate. */
export function formatRelativeDate(date: Date | string, now = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return formatDate(d);
}

export const WORKOUT_TYPE_SHORT: Record<string, string> = {
  SINGLE_DISTANCE: "Distance",
  SINGLE_TIME: "Time",
  INTERVALS: "Intervals",
  STEADY_STATE: "Steady",
  OTHER: "Other",
};
