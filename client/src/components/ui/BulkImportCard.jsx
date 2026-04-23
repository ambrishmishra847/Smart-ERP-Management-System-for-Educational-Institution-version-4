import { useEffect, useMemo, useState } from "react";
import SectionCard from "./SectionCard";
import api from "../../services/api";

const BulkImportCard = ({ title, subtitle, target, sampleHeaders = [], helperText, onImported }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [error, setError] = useState("");

  const accept = useMemo(() => ".xlsx,.xls,.csv,.pdf,.docx,.txt", []);

  const loadHistory = async () => {
    try {
      const response = await api.get("/erp/import/history", {
        params: { target, limit: 5 },
      });
      setHistory(Array.isArray(response.data?.rows) ? response.data.rows : []);
    } catch {
      setHistory([]);
    }
  };

  const downloadSampleTemplate = () => {
    if (!sampleHeaders.length) {
      return;
    }

    const csv = `${sampleHeaders.join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${target}-sample-template.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const runImport = async (mode) => {
    if (!file) {
      setError(`Please choose a file before ${mode === "preview" ? "previewing" : "importing"}.`);
      return;
    }

    if (mode === "preview") {
      setPreviewing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        mode === "preview" ? `/erp/import/${target}/preview` : `/erp/import/${target}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (mode === "preview") {
        setPreviewResult(response.data);
      } else {
        setResult(response.data);
        setSelectedJob(null);
        await onImported?.(response.data);
        setFile(null);
      }
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${mode === "preview" ? "preview" : "import"} the uploaded file.`);
    } finally {
      if (mode === "preview") {
        setPreviewing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const downloadErrorReport = (payload) => {
    if (!payload?.errors?.length) {
      return;
    }

    const rows = [
      ["row", "message"],
      ...payload.errors.map((item) => [item.row, item.message]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${target}-import-errors.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const openJobDetails = async (jobId) => {
    setJobLoading(true);
    setError("");
    try {
      const response = await api.get(`/erp/import/history/${jobId}`);
      setSelectedJob(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load import job details.");
    } finally {
      setJobLoading(false);
    }
  };

  const rollbackJob = async (jobId) => {
    setRollingBack(true);
    setError("");
    try {
      const response = await api.post(`/erp/import/history/${jobId}/rollback`);
      await loadHistory();
      if (selectedJob?._id === jobId) {
        await openJobDetails(jobId);
      }
      await onImported?.(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to roll back this import job.");
    } finally {
      setRollingBack(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    await runImport("commit");
    event.target.reset();
  };

  useEffect(() => {
    loadHistory();
  }, [target]);

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">{helperText}</p>
          <p className="mt-2 text-xs text-slate-500">Supported files: Excel, CSV, PDF, DOCX, TXT.</p>
          {sampleHeaders.length ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Suggested columns: <span className="font-medium text-slate-700">{sampleHeaders.join(", ")}</span>
              </p>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900"
              >
                Download Sample Template
              </button>
            </div>
          ) : null}
        </div>

        <input
          type="file"
          accept={accept}
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setPreviewResult(null);
            setResult(null);
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
        />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {previewResult ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preview Rows</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{previewResult.totalRows}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Valid</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">{previewResult.imported}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Skipped</p>
                <p className="mt-1 text-2xl font-semibold text-amber-600">{previewResult.skipped}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Duplicates</p>
                <p className="mt-1 text-2xl font-semibold text-orange-600">{previewResult.duplicateCount || 0}</p>
              </div>
            </div>
            {previewResult.preview?.length ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-900">Mapped preview</p>
                {previewResult.preview.slice(0, 3).map((item) => (
                  <div key={item.row} className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">Row {item.row} - {item.valid ? "Valid" : "Needs attention"}</p>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(item.mapped, null, 2)}</pre>
                    {item.duplicate ? (
                      <p className="mt-2 rounded-lg bg-orange-50 px-3 py-2 text-orange-700">
                        Duplicate detected: {item.duplicateMessage}
                      </p>
                    ) : null}
                    {item.validationError ? <p className="mt-2 text-rose-600">{item.validationError}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
            {previewResult.errors?.length ? (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Preview found issues</p>
                  <p className="mt-1 text-sm text-slate-700">{previewResult.errors.length} rows need attention before import.</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadErrorReport(previewResult)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900"
                >
                  Download Error Report
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {result ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rows</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{result.totalRows}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Imported</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">{result.imported}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Skipped</p>
                <p className="mt-1 text-2xl font-semibold text-amber-600">{result.skipped}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Duplicates</p>
                <p className="mt-1 text-2xl font-semibold text-orange-600">{result.duplicateCount || 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Validation Issues</p>
                <p className="mt-1 text-2xl font-semibold text-rose-600">{result.validationErrorCount || 0}</p>
              </div>
            </div>
            {result.errors?.length ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-900">Import notes</p>
                  <button
                    type="button"
                    onClick={() => downloadErrorReport(result)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900"
                  >
                    Download Error Report
                  </button>
                </div>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {result.errors.slice(0, 5).map((item) => (
                    <p key={`${item.row}-${item.message}`} className={/duplicate|already/i.test(item.message) ? "text-orange-700" : ""}>
                      Row {item.row}: {item.message}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => runImport("preview")}
            disabled={previewing || loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {previewing ? "Previewing..." : "Preview Import"}
          </button>
          <button
            type="submit"
            disabled={loading || previewing}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Importing..." : "Upload And Import"}
          </button>
        </div>

        {history.length ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Recent import activity</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {history.map((job) => (
                <div key={job._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{job.fileName}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{job.mode} • {job.target} • {job.status || "completed"}</p>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <p>Imported {job.imported} / {job.totalRows}</p>
                    <p>Skipped {job.skipped}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openJobDetails(job._id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900"
                    >
                      {jobLoading && selectedJob?._id !== job._id ? "Loading..." : "View Details"}
                    </button>
                    {job.mode === "commit" && job.status !== "rolled-back" ? (
                      <button
                        type="button"
                        onClick={() => rollbackJob(job._id)}
                        disabled={rollingBack}
                        className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 disabled:opacity-60"
                      >
                        {rollingBack ? "Rolling Back..." : "Rollback"}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {selectedJob ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Import Job Details</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {selectedJob.fileName} • {selectedJob.mode} • {selectedJob.status || "completed"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Rows</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{selectedJob.totalRows}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Imported</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">{selectedJob.imported}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Duplicates</p>
                <p className="mt-1 text-2xl font-semibold text-orange-600">{selectedJob.duplicateCount || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Validation Issues</p>
                <p className="mt-1 text-2xl font-semibold text-rose-600">{selectedJob.validationErrorCount || 0}</p>
              </div>
            </div>

            {selectedJob.rowDetails?.length ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-900">Row-level outcome</p>
                <div className="space-y-2">
                  {selectedJob.rowDetails.slice(0, 12).map((item) => (
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
                </div>
              </div>
            ) : null}

            {selectedJob.rollbackSummary?.notes?.length ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Rollback summary</p>
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  {selectedJob.rollbackSummary.notes.slice(0, 8).map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </form>
    </SectionCard>
  );
};

export default BulkImportCard;
