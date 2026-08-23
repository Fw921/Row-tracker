"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatSplit } from "@/lib/pace";
import { Badge, Card, Chip } from "@/components/ui";

/** Six weeks of an imaginary rower's 2k splits, trending down. Same shape
 * DashboardCharts renders from real logged data, just seeded with sample
 * numbers so the landing page doesn't depend on a database. */
const SPLIT_TREND = [
  { week: "Wk 1", split: 118.4 },
  { week: "Wk 2", split: 116.1 },
  { week: "Wk 3", split: 114.8 },
  { week: "Wk 4", split: 112.9 },
  { week: "Wk 5", split: 111.5 },
  { week: "Wk 6", split: 109.7 },
];

const VOLUME_TREND = [
  { week: "Wk 1", km: 18.2 },
  { week: "Wk 2", km: 22.5 },
  { week: "Wk 3", km: 19.8 },
  { week: "Wk 4", km: 27.3 },
  { week: "Wk 5", km: 24.1 },
  { week: "Wk 6", km: 30.6 },
];

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "var(--shadow-raised)",
};
const axisTick = { fontSize: 12, fill: "var(--muted)" };

export function LandingDemoChart() {
  const [view, setView] = useState<"split" | "volume">("split");

  return (
    <Card className="overflow-hidden p-4 sm:p-6" interactive>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">
            {view === "split" ? "2000m split trend" : "Weekly training volume"}
          </h3>
          <p className="text-xs text-muted">
            {view === "split" ? "Lower is faster. Six weeks of test pieces." : "Kilometers logged per week"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="highlight" className="hidden sm:inline-flex">
            Sample data
          </Badge>
          <div className="flex gap-1.5">
            <Chip active={view === "split"} onClick={() => setView("split")}>
              Split trend
            </Chip>
            <Chip active={view === "volume"} onClick={() => setView("volume")}>
              Volume
            </Chip>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {view === "split" ? (
          <LineChart data={SPLIT_TREND} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={axisTick} />
            <YAxis
              reversed
              tickFormatter={(v) => formatSplit(v)}
              tick={axisTick}
              width={56}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip formatter={(v) => [formatSplit(Number(v)), "Split /500m"]} contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="split" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        ) : (
          <BarChart data={VOLUME_TREND} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={axisTick} />
            <YAxis tick={axisTick} width={40} />
            <Tooltip formatter={(v) => [`${Number(v)} km`, "Volume"]} contentStyle={tooltipStyle} />
            <Bar dataKey="km" fill="var(--highlight)" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>

      {view === "split" && (
        <div className="mt-3 text-xs font-medium text-negative">
          <span aria-hidden>↓ </span>
          8.7 seconds faster over six weeks. This is what your own trend looks like once you start
          logging.
        </div>
      )}
    </Card>
  );
}
