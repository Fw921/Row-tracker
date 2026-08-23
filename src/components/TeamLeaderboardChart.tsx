"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatSplit } from "@/lib/pace";

type Row = { name: string; splitSeconds500m: number };

const RANK_COLORS = ["var(--highlight)", "var(--accent)", "var(--accent)"];

export function TeamLeaderboardChart({ rows }: { rows: Row[] }) {
  const data = rows.map((r) => ({ name: r.name, split: r.splitSeconds500m }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 4, bottom: 4 }}
        barCategoryGap={10}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => formatSplit(v)} tick={{ fontSize: 12, fill: "var(--muted)" }} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 13, fill: "var(--foreground)" }}
        />
        <Tooltip
          formatter={(v) => [formatSplit(Number(v)), "Split /500m"]}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="split"
          radius={[0, 4, 4, 0]}
          label={{
            position: "right",
            formatter: (v: unknown) => formatSplit(Number(v)),
            fontSize: 12,
            fill: "var(--muted)",
          }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? RANK_COLORS[0] : RANK_COLORS[1]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
