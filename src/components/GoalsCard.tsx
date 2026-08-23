"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DISTANCE_PRESETS } from "@/lib/constants";
import { parseDuration } from "@/lib/pace";
import { computeGoalProgress, type GoalRecord } from "@/lib/goals";
import type { DashboardWorkout } from "@/lib/dashboard";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Select,
  inputClass,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type GoalType = GoalRecord["type"];

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  SPLIT_TARGET: "Beat a split",
  TOTAL_METERS: "Total meters",
  MONTHLY_WORKOUTS: "Workouts per month",
};

export function GoalsCard({
  goals,
  workouts,
}: {
  goals: GoalRecord[];
  workouts: DashboardWorkout[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<GoalType>("SPLIT_TARGET");
  const [distance, setDistance] = useState(String(DISTANCE_PRESETS[2] ?? 2000));
  const [split, setSplit] = useState("");
  const [meters, setMeters] = useState("");
  const [count, setCount] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const progress = goals.map((g) => computeGoalProgress(g, workouts));

  function resetForm() {
    setSplit("");
    setMeters("");
    setCount("");
    setLabel("");
    setAdding(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let body: Record<string, unknown> | null = null;
    if (type === "SPLIT_TARGET") {
      const seconds = parseDuration(split);
      if (!seconds) {
        setError("Enter a target split like 1:45.0");
        return;
      }
      body = {
        type,
        label: label.trim() || undefined,
        targetDistanceMeters: Number(distance),
        targetSplitSeconds500m: seconds,
      };
    } else if (type === "TOTAL_METERS") {
      const value = Number(meters);
      if (!(value > 0)) {
        setError("Enter a meters target greater than 0");
        return;
      }
      body = { type, label: label.trim() || undefined, targetMeters: value };
    } else {
      const value = Number(count);
      if (!(value > 0)) {
        setError("Enter a workout count greater than 0");
        return;
      }
      body = { type, label: label.trim() || undefined, targetWorkoutsPerMonth: value };
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Couldn't save that goal");
      toast.success("Goal added");
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
      toast.success("Goal removed");
      router.refresh();
    } finally {
      setRemovingId(null);
      setConfirmingId(null);
    }
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
          <Target className="h-4 w-4 text-highlight" aria-hidden />
          Goals
        </h2>
        {!adding && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add goal
          </Button>
        )}
      </div>

      {progress.length === 0 && !adding && (
        <EmptyState
          icon="🎯"
          title="No goals set yet"
          description="Add a target split, a meters milestone, or a workouts-per-month streak to track here."
          action={
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add a goal
            </Button>
          }
        />
      )}

      {progress.length > 0 && (
        <ul className="space-y-4">
          {progress.map((g) => (
            <li key={g.id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-foreground">{g.displayLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular text-xs text-muted">
                    {g.progressPct === null ? "No data yet" : `${g.progressPct}%`}
                  </span>
                  <IconButton
                    label="Remove goal"
                    tone="danger"
                    onClick={() => setConfirmingId(g.id)}
                    disabled={removingId === g.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className={
                    "h-full rounded-full transition-all " +
                    (g.achieved ? "bg-highlight" : "bg-accent")
                  }
                  style={{ width: `${g.progressPct ?? 0}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>Current: {g.currentText}</span>
                <span>Target: {g.targetText}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
          <Field label="Goal type">
            <Select value={type} onChange={(e) => setType(e.target.value as GoalType)}>
              {Object.entries(GOAL_TYPE_LABELS).map(([value, lbl]) => (
                <option key={value} value={value}>
                  {lbl}
                </option>
              ))}
            </Select>
          </Field>

          {type === "SPLIT_TARGET" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Distance">
                <Select value={distance} onChange={(e) => setDistance(e.target.value)}>
                  {DISTANCE_PRESETS.map((d) => (
                    <option key={d} value={d}>
                      {d}m
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Target split" hint="m:ss.t / 500m">
                <input
                  type="text"
                  value={split}
                  onChange={(e) => setSplit(e.target.value)}
                  placeholder="1:45.0"
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {type === "TOTAL_METERS" && (
            <Field label="Target meters">
              <input
                type="number"
                min={1}
                value={meters}
                onChange={(e) => setMeters(e.target.value)}
                placeholder="1000000"
                className={inputClass}
              />
            </Field>
          )}

          {type === "MONTHLY_WORKOUTS" && (
            <Field label="Target workouts / month">
              <input
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="20"
                className={inputClass}
              />
            </Field>
          )}

          <Field label="Label" hint="optional">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Sub-7:00 2K"
              className={inputClass}
            />
          </Field>

          {error && <Alert>{error}</Alert>}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Saving…" : "Save goal"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={confirmingId !== null}
        onOpenChange={(open) => !open && setConfirmingId(null)}
        onConfirm={() => confirmingId && handleRemove(confirmingId)}
        pending={removingId !== null}
        title="Remove this goal?"
        confirmLabel="Remove"
      />
    </Card>
  );
}
