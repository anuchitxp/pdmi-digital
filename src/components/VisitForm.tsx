"use client";

import { useActionState, useState } from "react";
import { createVisit } from "@/app/actions";
import {
  POST_DISCHARGE_MANDATORY_ITEMS,
  POST_DISCHARGE_OPTIONAL_ITEMS,
  type ChecklistItemState,
  type ChecklistStatus,
} from "@/lib/checklists";

type State = { errors: Record<string, string> } | undefined;

const STATUS_OPTIONS: ChecklistStatus[] = ["yes", "no", "na", "pending"];

const statusStyles: Record<ChecklistStatus, string> = {
  yes: "bg-green-600 text-white border-green-600",
  no: "bg-red-600 text-white border-red-600",
  na: "bg-slate-500 text-white border-slate-500",
  pending: "bg-white text-slate-600 border-slate-300",
};

function init(defs: { itemNo: number }[]) {
  return defs.map((d) => ({ itemNo: d.itemNo, status: "pending" as ChecklistStatus, notes: "" }));
}

export default function VisitForm({
  patientId,
  defaultVisitDate,
  defaultNextVisitDate,
}: {
  patientId: string;
  defaultVisitDate: string;
  defaultNextVisitDate: string;
}) {
  const [state, action, pending] = useActionState<State, FormData>(
    async (prev, fd) => (await createVisit(fd)) ?? undefined,
    undefined,
  );
  const errors = state?.errors ?? {};

  const [mandatory, setMandatory] = useState<ChecklistItemState[]>(init(POST_DISCHARGE_MANDATORY_ITEMS));
  const [optional, setOptional] = useState<ChecklistItemState[]>(init(POST_DISCHARGE_OPTIONAL_ITEMS));

  const allItems = [
    ...mandatory.map((i) => ({ ...i, part: 1 })),
    ...optional.map((i) => ({ ...i, part: 2 })),
  ];

  const setItems =
    (setter: React.Dispatch<React.SetStateAction<ChecklistItemState[]>>) =>
    (itemNo: number, patch: Partial<ChecklistItemState>) =>
      setter((prev) => prev.map((i) => (i.itemNo === itemNo ? { ...i, ...patch } : i)));

  function ChecklistGroup({
    title,
    defs,
    items,
    onUpdate,
  }: {
    title: string;
    defs: typeof POST_DISCHARGE_MANDATORY_ITEMS;
    items: ChecklistItemState[];
    onUpdate: (itemNo: number, patch: Partial<ChecklistItemState>) => void;
  }) {
    return (
      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 font-semibold text-sky-900">{title}</h2>
        <div className="space-y-5">
          {defs.map((def) => {
            const state = items.find((i) => i.itemNo === def.itemNo);
            return (
              <div key={def.itemNo} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <p className="mb-2 text-sm font-medium">
                  {def.itemNo}. {def.text}
                </p>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onUpdate(def.itemNo, { status: s })}
                      className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-semibold uppercase ${statusStyles[s]}`}
                    >
                      {s === "na" ? "N/A" : s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={state?.notes ?? ""}
                  onChange={(e) => onUpdate(def.itemNo, { notes: e.target.value })}
                  className="mt-2"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6 pb-24 md:pb-0">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="items" value={JSON.stringify(allItems)} />

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 font-semibold text-sky-900">Visit details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="visitDate">Visit date</label>
            <input id="visitDate" name="visitDate" type="date" defaultValue={defaultVisitDate} required />
          </div>
          <div>
            <label htmlFor="visitType">Visit type</label>
            <select id="visitType" name="visitType">
              <option value="first-30-day">First visit (≤30 days)</option>
              <option value="3-6-month">Follow-up (3–6 months)</option>
              <option value="1-year">1-year review</option>
              <option value="telephone">Telephone contact</option>
            </select>
          </div>
          <div>
            <label htmlFor="nextVisitDate">Next appointment</label>
            <input id="nextVisitDate" name="nextVisitDate" type="date" defaultValue={defaultNextVisitDate} />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 font-semibold text-sky-900">Labs and vitals</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ldlc">LDL-C (mg/dL)</label>
            <input id="ldlc" name="ldlc" type="number" step="1" min={10} max={500} />
            {errors["LDL-C"] && <p className="mt-1 text-sm text-red-600">{errors["LDL-C"]}</p>}
          </div>
          <div>
            <label htmlFor="hba1c">HbA1c (%)</label>
            <input id="hba1c" name="hba1c" type="number" step="0.1" min={3} max={20} />
            {errors["HbA1c"] && <p className="mt-1 text-sm text-red-600">{errors["HbA1c"]}</p>}
          </div>
          <div>
            <label htmlFor="systolic">Systolic BP (mmHg)</label>
            <input id="systolic" name="systolic" type="number" step="1" min={50} max={300} />
            {errors["Systolic BP"] && <p className="mt-1 text-sm text-red-600">{errors["Systolic BP"]}</p>}
          </div>
          <div>
            <label htmlFor="diastolic">Diastolic BP (mmHg)</label>
            <input id="diastolic" name="diastolic" type="number" step="1" min={30} max={200} />
            {errors["Diastolic BP"] && <p className="mt-1 text-sm text-red-600">{errors["Diastolic BP"]}</p>}
          </div>
        </div>
      </div>

      <ChecklistGroup
        title="Part 1: Mandatory items"
        defs={POST_DISCHARGE_MANDATORY_ITEMS}
        items={mandatory}
        onUpdate={setItems(setMandatory)}
      />
      <ChecklistGroup
        title="Part 2: Optional items"
        defs={POST_DISCHARGE_OPTIONAL_ITEMS}
        items={optional}
        onUpdate={setItems(setOptional)}
      />

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 font-semibold text-sky-900">Medication regimen (this visit)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-base">
            <input type="checkbox" name="aspirin" className="h-5 w-5" /> Aspirin
          </label>
          <div>
            <label htmlFor="p2y12">P2Y12 inhibitor</label>
            <input id="p2y12" name="p2y12" placeholder="e.g. ticagrelor" />
          </div>
          <div>
            <label htmlFor="statinIntensity">Statin intensity</label>
            <select id="statinIntensity" name="statinIntensity">
              <option value="">None</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label htmlFor="nonStatin">Non-statin lipid-lowering</label>
            <input id="nonStatin" name="nonStatin" placeholder="ezetimibe / PCSK9i / bempedoic acid" />
          </div>
          <div>
            <label htmlFor="aceiOrArb">ACEI / ARB</label>
            <input id="aceiOrArb" name="aceiOrArb" placeholder="e.g. perindopril" />
          </div>
          <div>
            <label htmlFor="betaBlocker">β-blocker</label>
            <input id="betaBlocker" name="betaBlocker" placeholder="e.g. bisoprolol" />
          </div>
          <label className="flex items-center gap-2 text-base">
            <input type="checkbox" name="sglt2i" className="h-5 w-5" /> SGLT2i
          </label>
          <label className="flex items-center gap-2 text-base">
            <input type="checkbox" name="glp1ra" className="h-5 w-5" /> GLP-1 RA
          </label>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <label htmlFor="actor">Completed by</label>
        <input id="actor" name="actor" placeholder="e.g. opd-nurse, fellow" />
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg md:static md:border-0 md:p-0 md:shadow-none">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-sky-700 px-4 py-3 text-lg font-semibold text-white hover:bg-sky-800 disabled:opacity-50 md:w-auto"
        >
          {pending ? "Saving…" : "Save visit"}
        </button>
      </div>
    </form>
  );
}
