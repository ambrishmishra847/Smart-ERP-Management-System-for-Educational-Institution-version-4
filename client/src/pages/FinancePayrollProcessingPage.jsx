import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const FinancePayrollProcessingPage = () => {
  const [employees, setEmployees] = useState([]);
  const [runs, setRuns] = useState([]);
  const [form, setForm] = useState({
    employee: "",
    month: "",
    grossPay: "",
    deductions: "",
    netPay: "",
    status: "draft",
    remarks: "",
  });

  const load = async () => {
    const [participantsResponse, runsResponse] = await Promise.all([
      api.get("/erp/finance/participants"),
      api.get("/erp/finance/payroll-runs"),
    ]);
    setEmployees(participantsResponse.data.employees);
    setRuns(runsResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/finance/payroll-runs", {
      ...form,
      grossPay: Number(form.grossPay),
      deductions: Number(form.deductions || 0),
      netPay: Number(form.netPay),
    });
    setForm({
      employee: "",
      month: "",
      grossPay: "",
      deductions: "",
      netPay: "",
      status: "draft",
      remarks: "",
    });
    await load();
  };

  const setStatus = async (id, status) => {
    await api.patch(`/erp/finance/payroll-runs/${id}`, { status });
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Payroll Processing" subtitle="Generate and release payroll runs from finance.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <select value={form.employee} onChange={(event) => setForm((prev) => ({ ...prev, employee: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>{employee.name} ({employee.employeeId || "-"})</option>
            ))}
          </select>
          <input value={form.month} onChange={(event) => setForm((prev) => ({ ...prev, month: event.target.value }))} required placeholder="Month (e.g. 2026-04)" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input type="number" value={form.grossPay} onChange={(event) => setForm((prev) => ({ ...prev, grossPay: event.target.value }))} required placeholder="Gross pay" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input type="number" value={form.deductions} onChange={(event) => setForm((prev) => ({ ...prev, deductions: event.target.value }))} placeholder="Deductions" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input type="number" value={form.netPay} onChange={(event) => setForm((prev) => ({ ...prev, netPay: event.target.value }))} required placeholder="Net pay" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="draft">Draft</option>
            <option value="processed">Processed</option>
            <option value="released">Released</option>
          </select>
          <textarea value={form.remarks} onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))} rows={4} placeholder="Remarks" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Create Payroll Run</button>
        </form>
      </SectionCard>

      <SectionCard title="Payroll Runs" subtitle="Track payroll status from draft to released.">
        <DataTable
          columns={[
            { key: "employee", label: "Employee" },
            { key: "month", label: "Month" },
            { key: "gross", label: "Gross" },
            { key: "net", label: "Net" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={runs.map((item) => ({
            employee: `${item.employee?.name || "-"} (${item.employee?.employeeId || "-"})`,
            month: item.month,
            gross: item.grossPay,
            net: item.netPay,
            status: item.status,
            actions: (
              <div className="flex gap-2">
                <button type="button" onClick={() => setStatus(item._id, "processed")} className="text-blue-600">Process</button>
                <button type="button" onClick={() => setStatus(item._id, "released")} className="text-emerald-600">Release</button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default FinancePayrollProcessingPage;
