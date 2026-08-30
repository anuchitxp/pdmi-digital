"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

/** Tiny trend line under a stat; x = month key, y = at-goal %. */
export default function TrendSparkline({
  data,
  color,
}: {
  data: { month: string; pct: number }[];
  color: string;
}) {
  if (data.length < 2) return null;
  return (
    <div className="mt-3 h-8 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <Line
            type="monotone"
            dataKey="pct"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
