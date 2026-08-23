"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseDuration } from "@/lib/pace";
import { WORKOUT_TYPE_LABELS, DISTANCE_PRESETS } from "@/lib/constants";
import type { WorkoutType } from "@/generated/prisma/enums";

type SplitRow = { distanceMeters: string; timeSeconds: string };

const today = () => new Date().toISOString().slice(0, 10);

export function WorkoutForm() {
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [type, setType] = useState<WorkoutType>("SINGLE_DISTANCE");
  const [title, setTitle] = useState("");
  const [distance, setDistance] = useState("2000");
  const [time, setTime] = useState(""); // "6:52.4"
  const [avgWatts, setAvgWatts] = useState("");
  const [avgHeartRate, setAvgHeartRate] = useState("");
  const [maxHeartRate, setMaxHeartRate] = useState("");
  const [avgStrokeRate, setAvgStrokeRate] = useState("");
  const [dragFactor, setDragFactor] = useState("");
  const [notes, setNotes] = useState("");
  const [splits, setSplits] = useState<SplitRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSplit() {
    setSplits((s) => [...s, { distanceMeters: "", timeSeconds: "" }]);
  }

  function updateSplit(i: number, field: keyof SplitRow, value: string) {
    setSplits((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function removeSplit(i: number) {
    setSplits((s) => s.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const totalTimeSeconds = parseDuration(time);
    const totalDistanceMeters = Number(distance);

    if (!totalTimeSeconds) {
      setError('Enter a valid time, e.g. "6:52.4" or seconds.');
      return;
    }
    if (!totalDistanceMeters || totalDistanceMeters <= 0) {
      setError("Enter a valid distance in meters.");
      return;
    }

    const parsedSplits = [];
    for (const row of splits) {
      const d = Number(row.distanceMeters);
      const t = parseDuration(row.timeSeconds);
      if (!d || !t) {
        setError("Every split needs a distance and a valid time.");
        return;
      }
      parsedSplits.push({ distanceMeters: d, timeSeconds: t });
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          type,
          title: title || undefined,
          totalDistanceMeters,
          totalTimeSeconds,
          avgWatts: avgWatts ? Number(avgWatts) : undefined,
          avgHeartRate: avgHeartRate ? Number(avgHeartRate) : undefined,
          maxHeartRate: maxHeartRate ? Number(maxHeartRate) : undefined,
          avgStrokeRate: avgStrokeRate ? Number(avgStrokeRate) : undefined,
          dragFactor: dragFactor ? Number(dragFactor) : undefined,
          notes: notes || undefined,
          splits: parsedSplits.length ? parsedSplits : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ? JSON.stringify(body.error) : "Failed to save workout");
      }

      router.push("/history");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as WorkoutType)}
            className={inputClass}
          >
            {Object.entries(WORKOUT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Title (optional)">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. "2k Test" or "6x500m/3'r"`}
            className={inputClass}
          />
        </Field>

        <Field label="Distance (meters)">
          <div className="flex gap-2">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              min={1}
              required
              className={inputClass}
            />
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {DISTANCE_PRESETS.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDistance(String(d))}
                className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:bg-background"
              >
                {d}m
              </button>
            ))}
          </div>
        </Field>

        <Field label="Total time (m:ss.t)">
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="6:52.4"
            required
            className={`${inputClass} tabular`}
          />
        </Field>

        <Field label="Avg heart rate (bpm)">
          <input
            type="number"
            value={avgHeartRate}
            onChange={(e) => setAvgHeartRate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Max heart rate (bpm)">
          <input
            type="number"
            value={maxHeartRate}
            onChange={(e) => setMaxHeartRate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Avg watts">
          <input
            type="number"
            value={avgWatts}
            onChange={(e) => setAvgWatts(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Avg stroke rate (s/m)">
          <input
            type="number"
            value={avgStrokeRate}
            onChange={(e) => setAvgStrokeRate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Drag factor">
          <input
            type="number"
            value={dragFactor}
            onChange={(e) => setDragFactor(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Splits <span className="text-muted">(for pacing charts, optional)</span>
          </h3>
          <button
            type="button"
            onClick={addSplit}
            className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-background"
          >
            + Add split
          </button>
        </div>
        {splits.length > 0 && (
          <div className="space-y-2">
            {splits.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-xs text-muted">#{i + 1}</span>
                <input
                  type="number"
                  placeholder="Distance (m)"
                  value={row.distanceMeters}
                  onChange={(e) => updateSplit(i, "distanceMeters", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Time (m:ss.t)"
                  value={row.timeSeconds}
                  onChange={(e) => updateSplit(i, "timeSeconds", e.target.value)}
                  className={`${inputClass} tabular`}
                />
                <button
                  type="button"
                  onClick={() => removeSplit(i)}
                  className="text-xs text-muted hover:text-foreground"
                  aria-label={`Remove split ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-positive">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save workout"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
