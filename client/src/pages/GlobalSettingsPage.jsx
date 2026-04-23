import { useEffect, useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const initialForm = {
  institutionName: "",
  shortName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  address: "",
  academicSession: "",
  campusName: "",
  timezone: "Asia/Calcutta",
  announcementFooter: "",
  defaultStudentPassword: "Student@123",
  defaultFeeAmount: 0,
  defaultFeeDueDays: 30,
  maintenanceMode: false,
};

const GlobalSettingsPage = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");

  const load = async () => {
    const response = await api.get("/erp/settings/global");
    setForm({
      institutionName: response.data.institutionName || "",
      shortName: response.data.shortName || "",
      contactEmail: response.data.contactEmail || "",
      contactPhone: response.data.contactPhone || "",
      website: response.data.website || "",
      address: response.data.address || "",
      academicSession: response.data.academicSession || "",
      campusName: response.data.campusName || "",
      timezone: response.data.timezone || "Asia/Calcutta",
      announcementFooter: response.data.announcementFooter || "",
      defaultStudentPassword: response.data.defaultStudentPassword || "Student@123",
      defaultFeeAmount: response.data.defaultFeeAmount || 0,
      defaultFeeDueDays: response.data.defaultFeeDueDays || 30,
      maintenanceMode: Boolean(response.data.maintenanceMode),
    });
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post("/erp/settings/global", {
      ...form,
      defaultFeeAmount: Number(form.defaultFeeAmount || 0),
      defaultFeeDueDays: Number(form.defaultFeeDueDays || 30),
    });
    setStatus("Global settings saved successfully.");
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Institution Profile" subtitle="Maintain the core identity and operating defaults of the ERP.">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input name="institutionName" value={form.institutionName} onChange={handleChange} required placeholder="Institution name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="shortName" value={form.shortName} onChange={handleChange} required placeholder="Short name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="Contact email" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Contact phone" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="website" value={form.website} onChange={handleChange} placeholder="Website URL" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="campusName" value={form.campusName} onChange={handleChange} placeholder="Campus name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="academicSession" value={form.academicSession} onChange={handleChange} placeholder="Academic session" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="timezone" value={form.timezone} onChange={handleChange} placeholder="Timezone" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="defaultStudentPassword" value={form.defaultStudentPassword} onChange={handleChange} placeholder="Default student password" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="defaultFeeAmount" type="number" min="0" value={form.defaultFeeAmount} onChange={handleChange} placeholder="Default onboarding fee" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input name="defaultFeeDueDays" type="number" min="1" value={form.defaultFeeDueDays} onChange={handleChange} placeholder="Default fee due days" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900">
            <input name="maintenanceMode" type="checkbox" checked={form.maintenanceMode} onChange={handleChange} />
            Enable maintenance mode
          </label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={3} placeholder="Institution address" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <textarea name="announcementFooter" value={form.announcementFooter} onChange={handleChange} rows={3} placeholder="Announcement footer" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          {status ? <p className="text-sm text-emerald-600 md:col-span-2">{status}</p> : null}
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Save Global Settings</button>
        </form>
      </SectionCard>
    </div>
  );
};

export default GlobalSettingsPage;
