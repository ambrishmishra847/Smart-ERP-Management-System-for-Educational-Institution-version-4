import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const LeaveRequestsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    employee: "",
    leaveType: "casual",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const load = async () => {
    const [employeesResponse, requestsResponse] = await Promise.all([
      api.get("/erp/hr/employees"),
      api.get("/erp/hr/leave-requests"),
    ]);
    setEmployees(employeesResponse.data);
    setRequests(requestsResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/hr/leave-requests", form);
    setForm({ employee: "", leaveType: "casual", fromDate: "", toDate: "", reason: "" });
    await load();
  };

  const review = async (id, status) => {
    await api.patch(`/erp/hr/leave-requests/${id}`, { status });
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Create Leave Request" subtitle="Raise and review staff leave requests from HR.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <select
            value={form.employee}
            onChange={(event) => setForm((prev) => ({ ...prev, employee: event.target.value }))}
            required
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>{employee.name} ({employee.employeeId || "-"})</option>
            ))}
          </select>
          <select
            value={form.leaveType}
            onChange={(event) => setForm((prev) => ({ ...prev, leaveType: event.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          >
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
            <option value="unpaid">Unpaid</option>
            <option value="duty">Duty</option>
          </select>
          <input type="date" value={form.fromDate} onChange={(event) => setForm((prev) => ({ ...prev, fromDate: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input type="date" value={form.toDate} onChange={(event) => setForm((prev) => ({ ...prev, toDate: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <textarea value={form.reason} onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))} rows={4} required placeholder="Reason" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Submit Leave Request</button>
        </form>
      </SectionCard>

      <SectionCard title="Leave Review Queue" subtitle="Approve or reject employee leave requests.">
        <DataTable
          columns={[
            { key: "employee", label: "Employee" },
            { key: "type", label: "Type" },
            { key: "dates", label: "Dates" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={requests.map((item) => ({
            employee: `${item.employee?.name || "-"} (${item.employee?.employeeId || "-"})`,
            type: item.leaveType,
            dates: `${new Date(item.fromDate).toLocaleDateString("en-IN")} - ${new Date(item.toDate).toLocaleDateString("en-IN")}`,
            status: item.status,
            actions: item.status === "pending" ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => review(item._id, "approved")} className="text-emerald-600">Approve</button>
                <button type="button" onClick={() => review(item._id, "rejected")} className="text-rose-600">Reject</button>
              </div>
            ) : item.status,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default LeaveRequestsPage;
