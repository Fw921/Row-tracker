"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListPlus, Save, X } from "lucide-react";
import { parseDuration } from "@/lib/pace";
import { WORKOUT_TYPE_LABELS, DISTANCE_PRESETS } from "@/lib/constants";
import { Alert, Button, Card, Chip, Field, IconButton, inputClass } from "@/components/ui";
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
      <Card className="space-y-4 p-4 sm:p-6">
        <SectionLabel>Basics</SectionLabel>
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

          <Field label="Title" hint="optional">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. "2k Test" or "6x500m/3'r"`}
              className={inputClass}
            />
          </Field>

          <Field label="Distance (meters)">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              min={1}
              required
              className={inputClass}
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {DISTANCE_PRESETS.map((d) => (
                <Chip key={d} active={distance === String(d)} onClick={() => setDistance(String(d))}>
                  {d}m
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Total time" hint="m:ss.t">
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="6:52.4"
              required
              className={`${inputClass} tabular`}
            />
          </Field>

          <Field label="Avg heart rate" hint="bpm">
            <input
              type="number"
              value={avgHeartRate}
              onChange={(e) => setAvgHeartRate(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Max heart rate" hint="bpm">
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

          <Field label="Avg stroke rate" hint="s/m">
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

        <Field label="Notes" hint="optional">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel icon={<ListPlus className="h-3.5 w-3.5" aria-hidden />}>
            Splits <span className="font-normal normal-case text-muted-soft">— for pacing charts, optional</span>
          </SectionLabel>
          <button
            type="button"
            onClick={addSplit}
            className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-background"
          >
            + Add split
          </button>
        </div>
        {splits.length > 0 && (
          <div className="space-y-2">
            {splits.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-xs text-muted-soft">#{i + 1}</span>
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
                <IconButton label={`Remove split ${i + 1}`} tone="danger" onClick={() => removeSplit(i)}>
                  <X className="h-3.5 w-3.5" aria-hidden />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>

      {error && <Alert>{error}</Alert>}

      <Button type="submit" disabled={submitting} size="lg">
        <Save className="h-4 w-4" aria-hidden />
        {submitting ? "Saving…" : "Save workout"}
      </Button>
    </form>
  );
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
      {icon}
      {children}
    </h3>
  );
}
