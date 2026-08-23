"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Activity,
  Award,
  BarChart3,
  CalendarRange,
  Gauge,
  Medal,
  Route,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatDate, formatMeters, formatRelativeDate, WORKOUT_TYPE_SHORT } from "@/lib/format";
import { formatDuration, formatSplit } from "@/lib/pace";
import { Badge, Card, Chip, EmptyState, StatTile } from "@/components/ui";
import { PACING_LABELS } from "@/lib/constants";
import { GoalsCard } from "@/components/GoalsCard";
import { SplitTrendChart } from "@/components/SplitTrendChart";
import type { GoalRecord } from "@/lib/goals";
import Link from "next/link";
import {
  bestFixedTimeEffort,
  bestSplitForBucket,
  bucketLabel,
  buildInsights,
  dailyVolumeThisWeek,
  distinctBuckets,
  latestPacedPiece,
  mostRecentInBucket,
  pacingSummary,
  personalRecords,
  volumeSummary,
  workoutsThisMonth,
  type DashboardWorkout,
} from "@/lib/dashboard";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "var(--shadow-raised)",
};
const axisTick = { fontSize: 12, fill: "var(--muted)" };

const PACING_TONE: Record<string, "faster" | "slower" | "neutral"> = {
  negative: "faster",
  positive: "slower",
  even: "neutral",
  unknown: "neutral",
};

export function DashboardCharts({
  workouts,
  goals,
}: {
  workouts: DashboardWorkout[];
  goals: GoalRecord[];
}) {
  const buckets = useMemo(() => distinctBuckets(workouts), [workouts]);
  const [bucket, setBucket] = useState<number | null>(buckets[0] ?? null);

  // --- 1. Performance overview — headline numbers a rower actually says
  // out loud ("I got a 7:00 2k"), so these read as total elapsed time, not
  // the average split shown in the chart below.
  const current2k = mostRecentInBucket(workouts, 2000);
  const pr2k = bestSplitForBucket(workouts, 2000);
  const pr5k = bestSplitForBucket(workouts, 5000);
  const totalMeters = workouts.reduce((sum, w) => sum + w.totalDistanceMeters, 0);
  const monthCount = workoutsThisMonth(workouts);

  // --- 4. Training volume
  const volume = volumeSummary(workouts);
  const daily = dailyVolumeThisWeek(workouts);

  // --- 5. Pacing analysis, most recent piece with splits
  const pacedPiece = latestPacedPiece(workouts);
  const pacing = pacedPiece ? pacingSummary(pacedPiece.splits) : null;

  // --- 7. Personal records
  const records = personalRecords(workouts);
  const thirtyMin = bestFixedTimeEffort(workouts, 1800);

  // --- 8. Training insights
  const insights = buildInsights(workouts);

  // --- 3. Recent workouts
  const recent = workouts
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* 1. Performance overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <StatTile
          icon={<Timer className="h-3.5 w-3.5" aria-hidden />}
          label="Current 2K"
          value={current2k ? formatDuration(current2k.totalTimeSeconds) : "—"}
        />
        <StatTile
          icon={<Award className="h-3.5 w-3.5" aria-hidden />}
          tone="highlight"
          label="2K PR"
          value={pr2k ? formatDuration(pr2k.totalTimeSeconds) : "—"}
        />
        <StatTile
          icon={<Award className="h-3.5 w-3.5" aria-hidden />}
          tone="highlight"
          label="5K PR"
          value={pr5k ? formatDuration(pr5k.totalTimeSeconds) : "—"}
        />
        <StatTile
          icon={<Route className="h-3.5 w-3.5" aria-hidden />}
          label="Total meters"
          value={formatMeters(totalMeters)}
        />
        <StatTile
          icon={<CalendarRange className="h-3.5 w-3.5" aria-hidden />}
          label="Workouts this month"
          value={String(monthCount)}
        />
      </div>

      {/* 2. 2K progress chart — the largest thing on the page */}
      <Card className="p-4 sm:p-6" interactive>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              {bucket ? `${bucketLabel(bucket)} progress` : "Progress"}
            </h2>
            <p className="text-xs text-muted">Every result, oldest to newest · lower is faster</p>
          </div>
          {buckets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {buckets.map((b) => (
                <Chip key={b} active={bucket === b} onClick={() => setBucket(b)}>
                  {bucketLabel(b)}
                </Chip>
              ))}
            </div>
          )}
        </div>

        <SplitTrendChart workouts={workouts} bucket={bucket} />
      </Card>

      {/* 3. Recent workouts */}
      <div>
        <h2 className="mb-2 font-display text-sm font-semibold text-foreground">Recent workouts</h2>
        {recent.length === 0 ? (
          <EmptyState icon="🚣" title="Nothing logged yet" />
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {recent.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/workouts/${w.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-background"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {w.title || WORKOUT_TYPE_SHORT[w.type]}
                    </span>
                    <span className="tabular shrink-0 text-muted">{resultText(w)}</span>
                    <span className="w-16 shrink-0 text-right text-xs text-muted">
                      {formatRelativeDate(w.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* 4. Training volume */}
      <div>
        <h2 className="mb-2 font-display text-sm font-semibold text-foreground">Training volume</h2>
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          <StatTile
            icon={<Route className="h-3.5 w-3.5" aria-hidden />}
            label="This week"
            value={formatMeters(volume.weekMeters)}
          />
          <StatTile
            icon={<Route className="h-3.5 w-3.5" aria-hidden />}
            label="This month"
            value={formatMeters(volume.monthMeters)}
          />
          <StatTile
            icon={<Route className="h-3.5 w-3.5" aria-hidden />}
            label="This season"
            value={formatMeters(volume.seasonMeters)}
          />
          <StatTile
            icon={<Activity className="h-3.5 w-3.5" aria-hidden />}
            label="Workouts"
            value={String(volume.workoutCount)}
          />
          <StatTile
            icon={<Gauge className="h-3.5 w-3.5" aria-hidden />}
            label="Avg distance"
            value={volume.workoutCount ? formatMeters(volume.avgWorkoutMeters) : "—"}
          />
        </div>
        <Card className="p-4 sm:p-5" interactive>
          <p className="mb-3 text-xs text-muted">Meters per day, this week</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={daily} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={axisTick} />
              <YAxis tick={axisTick} width={48} tickFormatter={(v) => formatMeters(v)} />
              <Tooltip formatter={(v) => [formatMeters(Number(v)), "Distance"]} contentStyle={tooltipStyle} />
              <Bar dataKey="meters" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 5. Pacing analysis */}
      <div>
        <h2 className="mb-2 font-display text-sm font-semibold text-foreground">Pacing analysis</h2>
        {pacedPiece && pacing ? (
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
              <span className="text-sm font-medium text-foreground">
                {pacedPiece.title || WORKOUT_TYPE_SHORT[pacedPiece.type]} ·{" "}
                <span className="font-normal text-muted">{formatDate(pacedPiece.date)}</span>
              </span>
              <Badge tone={PACING_TONE[pacing.pacing]}>{PACING_LABELS[pacing.pacing]}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-2">Range</th>
                    <th className="px-4 py-2 text-right">Split /500m</th>
                  </tr>
                </thead>
                <tbody>
                  {pacing.ranges.map((r) => (
                    <tr key={r.index} className="border-b border-border last:border-0">
                      <td className="px-4 py-1.5 text-muted">
                        {formatMeters(r.startMeters)}–{formatMeters(r.endMeters)}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular font-medium">
                        {formatSplit(r.splitSeconds500m)}
                        {r.index === pacing.fastest.index && (
                          <Badge tone="faster" className="ml-2">
                            Fastest
                          </Badge>
                        )}
                        {r.index === pacing.slowest.index && (
                          <Badge tone="slower" className="ml-2">
                            Slowest
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 py-3 text-xs text-muted sm:grid-cols-3">
              <div>
                Average split{" "}
                <span className="tabular block font-medium text-foreground">
                  {formatSplit(pacing.averageSplitSeconds500m)}
                </span>
              </div>
              {pacing.strokeRateChange !== null && (
                <div>
                  Stroke rate, start → finish
                  <span className="tabular block font-medium text-foreground">
                    {pacing.strokeRateChange > 0 ? "+" : ""}
                    {pacing.strokeRateChange.toFixed(1)} spm
                  </span>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <EmptyState icon="⚡" title="No multi-split pieces yet" description="Log a piece with splits to see a pacing breakdown here." />
        )}
      </div>

      {/* 6. Goals */}
      <div>
        <h2 className="mb-2 font-display text-sm font-semibold text-foreground">Goals</h2>
        <GoalsCard goals={goals} workouts={workouts} />
      </div>

      {/* 7. Personal records */}
      <div>
        <h2 className="mb-2 font-display text-sm font-semibold text-foreground">Personal records</h2>
        {records.length === 0 && !thirtyMin ? (
          <EmptyState icon="🏆" title="No PRs yet" description="Log a test piece at a standard distance to start tracking PRs." />
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {records.map((r) => (
                <li key={r.bucket} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Medal className="h-4 w-4 text-highlight" aria-hidden />
                    {bucketLabel(r.bucket)}
                  </span>
                  <span className="tabular text-right">
                    {formatDuration(r.workout.totalTimeSeconds)}{" "}
                    <span className="text-xs text-muted">
                      · {formatSplit(r.workout.avgSplitSeconds500m)}/500m
                    </span>
                  </span>
                </li>
              ))}
              {thirtyMin && (
                <li className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Medal className="h-4 w-4 text-highlight" aria-hidden />
                    30 min
                  </span>
                  <span className="tabular">{formatMeters(thirtyMin.totalDistanceMeters)}</span>
                </li>
              )}
            </ul>
          </Card>
        )}
      </div>

      {/* 8. Training insights */}
      <div>
        <h2 className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden />
          Training insights
        </h2>
        {insights.length === 0 ? (
          <EmptyState
            icon="🧠"
            title="Not enough data yet"
            description="Log a few more pieces and Row Tracker will start surfacing trends here."
          />
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {insights.map((insight) => (
                <li key={insight.id} className="flex items-start gap-2.5 px-4 py-3 text-sm text-foreground">
                  <InsightIcon id={insight.id} />
                  <span>{insight.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function InsightIcon({ id }: { id: string }) {
  if (id === "split-trend") return <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />;
  if (id === "volume-trend") return <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />;
  return <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />;
}

function resultText(w: DashboardWorkout): string {
  if (w.type === "INTERVALS" && w.splits.length > 1) {
    return `${formatSplit(w.avgSplitSeconds500m)} avg`;
  }
  return formatDuration(w.totalTimeSeconds);
}
