import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const initialForm = {
  room: "",
  title: "",
  issueType: "electrical",
  priority: "medium",
  status: "open",
  assignedTo: "",
  resolutionNotes: "",
};

const HostelMaintenancePage = () => {
  const [tickets, setTickets] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const [ticketsResponse, roomsResponse] = await Promise.all([
      api.get("/erp/hostel/maintenance"),
      api.get("/erp/hostel/rooms"),
    ]);
    setTickets(ticketsResponse.data);
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
    await api.post("/erp/hostel/maintenance", form);
    setForm(initialForm);
    await load();
  };

  const updateStatus = async (ticket, status) => {
    await api.patch(`/erp/hostel/maintenance/${ticket._id}`, {
      ...ticket,
      room: ticket.room?._id || ticket.room,
      status,
      resolutionNotes: status === "resolved" ? ticket.resolutionNotes || "Issue resolved by hostel support." : ticket.resolutionNotes || "",
    });
    await load();
  };

  const removeTicket = async (id) => {
    await api.delete(`/erp/hostel/maintenance/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Log Maintenance Issue" subtitle="Track room repairs, vendor follow-up, and hostel facility issues.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <select name="room" value={form.room} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.block} - {room.roomNumber}
              </option>
            ))}
          </select>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="Issue title" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select name="issueType" value={form.issueType} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="furniture">Furniture</option>
            <option value="general">General</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <input name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Assigned vendor or staff" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <textarea name="resolutionNotes" value={form.resolutionNotes} onChange={handleChange} rows={3} placeholder="Initial notes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Create Maintenance Ticket</button>
        </form>
      </SectionCard>

      <SectionCard title="Maintenance Queue" subtitle="Keep hostel repairs visible until fully resolved.">
        <DataTable
          columns={[
            { key: "room", label: "Room" },
            { key: "issue", label: "Issue" },
            { key: "priority", label: "Priority" },
            { key: "status", label: "Status" },
            { key: "assignedTo", label: "Assigned To" },
            { key: "actions", label: "Actions" },
          ]}
          rows={tickets.map((ticket) => ({
            room: ticket.room ? `${ticket.room.block} - ${ticket.room.roomNumber}` : "Common Area",
            issue: ticket.title,
            priority: ticket.priority,
            status: ticket.status,
            assignedTo: ticket.assignedTo || "-",
            actions: (
              <div className="flex gap-3">
                {ticket.status === "open" ? <button type="button" onClick={() => updateStatus(ticket, "in-progress")} className="text-blue-600">Start</button> : null}
                {ticket.status !== "resolved" ? <button type="button" onClick={() => updateStatus(ticket, "resolved")} className="text-emerald-600">Resolve</button> : null}
                <button type="button" onClick={() => removeTicket(ticket._id)} className="text-rose-600">Remove</button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default HostelMaintenancePage;
