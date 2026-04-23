import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { formatDate } from "../utils/formatters";

const initialForm = {
  student: "",
  room: "",
  passType: "day",
  reason: "",
  outDateTime: "",
  expectedReturnAt: "",
};

const HostelGatePassesPage = () => {
  const [gatePasses, setGatePasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const [passesResponse, studentsResponse, roomsResponse] = await Promise.all([
      api.get("/erp/hostel/gate-passes"),
      api.get("/erp/hostel/students"),
      api.get("/erp/hostel/rooms"),
    ]);
    setGatePasses(passesResponse.data);
    setStudents(studentsResponse.data);
    setRooms(roomsResponse.data);
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
    await api.post("/erp/hostel/gate-passes", form);
    setForm(initialForm);
    await load();
  };

  const updateStatus = async (id, status) => {
    const approvalNotes =
      status === "approved"
        ? "Approved by hostel office."
        : status === "returned"
          ? "Student returned to hostel."
          : "Pass was rejected by the warden.";

    await api.patch(`/erp/hostel/gate-passes/${id}`, {
      status,
      approvalNotes,
      returnedAt: status === "returned" ? new Date().toISOString() : undefined,
    });
    await load();
  };

  const removePass = async (id) => {
    await api.delete(`/erp/hostel/gate-passes/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Create Gate Pass" subtitle="Issue hostel out-passes and monitor expected return timings.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <select name="student" value={form.student} onChange={handleChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} ({student.rollNumber || student.className || "Student"})
              </option>
            ))}
          </select>
          <select name="room" value={form.room} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.block} - {room.roomNumber}
              </option>
            ))}
          </select>
          <select name="passType" value={form.passType} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="day">Day Pass</option>
            <option value="night">Night Pass</option>
            <option value="weekend">Weekend Pass</option>
            <option value="medical">Medical</option>
            <option value="emergency">Emergency</option>
          </select>
          <input name="outDateTime" type="datetime-local" value={form.outDateTime} onChange={handleChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="expectedReturnAt" type="datetime-local" value={form.expectedReturnAt} onChange={handleChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <textarea name="reason" value={form.reason} onChange={handleChange} rows={3} required placeholder="Reason for pass" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Create Gate Pass</button>
        </form>
      </SectionCard>

      <SectionCard title="Gate Pass Register" subtitle="Approve movement, track returns, and keep hostel movement visible.">
        <DataTable
          columns={[
            { key: "student", label: "Student" },
            { key: "passType", label: "Pass Type" },
            { key: "outDate", label: "Out" },
            { key: "returnDate", label: "Expected Return" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={gatePasses.map((item) => ({
            student: item.student ? `${item.student.name} (${item.student.rollNumber || "-"})` : "-",
            passType: item.passType,
            outDate: item.outDateTime ? formatDate(item.outDateTime) : "-",
            returnDate: item.expectedReturnAt ? formatDate(item.expectedReturnAt) : "-",
            status: item.status,
            actions: (
              <div className="flex gap-3">
                {item.status === "pending" ? <button type="button" onClick={() => updateStatus(item._id, "approved")} className="text-emerald-600">Approve</button> : null}
                {item.status === "approved" || item.status === "out" ? <button type="button" onClick={() => updateStatus(item._id, "returned")} className="text-blue-600">Mark Returned</button> : null}
                {item.status === "pending" ? <button type="button" onClick={() => updateStatus(item._id, "rejected")} className="text-amber-600">Reject</button> : null}
                <button type="button" onClick={() => removePass(item._id)} className="text-rose-600">Remove</button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default HostelGatePassesPage;
