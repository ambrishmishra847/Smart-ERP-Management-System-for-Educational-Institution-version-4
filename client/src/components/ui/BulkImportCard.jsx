import { useMemo, useState } from "react";
import SectionCard from "./SectionCard";
import api from "../../services/api";

const BulkImportCard = ({ title, subtitle, target, sampleHeaders = [], helperText, onImported }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const accept = useMemo(() => ".xlsx,.xls,.csv,.pdf,.docx,.txt", []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose a file before importing.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(`/erp/import/${target}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
      await onImported?.(response.data);
      setFile(null);
      event.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to import the uploaded file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">{helperText}</p>
          <p className="mt-2 text-xs text-slate-500">Supported files: Excel, CSV, PDF, DOCX, TXT.</p>
          {sampleHeaders.length ? (
            <p className="mt-2 text-xs text-slate-500">
              Suggested columns: <span className="font-medium text-slate-700">{sampleHeaders.join(", ")}</span>
            </p>
          ) : null}
        </div>

        <input
          type="file"
          accept={accept}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
        />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {result ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-3">
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
            </div>
            {result.errors?.length ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-slate-900">Import notes</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {result.errors.slice(0, 5).map((item) => (
                    <p key={`${item.row}-${item.message}`}>Row {item.row}: {item.message}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Importing..." : "Upload And Import"}
        </button>
      </form>
    </SectionCard>
  );
};

export default BulkImportCard;
