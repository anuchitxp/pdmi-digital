/** Server-renderable circular gauge: shows % of patients at goal. */
export function goalColor(pct: number): string {
  if (pct >= 67) return "#10b981"; // green
  if (pct >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export default function Gauge({ pct, size = 120 }: { pct: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={`${clamped}% at goal`}
      className="mx-auto"
    >
      <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={goalColor(clamped)}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dy="0.3em"
        fontSize="26"
        fontWeight="bold"
        fill="#111827"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {clamped}%
      </text>
    </svg>
  );
}
