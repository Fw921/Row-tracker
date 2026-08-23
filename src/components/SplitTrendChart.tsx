"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/format";
import { formatSplit } from "@/lib/pace";
import { EmptyState } from "@/components/ui";
import {
  bestSplitForBucket,
  linearRegression,
  workoutsInBucket,
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

/**
 * Split-over-time chart for one distance bucket: PR highlighted, trend line
 * once there's enough data, hover for the exact result. Shared by the
 * personal dashboard's big progress chart and the coach's per-athlete sheet
 * — same series, same reading, different size.
 */
export function SplitTrendChart({
  workouts,
  bucket,
  height = 380,
  emptyDescription = "Log a 2k, 5k, or other test piece to start a trend line here.",
}: {
  workouts: DashboardWorkout[];
  bucket: number | null;
  height?: number;
  emptyDescription?: string;
}) {
  const bucketWorkouts = useMemo(
    () => (bucket === null ? [] : workoutsInBucket(workouts, bucket)),
    [workouts, bucket],
  );
  const pr = bucket !== null ? bestSplitForBucket(workouts, bucket) : null;

  const chartData = useMemo(() => {
    const trendFn =
      bucketWorkouts.length >= 3
        ? linearRegression(bucketWorkouts.map((w) => w.avgSplitSeconds500m))
        : null;
    return bucketWorkouts.map((w, i) => ({
      date: formatDate(w.date),
      split: w.avgSplitSeconds500m,
      trend: trendFn ? trendFn(i) : undefined,
      title: w.title,
      isPR: pr?.id === w.id,
    }));
  }, [bucketWorkouts, pr]);

  const prPoint = chartData.find((d) => d.isPR);

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp className="h-6 w-6" aria-hidden />}
        title="No pieces logged yet"
        description={emptyDescription}
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 16, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={axisTick} />
        <YAxis
          reversed
          tickFormatter={(v) => formatSplit(v)}
          tick={axisTick}
          width={64}
          domain={["dataMin - 2", "dataMax + 2"]}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const point = payload[0].payload as (typeof chartData)[number];
            return (
              <div style={tooltipStyle} className="px-2.5 py-2">
                <div className="font-medium text-foreground">{point.date}</div>
                <div className="tabular text-muted">{formatSplit(point.split)} /500m</div>
                {point.title && <div className="text-muted">{point.title}</div>}
                {point.isPR && (
                  <div className="mt-0.5 font-medium text-highlight-strong">Personal best</div>
                )}
              </div>
            );
          }}
        />
        {chartData.some((d) => d.trend !== undefined) && (
          <Line
            type="linear"
            dataKey="trend"
            stroke="var(--muted-soft)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
            legendType="none"
          />
        )}
        <Line
          type="monotone"
          dataKey="split"
          stroke="var(--accent)"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          animationDuration={600}
          animationEasing="ease-out"
        />
        {prPoint && (
          <ReferenceDot
            x={prPoint.date}
            y={prPoint.split}
            r={6}
            fill="var(--highlight)"
            stroke="var(--surface)"
            strokeWidth={2}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
