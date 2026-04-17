import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import AdmissionsPage from "./pages/AdmissionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import AttendancePage from "./pages/AttendancePage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import FeesPage from "./pages/FeesPage";
import FinanceInvoicesPage from "./pages/FinanceInvoicesPage";
import FinancePayrollProcessingPage from "./pages/FinancePayrollProcessingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FinanceTransactionsPage from "./pages/FinanceTransactionsPage";
import EmployeesPage from "./pages/EmployeesPage";
import HRStaffAttendancePage from "./pages/HRStaffAttendancePage";
import HodFacultyPage from "./pages/HodFacultyPage";
import LeaveRequestsPage from "./pages/LeaveRequestsPage";
import LibraryCatalogPage from "./pages/LibraryCatalogPage";
import LibraryCirculationPage from "./pages/LibraryCirculationPage";
import LibraryFinesPage from "./pages/LibraryFinesPage";
import LibraryMembersPage from "./pages/LibraryMembersPage";
import LoginPage from "./pages/LoginPage";
import ManagementApprovalsPage from "./pages/ManagementApprovalsPage";
import NotificationsPage from "./pages/NotificationsPage";
import PlacementsPage from "./pages/PlacementsPage";
import ProfilePage from "./pages/ProfilePage";
import PayrollSetupPage from "./pages/PayrollSetupPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResultsPage from "./pages/ResultsPage";
import RoleWorkspacePage from "./pages/RoleWorkspacePage";
import SharedModulePage from "./pages/SharedModulePage";
import StudentManagementPage from "./pages/StudentManagementPage";
import SyllabusTrackingPage from "./pages/SyllabusTrackingPage";
import TimetablePage from "./pages/TimetablePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import UsersPage from "./pages/UsersPage";
import { PERMISSIONS } from "./utils/access";
import { getDefaultRoute } from "./utils/routes";

const ADMIN_ROLES = ["super-admin", "system-admin"];
const MANAGEMENT_ROLES = ["director-principal", "super-admin"];
const REGISTRAR_ROLES = ["registrar", "super-admin"];
const ADMISSION_ROLES = ["admission-cell", "super-admin"];
const HR_ROLES = ["hr-manager", "super-admin"];
const FINANCE_ROLES = ["accountant", "super-admin"];
const HOD_ROLES = ["hod", "super-admin"];
const TEACHER_ROLES = ["faculty-professor", "super-admin"];
const STUDENT_ROLES = ["student", "super-admin"];
const LIBRARY_ROLES = ["librarian", "super-admin"];
const PLACEMENT_ROLES = ["placement-cell", "super-admin"];
const PARENT_ROLES = ["parent-guardian", "super-admin"];
const HOSTEL_ROLES = ["hostel-warden", "super-admin"];
const TRANSPORT_ROLES = ["transport-manager", "super-admin"];

const shared = (title, subtitle, summary, points = [], links = []) => (
  <SharedModulePage title={title} subtitle={subtitle} summary={summary} points={points} links={links} />
);

const directRoutes = [
  ["/admin/dashboard", ADMIN_ROLES, <DashboardPage />],
  ["/admin/users", ADMIN_ROLES, <UsersPage />],
  ["/admin/announcements", ADMIN_ROLES, <AnnouncementsPage />],
  ["/admin/system-logs", ADMIN_ROLES, <AuditLogsPage />],
  ["/management/dashboard", MANAGEMENT_ROLES, <DashboardPage />],
  ["/management/finance-reports", MANAGEMENT_ROLES, <AnalyticsPage variant="finance" />],
  ["/management/academic-reports", MANAGEMENT_ROLES, <AnalyticsPage variant="academic" />],
  ["/management/approvals", MANAGEMENT_ROLES, <ManagementApprovalsPage />],
  ["/management/announcements", MANAGEMENT_ROLES, <AnnouncementsPage />],
  ["/registrar/dashboard", REGISTRAR_ROLES, <DashboardPage />],
  ["/registrar/admissions", REGISTRAR_ROLES, <AdmissionsPage />],
  ["/registrar/students", REGISTRAR_ROLES, <StudentManagementPage />],
  ["/registrar/courses", REGISTRAR_ROLES, <CoursesPage />],
  ["/registrar/announcements", REGISTRAR_ROLES, <AnnouncementsPage />],
  ["/admission/dashboard", ADMISSION_ROLES, <DashboardPage />],
  ["/admission/leads", ADMISSION_ROLES, <AdmissionsPage view="leads" />],
  ["/admission/applications", ADMISSION_ROLES, <AdmissionsPage view="applications" />],
  ["/admission/announcements", ADMISSION_ROLES, <AnnouncementsPage />],
  ["/hr/dashboard", HR_ROLES, <DashboardPage />],
  ["/hr/employees", HR_ROLES, <EmployeesPage />],
  ["/hr/attendance", HR_ROLES, <HRStaffAttendancePage />],
  ["/hr/leave-requests", HR_ROLES, <LeaveRequestsPage />],
  ["/hr/payroll-setup", HR_ROLES, <PayrollSetupPage />],
  ["/hr/announcements", HR_ROLES, <AnnouncementsPage />],
  ["/finance/dashboard", FINANCE_ROLES, <DashboardPage />],
  ["/finance/fee-collection", FINANCE_ROLES, <FeesPage />],
  ["/finance/invoices", FINANCE_ROLES, <FinanceInvoicesPage />],
  ["/finance/payroll", FINANCE_ROLES, <FinancePayrollProcessingPage />],
  ["/finance/transactions", FINANCE_ROLES, <FinanceTransactionsPage />],
  ["/finance/announcements", FINANCE_ROLES, <AnnouncementsPage />],
  ["/hod/dashboard", HOD_ROLES, <DashboardPage />],
  ["/hod/faculty", HOD_ROLES, <HodFacultyPage />],
  ["/hod/syllabus-tracking", HOD_ROLES, <SyllabusTrackingPage />],
  ["/hod/timetable-builder", HOD_ROLES, <TimetablePage />],
  ["/hod/department-notices", HOD_ROLES, <AnnouncementsPage />],
  ["/teacher/dashboard", TEACHER_ROLES, <DashboardPage />],
  ["/teacher/my-classes", TEACHER_ROLES, <CoursesPage view="classes" />],
  ["/teacher/attendance", TEACHER_ROLES, <AttendancePage />],
  ["/teacher/assignments", TEACHER_ROLES, <AssignmentsPage />],
  ["/teacher/materials", TEACHER_ROLES, <CoursesPage view="materials" />],
  ["/teacher/timetable", TEACHER_ROLES, <TimetablePage />],
  ["/teacher/announcements", TEACHER_ROLES, <AnnouncementsPage />],
  ["/student/dashboard", STUDENT_ROLES, <DashboardPage />],
  ["/student/profile", STUDENT_ROLES, <ProfilePage />],
  ["/student/attendance-report", STUDENT_ROLES, <AttendancePage />],
  ["/student/timetable", STUDENT_ROLES, <TimetablePage />],
  ["/student/assignments", STUDENT_ROLES, <AssignmentsPage />],
  ["/student/materials", STUDENT_ROLES, <CoursesPage view="materials" />],
  ["/student/results", STUDENT_ROLES, <ResultsPage />],
  ["/student/fees", STUDENT_ROLES, <FeesPage />],
  ["/student/announcements", STUDENT_ROLES, <AnnouncementsPage />],
  ["/library/dashboard", LIBRARY_ROLES, <DashboardPage />],
  ["/library/catalog", LIBRARY_ROLES, <LibraryCatalogPage />],
  ["/library/circulation", LIBRARY_ROLES, <LibraryCirculationPage />],
  ["/library/members", LIBRARY_ROLES, <LibraryMembersPage />],
  ["/library/fines", LIBRARY_ROLES, <LibraryFinesPage />],
  ["/library/announcements", LIBRARY_ROLES, <AnnouncementsPage />],
  ["/placement/dashboard", PLACEMENT_ROLES, <DashboardPage />],
  ["/placement/companies", PLACEMENT_ROLES, <PlacementsPage view="companies" />],
  ["/placement/drives", PLACEMENT_ROLES, <PlacementsPage view="drives" />],
  ["/placement/students", PLACEMENT_ROLES, <StudentManagementPage />],
  ["/placement/reports", PLACEMENT_ROLES, <AnalyticsPage variant="placements" />],
  ["/placement/announcements", PLACEMENT_ROLES, <AnnouncementsPage />],
  ["/parent/dashboard", PARENT_ROLES, <DashboardPage />],
  ["/parent/attendance", PARENT_ROLES, <AttendancePage />],
  ["/parent/results", PARENT_ROLES, <ResultsPage />],
  ["/parent/fees", PARENT_ROLES, <FeesPage />],
  ["/parent/announcements", PARENT_ROLES, <AnnouncementsPage />],
  ["/hostel/dashboard", HOSTEL_ROLES, <DashboardPage />],
  ["/hostel/fees", HOSTEL_ROLES, <FeesPage />],
  ["/hostel/announcements", HOSTEL_ROLES, <AnnouncementsPage />],
  ["/transport/dashboard", TRANSPORT_ROLES, <DashboardPage />],
  ["/transport/payments", TRANSPORT_ROLES, <FeesPage />],
  ["/transport/announcements", TRANSPORT_ROLES, <AnnouncementsPage />],
];

const placeholderRoutes = [
  ["/admin/roles-permissions", ADMIN_ROLES, "Roles And Permissions", "Manage RBAC", "Control role access and permission governance.", ["Define role policies for every institutional module", "Audit permission and access boundaries"], [{ label: "Open Users", to: "/admin/users" }]],
  ["/admin/global-settings", ADMIN_ROLES, "Global Settings", "Institution profile and platform setup", "Control institution details, sessions, and shared ERP configuration.", ["Configure shared academic and communication defaults", "Extend SMTP, payments, and storage settings"], [{ label: "Admin Dashboard", to: "/admin/dashboard" }]],
  ["/admission/onboarding", ADMISSION_ROLES, "Admission Onboarding", "Convert applicants to enrolled students", "Coordinate document verification, fee initiation, and onboarding actions.", ["Track onboarding stage completion", "Extend with roll-number and ID generation"], [{ label: "Applications", to: "/admission/applications" }]],
  ["/parent/messages", PARENT_ROLES, "Parent Communication", "Appointments and updates", "Review notices and prepare parent communication workflows.", ["Track communication from faculty and HOD", "Extend with appointment scheduling"], [{ label: "Notifications", to: "/notifications" }]],
  ["/hostel/rooms", HOSTEL_ROLES, "Hostel Rooms", "Room allotment and occupancy", "Track room availability, bed capacity, and hostel assignments.", ["Monitor occupancy and vacancy", "Extend room transfers and waiting list"], [{ label: "Gate Passes", to: "/hostel/gate-passes" }]],
  ["/hostel/gate-passes", HOSTEL_ROLES, "Hostel Gate Passes", "Entry and movement control", "Track gate passes, entry-exit permissions, and night oversight.", ["Monitor out-pass usage and return timing", "Extend QR or biometric validation"], [{ label: "Maintenance", to: "/hostel/maintenance" }]],
  ["/hostel/maintenance", HOSTEL_ROLES, "Hostel Maintenance", "Repair and issue tracking", "Log, assign, and close maintenance requests for hostel facilities.", ["Track room-level issues", "Extend SLA and escalation flow"], [{ label: "Hostel Dashboard", to: "/hostel/dashboard" }]],
  ["/transport/routes", TRANSPORT_ROLES, "Transport Routes", "Bus routes and stops", "Manage route planning, stops, and schedule structure.", ["Track service coverage and route planning", "Extend conflict and capacity checks"], [{ label: "Allocations", to: "/transport/allocations" }]],
  ["/transport/allocations", TRANSPORT_ROLES, "Transport Allocations", "Passenger route assignment", "Allocate students and staff to routes, stops, and vehicles.", ["Track route riders and seat usage", "Extend capacity balancing"], [{ label: "Fleet", to: "/transport/fleet" }]],
  ["/transport/fleet", TRANSPORT_ROLES, "Transport Fleet", "Vehicles and maintenance logs", "Monitor vehicle maintenance, fuel, and driver allocation.", ["Track vehicle readiness and fuel use", "Extend breakdown alerts and driver roster"], [{ label: "Payments", to: "/transport/payments" }]],
];

const legacyRoutes = [
  ["/users", [PERMISSIONS.USERS_MANAGE], <UsersPage />],
  ["/student-management", [PERMISSIONS.STUDENTS_MANAGE], <StudentManagementPage />],
  ["/admissions", [PERMISSIONS.ADMISSIONS_MANAGE], <AdmissionsPage />],
  ["/courses", [PERMISSIONS.TIMETABLE_VIEW], <CoursesPage />],
  ["/timetable", [PERMISSIONS.TIMETABLE_VIEW], <TimetablePage />],
  ["/announcements", [PERMISSIONS.ANNOUNCEMENTS_VIEW, PERMISSIONS.ANNOUNCEMENTS_MANAGE], <AnnouncementsPage />],
  ["/assignments", [PERMISSIONS.ASSIGNMENTS_MANAGE, PERMISSIONS.ASSIGNMENTS_SUBMIT], <AssignmentsPage />],
  ["/attendance", [PERMISSIONS.ATTENDANCE_VIEW], <AttendancePage />],
  ["/fees", [PERMISSIONS.FEES_VIEW], <FeesPage />],
  ["/placements", [PERMISSIONS.PLACEMENTS_MANAGE, PERMISSIONS.PLACEMENTS_APPLY], <PlacementsPage />],
  ["/results", [PERMISSIONS.RESULTS_VIEW], <ResultsPage />],
  ["/analytics", [PERMISSIONS.ANALYTICS_VIEW], <AnalyticsPage />],
];

const RoleAwareRoutes = () => {
  const { user } = useAuth();

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultRoute(user)} replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/workspace" element={<RoleWorkspacePage />} />

        {directRoutes.map(([path, roles, element]) => (
          <Route key={path} path={path} element={<ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>} />
        ))}
        {placeholderRoutes.map(([path, roles, title, subtitle, summary, points, links]) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute allowedRoles={roles}>{shared(title, subtitle, summary, points, links)}</ProtectedRoute>}
          />
        ))}
        {legacyRoutes.map(([path, permissions, element]) => (
          <Route key={path} path={path} element={<ProtectedRoute allowedPermissions={permissions}>{element}</ProtectedRoute>} />
        ))}

        <Route path="*" element={<Navigate to={getDefaultRoute(user)} replace />} />
      </Routes>
    </AppShell>
  );
};

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="/*" element={<ProtectedRoute><RoleAwareRoutes /></ProtectedRoute>} />
  </Routes>
);

export default App;
