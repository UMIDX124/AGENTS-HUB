"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface AuditHistoryChartProps {
  data: { date: string; score: number; agent?: string }[];
}

export function AuditHistoryChart({ data }: AuditHistoryChartProps) {
  if (!data.length) {
    return <p className="text-sm text-[#64748b]">No audit history yet.</p>;
  }

  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d0f1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#818cf8"
            strokeWidth={2}
            dot={{ fill: "#818cf8", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
