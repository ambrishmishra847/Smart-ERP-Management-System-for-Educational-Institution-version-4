import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const initialForm = {
  routeName: "",
  vehicleNumber: "",
  driverName: "",
  driverPhone: "",
  capacity: 40,
  departureTime: "",
  returnTime: "",
  stops: "",
  notes: "",
  active: true,
};

const TransportRoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const load = async () => {
    const response = await api.get("/erp/transport/routes");
    setRoutes(response.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      capacity: Number(form.capacity || 40),
      stops: form.stops.split(",").map((item) => item.trim()).filter(Boolean),
    };

    if (editingId) {
      await api.patch(`/erp/transport/routes/${editingId}`, payload);
    } else {
      await api.post("/erp/transport/routes", payload);
    }

    reset();
    await load();
  };

  const editRoute = (route) => {
    setEditingId(route._id);
    setForm({
      routeName: route.routeName,
      vehicleNumber: route.vehicleNumber || "",
      driverName: route.driverName || "",
      driverPhone: route.driverPhone || "",
      capacity: route.capacity || 40,
      departureTime: route.departureTime || "",
      returnTime: route.returnTime || "",
      stops: (route.stops || []).join(", "),
      notes: route.notes || "",
      active: Boolean(route.active),
    });
  };

  const removeRoute = async (id) => {
    await api.delete(`/erp/transport/routes/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Transport Route Planner" subtitle="Define routes, assign vehicles, and keep stop coverage organized.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input name="routeName" value={form.routeName} onChange={handleChange} required placeholder="Route name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="Vehicle number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="driverName" value={form.driverName} onChange={handleChange} placeholder="Driver name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="driverPhone" value={form.driverPhone} onChange={handleChange} placeholder="Driver phone" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} placeholder="Capacity" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="departureTime" value={form.departureTime} onChange={handleChange} placeholder="Departure time" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="returnTime" value={form.returnTime} onChange={handleChange} placeholder="Return time" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900">
            <input name="active" type="checkbox" checked={form.active} onChange={handleChange} />
            Route active
          </label>
          <textarea name="stops" value={form.stops} onChange={handleChange} rows={3} placeholder="Stops separated by commas" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Notes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">{editingId ? "Update Route" : "Create Route"}</button>
            {editingId ? <button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-5 py-3 text-slate-900">Cancel</button> : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Route Register" subtitle="Overview of current route, driver, and vehicle assignments.">
        <DataTable
          columns={[
            { key: "route", label: "Route" },
            { key: "vehicle", label: "Vehicle" },
            { key: "driver", label: "Driver" },
            { key: "stops", label: "Stops" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={routes.map((route) => ({
            route: route.routeName,
            vehicle: route.vehicleNumber || "-",
            driver: route.driverName || "-",
            stops: (route.stops || []).join(", ") || "-",
            status: route.active ? "Active" : "Inactive",
            actions: (
              <div className="flex gap-3">
                <button type="button" onClick={() => editRoute(route)} className="text-blue-600">Edit</button>
                <button type="button" onClick={() => removeRoute(route._id)} className="text-rose-600">Remove</button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default TransportRoutesPage;
