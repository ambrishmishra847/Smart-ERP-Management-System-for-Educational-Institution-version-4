import { useEffect, useMemo, useState } from "react";
import ContentState from "./ContentState";
import PaginationControls from "./PaginationControls";

const DataTable = ({
  columns,
  rows,
  loading = false,
  error = "",
  emptyMessage = "No records are available yet.",
  mobileCardRender,
  mobileTitleKey,
  rowKey,
  pageSizeOptions = [5, 10, 20],
  initialPageSize = 10,
  pagination = true,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const safeRows = Array.isArray(rows) ? rows : [];

  useEffect(() => {
    setPage(1);
  }, [safeRows.length]);

  const totalPages = Math.max(1, Math.ceil(safeRows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleRows = useMemo(() => {
    if (!pagination) {
      return safeRows;
    }

    const start = (page - 1) * pageSize;
    return safeRows.slice(start, start + pageSize);
  }, [page, pageSize, pagination, safeRows]);

  if (loading) {
    return (
      <ContentState
        tone="loading"
        title="Loading data"
        description="The latest records are being prepared for this section."
      />
    );
  }

  if (error) {
    return (
      <ContentState
        tone="error"
        title="Unable to load this section"
        description={error}
      />
    );
  }

  if (!safeRows.length) {
    return <ContentState tone="empty" title="Nothing to show yet" description={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 p-4 md:hidden">
        {visibleRows.map((row, index) => (
          <article
            key={typeof rowKey === "function" ? rowKey(row, index) : row[rowKey] || `${index}-${row[mobileTitleKey] || "row"}`}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            {mobileCardRender ? (
              mobileCardRender(row)
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {mobileTitleKey ? row[mobileTitleKey] : row[columns[0]?.key]}
                  </p>
                </div>
                {columns.slice(mobileTitleKey ? 1 : 0).map((column) => (
                  <div key={column.key} className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{column.label}</p>
                    <div className="text-sm text-slate-700">{row[column.key]}</div>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                key={typeof rowKey === "function" ? rowKey(row, index) : row[rowKey] || index}
                className="border-t border-slate-200 text-sm text-slate-800"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 align-top">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && safeRows.length > Math.min(...pageSizeOptions) ? (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={pageSizeOptions}
          totalItems={safeRows.length}
        />
      ) : null}
    </div>
  );
};

export default DataTable;
