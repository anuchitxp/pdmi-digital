"use client";

import { useActionState } from "react";
import { createPatient } from "@/app/actions";

type State = { errors: Record<string, string> } | undefined;

export default function PatientForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    async (prev, fd) => (await createPatient(fd)) ?? undefined,
    undefined,
  );
  const errors = state?.errors ?? {};

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="codedId">Coded ID *</label>
        <input id="codedId" name="codedId" required placeholder="H01-P-0142" />
        {errors.codedId && <p className="mt-1 text-sm text-red-600">{errors.codedId}</p>}
        <p className="mt-1 text-xs text-slate-500">
          Pseudonymised ID only — never enter patient names or HNs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="age">Age *</label>
          <input id="age" name="age" type="number" min={18} max={120} required />
          {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
        </div>
        <div>
          <label htmlFor="sex">Sex</label>
          <select id="sex" name="sex">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="acsType">ACS type</label>
          <select id="acsType" name="acsType">
            <option value="STEMI">STEMI</option>
            <option value="NSTEMI">NSTEMI</option>
            <option value="UA">UA</option>
          </select>
        </div>
        <div>
          <label htmlFor="recurrentEvents">Number of ACS events (incl. current)</label>
          <input id="recurrentEvents" name="recurrentEvents" type="number" min={1} defaultValue={1} />
        </div>
        <div>
          <label htmlFor="admissionDate">Admission date</label>
          <input id="admissionDate" name="admissionDate" type="date" required />
        </div>
        <div>
          <label htmlFor="baselineLdlc">Baseline LDL-C (mg/dL)</label>
          <input id="baselineLdlc" name="baselineLdlc" type="number" step="1" min={10} max={500} />
          {errors.baselineLdlc && <p className="mt-1 text-sm text-red-600">{errors.baselineLdlc}</p>}
        </div>
        <div>
          <label htmlFor="lvef">LVEF (%)</label>
          <input id="lvef" name="lvef" type="number" step="1" min={5} max={90} />
          {errors.lvef && <p className="mt-1 text-sm text-red-600">{errors.lvef}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-base">
          <input type="checkbox" name="pci" className="h-5 w-5" /> PCI performed
        </label>
        <label className="flex items-center gap-2 text-base">
          <input type="checkbox" name="hasDiabetes" className="h-5 w-5" /> Diabetes
        </label>
      </div>

      <div>
        <label htmlFor="actor">Completed by</label>
        <input id="actor" name="actor" placeholder="e.g. ward-nurse, fellow" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-sky-700 px-4 py-3 text-lg font-semibold text-white hover:bg-sky-800 disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Saving…" : "Create patient"}
      </button>
    </form>
  );
}
