export function formatMeters(meters: number): string {
  return `${Math.round(meters).toLocaleString()}m`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export const WORKOUT_TYPE_SHORT: Record<string, string> = {
  SINGLE_DISTANCE: "Distance",
  SINGLE_TIME: "Time",
  INTERVALS: "Intervals",
  STEADY_STATE: "Steady",
  OTHER: "Other",
};
