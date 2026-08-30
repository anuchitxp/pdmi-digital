UI/UX improvements per docs/improve-uiux.md — dashboard overhaul + shared polish, no dark mode, with lucide-react icons, SVG gauges, and trend sparklines.

## 1. Dependencies & foundation
- `npm install lucide-react` (only new dep; recharts already present for sparklines).
- `src/app/layout.tsx`: add `next/font/google` Inter with CSS variable `--font-inter`, applied to `<body>`; set `font-feature-settings`/tabular numbers for stat values.
- `tailwind.config.ts`: extend `fontFamily.sans` to use the Inter variable; add semantic goal colors if useful (can stay with stock palette).
- `globals.css`: background to `#f8fafc` (slate-50) via existing body rule; add a fade-in keyframe utility for cards.

## 2. Shared components (src/components)
- `Card.tsx` — server-safe wrapper extracting the existing `rounded-xl bg-white p-5 shadow` idiom (plus hover lift transition when interactive).
- `StatCard.tsx` — icon + label (uppercase small tracking), big value (large, tight tracking), sub text; color prop per metric (sky for Patients, red/orange LDL-C heart, green BP, purple HbA1c droplet).
- `Gauge.tsx` ("use client" not needed — pure SVG, server-renderable) — circular gauge per the doc's SVG example: background ring, colored progress ring with `stroke-dasharray`, rounded linecap, centered % text; color threshold: green ≥67%, amber 40–66%, red <40%.
- `TrendSparkline.tsx` ("use client", recharts tiny line chart, no axes) — renders a small trend line under a stat.
- `AlertBanner.tsx` — colored banner (red/warning variant with alert icon when overdue > 0, green/success check when none).

## 3. Dashboard rework (src/app/page.tsx)
- Stat grid per doc item 1/8: Patients card first (hero-sized or first position), then LDL-C → BP → HbA1c in clinical priority order; grid `repeat(auto-fit, minmax(200px,1fr))` equivalent via existing Tailwind responsive classes (`sm:grid-cols-2 lg:grid-cols-4`), single column on mobile with reduced value font size.
- Goal cards: StatCard shell + Gauge (replacing plain bar) + "X of Y measured patients" sub text + tooltip (title attr or simple hover text) showing measured detail.
- Overdue follow-ups: replace plain card header with AlertBanner — red banner with count and warning icon when > 0, green positive banner when 0; patient list stays inside a Card below.
- Micro-interactions: hover lift + shadow transition on cards (CSS only, respects touch — transform only on hover-capable devices via `hover:` classes), fade-in on load.

## 4. Trend data (doc item 8)
- Extend `getDashboardData()` in `src/lib/queries.ts` to compute a monthly at-goal % series (last ~6 months) for LDL-C, BP, HbA1c by evaluating each measurement with the existing goal-engine functions (`evaluateLdlGoal` etc.) grouped by month — no clinical logic inlined; rules still come from `src/lib/goals`. Add/extend Vitest tests only if query logic is extracted into a testable pure helper (trend grouping helper goes in `src/lib` with tests).

## 5. Shared polish on other pages
- `src/app/patients/page.tsx` and `src/app/patients/[id]/page.tsx`: swap ad-hoc `rounded-xl bg-white p-5 shadow` blocks for the new `<Card>`, use StatCard where stat-like values appear, keep all clinical content untouched.

## Constraints honored
- No clinical logic changes; goal evaluation stays in `src/lib/goals`.
- No real identifiers; UI language English; mobile-first responsive preserved.
- Verify with `npm run build` and `npm test`; visually check dev server at common viewport widths.