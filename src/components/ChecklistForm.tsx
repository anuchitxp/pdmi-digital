"use client";

import { useMemo, useState } from "react";
import { savePreDischargeChecklist } from "@/app/actions";
import {
  PRE_DISCHARGE_ITEMS,
  type ChecklistItemDef,
  type ChecklistItemState,
  type ChecklistStatus,
} from "@/lib/checklists";

const STATUS_OPTIONS: ChecklistStatus[] = ["yes", "no", "na", "pending"];

const statusStyles: Record<ChecklistStatus, string> = {
  yes: "bg-green-600 text-white border-green-600",
  no: "bg-red-600 text-white border-red-600",
  na: "bg-slate-500 text-white border-slate-500",
  pending: "bg-white text-slate-600 border-slate-300",
};

function SegmentedControl({
  value,
  onChange,
}: {
  value: ChecklistStatus;
  onChange: (s: ChecklistStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-semibold uppercase ${statusStyles[s]}`}
        >
          {s === "na" ? "N/A" : s}
        </button>
      ))}
    </div>
  );
}

function bySection(defs: ChecklistItemDef[]) {
  const sections: { name: string; items: ChecklistItemDef[] }[] = [];
  for (const d of defs) {
    const last = sections[sections.length - 1];
    if (last && last.name === d.section) last.items.push(d);
    else sections.push({ name: d.section, items: [d] });
  }
  return sections;
}

export default function ChecklistForm({
  patientId,
  initialItems,
  dischargeDate,
}: {
  patientId: string;
  initialItems: ChecklistItemState[];
  dischargeDate: string;
}) {
  const [items, setItems] = useState<ChecklistItemState[]>(
    initialItems.length > 0
      ? initialItems
      : PRE_DISCHARGE_ITEMS.map((d) => ({ itemNo: d.itemNo, status: "pending" as ChecklistStatus, notes: "" })),
  );
  const [discharge, setDischarge] = useState(dischargeDate);

  const sections = useMemo(() => bySection(PRE_DISCHARGE_ITEMS), []);
  const answered = items.filter((i) => i.status !== "pending").length;

  const update = (itemNo: number, patch: Partial<ChecklistItemState>) =>
    setItems((prev) => prev.map((i) => (i.itemNo === itemNo ? { ...i, ...patch } : i)));

  return (
    <form
      action={savePreDischargeChecklist}
      className="space-y-6 pb-24 md:pb-0"
    >
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="dischargeDate" value={discharge} />

      <div className="rounded-xl bg-white p-5 shadow">
        <label htmlFor="dischargeDateInput" className="text-base">Discharge date</label>
        <input
          id="dischargeDateInput"
          type="date"
          value={discharge}
          onChange={(e) => setDischarge(e.target.value)}
          className="max-w-xs"
        />
        <p className="mt-2 text-sm text-slate-500">
          {answered}/{items.length} items answered
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.name} className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 font-semibold text-sky-900">{section.name}</h2>
          <div className="space-y-5">
            {section.items.map((def) => {
              const state = items.find((i) => i.itemNo === def.itemNo);
              return (
                <div key={def.itemNo} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <p className="mb-2 text-sm font-medium">
                    {def.itemNo}. {def.text}
                  </p>
                  <SegmentedControl
                    value={state?.status ?? "pending"}
                    onChange={(status) => update(def.itemNo, { status })}
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={state?.notes ?? ""}
                    onChange={(e) => update(def.itemNo, { notes: e.target.value })}
                    className="mt-2"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="no-print">
        <div>
          <label htmlFor="actor">Completed by</label>
          <input id="actor" name="actor" placeholder="e.g. ward-nurse, fellow" className="max-w-xs" />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg md:static md:border-0 md:p-0 md:shadow-none">
        <button
          type="submit"
          className="w-full rounded-lg bg-sky-700 px-4 py-3 text-lg font-semibold text-white hover:bg-sky-800 md:w-auto"
        >
          Save checklist
        </button>
      </div>
    </form>
  );
}
