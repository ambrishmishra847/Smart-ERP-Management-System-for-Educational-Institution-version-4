import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const FinanceInvoicesPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    vendorName: "",
    invoiceNumber: "",
    category: "vendor",
    amount: "",
    dueDate: "",
    status: "pending",
    notes: "",
  });

  const load = async () => {
    const response = await api.get("/erp/finance/invoices");
    setItems(response.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/finance/invoices", {
      ...form,
      amount: Number(form.amount),
    });
    setForm({
      title: "",
      vendorName: "",
      invoiceNumber: "",
      category: "vendor",
      amount: "",
      dueDate: "",
      status: "pending",
      notes: "",
    });
    await load();
  };

  const remove = async (id) => {
    await api.delete(`/erp/finance/invoices/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Vendor Invoice Intake" subtitle="Track payable invoices, categories, and due dates.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required placeholder="Invoice title" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.vendorName} onChange={(event) => setForm((prev) => ({ ...prev, vendorName: event.target.value }))} required placeholder="Vendor name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.invoiceNumber} onChange={(event) => setForm((prev) => ({ ...prev, invoiceNumber: event.target.value }))} required placeholder="Invoice number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input type="number" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} required placeholder="Amount" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="vendor">Vendor</option>
            <option value="maintenance">Maintenance</option>
            <option value="technology">Technology</option>
            <option value="utilities">Utilities</option>
            <option value="services">Services</option>
          </select>
          <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <input type="date" value={form.dueDate} onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} rows={4} placeholder="Notes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Create Invoice</button>
        </form>
      </SectionCard>

      <SectionCard title="Invoice Register" subtitle="Current payables and payment readiness.">
        <DataTable
          columns={[
            { key: "title", label: "Title" },
            { key: "vendor", label: "Vendor" },
            { key: "invoiceNumber", label: "Invoice #" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={items.map((item) => ({
            title: item.title,
            vendor: item.vendorName,
            invoiceNumber: item.invoiceNumber,
            amount: item.amount,
            status: item.status,
            actions: <button type="button" onClick={() => remove(item._id)} className="text-rose-600">Remove</button>,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default FinanceInvoicesPage;
