import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/ui/DataTable";
import BulkImportCard from "../components/ui/BulkImportCard";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const formDefaults = {
  studentName: "",
  email: "",
  phone: "",
  program: "",
  academicYear: "",
  source: "website",
  documentsVerified: false,
  score: "",
  status: "lead",
  notes: "",
};

const AdmissionsPage = ({ view = "pipeline" }) => {
  const [admissions, setAdmissions] = useState([]);
  const [form, setForm] = useState(formDefaults);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isLeadView = view === "leads";
  const isApplicationView = view === "applications";

  const loadAdmissions = async () => {
    const response = await api.get("/erp/admissions");
    setAdmissions(response.data);
  };

  useEffect(() => {
    loadAdmissions();
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
    setMessage("");
    setError("");

    try {
      await api.post("/erp/admissions", {
        ...form,
        score: Number(form.score || 0),
      });
      setMessage(isApplicationView ? "Application record added successfully." : "Admission lead added successfully.");
      setForm(formDefaults);
      await loadAdmissions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create admission lead.");
    }
  };

  const updateAdmission = async (admissionId, payload, successText) => {
    setMessage("");
    setError("");

    try {
      await api.patch(`/erp/admissions/${admissionId}`, payload);
      setMessage(successText);
      await loadAdmissions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update admission record.");
    }
  };

  const removeAdmission = async (admissionId) => {
    await api.delete(`/erp/admissions/${admissionId}`);
    await loadAdmissions();
  };

  const visibleAdmissions = useMemo(() => {
    const statuses = isLeadView
      ? ["lead"]
      : isApplicationView
        ? ["under-review", "verified", "accepted", "rejected"]
        : ["lead", "under-review", "verified", "accepted", "rejected"];
    const query = search.trim().toLowerCase();

    return admissions
      .filter((item) => statuses.includes(item.status))
      .filter((item) => {
        if (!query) {
          return true;
        }

        return [item.studentName, item.email, item.program, item.academicYear, item.status, item.source]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
  }, [admissions, isApplicationView, isLeadView, search]);

  const title = isLeadView ? "Lead Management" : isApplicationView ? "Application Review" : "Admissions Pipeline";
  const subtitle = isLeadView
    ? "Capture enquiries, track source quality, and move prospects into active review."
    : isApplicationView
      ? "Verify documents, decide outcomes, and move applicants toward onboarding."
      : "Track lead sources, document verification, and acceptance readiness.";

  return (
    <div className="space-y-6">
      <BulkImportCard
        title="Bulk Admission Import"
        subtitle="Upload Excel, PDF, Word, or CSV lists of admitted applicants."
        target="admissions"
        sampleHeaders={["studentName", "email", "phone", "program", "academicYear", "source", "documentsVerified", "score", "status", "notes"]}
        helperText="Admission Cell can upload tabular lists directly from office exports. If the document contains recognizable headers, the ERP will map and create the admission pipeline records automatically."
        onImported={loadAdmissions}
      />

      <SectionCard title={title} subtitle={subtitle}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            name="studentName"
            value={form.studentName}
            onChange={handleChange}
            required
            placeholder="Applicant name"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Applicant email"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <input
            name="program"
            value={form.program}
            onChange={handleChange}
            required
            placeholder="Program"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <input
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange}
            required
            placeholder="Academic year"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <input
            name="score"
            type="number"
            min="0"
            max="100"
            value={form.score}
            onChange={handleChange}
            placeholder="Merit score"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          >
            <option value="website">Website</option>
            <option value="social-media">Social Media</option>
            <option value="walk-in">Walk-in</option>
            <option value="referral">Referral</option>
            <option value="campaign">Campaign</option>
          </select>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          >
            {(isLeadView ? ["lead"] : isApplicationView ? ["under-review", "verified", "accepted", "rejected"] : ["lead", "under-review", "verified", "accepted", "rejected"]).map((status) => (
              <option key={status} value={status}>
                {status.replace(/-/g, " ")}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              name="documentsVerified"
              checked={form.documentsVerified}
              onChange={handleChange}
            />
            Documents verified
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Admission notes"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2"
          />
          {error ? <p className="text-sm text-red-500 md:col-span-2">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">
            {isApplicationView ? "Add Application Record" : "Add Admission Lead"}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title={isLeadView ? "Lead Pipeline" : isApplicationView ? "Application Queue" : "Admission Register"}
        subtitle={isLeadView ? "Live lead tracking with movement into review." : isApplicationView ? "Verification and decision workflow for active applications." : "Live pipeline view for admission operations."}
      >
        <div className="mb-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={isApplicationView ? "Search by applicant, program, year, or status" : "Search by applicant, program, source, or year"}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
        </div>
        <DataTable
          columns={[
            { key: "studentName", label: "Applicant" },
            { key: "program", label: "Program" },
            { key: "stageInfo", label: isLeadView ? "Lead Source" : "Academic Year" },
            { key: "score", label: "Score" },
            { key: "verified", label: "Verified" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={visibleAdmissions.map((item) => ({
            studentName: item.studentName,
            program: item.program,
            stageInfo: isLeadView ? item.source : item.academicYear,
            score: item.score,
            verified: item.documentsVerified ? "Yes" : "No",
            status: item.status,
            actions: (
              <div className="flex gap-3">
                {isLeadView ? (
                  <>
                    <button
                      type="button"
                      onClick={() => updateAdmission(item._id, { status: "under-review" }, `${item.studentName} moved to review.`)}
                      className="text-blue-700"
                    >
                      Move To Review
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAdmission(item._id, { documentsVerified: true, status: "verified" }, `${item.studentName} marked verified.`)}
                      className="text-emerald-700"
                    >
                      Verify
                    </button>
                  </>
                ) : isApplicationView ? (
                  <>
                    <button
                      type="button"
                      onClick={() => updateAdmission(item._id, { documentsVerified: true, status: "verified" }, `${item.studentName} verified.`)}
                      className="text-blue-700"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAdmission(item._id, { status: "accepted" }, `${item.studentName} accepted.`)}
                      className="text-emerald-700"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAdmission(item._id, { status: "rejected" }, `${item.studentName} rejected.`)}
                      className="text-amber-700"
                    >
                      Reject
                    </button>
                  </>
                ) : null}
                <button type="button" onClick={() => removeAdmission(item._id)} className="text-red-600">
                  Remove
                </button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default AdmissionsPage;
