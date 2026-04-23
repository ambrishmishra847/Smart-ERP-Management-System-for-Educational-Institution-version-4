import { useEffect, useMemo, useState } from "react";
import BulkImportCard from "../components/ui/BulkImportCard";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";
import { formatDate } from "../utils/formatters";

const PlacementsPage = ({ view = "drives" }) => {
  const { user } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [form, setForm] = useState({
    companyName: "",
    roleTitle: "",
    description: "",
    location: "",
    packageLpa: "",
    eligibility: "",
    deadline: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const isCompaniesView = view === "companies";

  const loadPlacements = async () => {
    const response = await api.get("/erp/placements");
    setPlacements(response.data);
  };

  useEffect(() => {
    loadPlacements();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createPlacement = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/erp/placements", {
        ...form,
        packageLpa: Number(form.packageLpa),
      });
      setMessage("Placement opportunity created successfully.");
      setForm({
        companyName: "",
        roleTitle: "",
        description: "",
        location: "",
        packageLpa: "",
        eligibility: "",
        deadline: "",
      });
      await loadPlacements();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create placement.");
    }
  };

  const applyForPlacement = async (placementId) => {
    setMessage("");
    setError("");

    try {
      await api.post(`/erp/placements/${placementId}/apply`);
      setMessage("Placement application submitted.");
      await loadPlacements();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to apply for placement.");
    }
  };

  const removePlacement = async (placementId) => {
    await api.delete(`/erp/placements/${placementId}`);
    await loadPlacements();
  };

  const filteredPlacements = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return placements;
    }

    return placements.filter((item) =>
      [item.companyName, item.roleTitle, item.location, item.eligibility]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [placements, search]);

  const companies = useMemo(
    () =>
      Object.values(
        filteredPlacements.reduce((acc, item) => {
          if (!acc[item.companyName]) {
            acc[item.companyName] = {
              companyName: item.companyName,
              locations: new Set(),
              drives: 0,
              totalApplications: 0,
              highestPackage: 0,
              lastDeadline: item.deadline,
              roles: new Set(),
            };
          }

          acc[item.companyName].locations.add(item.location || "Undisclosed");
          acc[item.companyName].roles.add(item.roleTitle);
          acc[item.companyName].drives += 1;
          acc[item.companyName].totalApplications += item.applications?.length || 0;
          acc[item.companyName].highestPackage = Math.max(acc[item.companyName].highestPackage, Number(item.packageLpa || 0));

          if (new Date(item.deadline) > new Date(acc[item.companyName].lastDeadline)) {
            acc[item.companyName].lastDeadline = item.deadline;
          }

          return acc;
        }, {})
      ),
    [filteredPlacements]
  );

  return (
    <div className="space-y-6">
      {hasPermission(user, PERMISSIONS.PLACEMENTS_MANAGE) ? (
        <BulkImportCard
          title="Bulk Placement Import"
          subtitle="Upload company drives from Excel, PDF, Word, or CSV."
          target="placements"
          sampleHeaders={["companyName", "roleTitle", "description", "location", "packageLpa", "eligibility", "deadline"]}
          helperText="Placement teams can onboard recruitment drives in bulk. Preview detects duplicates before commit, and committed runs can be inspected or rolled back if a source file was incorrect."
          onImported={loadPlacements}
        />
      ) : null}

      {hasPermission(user, PERMISSIONS.PLACEMENTS_MANAGE) && !isCompaniesView ? (
        <SectionCard title="Create Placement Opportunity" subtitle="Publish company roles that students can apply to.">
          <form onSubmit={createPlacement} className="grid gap-4 md:grid-cols-2">
            <input name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Company name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <input name="roleTitle" value={form.roleTitle} onChange={handleChange} required placeholder="Role title" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <input name="packageLpa" type="number" min="0" value={form.packageLpa} onChange={handleChange} placeholder="Package (LPA)" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <input name="eligibility" value={form.eligibility} onChange={handleChange} placeholder="Eligibility criteria" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} required placeholder="Role description" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
            {error ? <p className="text-sm text-red-500 md:col-span-2">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">Create Placement</button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title={isCompaniesView ? "Company Directory" : "Placement Drives"}
        subtitle={isCompaniesView ? "Corporate relationship view with hiring footprint and drive activity." : "Role-level drives published by placement teams, HODs, and administrators."}
      >
        <div className="mb-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={isCompaniesView ? "Search company, role, location, or eligibility" : "Search drives by company, role, location, or eligibility"}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
        </div>

        {isCompaniesView ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {companies.map((item) => (
              <article key={item.companyName} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Corporate Partner</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.companyName}</h3>
                  </div>
                  <span className="text-sm text-slate-500">{item.drives} drives</span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>Roles covered: {Array.from(item.roles).join(", ")}</p>
                  <p>Locations: {Array.from(item.locations).join(", ")}</p>
                  <p>Total applications: {item.totalApplications}</p>
                  <p>Highest package: {item.highestPackage ? `${item.highestPackage} LPA` : "-"}</p>
                  <p>Latest deadline: {formatDate(item.lastDeadline)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredPlacements.map((item) => {
            const hasApplied = item.applications?.some((application) => application.student?._id === user._id);

            return (
              <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-blue-600">{item.companyName}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.roleTitle}</h3>
                  </div>
                  <span className="text-sm text-slate-500">{formatDate(item.deadline)}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                <div className="mt-4 space-y-1 text-sm text-slate-700">
                  <p>Location: {item.location || "-"}</p>
                  <p>Package: {item.packageLpa ? `${item.packageLpa} LPA` : "-"}</p>
                  <p>Eligibility: {item.eligibility || "-"}</p>
                  <p>Applications: {item.applications?.length || 0}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  {hasPermission(user, PERMISSIONS.PLACEMENTS_APPLY) ? (
                    <button
                      type="button"
                      onClick={() => applyForPlacement(item._id)}
                      disabled={hasApplied}
                      className="rounded-xl bg-solar px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
                    >
                      {hasApplied ? "Applied" : "Apply"}
                    </button>
                  ) : null}
                  {hasPermission(user, PERMISSIONS.PLACEMENTS_MANAGE) ? (
                    <button
                      type="button"
                      onClick={() => removePlacement(item._id)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-500"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </article>
            );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default PlacementsPage;
