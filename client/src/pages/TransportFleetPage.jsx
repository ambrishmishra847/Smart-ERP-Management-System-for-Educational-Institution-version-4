import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { formatDate } from "../utils/formatters";

const initialForm = {
  vehicleNumber: "",
  busName: "",
  driverName: "",
  driverPhone: "",
  capacity: 40,
  insuranceExpiry: "",
  fitnessExpiry: "",
  lastServiceDate: "",
  status: "active",
  notes: "",
};

const TransportFleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    const response = await api.get("/erp/transport/fleet");
    setVehicles(response.data);
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
    const payload = {
      ...form,
      capacity: Number(form.capacity || 40),
    };

    if (editingId) {
      await api.patch(`/erp/transport/fleet/${editingId}`, payload);
    } else {
      await api.post("/erp/transport/fleet", payload);
    }

    reset();
    await load();
  };

  const editVehicle = (vehicle) => {
    setEditingId(vehicle._id);
    setForm({
      vehicleNumber: vehicle.vehicleNumber,
      busName: vehicle.busName || "",
      driverName: vehicle.driverName || "",
      driverPhone: vehicle.driverPhone || "",
      capacity: vehicle.capacity || 40,
      insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().slice(0, 10) : "",
      fitnessExpiry: vehicle.fitnessExpiry ? new Date(vehicle.fitnessExpiry).toISOString().slice(0, 10) : "",
      lastServiceDate: vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toISOString().slice(0, 10) : "",
      status: vehicle.status || "active",
      notes: vehicle.notes || "",
    });
  };

  const removeVehicle = async (id) => {
    await api.delete(`/erp/transport/fleet/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Fleet Register" subtitle="Maintain vehicle readiness, compliance dates, and driver mapping.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} required placeholder="Vehicle number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="busName" value={form.busName} onChange={handleChange} placeholder="Bus name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="driverName" value={form.driverName} onChange={handleChange} placeholder="Driver name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="driverPhone" value={form.driverPhone} onChange={handleChange} placeholder="Driver phone" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} placeholder="Vehicle capacity" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select name="status" value={form.status} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          <input name="insuranceExpiry" type="date" value={form.insuranceExpiry} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="fitnessExpiry" type="date" value={form.fitnessExpiry} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="lastServiceDate" type="date" value={form.lastServiceDate} onChange={handleChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Maintenance or compliance notes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">{editingId ? "Update Vehicle" : "Add Vehicle"}</button>
            {editingId ? <button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-5 py-3 text-slate-900">Cancel</button> : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Fleet Status" subtitle="Current transport asset readiness with next compliance dates.">
        <DataTable
          columns={[
            { key: "vehicle", label: "Vehicle" },
            { key: "driver", label: "Driver" },
            { key: "capacity", label: "Capacity" },
            { key: "insurance", label: "Insurance" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={vehicles.map((vehicle) => ({
            vehicle: vehicle.busName ? `${vehicle.vehicleNumber} (${vehicle.busName})` : vehicle.vehicleNumber,
            driver: vehicle.driverName || "-",
            capacity: vehicle.capacity,
            insurance: vehicle.insuranceExpiry ? formatDate(vehicle.insuranceExpiry) : "-",
            status: vehicle.status,
            actions: (
              <div className="flex gap-3">
                <button type="button" onClick={() => editVehicle(vehicle)} className="text-blue-600">Edit</button>
                <button type="button" onClick={() => removeVehicle(vehicle._id)} className="text-rose-600">Remove</button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default TransportFleetPage;
