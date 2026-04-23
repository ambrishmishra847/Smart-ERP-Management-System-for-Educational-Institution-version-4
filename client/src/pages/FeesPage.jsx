import { useEffect, useState } from "react";
import BulkImportCard from "../components/ui/BulkImportCard";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";
import { formatCurrency, formatDate } from "../utils/formatters";

const FeesPage = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student: "",
    academicYear: "",
    totalAmount: "",
    paidAmount: "",
    dueDate: "",
    status: "pending",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const feesResponse = await api.get("/erp/fees");
      setFees(Array.isArray(feesResponse.data) ? feesResponse.data : feesResponse.data?.rows || []);

      if (hasPermission(user, PERMISSIONS.FEES_MANAGE)) {
        const usersResponse = await api.get("/erp/users");
        const allUsers = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data?.rows || [];
        setStudents(allUsers.filter((item) => item.role === "student"));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fee records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/erp/fees", {
        ...form,
        totalAmount: Number(form.totalAmount),
        paidAmount: Number(form.paidAmount),
      });
      setMessage("Fee record created successfully.");
      setForm({
        student: "",
        academicYear: "",
        totalAmount: "",
        paidAmount: "",
        dueDate: "",
        status: "pending",
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create fee record.");
    }
  };

  const removeFee = async (feeId) => {
    await api.delete(`/erp/fees/${feeId}`);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {hasPermission(user, PERMISSIONS.FEES_MANAGE) ? (
        <BulkImportCard
          title="Bulk Fee Import"
          subtitle="Upload fee ledgers through Excel, PDF, Word, or CSV."
          target="fees"
          sampleHeaders={["rollNumber", "studentEmail", "academicYear", "totalAmount", "paidAmount", "dueDate", "status"]}
          helperText="Finance can upload full academic fee records from exported fee sheets. The importer matches students using roll number or student email and creates the fee entries automatically."
          onImported={loadData}
        />
      ) : null}

      {hasPermission(user, PERMISSIONS.FEES_MANAGE) ? (
        <SectionCard title="Create Fee Record" subtitle="Assign academic-year fee data and payment status to students.">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <select
              name="student"
              value={form.student}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.rollNumber || "No roll"})
                </option>
              ))}
            </select>
            <input
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              required
              placeholder="Academic year"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
            <input
              name="totalAmount"
              type="number"
              min="0"
              value={form.totalAmount}
              onChange={handleChange}
              required
              placeholder="Total amount"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
            <input
              name="paidAmount"
              type="number"
              min="0"
              value={form.paidAmount}
              onChange={handleChange}
              required
              placeholder="Paid amount"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
            {error ? <p className="text-sm text-red-500 md:col-span-2">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">
              Create Fee Record
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title="Fees" subtitle="Monitor payment progress, due dates, and student account standing.">
        <DataTable
          loading={loading}
          error={!fees.length ? error : ""}
          emptyMessage="No fee records are available yet."
          mobileTitleKey="student"
          rowKey={(row) => row.id}
          columns={[
            { key: "student", label: "Student" },
            { key: "academicYear", label: "Academic Year" },
            { key: "paid", label: "Paid" },
            { key: "total", label: "Total" },
            { key: "dueDate", label: "Due Date" },
            { key: "status", label: "Status" },
            ...(hasPermission(user, PERMISSIONS.FEES_MANAGE) ? [{ key: "actions", label: "Actions" }] : []),
          ]}
          rows={fees.map((fee) => ({
            id: fee._id,
            student: fee.student ? `${fee.student.name} (${fee.student.rollNumber || "-"})` : "Current student",
            academicYear: fee.academicYear,
            paid: formatCurrency(fee.paidAmount),
            total: formatCurrency(fee.totalAmount),
            dueDate: formatDate(fee.dueDate),
            status: fee.status,
            actions:
              hasPermission(user, PERMISSIONS.FEES_MANAGE) ? (
                <button type="button" onClick={() => removeFee(fee._id)} className="text-red-500">
                  Remove
                </button>
              ) : undefined,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default FeesPage;
