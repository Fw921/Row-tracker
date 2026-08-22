import { parse } from "csv-parse/sync";
import { parseDuration } from "@/lib/pace";
import type { WorkoutInput } from "@/lib/validation";

export type ParsedRow = {
  workout: WorkoutInput;
  rawRowIndex: number;
};

export type ImportResult = {
  rows: ParsedRow[];
  skipped: { rowIndex: number; reason: string }[];
};

/** Lowercase + strip everything but letters/digits, so header variants
 * like "Work Time (Seconds)" and "worktime_seconds" both become
 * "worktimeseconds" and match the same alias. */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pickField(row: Record<string, string>, aliases: string[]): string | undefined {
  for (const [key, value] of Object.entries(row)) {
    if (aliases.includes(normalizeHeader(key)) && value !== undefined && value.trim() !== "") {
      return value.trim();
    }
  }
  return undefined;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** Concept2's Logbook date column shows up in a few formats across export
 * eras ("2024-08-15 07:32:00", "08/15/2024 7:32am", ...). `Date` parses
 * most of them directly; this is a light backstop for the rest. */
function parseFlexibleDate(value: string): Date | null {
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const [, month, day, year] = match;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

function inferWorkoutType(
  description: string,
  restTimeSeconds: number | undefined,
  restDistance: number | undefined,
): WorkoutInput["type"] {
  if ((restTimeSeconds && restTimeSeconds > 0) || (restDistance && restDistance > 0)) {
    return "INTERVALS";
  }
  // Descriptions for interval pieces often look like "6 x 500m" even when
  // the rest fields didn't come through.
  if (/\d+\s*x\s*\d/i.test(description)) return "INTERVALS";
  // A description that's just a duration ("30:00") with no distance cue
  // usually means a fixed-time piece.
  if (/^\d{1,3}:\d{2}(\.\d+)?(:\d{2})?$/.test(description.trim())) return "SINGLE_TIME";
  return "SINGLE_DISTANCE";
}

const DATE_ALIASES = ["date"];
const DESCRIPTION_ALIASES = ["description"];
const WORK_TIME_SECONDS_ALIASES = ["worktimeseconds"];
const WORK_TIME_FORMATTED_ALIASES = ["worktimeformatted", "worktime"];
const WORK_DISTANCE_ALIASES = ["workdistance", "workdistancemeters", "distance"];
const REST_TIME_SECONDS_ALIASES = ["resttimeseconds"];
const REST_TIME_FORMATTED_ALIASES = ["resttimeformatted", "resttime"];
const REST_DISTANCE_ALIASES = ["restdistance"];
const STROKE_RATE_ALIASES = ["strokeratecadence", "strokerate", "cadence"];
const AVG_WATTS_ALIASES = ["avgwatts", "watts"];
const TOTAL_CAL_ALIASES = ["totalcal", "calories"];
const AVG_HEART_RATE_ALIASES = ["avgheartrate", "heartrate"];
const DRAG_FACTOR_ALIASES = ["dragfactor"];
const COMMENTS_ALIASES = ["comments", "notes"];

/**
 * Parse a Concept2 Logbook "season" CSV export into workout inputs ready
 * for `createWorkout`. One CSV row is one logged result — Concept2's bulk
 * export doesn't include per-500m splits, so imported workouts land
 * without `splits` (add those by hand later if you want pacing charts
 * for a given piece).
 */
export function parseConcept2Csv(csvText: string): ImportResult {
  const records: Record<string, string>[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  const rows: ParsedRow[] = [];
  const skipped: ImportResult["skipped"] = [];

  records.forEach((record, i) => {
    const rowIndex = i + 2; // +1 for header row, +1 for 1-based

    const dateStr = pickField(record, DATE_ALIASES);
    if (!dateStr) {
      skipped.push({ rowIndex, reason: "Missing Date column" });
      return;
    }
    const date = parseFlexibleDate(dateStr);
    if (!date) {
      skipped.push({ rowIndex, reason: `Unparseable date "${dateStr}"` });
      return;
    }

    const workTimeSeconds =
      toNumber(pickField(record, WORK_TIME_SECONDS_ALIASES)) ??
      (() => {
        const formatted = pickField(record, WORK_TIME_FORMATTED_ALIASES);
        return formatted ? (parseDuration(formatted) ?? undefined) : undefined;
      })();

    const workDistance = toNumber(pickField(record, WORK_DISTANCE_ALIASES));

    if (!workTimeSeconds || workTimeSeconds <= 0 || !workDistance || workDistance <= 0) {
      skipped.push({ rowIndex, reason: "Missing or zero work time/distance" });
      return;
    }

    const restTimeSeconds =
      toNumber(pickField(record, REST_TIME_SECONDS_ALIASES)) ??
      (() => {
        const formatted = pickField(record, REST_TIME_FORMATTED_ALIASES);
        return formatted ? (parseDuration(formatted) ?? undefined) : undefined;
      })();
    const restDistance = toNumber(pickField(record, REST_DISTANCE_ALIASES));

    const description = pickField(record, DESCRIPTION_ALIASES) ?? "";

    const workout: WorkoutInput = {
      date: date.toISOString(),
      type: inferWorkoutType(description, restTimeSeconds, restDistance),
      title: description || undefined,
      totalDistanceMeters: workDistance,
      totalTimeSeconds: workTimeSeconds,
      avgWatts: toNumber(pickField(record, AVG_WATTS_ALIASES)),
      avgHeartRate: toNumber(pickField(record, AVG_HEART_RATE_ALIASES)),
      avgStrokeRate: toNumber(pickField(record, STROKE_RATE_ALIASES)),
      dragFactor: toNumber(pickField(record, DRAG_FACTOR_ALIASES)),
      calories: toNumber(pickField(record, TOTAL_CAL_ALIASES)),
      notes: pickField(record, COMMENTS_ALIASES),
    };

    rows.push({ workout, rawRowIndex: rowIndex });
  });

  return { rows, skipped };
}
