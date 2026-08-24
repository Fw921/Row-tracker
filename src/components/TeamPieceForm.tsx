"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Save, Square, Users } from "lucide-react";
import { toast } from "sonner";
import { parseDuration } from "@/lib/pace";
import { WORKOUT_TYPE_LABELS, DISTANCE_PRESETS } from "@/lib/constants";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Select,
  inputClass,
} from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkoutType } from "@/generated/prisma/enums";

type Athlete = { id: string; name: string };
type Mode = "distance" | "time";

const today = () => new Date().toISOString().slice(0, 10);

export function TeamPieceForm({ athletes }: { athletes: Athlete[] }) {
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [type, setType] = useState<WorkoutType>("SINGLE_DISTANCE");
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<Mode>("distance");
  const [targetDistance, setTargetDistance] = useState("2000");
  const [targetTime, setTargetTime] = useState("20:00");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, string>>({}); // athleteId -> time or distance
  const [heartRates, setHeartRates] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSelected = athletes.length > 0 && selected.size === athletes.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(athletes.map((a) => a.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedAthletes = useMemo(
    () => athletes.filter((a) => selected.has(a.id)),
    [athletes, selected],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedAthletes.length === 0) {
      setError("Select at least one rower.");
      return;
    }

    const target = mode === "distance" ? Number(targetDistance) : parseDuration(targetTime);
    if (!target || target <= 0) {
      setError(mode === "distance" ? "Enter a valid distance." : "Enter a valid time.");
      return;
    }

    const entries = [];
    for (const a of selectedAthletes) {
      const raw = results[a.id];
      const value = mode === "distance" ? parseDuration(raw ?? "") : Number(raw);
      if (!value || value <= 0) {
        setError(
          `Enter ${mode === "distance" ? "a time" : "a distance"} for ${a.name}, or unselect them.`,
        );
        return;
      }
      const hrRaw = heartRates[a.id];
      entries.push({
        athleteId: a.id,
        value,
        avgHeartRate: hrRaw ? Number(hrRaw) : undefined,
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/piece-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          type,
          title: title || undefined,
          mode,
          target,
          entries,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ? JSON.stringify(body.error) : "Failed to save piece");
      }

      const body = await res.json();
      toast.success(`Piece saved for ${selectedAthletes.length} rower${selectedAthletes.length === 1 ? "" : "s"}`);
      router.push(`/team/${body.pieceGroup.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (athletes.length === 0) {
    return (
      <div className="max-w-lg">
        <EmptyState
          icon={<Users className="h-6 w-6" aria-hidden />}
          title="No teammates on your roster yet"
          description="Add the boat first, then come back to log a piece for everyone at once."
          action={<Button href="/roster">Go to roster</Button>}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Card className="p-4 sm:p-6">
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
            <Select value={type} onChange={(e) => setType(e.target.value as WorkoutType)}>
              {Object.entries(WORKOUT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Title" hint="optional">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="2k Test"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <span className="mb-2 block text-sm font-medium text-foreground">
            What&apos;s the same for everyone?
          </span>
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="distance">Same distance</TabsTrigger>
              <TabsTrigger value="time">Same time</TabsTrigger>
            </TabsList>

            <TabsContent value="distance" className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={targetDistance}
                onChange={(e) => setTargetDistance(e.target.value)}
                min={1}
                className={`${inputClass} w-28`}
              />
              <span className="text-sm text-muted">meters</span>
              {DISTANCE_PRESETS.map((d) => (
                <Chip
                  key={d}
                  active={targetDistance === String(d)}
                  onClick={() => setTargetDistance(String(d))}
                >
                  {d}m
                </Chip>
              ))}
              <p className="mt-0.5 w-full text-xs text-muted">
                Everyone rows the same distance — you&apos;ll enter each rower&apos;s time.
              </p>
            </TabsContent>
            <TabsContent value="time" className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                placeholder="20:00"
                className={`${inputClass} w-28 tabular`}
              />
              <span className="text-sm text-muted">minutes:seconds</span>
              <p className="mt-0.5 w-full text-xs text-muted">
                Everyone rows the same time — you&apos;ll enter each rower&apos;s distance.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-3">
          <h2 className="flex items-center gap-1.5 text-sm font-medium">
            <Users className="h-4 w-4 text-muted" aria-hidden />
            Who rowed it?
          </h2>
          <button
            type="button"
            onClick={toggleAll}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-strong"
          >
            {allSelected ? <CheckSquare className="h-3.5 w-3.5" aria-hidden /> : <Square className="h-3.5 w-3.5" aria-hidden />}
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        <ul className="divide-y divide-border">
          {athletes.map((a) => {
            const isSelected = selected.has(a.id);
            return (
              <li
                key={a.id}
                className={`flex flex-wrap items-center gap-3 px-4 py-2.5 transition-colors ${isSelected ? "bg-accent-soft/40" : ""}`}
              >
                <label className="flex flex-1 min-w-[10rem] cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(a.id)}
                    className="h-4 w-4 cursor-pointer rounded border-border accent-accent"
                  />
                  <Avatar name={a.name} />
                  <span className="text-sm font-medium">{a.name}</span>
                </label>
                {isSelected && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={mode === "distance" ? "Time (m:ss.t)" : "Distance (m)"}
                      value={results[a.id] ?? ""}
                      onChange={(e) =>
                        setResults((prev) => ({ ...prev, [a.id]: e.target.value }))
                      }
                      className={`${inputClass} w-32 tabular`}
                    />
                    <input
                      type="number"
                      placeholder="Avg HR"
                      value={heartRates[a.id] ?? ""}
                      onChange={(e) =>
                        setHeartRates((prev) => ({ ...prev, [a.id]: e.target.value }))
                      }
                      className={`${inputClass} w-24`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      {error && <Alert>{error}</Alert>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting} size="lg">
          <Save className="h-4 w-4" aria-hidden />
          {submitting ? "Saving…" : "Save piece"}
        </Button>
        {selectedAthletes.length > 0 && (
          <Badge tone="accent">
            {selectedAthletes.length} rower{selectedAthletes.length === 1 ? "" : "s"} selected
          </Badge>
        )}
      </div>
    </form>
  );
}
