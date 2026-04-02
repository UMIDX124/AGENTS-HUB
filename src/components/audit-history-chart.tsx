"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AuditHistoryChartProps {
  data: { date: string; score: number; agent?: string }[];
}

export function AuditHistoryChart({ data }: AuditHistoryChartProps) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground">No audit history yet.</p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(1 0 0 / 6%)"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.14 0.005 270)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "8px",
              color: "white",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#14b8a6"
            strokeWidth={2.5}
            dot={{
              fill: "#14b8a6",
              r: 4,
              strokeWidth: 2,
              stroke: "#0d9488",
            }}
            activeDot={{ r: 7, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
