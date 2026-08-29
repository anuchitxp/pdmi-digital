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

export default function LdlTrendChart({
  data,
  target,
}: {
  data: { date: string; ldlc: number }[];
  target: number;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No LDL-C results recorded yet.</p>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[20, "auto"]} />
          <Tooltip />
          <ReferenceLine
            y={target}
            stroke="#dc2626"
            strokeDasharray="6 4"
            label={{ value: `target <${target}`, position: "insideTopRight", fontSize: 11, fill: "#dc2626" }}
          />
          <Line type="monotone" dataKey="ldlc" name="LDL-C (mg/dL)" stroke="#0369a1" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
