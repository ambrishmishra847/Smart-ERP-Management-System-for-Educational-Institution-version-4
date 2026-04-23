import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 25 });

  const loadLogs = async (page = 1, nextQuery = query, nextStatus = status) => {
    const { data } = await api.get("/erp/audit-logs", {
      params: {
        page,
        limit: 25,
        q: nextQuery || undefined,
        status: nextStatus || undefined,
      },
    });
    setLogs(data.rows || []);
    setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit: 25 });
  };

  useEffect(() => {
    loadLogs(1, "", "");
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard title="Audit Logs" subtitle="Trace privileged actions, imports, login attempts, and key record changes across the ERP.">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search action, entity, actor role, or target id"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          >
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
          <button
            type="button"
            onClick={() => loadLogs(1, query, status)}
            className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Search
          </button>
        </div>

        <div className="mb-4 text-sm text-slate-600">
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
        </div>

        <DataTable
          columns={[
            { key: "timestamp", label: "Timestamp" },
            { key: "action", label: "Action" },
            { key: "entity", label: "Entity" },
            { key: "actor", label: "Actor" },
            { key: "status", label: "Status" },
            { key: "requestId", label: "Request Id" },
          ]}
          rows={logs.map((item) => ({
            timestamp: new Date(item.timestamp || item.createdAt).toLocaleString(),
            action: item.action,
            entity: `${item.entityType} / ${item.entityId}`,
            actor: item.actor?.name ? `${item.actor.name} (${item.actorRole || item.actor?.role || "-"})` : item.actorRole || "-",
            status: item.status,
            requestId: item.requestId || "-",
          }))}
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => loadLogs(pagination.page - 1, query, status)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadLogs(pagination.page + 1, query, status)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default AuditLogsPage;
