import PatientForm from "@/components/PatientForm";

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Add patient</h1>
      <div className="rounded-xl bg-white p-6 shadow">
        <PatientForm />
      </div>
    </div>
  );
}
