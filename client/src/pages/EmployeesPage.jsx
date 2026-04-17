import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await api.get("/erp/hr/employees");
      setEmployees(response.data);
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (employee) =>
        !q ||
        employee.name?.toLowerCase().includes(q) ||
        employee.email?.toLowerCase().includes(q) ||
        employee.employeeId?.toLowerCase().includes(q) ||
        employee.department?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Employees" subtitle="Total active staff directory">
          <p className="text-4xl font-semibold text-slate-900">{employees.length}</p>
        </SectionCard>
        <SectionCard title="Departments" subtitle="Represented in HR records">
          <p className="text-4xl font-semibold text-slate-900">{new Set(employees.map((item) => item.department).filter(Boolean)).size}</p>
        </SectionCard>
        <SectionCard title="Leadership / Admin" subtitle="Oversight and operations roles">
          <p className="text-4xl font-semibold text-slate-900">
            {employees.filter((item) => ["director-principal", "registrar", "accountant", "hr-manager", "system-admin"].includes(item.role)).length}
          </p>
        </SectionCard>
      </section>

      <SectionCard title="Employee Directory" subtitle="Search staff by name, department, or employee code.">
        <div className="mb-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employee"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "role", label: "Role" },
            { key: "department", label: "Department" },
            { key: "employeeId", label: "Employee ID" },
            { key: "email", label: "Email" },
          ]}
          rows={filtered.map((employee) => ({
            name: employee.name,
            role: employee.roleLabel || employee.role,
            department: employee.department || "-",
            employeeId: employee.employeeId || employee.username || "-",
            email: employee.email,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default EmployeesPage;
