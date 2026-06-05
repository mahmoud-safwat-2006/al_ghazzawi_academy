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

interface DayBucket {
  dayKey: string;
  minutes: number;
  count: number;
  label: string;
}

export function ActivityBarChart({ data }: { data: DayBucket[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
            tickLine={false}
            axisLine={false}
            interval={Math.max(0, Math.floor(data.length / 8))}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "currentColor", opacity: 0.05 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.1)",
              fontSize: 12,
              background: "var(--color-card, #fff)",
              color: "var(--color-foreground)",
            }}
            formatter={(v) => [`${v} نشاط`, ""]}
            labelFormatter={(l) => String(l)}
          />
          <Bar
            dataKey="count"
            fill="#06B6D4"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
