const DataTable = ({ columns, rows }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
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
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-200 text-sm text-slate-800">
              {columns.map((column) => (
                <td key={column.key} className="px-5 py-4">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;
