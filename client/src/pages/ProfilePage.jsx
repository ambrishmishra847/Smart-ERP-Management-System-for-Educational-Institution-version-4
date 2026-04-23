import { useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import { useAuth } from "../contexts/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();
  const [form] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.roleLabel || user?.role || "",
  });

  return (
    <div className="space-y-6">
      <SectionCard title="Profile" subtitle="Review your account details and personal access identity.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</p>
            <p className="mt-2 text-base font-medium text-slate-900">{form.name}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
            <p className="mt-2 text-base font-medium text-slate-900">{form.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Role</p>
            <p className="mt-2 text-base font-medium text-slate-900">{form.role}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p className="mt-2 text-base font-medium text-emerald-600">Active</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Account Actions" subtitle="Profile editing, password reset, and image upload hooks can be extended here.">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          This shared profile page is ready for password change, avatar upload, and personal detail editing flows.
        </div>
      </SectionCard>
    </div>
  );
};

export default ProfilePage;
