import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const ManagementApprovalsPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    requestType: "budget",
    department: "",
    amount: "",
    notes: "",
  });

  const load = async () => {
    const response = await api.get("/erp/management/approvals");
    setItems(response.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/management/approvals", {
      ...form,
      amount: Number(form.amount || 0),
    });
    setForm({
      title: "",
      requestType: "budget",
      department: "",
      amount: "",
      notes: "",
    });
    await load();
  };

  const review = async (id, status) => {
    await api.patch(`/erp/management/approvals/${id}`, { status });
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Create Approval Item" subtitle="Capture budgets, leave escalations, procurement, and academic approvals.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required placeholder="Approval title" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.department} onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))} required placeholder="Department" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select value={form.requestType} onChange={(event) => setForm((prev) => ({ ...prev, requestType: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="budget">Budget</option>
            <option value="leave">Leave</option>
            <option value="payroll">Payroll</option>
            <option value="procurement">Procurement</option>
            <option value="academic">Academic</option>
          </select>
          <input type="number" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} placeholder="Amount" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} rows={4} placeholder="Notes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Create Approval Item</button>
        </form>
      </SectionCard>

      <SectionCard title="Approval Queue" subtitle="Leadership review for high-priority requests.">
        <DataTable
          columns={[
            { key: "title", label: "Title" },
            { key: "type", label: "Type" },
            { key: "department", label: "Department" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={items.map((item) => ({
            title: item.title,
            type: item.requestType,
            department: item.department,
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

export default ManagementApprovalsPage;
