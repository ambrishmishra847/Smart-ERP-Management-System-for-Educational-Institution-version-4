import { useEffect, useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { formatDate } from "../utils/formatters";

const ImportJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [rollingBack, setRollingBack] = useState(false);

  const loadJobs = async (selectedTarget = target) => {
    try {
      setError("");
      const response = await api.get("/erp/import/history", {
        params: {
          ...(selectedTarget ? { target: selectedTarget } : {}),
          limit: 30,
        },
      });
      setJobs(Array.isArray(response.data?.rows) ? response.data.rows : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load import jobs.");
    }
  };

  const loadJobDetails = async (jobId) => {
    try {
      setError("");
      const response = await api.get(`/erp/import/history/${jobId}`);
      setSelectedJob(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load import job details.");
    }
  };

  const rollbackJob = async (jobId) => {
    setRollingBack(true);
    try {
      setError("");
      await api.post(`/erp/import/history/${jobId}/rollback`);
      await loadJobs();
      await loadJobDetails(jobId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to roll back this import job.");
    } finally {
      setRollingBack(false);
    }
  };

  useEffect(() => {
    loadJobs("");
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard title="Import Operations" subtitle="Monitor preview and commit jobs, inspect row-level outcomes, and roll back unsafe commits.">
        <div className="flex flex-wrap gap-3">
          <select
            value={target}
            onChange={(event) => {
              const nextTarget = event.target.value;
              setTarget(nextTarget);
              loadJobs(nextTarget);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          >
            <option value="">All import targets</option>
            <option value="admissions">Admissions</option>
            <option value="students">Students</option>
            <option value="staff">Staff</option>
            <option value="fees">Fees</option>
            <option value="courses">Courses</option>
            <option value="placements">Placements</option>
            <option value="announcements">Announcements</option>
          </select>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Recent Import Jobs" subtitle="Latest import previews and committed data movements across ERP modules.">
          <div className="space-y-3">
            {jobs.map((job) => (
              <button
                key={job._id}
                type="button"
                onClick={() => loadJobDetails(job._id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedJob?._id === job._id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{job.fileName}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      {job.target} • {job.mode} • {job.status || "completed"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-700">
                    <p>Imported {job.imported} / {job.totalRows}</p>
                    <p>Duplicates {job.duplicateCount || 0}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">{formatDate(job.createdAt)}</p>
              </button>
            ))}
            {!jobs.length ? <p className="text-sm text-slate-500">No import jobs found for the selected filter.</p> : null}
          </div>
        </SectionCard>

        <SectionCard title="Job Detail" subtitle="Detailed row outcomes, rollback metadata, and quality signals for the selected import.">
          {selectedJob ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{selectedJob.status || "completed"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Imported rows</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{selectedJob.imported}</p>
                </div>
              </div>

              {selectedJob.mode === "commit" && selectedJob.status !== "rolled-back" ? (
                <button
                  type="button"
                  onClick={() => rollbackJob(selectedJob._id)}
                  disabled={rollingBack}
                  className="rounded-xl border border-rose-200 bg-white px-5 py-3 font-semibold text-rose-700 disabled:opacity-60"
                >
                  {rollingBack ? "Rolling Back Import..." : "Rollback This Import"}
                </button>
              ) : null}

              {selectedJob.rollbackSummary?.notes?.length ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Rollback summary</p>
                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    {selectedJob.rollbackSummary.notes.slice(0, 10).map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Row details</p>
                {(selectedJob.rowDetails || []).slice(0, 20).map((item) => (
                  <div
                    key={`${item.row}-${item.status}`}
                    className={`rounded-xl border p-3 text-sm ${
                      item.status === "duplicate"
                        ? "border-orange-200 bg-orange-50"
                        : item.status === "validation-error" || item.status === "error"
                          ? "border-rose-200 bg-rose-50"
                          : item.status === "imported"
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="font-medium text-slate-900">Row {item.row} • {item.status}</p>
                    <p className="mt-1 text-slate-700">{item.message}</p>
                  </div>
                ))}
                {!selectedJob.rowDetails?.length ? <p className="text-sm text-slate-500">No row details are stored for this job.</p> : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select an import job from the left to inspect its results.</p>
          )}
        </SectionCard>
      </section>
    </div>
  );
};

export default ImportJobsPage;
