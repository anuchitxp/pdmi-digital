// Checklist item definitions — text taken verbatim from pdmi-context.md §6 and §7.

export type ChecklistStatus = "yes" | "no" | "na" | "pending";

export interface ChecklistItemDef {
  itemNo: number;
  section: string;
  text: string;
}

export const PRE_DISCHARGE_ITEMS: ChecklistItemDef[] = [
  { itemNo: 1, section: "Confirm Treatment and Investigations Performed", text: "Initial dose of Aspirin and/or P2Y12 inhibitor (if no contraindication)" },
  { itemNo: 2, section: "Confirm Treatment and Investigations Performed", text: "Echocardiogram performed" },
  { itemNo: 3, section: "Confirm Treatment and Investigations Performed", text: "Lipid profile checked" },
  { itemNo: 4, section: "Confirm Treatment and Investigations Performed", text: "HbA1c checked" },
  { itemNo: 5, section: "Confirm Prescribing/Dose Adjustment", text: "Aspirin prescribed" },
  { itemNo: 6, section: "Confirm Prescribing/Dose Adjustment", text: "P2Y12 inhibitor prescribed (if no contraindication)" },
  { itemNo: 7, section: "Confirm Prescribing/Dose Adjustment", text: "Antiplatelet regimen adjusted by cardiologist (if indicated)" },
  { itemNo: 8, section: "Confirm Prescribing/Dose Adjustment", text: "High-intensity statin and/or non-statin (ezetimibe, bempedoic acid, PCSK9) prescribed (if no contraindication)" },
  { itemNo: 9, section: "Confirm Prescribing/Dose Adjustment", text: "Antihypertensive regimen adjusted by cardiologist" },
  { itemNo: 10, section: "Confirm Prescribing/Dose Adjustment", text: "Antidiabetic regimen adjusted by cardiologist" },
  { itemNo: 11, section: "Confirm Patient Education", text: "Patient and caregiver received counselling" },
  { itemNo: 12, section: "Confirm Patient Education", text: "Vaccination recommendations provided" },
  { itemNo: 13, section: "Confirm Patient Education", text: "Referral to cardiac rehabilitation programme (if feasible)" },
  { itemNo: 14, section: "Confirm Follow-up Arrangements", text: "Patient has adequate caregiver support" },
  { itemNo: 15, section: "Confirm Follow-up Arrangements", text: "Caregiver contact details recorded" },
  { itemNo: 16, section: "Confirm Follow-up Arrangements", text: "Responsible physician/healthcare provider identified" },
  { itemNo: 17, section: "Confirm Follow-up Arrangements", text: "Patient/caregiver contact confirmed" },
  { itemNo: 18, section: "Confirm Follow-up Arrangements", text: "Treatment plan for next visit established" },
  { itemNo: 19, section: "Confirm Follow-up Arrangements", text: "Follow-up appointment scheduled" },
];

export const POST_DISCHARGE_MANDATORY_ITEMS: ChecklistItemDef[] = [
  { itemNo: 1, section: "Patient Status Assessment", text: "Record symptoms or signs of CV events since last visit" },
  { itemNo: 2, section: "Patient Status Assessment", text: "Lipid profile checked" },
  { itemNo: 3, section: "Patient Status Assessment", text: "HbA1c checked" },
  { itemNo: 4, section: "Treatment Assessment", text: "Check medication compliance" },
  { itemNo: 5, section: "Treatment Assessment", text: "Consider antiplatelet adjustment by cardiologist" },
  { itemNo: 6, section: "Treatment Assessment", text: "Consider lipid-lowering medication adjustment by cardiologist" },
  { itemNo: 7, section: "Treatment Assessment", text: "Consider antihypertensive medication adjustment by cardiologist" },
  { itemNo: 8, section: "Treatment Assessment", text: "Consider antidiabetic medication adjustment by cardiologist" },
  { itemNo: 9, section: "Education and Follow-up", text: "Patient and caregiver education on medication plan and lifestyle modification (including smoking cessation and safe sexual activity)" },
  { itemNo: 10, section: "Education and Follow-up", text: "Next follow-up appointment scheduled" },
];

export const POST_DISCHARGE_OPTIONAL_ITEMS: ChecklistItemDef[] = [
  { itemNo: 1, section: "Optional", text: "ECG or chest X-ray (if indicated)" },
  { itemNo: 2, section: "Optional", text: "Echocardiogram (if indicated)" },
  { itemNo: 3, section: "Optional", text: "Check participation in cardiac rehabilitation and smoking cessation programme" },
  { itemNo: 4, section: "Optional", text: "Patient still has adequate caregiver support" },
  { itemNo: 5, section: "Optional", text: "Patient/caregiver can contact healthcare provider if needed" },
  { itemNo: 6, section: "Optional", text: "Responsible physician/healthcare provider identified" },
  { itemNo: 7, section: "Optional", text: "Plan for next visit established" },
];

export interface ChecklistItemState {
  itemNo: number;
  status: ChecklistStatus;
  notes: string;
}

export function initChecklistItems(defs: ChecklistItemDef[]): ChecklistItemState[] {
  return defs.map((d) => ({ itemNo: d.itemNo, status: "pending", notes: "" }));
}
