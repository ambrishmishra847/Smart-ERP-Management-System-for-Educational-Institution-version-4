import { Link } from "react-router-dom";
import SectionCard from "../components/ui/SectionCard";
import { useAuth } from "../contexts/AuthContext";

const roleContent = {
  "super-admin": {
    title: "Super Admin Command Center",
    summary: "Oversee system health, user management, role permissions, global settings, and institutional audit visibility.",
    actions: [
      { label: "Open Admin Dashboard", to: "/admin/dashboard" },
      { label: "Manage Users", to: "/admin/users" },
      { label: "Review System Logs", to: "/admin/system-logs" },
    ],
    functions: [
      "Global ERP control across configuration, access, and oversight",
      "Role and permission governance for every institutional module",
      "System-level monitoring, policy, and setup administration",
    ],
  },
  "director-principal": {
    title: "Leadership Command Center",
    summary: "Institution-wide oversight for admissions, revenue, academic performance, payroll approvals, and compliance reports.",
    actions: [
      { label: "View Management Dashboard", to: "/management/dashboard" },
      { label: "Open Finance Reports", to: "/management/finance-reports" },
      { label: "Review Academic Reports", to: "/management/academic-reports" },
    ],
    functions: [
      "Dashboard with admissions, academic health, and financial visibility",
      "Major budget and leave approval overview",
      "Placement, compliance, and revenue reporting",
    ],
  },
  registrar: {
    title: "Registrar Workspace",
    summary: "Manage student lifecycle, academic records, certificates, roll number allocation, and regulatory exports.",
    actions: [
      { label: "Open Registrar Dashboard", to: "/registrar/dashboard" },
      { label: "Review Admissions", to: "/registrar/admissions" },
      { label: "Manage Student Records", to: "/registrar/students" },
    ],
    functions: [
      "Registration, roll number, and batch allocation control",
      "Transcript, bonafide, migration, and dropout administration",
      "University and statutory record exports",
    ],
  },
  "admission-cell": {
    title: "Admission Cell Desk",
    summary: "Handle inquiries, applications, counseling stages, document verification, merit lists, and onboarding.",
    actions: [
      { label: "Open Admission Dashboard", to: "/admission/dashboard" },
      { label: "Manage Leads", to: "/admission/leads" },
      { label: "Track Applications", to: "/admission/applications" },
    ],
    functions: [
      "Prospective student CRM and stage tracking",
      "Application verification and merit processing",
      "New student onboarding coordination",
    ],
  },
  hod: {
    title: "HOD Operations Page",
    summary: "Oversee faculty allocation, timetable approval, syllabus progress, internal marks, and departmental performance.",
    actions: [
      { label: "Open HOD Dashboard", to: "/hod/dashboard" },
      { label: "Review Timetable", to: "/hod/timetable-builder" },
      { label: "Publish Department Notices", to: "/hod/department-notices" },
    ],
    functions: [
      "Faculty subject allocation and timetable approval",
      "Syllabus completion and attendance monitoring",
      "Department internal marks review and locking",
    ],
  },
  "faculty-professor": {
    title: "Faculty Workspace",
    summary: "Daily teaching operations for attendance, assignments, materials, marks, quizzes, and batch communication.",
    actions: [
      { label: "Open Teacher Dashboard", to: "/teacher/dashboard" },
      { label: "Mark Attendance", to: "/teacher/attendance" },
      { label: "Manage Assignments", to: "/teacher/assignments" },
    ],
    functions: [
      "Daily attendance and assignment workflows",
      "Internal marks and evaluation tasks",
      "Academic communication for assigned batches",
    ],
  },
  accountant: {
    title: "Finance Console",
    summary: "Manage fee collection, receipts, ledgers, payroll coordination, and financial operations.",
    actions: [
      { label: "Open Finance Dashboard", to: "/finance/dashboard" },
      { label: "Manage Fee Collection", to: "/finance/fee-collection" },
      { label: "Review Payroll", to: "/finance/payroll" },
    ],
    functions: [
      "Student receivables and receipt generation",
      "General ledger and reconciliation view",
      "Payroll and deduction operations support",
    ],
  },
  "hr-manager": {
    title: "HR Manager Desk",
    summary: "Handle staff records, onboarding, attendance, leave processing, appraisals, and benefits tracking.",
    actions: [
      { label: "Open HR Dashboard", to: "/hr/dashboard" },
      { label: "Review Attendance", to: "/hr/attendance" },
      { label: "Process Leave Requests", to: "/hr/leave-requests" },
    ],
    functions: [
      "Staff onboarding and digital records",
      "Attendance and leave administration",
      "Appraisal and grievance support tracking",
    ],
  },
  "placement-cell": {
    title: "Placement Cell Hub",
    summary: "Manage companies, recruitment drives, eligibility filtering, interview stages, and placement reports.",
    actions: [
      { label: "Open Placement Dashboard", to: "/placement/dashboard" },
      { label: "Manage Drives", to: "/placement/drives" },
      { label: "Review Placement Reports", to: "/placement/reports" },
    ],
    functions: [
      "Company and drive scheduling management",
      "Student profile and eligibility filtering",
      "Interview stage and offer tracking",
    ],
  },
  librarian: {
    title: "Library Desk",
    summary: "Manage catalog, circulation, overdue fines, and learning resource visibility.",
    actions: [
      { label: "Open Library Dashboard", to: "/library/dashboard" },
      { label: "Manage Catalog", to: "/library/catalog" },
      { label: "Track Fines", to: "/library/fines" },
    ],
    functions: [
      "Book and journal inventory administration",
      "Issue and return tracking workflows",
      "Late fine coordination with central ledger",
    ],
  },
  "hostel-warden": {
    title: "Hostel Warden Panel",
    summary: "Manage room allotment, occupancy, attendance, gate passes, mess fee tracking, and maintenance issues.",
    actions: [
      { label: "Open Hostel Dashboard", to: "/hostel/dashboard" },
      { label: "Manage Rooms", to: "/hostel/rooms" },
      { label: "Track Maintenance", to: "/hostel/maintenance" },
    ],
    functions: [
      "Room and bed allocation tracking",
      "Hostel operations and nightly attendance",
      "Maintenance issue monitoring",
    ],
  },
  "transport-manager": {
    title: "Transport Control Room",
    summary: "Manage routes, stops, assignments, transport payments, fleet logs, and driver scheduling.",
    actions: [
      { label: "Open Transport Dashboard", to: "/transport/dashboard" },
      { label: "Manage Routes", to: "/transport/routes" },
      { label: "Review Allocations", to: "/transport/allocations" },
    ],
    functions: [
      "Route and stop configuration planning",
      "Student and staff route allocation",
      "Vehicle and driver operation tracking",
    ],
  },
  "system-admin": {
    title: "System Administration Console",
    summary: "Control users, permissions, support tickets, backup readiness, configuration oversight, and audit visibility.",
    actions: [
      { label: "Open Admin Dashboard", to: "/admin/dashboard" },
      { label: "Manage Users", to: "/admin/users" },
      { label: "Review System Logs", to: "/admin/system-logs" },
    ],
    functions: [
      "User accounts and RBAC administration",
      "Technical governance and system support",
      "Security and monitoring oversight",
    ],
  },
  student: {
    title: "Student Self-Service",
    summary: "Access timetable, attendance, assignments, results, fees, study materials, and placements.",
    actions: [
      { label: "Open Student Dashboard", to: "/student/dashboard" },
      { label: "Open Assignments", to: "/student/assignments" },
      { label: "View Results", to: "/student/results" },
    ],
    functions: [
      "Timetable, attendance, and study materials access",
      "Assignment submission and result tracking",
      "Fee visibility and placement participation",
    ],
  },
  "parent-guardian": {
    title: "Parent / Guardian Portal",
    summary: "Monitor child attendance, academic progress, fees, and notices while staying connected to the institution.",
    actions: [
      { label: "Open Parent Dashboard", to: "/parent/dashboard" },
      { label: "Track Attendance", to: "/parent/attendance" },
      { label: "Review Fees", to: "/parent/fees" },
    ],
    functions: [
      "Attendance and academic progress monitoring",
      "Fee payment visibility and history review",
      "Institution communication access",
    ],
  },
};

const RoleWorkspacePage = () => {
  const { user } = useAuth();
  const content = roleContent[user.role] || {
    title: user.roleLabel || "Role Workspace",
    summary: "This workspace brings together the modules and approvals relevant to your role.",
    actions: [{ label: "Open Overview", to: "/" }],
    functions: ["Role-based ERP functions are active for this user."],
  };

  return (
    <div className="space-y-6">
      <SectionCard title={content.title} subtitle={content.summary}>
        <div className="grid gap-4 md:grid-cols-3">
          {content.actions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Role Functions" subtitle="Primary responsibilities enabled for your role in this ERP.">
        <div className="grid gap-4 md:grid-cols-2">
          {content.functions.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default RoleWorkspacePage;
