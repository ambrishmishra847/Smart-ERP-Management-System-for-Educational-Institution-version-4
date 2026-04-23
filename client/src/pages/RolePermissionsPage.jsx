import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const roleLabels = {
  "super-admin": "Super Admin",
  "system-admin": "System Admin",
  "director-principal": "Director / Principal",
  registrar: "Registrar",
  "admission-cell": "Admission Cell",
  hod: "HOD",
  "faculty-professor": "Faculty / Professor",
  student: "Student",
  "parent-guardian": "Parent / Guardian",
  accountant: "Accountant",
  "hr-manager": "HR Manager",
  "placement-cell": "Placement Cell",
  librarian: "Librarian",
  "hostel-warden": "Hostel Warden",
  "transport-manager": "Transport Manager",
};

const roleCapabilities = [
  { role: "super-admin", access: "Full platform control", focus: "All modules, security, settings, and governance" },
  { role: "system-admin", access: "System and user administration", focus: "Users, settings, support, and security operations" },
  { role: "director-principal", access: "Leadership oversight", focus: "Analytics, approvals, finance reports, academic reports" },
  { role: "registrar", access: "Student records and academics", focus: "Admissions, students, records, courses" },
  { role: "admission-cell", access: "Admissions operations", focus: "Leads, applications, onboarding, intake coordination" },
  { role: "hod", access: "Department governance", focus: "Faculty, timetable, syllabus, department notices" },
  { role: "faculty-professor", access: "Teaching operations", focus: "Classes, attendance, assignments, materials, timetable" },
  { role: "student", access: "Self service", focus: "Attendance, assignments, materials, results, fees" },
  { role: "parent-guardian", access: "Child monitoring", focus: "Attendance, results, fees, communication" },
  { role: "accountant", access: "Finance operations", focus: "Fees, transactions, invoices, payroll execution" },
  { role: "hr-manager", access: "People operations", focus: "Employees, attendance, leave requests, payroll setup" },
  { role: "placement-cell", access: "Placement operations", focus: "Companies, drives, eligible students, reports" },
  { role: "librarian", access: "Library operations", focus: "Catalog, circulation, members, fines" },
  { role: "hostel-warden", access: "Hostel operations", focus: "Rooms, gate passes, maintenance, hostel fee coordination" },
  { role: "transport-manager", access: "Transport operations", focus: "Routes, allocations, fleet, payment coordination" },
];

const RolePermissionsPage = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const load = async () => {
      const response = await api.get("/erp/role-permissions");
      setCounts(Object.fromEntries((response.data || []).map((row) => [row._id, row.total])));
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard title="Role Matrix" subtitle="Current ERP access distribution and operational ownership.">
        <DataTable
          columns={[
            { key: "role", label: "Role" },
            { key: "access", label: "Access Scope" },
            { key: "focus", label: "Primary Modules" },
            { key: "users", label: "Users" },
          ]}
          rows={roleCapabilities.map((item) => ({
            role: roleLabels[item.role] || item.role,
            access: item.access,
            focus: item.focus,
            users: counts[item.role] || 0,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default RolePermissionsPage;
