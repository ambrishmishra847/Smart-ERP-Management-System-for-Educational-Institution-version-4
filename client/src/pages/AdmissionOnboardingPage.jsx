import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatters";

const initialForm = {
  admissionId: "",
  className: "",
  section: "",
  batchId: "",
  department: "",
  academicSession: "",
  parentEmail: "",
  totalAmount: "",
};

const AdmissionOnboardingPage = () => {
  const [admissions, setAdmissions] = useState([]);
  const [defaults, setDefaults] = useState({});
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await api.get("/erp/admissions/onboarding");
    setAdmissions(response.data.admissions || []);
    setDefaults(response.data.defaults || {});
    setForm((prev) => ({
      ...prev,
      academicSession: prev.academicSession || response.data.defaults?.academicSession || "",
      totalAmount: prev.totalAmount || response.data.defaults?.defaultFeeAmount || "",
    }));
  };

  useEffect(() => {
    load();
  }, []);

  const selectedAdmission = admissions.find((item) => item._id === form.admissionId);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.admissionId) return;

    const response = await api.post(`/erp/admissions/${form.admissionId}/enroll`, {
      className: form.className || selectedAdmission?.program || "",
      section: form.section,
      batchId: form.batchId,
      department: form.department,
      academicSession: form.academicSession,
      parentEmail: form.parentEmail,
      totalAmount: Number(form.totalAmount || 0),
    });

    setMessage(response.data.message || "Student onboarded successfully.");
    setForm({
      ...initialForm,
      academicSession: defaults.academicSession || "",
      totalAmount: defaults.defaultFeeAmount || "",
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Onboard Accepted Applicants" subtitle="Create a student account, assign class metadata, and initialize fee records.">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <select name="admissionId" value={form.admissionId} onChange={handleChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select accepted or verified applicant</option>
            {admissions.filter((item) => item.status !== "rejected").map((item) => (
              <option key={item._id} value={item._id}>
                {item.studentName} | {item.program} | {item.status}
              </option>
            ))}
          </select>
          <input name="className" value={form.className} onChange={handleChange} placeholder="Class / program allocation" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="section" value={form.section} onChange={handleChange} placeholder="Section" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="batchId" value={form.batchId} onChange={handleChange} placeholder="Batch" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="department" value={form.department} onChange={handleChange} placeholder="Department" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="academicSession" value={form.academicSession} onChange={handleChange} placeholder="Academic session" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="parentEmail" type="email" value={form.parentEmail} onChange={handleChange} placeholder="Parent email" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="totalAmount" type="number" min="0" value={form.totalAmount} onChange={handleChange} placeholder="Initial fee amount" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          {selectedAdmission ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
              Default login password will be <strong>{defaults.defaultStudentPassword || "Student@123"}</strong> and can be changed on first login.
            </div>
          ) : null}
          {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Complete Onboarding</button>
        </form>
      </SectionCard>

      <SectionCard title="Onboarding Queue" subtitle="Track which applicants have already been converted into live student accounts.">
        <DataTable
          columns={[
            { key: "student", label: "Applicant" },
            { key: "program", label: "Program" },
            { key: "status", label: "Status" },
            { key: "session", label: "Academic Year" },
            { key: "onboarded", label: "Onboarded" },
            { key: "fee", label: "Default Fee" },
          ]}
          rows={admissions.map((item) => ({
            student: item.enrolledStudent ? `${item.studentName} -> ${item.enrolledStudent.rollNumber || "Student Created"}` : item.studentName,
            program: item.program,
            status: item.status,
            session: item.academicYear,
            onboarded: item.onboardedAt ? formatDate(item.onboardedAt) : "-",
            fee: formatCurrency(defaults.defaultFeeAmount || 0),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default AdmissionOnboardingPage;
