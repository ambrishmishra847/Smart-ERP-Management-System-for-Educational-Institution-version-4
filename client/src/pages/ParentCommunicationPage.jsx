import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { formatDate } from "../utils/formatters";

const initialForm = {
  student: "",
  category: "appointment",
  subject: "",
  message: "",
  preferredDate: "",
};

const ParentCommunicationPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const response = await api.get("/erp/parent/communications");
    setRows(response.data.rows || []);
    setStudents(response.data.students || []);
    if ((response.data.students || []).length === 1) {
      setForm((prev) => ({ ...prev, student: prev.student || response.data.students[0]._id }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/parent/communications", form);
    setForm(initialForm);
    await load();
  };

  const respond = async (id, status) => {
    const responseMessage = window.prompt(`Add ${status} note`, status === "responded" ? "Meeting confirmed." : "Closed after follow-up.");
    await api.patch(`/erp/parent/communications/${id}`, {
      status,
      responseMessage: responseMessage || "",
    });
    await load();
  };

  const canRespond = user?.role !== "parent-guardian";

  return (
    <div className="space-y-6">
      {!canRespond ? (
        <SectionCard title="Raise Parent Communication" subtitle="Request a meeting or send a concern to academic administration.">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <select name="student" value={form.student} onChange={handleChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
              <option value="">Select child</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.rollNumber || student.className || "Student"})
                </option>
              ))}
            </select>
            <select name="category" value={form.category} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
              <option value="appointment">Appointment</option>
              <option value="attendance">Attendance</option>
              <option value="fees">Fees</option>
              <option value="result">Result</option>
              <option value="discipline">Discipline</option>
              <option value="general">General</option>
            </select>
            <input name="subject" value={form.subject} onChange={handleChange} required placeholder="Subject" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
            <textarea name="message" value={form.message} onChange={handleChange} rows={4} required placeholder="Message" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
            <input name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Send Communication</button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title="Communication Log" subtitle="Track appointment requests, responses, and parent-facing updates.">
        <DataTable
          columns={[
            { key: "student", label: "Student" },
            { key: "category", label: "Category" },
            { key: "subject", label: "Subject" },
            { key: "status", label: "Status" },
            { key: "preferredDate", label: "Preferred Date" },
            { key: "actions", label: "Actions" },
          ]}
          rows={rows.map((row) => ({
            student: row.student ? `${row.student.name} (${row.student.rollNumber || row.student.className || "-"})` : "-",
            category: row.category,
            subject: row.subject,
            status: row.status,
            preferredDate: row.preferredDate ? formatDate(row.preferredDate) : "-",
            actions: canRespond && row.status !== "closed" ? (
              <div className="flex gap-3">
                <button type="button" onClick={() => respond(row._id, "responded")} className="text-emerald-600">Respond</button>
                <button type="button" onClick={() => respond(row._id, "closed")} className="text-rose-600">Close</button>
              </div>
            ) : (
              row.responseMessage || "-"
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default ParentCommunicationPage;
