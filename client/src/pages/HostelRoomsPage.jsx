import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const initialForm = {
  roomNumber: "",
  block: "",
  floor: "",
  roomType: "standard",
  capacity: 1,
  occupants: [],
  status: "available",
  notes: "",
};

const HostelRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    const [roomsResponse, studentsResponse] = await Promise.all([
      api.get("/erp/hostel/rooms"),
      api.get("/erp/hostel/students"),
    ]);
    setRooms(roomsResponse.data);
    setStudents(studentsResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOccupants = (event) => {
    setForm((prev) => ({
      ...prev,
      occupants: Array.from(event.target.selectedOptions).map((option) => option.value),
    }));
  };

  const reset = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      capacity: Number(form.capacity || 1),
    };

    if (editingId) {
      await api.patch(`/erp/hostel/rooms/${editingId}`, payload);
    } else {
      await api.post("/erp/hostel/rooms", payload);
    }

    reset();
    await load();
  };

  const editRoom = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor || "",
      roomType: room.roomType || "standard",
      capacity: room.capacity,
      occupants: (room.occupants || []).map((item) => item._id),
      status: room.status || "available",
      notes: room.notes || "",
    });
  };

  const removeRoom = async (id) => {
    await api.delete(`/erp/hostel/rooms/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Hostel Room Management" subtitle="Create rooms, assign occupants, and monitor occupancy by block.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input name="roomNumber" value={form.roomNumber} onChange={handleChange} required placeholder="Room number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="block" value={form.block} onChange={handleChange} required placeholder="Block" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="floor" value={form.floor} onChange={handleChange} placeholder="Floor" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} placeholder="Capacity" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select name="roomType" value={form.roomType} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="standard">Standard</option>
            <option value="double">Double</option>
            <option value="deluxe">Deluxe</option>
          </select>
          <select name="status" value={form.status} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select multiple value={form.occupants} onChange={handleOccupants} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2">
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} ({student.rollNumber || student.className || "Student"})
              </option>
            ))}
          </select>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Notes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">{editingId ? "Update Room" : "Create Room"}</button>
            {editingId ? <button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-5 py-3 text-slate-900">Cancel</button> : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Room Register" subtitle="Track availability and current student allocation.">
        <DataTable
          columns={[
            { key: "room", label: "Room" },
            { key: "type", label: "Type" },
            { key: "occupancy", label: "Occupancy" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={rooms.map((room) => ({
            room: `${room.block} - ${room.roomNumber}`,
            type: room.roomType,
            occupancy: `${(room.occupants || []).length}/${room.capacity}`,
            status: room.status,
            actions: (
              <div className="flex gap-3">
                <button type="button" onClick={() => editRoom(room)} className="text-blue-600">Edit</button>
                <button type="button" onClick={() => removeRoom(room._id)} className="text-rose-600">Remove</button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default HostelRoomsPage;
