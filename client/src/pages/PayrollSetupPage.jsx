import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const PayrollSetupPage = () => {
  const [employees, setEmployees] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [form, setForm] = useState({
    employee: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    paymentCycle: "monthly",
    effectiveFrom: "",
    bankName: "",
    accountNumber: "",
  });

  const load = async () => {
    const [employeesResponse, configsResponse] = await Promise.all([
      api.get("/erp/hr/employees"),
      api.get("/erp/hr/payroll"),
    ]);
    setEmployees(employeesResponse.data);
    setConfigs(configsResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/hr/payroll", {
      ...form,
      basicSalary: Number(form.basicSalary),
      allowances: Number(form.allowances || 0),
      deductions: Number(form.deductions || 0),
    });
    setForm({
      employee: "",
      basicSalary: "",
      allowances: "",
      deductions: "",
      paymentCycle: "monthly",
      effectiveFrom: "",
      bankName: "",
      accountNumber: "",
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Payroll Setup" subtitle="Configure salary structures, deductions, and effective pay cycles.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <select value={form.employee} onChange={(event) => setForm((prev) => ({ ...prev, employee: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>{employee.name} ({employee.employeeId || "-"})</option>
            ))}
          </select>
          <input value={form.basicSalary} onChange={(event) => setForm((prev) => ({ ...prev, basicSalary: event.target.value }))} required type="number" placeholder="Basic salary" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.allowances} onChange={(event) => setForm((prev) => ({ ...prev, allowances: event.target.value }))} type="number" placeholder="Allowances" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.deductions} onChange={(event) => setForm((prev) => ({ ...prev, deductions: event.target.value }))} type="number" placeholder="Deductions" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select value={form.paymentCycle} onChange={(event) => setForm((prev) => ({ ...prev, paymentCycle: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="monthly">Monthly</option>
            <option value="biweekly">Biweekly</option>
            <option value="weekly">Weekly</option>
          </select>
          <input type="date" value={form.effectiveFrom} onChange={(event) => setForm((prev) => ({ ...prev, effectiveFrom: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.bankName} onChange={(event) => setForm((prev) => ({ ...prev, bankName: event.target.value }))} placeholder="Bank name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.accountNumber} onChange={(event) => setForm((prev) => ({ ...prev, accountNumber: event.target.value }))} placeholder="Account number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Save Payroll Setup</button>
        </form>
      </SectionCard>

      <SectionCard title="Payroll Configurations" subtitle="Current salary setup and payment cycle records.">
        <DataTable
          columns={[
            { key: "employee", label: "Employee" },
            { key: "salary", label: "Basic Salary" },
            { key: "allowances", label: "Allowances" },
            { key: "deductions", label: "Deductions" },
            { key: "cycle", label: "Cycle" },
          ]}
          rows={configs.map((item) => ({
            employee: `${item.employee?.name || "-"} (${item.employee?.employeeId || "-"})`,
            salary: item.basicSalary,
            allowances: item.allowances,
            deductions: item.deductions,
            cycle: item.paymentCycle,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default PayrollSetupPage;
