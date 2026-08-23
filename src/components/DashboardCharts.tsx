"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Award, CalendarRange, Route } from "lucide-react";
import { formatDate, formatMeters } from "@/lib/format";
import { formatSplit } from "@/lib/pace";
import { Card, Chip, StatTile } from "@/components/ui";
import {
  bestSplitForBucket,
  distinctBuckets,
  weeklyVolume,
  type DashboardWorkout,
} from "@/lib/dashboard";

const LINE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "var(--shadow-raised)",
};
const axisTick = { fontSize: 12, fill: "var(--muted)" };

export function DashboardCharts({ workouts }: { workouts: DashboardWorkout[] }) {
  const buckets = useMemo(() => distinctBuckets(workouts), [workouts]);
  const [bucket, setBucket] = useState<number | null>(buckets[0] ?? null);

  const inBucket = useMemo(
    () =>
      bucket === null
        ? []
        : workouts
            .filter((w) => Math.abs(w.totalDistanceMeters - bucket) / bucket <= 0.08)
            .sort((a, b) => a.date.localeCompare(b.date)),
    [workouts, bucket],
  );

  const splitTrend = inBucket.map((w) => ({
    date: formatDate(w.date),
    split: w.avgSplitSeconds500m,
  }));

  const hrTrend = inBucket
    .filter((w) => w.avgHeartRate)
    .map((w) => ({ date: formatDate(w.date), hr: w.avgHeartRate as number }));

  const volume = useMemo(() => weeklyVolume(workouts), [workouts]);
  const volumeData = volume.map((v) => ({
    week: formatDate(v.weekStart),
    km: Math.round(v.meters / 100) / 10,
  }));

  const pacingPieces = inBucket.filter((w) => w.splits.length >= 2).slice(-4);
  const maxSplitCount = Math.max(0, ...pacingPieces.map((w) => w.splits.length));
  const pacingData = Array.from({ length: maxSplitCount }, (_, i) => {
    const row: Record<string, number | string> = { split: `#${i + 1}` };
    pacingPieces.forEach((w) => {
      row[formatDate(w.date)] = w.splits[i]?.splitSeconds500m ?? null;
    });
    return row;
  });

  const totalDistance = workouts.reduce((sum, w) => sum + w.totalDistanceMeters, 0);
  const thisWeekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const thisWeekDistance = workouts
    .filter((w) => new Date(w.date) >= thisWeekStart)
    .reduce((sum, w) => sum + w.totalDistanceMeters, 0);

  const pr = bucket ? bestSplitForBucket(workouts, bucket) : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatTile icon={<Activity className="h-3.5 w-3.5" aria-hidden />} label="Total workouts" value={String(workouts.length)} />
        <StatTile icon={<Route className="h-3.5 w-3.5" aria-hidden />} label="Total distance" value={formatMeters(totalDistance)} />
        <StatTile icon={<CalendarRange className="h-3.5 w-3.5" aria-hidden />} label="This week" value={formatMeters(thisWeekDistance)} />
        <StatTile
          icon={<Award className="h-3.5 w-3.5" aria-hidden />}
          tone="highlight"
          label={pr ? `${bucket}m PR` : "PR"}
          value={pr ? formatSplit(pr.avgSplitSeconds500m) : "—"}
        />
      </div>

      {buckets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Distance</span>
          {buckets.map((b) => (
            <Chip key={b} active={bucket === b} onClick={() => setBucket(b)}>
              {b}m
            </Chip>
          ))}
        </div>
      )}

      {splitTrend.length > 0 && (
        <ChartCard title={`Split trend — ${bucket}m`} subtitle="Lower is faster">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={splitTrend} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis
                reversed
                tickFormatter={(v) => formatSplit(v)}
                tick={axisTick}
                width={60}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip formatter={(v) => [formatSplit(Number(v)), "Split /500m"]} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="split" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hrTrend.length > 0 && (
        <ChartCard title={`Heart rate trend — ${bucket}m`}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hrTrend} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis tick={axisTick} width={40} domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip formatter={(v) => [`${Number(v)} bpm`, "Avg HR"]} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="hr" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {pacingPieces.length > 0 && (
        <ChartCard
          title={`Pacing strategy — last ${pacingPieces.length} × ${bucket}m`}
          subtitle="Split per interval, overlaid"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={pacingData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="split" tick={axisTick} />
              <YAxis reversed tickFormatter={(v) => formatSplit(v)} tick={axisTick} width={60} />
              <Tooltip formatter={(v) => formatSplit(Number(v))} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {pacingPieces.map((w, i) => (
                <Line
                  key={w.id}
                  type="monotone"
                  dataKey={formatDate(w.date)}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {volumeData.length > 0 && (
        <ChartCard title="Weekly volume" subtitle="Kilometers per week, all workout types">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volumeData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={axisTick} />
              <YAxis tick={axisTick} width={40} />
              <Tooltip formatter={(v) => [`${Number(v)} km`, "Volume"]} contentStyle={tooltipStyle} />
              <Bar dataKey="km" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5" interactive>
      <div className="mb-3">
        <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}
