"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendPoint {
  x: number;
  percent: number;
  date: string;
  chapter: string;
}

export function QuizAccuracyChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ stroke: "#06B6D4", strokeOpacity: 0.3 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.1)",
              fontSize: 12,
              background: "var(--color-card, #fff)",
              color: "var(--color-foreground)",
            }}
            formatter={(v) => [`${v}%`, "النتيجة"]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as TrendPoint | undefined;
              return p ? `${p.chapter} — ${p.date}` : "";
            }}
          />
          <ReferenceLine
            y={60}
            stroke="currentColor"
            strokeDasharray="4 4"
            opacity={0.3}
          />
          <Line
            type="monotone"
            dataKey="percent"
            stroke="#1E40AF"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#1E40AF" }}
            activeDot={{ r: 5, fill: "#06B6D4" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
