import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const initialForm = {
  route: "",
  rider: "",
  stop: "",
  seatNumber: "",
  shift: "morning-evening",
  feeStatus: "pending",
  status: "active",
  notes: "",
};

const TransportAllocationsPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    const [allocationsResponse, routesResponse, participantsResponse] = await Promise.all([
      api.get("/erp/transport/allocations"),
      api.get("/erp/transport/routes"),
      api.get("/erp/transport/participants"),
    ]);
    setAllocations(allocationsResponse.data);
    setRoutes(routesResponse.data);
    setParticipants(participantsResponse.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await api.patch(`/erp/transport/allocations/${editingId}`, form);
    } else {
      await api.post("/erp/transport/allocations", form);
    }
    reset();
    await load();
  };

  const editAllocation = (allocation) => {
    setEditingId(allocation._id);
    setForm({
      route: allocation.route?._id || "",
      rider: allocation.rider?._id || "",
      stop: allocation.stop || "",
      seatNumber: allocation.seatNumber || "",
      shift: allocation.shift || "morning-evening",
      feeStatus: allocation.feeStatus || "pending",
      status: allocation.status || "active",
      notes: allocation.notes || "",
    });
  };

  const removeAllocation = async (id) => {
    await api.delete(`/erp/transport/allocations/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Assign Riders To Routes" subtitle="Allocate students and staff to stops, vehicles, and seat plans.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <select name="route" value={form.route} onChange={handleChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select route</option>
            {routes.map((route) => (
              <option key={route._id} value={route._id}>
                {route.routeName}
              </option>
            ))}
          </select>
          <select name="rider" value={form.rider} onChange={handleChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select rider</option>
            {participants.map((participant) => (
              <option key={participant._id} value={participant._id}>
                {participant.name} ({participant.rollNumber || participant.employeeId || participant.role})
              </option>
            ))}
          </select>
          <input name="stop" value={form.stop} onChange={handleChange} required placeholder="Assigned stop" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="seatNumber" value={form.seatNumber} onChange={handleChange} placeholder="Seat number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select name="shift" value={form.shift} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="morning-evening">Morning / Evening</option>
            <option value="morning-only">Morning Only</option>
            <option value="evening-only">Evening Only</option>
          </select>
          <select name="feeStatus" value={form.feeStatus} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
          <select name="status" value={form.status} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="active">Active</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="inactive">Inactive</option>
          </select>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Notes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">{editingId ? "Update Allocation" : "Create Allocation"}</button>
            {editingId ? <button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-5 py-3 text-slate-900">Cancel</button> : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Active Allocations" subtitle="Monitor who is assigned to each route and current fee standing.">
        <DataTable
          columns={[
            { key: "rider", label: "Rider" },
            { key: "route", label: "Route" },
            { key: "stop", label: "Stop" },
            { key: "feeStatus", label: "Fee Status" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={allocations.map((allocation) => ({
            rider: allocation.rider ? `${allocation.rider.name} (${allocation.rider.rollNumber || allocation.rider.employeeId || allocation.rider.role})` : "-",
            route: allocation.route?.routeName || "-",
            stop: allocation.stop,
            feeStatus: allocation.feeStatus,
            status: allocation.status,
            actions: (
              <div className="flex gap-3">
                <button type="button" onClick={() => editAllocation(allocation)} className="text-blue-600">Edit</button>
                <button type="button" onClick={() => removeAllocation(allocation._id)} className="text-rose-600">Remove</button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default TransportAllocationsPage;
