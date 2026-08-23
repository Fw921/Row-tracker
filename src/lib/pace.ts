/**
 * Time/pace formatting and parsing shared by manual entry, CSV import,
 * and charts. Erg convention: pace is expressed as split time per 500m.
 */

/** Format seconds as erg-style "m:ss.t" (or "h:mm:ss.t" past an hour). */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00.0";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const secondsStr = seconds.toFixed(1).padStart(4, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${secondsStr}`;
  }
  return `${minutes}:${secondsStr}`;
}

/** Format a 500m split (seconds) as "m:ss.t / 500m". */
export function formatSplit(splitSeconds: number): string {
  return formatDuration(splitSeconds);
}

/**
 * Parse a duration string like "6:52.4", "1:02:15", or a bare number of
 * seconds ("412.4") into total seconds. Returns null if unparseable.
 */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;

  if (!trimmed.includes(":")) {
    const asNumber = Number(trimmed);
    return Number.isFinite(asNumber) && asNumber >= 0 ? asNumber : null;
  }

  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "" || Number.isNaN(Number(p)))) return null;

  let seconds = 0;
  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number);
    seconds = h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    seconds = m * 60 + s;
  } else {
    return null;
  }

  return seconds >= 0 ? seconds : null;
}

/** Split (seconds per 500m) for a given distance/time. */
export function splitPer500m(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters <= 0) return 0;
  return (timeSeconds / distanceMeters) * 500;
}

/** Average speed in meters/second. */
export function speedMetersPerSecond(distanceMeters: number, timeSeconds: number): number {
  if (timeSeconds <= 0) return 0;
  return distanceMeters / timeSeconds;
}

/**
 * Classify pacing strategy for a piece from its ordered splits, comparing
 * the average of the first half of splits to the second half.
 * Threshold is in seconds/500m; differences smaller than it count as even.
 */
export function classifyPacing(
  splitSeconds: number[],
  evenThreshold = 0.5,
): "negative" | "positive" | "even" | "unknown" {
  if (splitSeconds.length < 2) return "unknown";

  const mid = Math.floor(splitSeconds.length / 2);
  const firstHalf = splitSeconds.slice(0, mid);
  const secondHalf = splitSeconds.slice(splitSeconds.length - mid);

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const diff = avg(secondHalf) - avg(firstHalf);

  if (Math.abs(diff) < evenThreshold) return "even";
  return diff < 0 ? "negative" : "positive";
}
