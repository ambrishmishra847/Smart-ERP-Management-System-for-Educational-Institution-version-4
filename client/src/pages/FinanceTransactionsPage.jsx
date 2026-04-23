import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const FinanceTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "fee",
    type: "credit",
    amount: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    reference: "",
    relatedStudent: "",
    relatedEmployee: "",
    notes: "",
  });

  const load = async () => {
    const [transactionsResponse, participantsResponse] = await Promise.all([
      api.get("/erp/finance/transactions"),
      api.get("/erp/finance/participants"),
    ]);
    setTransactions(transactionsResponse.data);
    setStudents(participantsResponse.data.students);
    setEmployees(participantsResponse.data.employees);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/finance/transactions", {
      ...form,
      amount: Number(form.amount),
      relatedStudent: form.relatedStudent || undefined,
      relatedEmployee: form.relatedEmployee || undefined,
    });
    setForm({
      title: "",
      category: "fee",
      type: "credit",
      amount: "",
      transactionDate: new Date().toISOString().slice(0, 10),
      reference: "",
      relatedStudent: "",
      relatedEmployee: "",
      notes: "",
    });
    await load();
  };

  const removeTransaction = async (id) => {
    await api.delete(`/erp/finance/transactions/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Create Finance Transaction" subtitle="Maintain a working ledger for credits, debits, payroll, vendor, and adjustment entries.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required placeholder="Transaction title" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} required type="number" placeholder="Amount" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="fee">Fee</option>
            <option value="vendor">Vendor</option>
            <option value="payroll">Payroll</option>
            <option value="expense">Expense</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input type="date" value={form.transactionDate} onChange={(event) => setForm((prev) => ({ ...prev, transactionDate: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.reference} onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))} placeholder="Reference" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select value={form.relatedStudent} onChange={(event) => setForm((prev) => ({ ...prev, relatedStudent: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Related student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>{student.name} ({student.rollNumber || "-"})</option>
            ))}
          </select>
          <select value={form.relatedEmployee} onChange={(event) => setForm((prev) => ({ ...prev, relatedEmployee: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Related employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>{employee.name} ({employee.employeeId || "-"})</option>
            ))}
          </select>
          <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} rows={4} placeholder="Notes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Add Transaction</button>
        </form>
      </SectionCard>

      <SectionCard title="Ledger History" subtitle="Working finance transactions across collections, payroll, and expenses.">
        <DataTable
          columns={[
            { key: "title", label: "Title" },
            { key: "type", label: "Type" },
            { key: "category", label: "Category" },
            { key: "amount", label: "Amount" },
            { key: "date", label: "Date" },
            { key: "actions", label: "Actions" },
          ]}
          rows={transactions.map((item) => ({
            title: item.title,
            type: item.type,
            category: item.category,
            amount: item.amount,
            date: new Date(item.transactionDate).toLocaleDateString("en-IN"),
            actions: <button type="button" onClick={() => removeTransaction(item._id)} className="text-rose-600">Remove</button>,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default FinanceTransactionsPage;
