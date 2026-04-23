import { useEffect, useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import DataTable from "../components/ui/DataTable";
import api from "../services/api";

const statuses = ["present", "absent", "leave", "remote"];

const HRStaffAttendancePage = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);

  const load = async () => {
    const [employeesResponse, attendanceResponse] = await Promise.all([
      api.get("/erp/hr/employees"),
      api.get("/erp/hr/attendance"),
    ]);
    setEmployees(employeesResponse.data);
    setAttendance(attendanceResponse.data);
    setRecords(
      employeesResponse.data.map((employee) => ({
        staff: employee._id,
        status: "present",
        checkIn: "",
        checkOut: "",
        remarks: "",
        name: employee.name,
        employeeId: employee.employeeId,
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const updateRecord = (staffId, field, value) => {
    setRecords((prev) => prev.map((item) => (item.staff === staffId ? { ...item, [field]: value } : item)));
  };

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/erp/hr/attendance", { date, records });
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Mark Staff Attendance" subtitle="Maintain daily HR attendance logs for staff and faculty.">
        <form onSubmit={submit} className="space-y-4">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.staff} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{record.name}</p>
                    <p className="text-sm text-slate-500">{record.employeeId || "No employee code"}</p>
                  </div>
                  <select
                    value={record.status}
                    onChange={(event) => updateRecord(record.staff, "status", event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={record.checkIn}
                    onChange={(event) => updateRecord(record.staff, "checkIn", event.target.value)}
                    placeholder="Check-in"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                  <input
                    value={record.checkOut}
                    onChange={(event) => updateRecord(record.staff, "checkOut", event.target.value)}
                    placeholder="Check-out"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                  <input
                    value={record.remarks}
                    onChange={(event) => updateRecord(record.staff, "remarks", event.target.value)}
                    placeholder="Remarks"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
            Save Staff Attendance
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Recent Staff Attendance" subtitle="Latest attendance logs recorded by HR.">
        <DataTable
          columns={[
            { key: "staff", label: "Employee" },
            { key: "date", label: "Date" },
            { key: "status", label: "Status" },
            { key: "checkIn", label: "Check-in" },
            { key: "checkOut", label: "Check-out" },
          ]}
          rows={attendance.map((item) => ({
            staff: `${item.staff?.name || "-"} (${item.staff?.employeeId || "-"})`,
            date: new Date(item.date).toLocaleDateString("en-IN"),
            status: item.status,
            checkIn: item.checkIn || "-",
            checkOut: item.checkOut || "-",
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default HRStaffAttendancePage;
