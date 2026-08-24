"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatSplit } from "@/lib/pace";

type SplitPoint = { index: number; splitSeconds500m: number };

export function SplitChart({ splits }: { splits: SplitPoint[] }) {
  const data = splits.map((s) => ({ name: `#${s.index}`, split: s.splitSeconds500m }));
  const values = data.map((d) => d.split);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.3, 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted)" }} />
        <YAxis
          domain={[min - pad, max + pad]}
          tickFormatter={(v) => formatSplit(v)}
          tick={{ fontSize: 12, fill: "var(--muted)" }}
          width={56}
        />
        <Tooltip
          formatter={(value) => [formatSplit(Number(value)), "Split /500m"]}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="split"
          fill="var(--accent)"
          radius={[4, 4, 0, 0]}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
