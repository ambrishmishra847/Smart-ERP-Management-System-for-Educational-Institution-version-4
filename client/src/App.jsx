import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { PERMISSIONS } from "./utils/access";
import { getDefaultRoute } from "./utils/routes";

const AdmissionsPage = lazy(() => import("./pages/AdmissionsPage"));
const AdmissionOnboardingPage = lazy(() => import("./pages/AdmissionOnboardingPage"));
const AiRiskAnalysisPage = lazy(() => import("./pages/AiRiskAnalysisPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const FeesPage = lazy(() => import("./pages/FeesPage"));
const FinanceInvoicesPage = lazy(() => import("./pages/FinanceInvoicesPage"));
const FinancePayrollProcessingPage = lazy(() => import("./pages/FinancePayrollProcessingPage"));
const FinanceTransactionsPage = lazy(() => import("./pages/FinanceTransactionsPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const GlobalSettingsPage = lazy(() => import("./pages/GlobalSettingsPage"));
const HostelGatePassesPage = lazy(() => import("./pages/HostelGatePassesPage"));
const HostelMaintenancePage = lazy(() => import("./pages/HostelMaintenancePage"));
const HostelRoomsPage = lazy(() => import("./pages/HostelRoomsPage"));
const HRStaffAttendancePage = lazy(() => import("./pages/HRStaffAttendancePage"));
const HodFacultyPage = lazy(() => import("./pages/HodFacultyPage"));
const ImportJobsPage = lazy(() => import("./pages/ImportJobsPage"));
const LeaveRequestsPage = lazy(() => import("./pages/LeaveRequestsPage"));
const LibraryCatalogPage = lazy(() => import("./pages/LibraryCatalogPage"));
const LibraryCirculationPage = lazy(() => import("./pages/LibraryCirculationPage"));
const LibraryFinesPage = lazy(() => import("./pages/LibraryFinesPage"));
const LibraryMembersPage = lazy(() => import("./pages/LibraryMembersPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ManagementApprovalsPage = lazy(() => import("./pages/ManagementApprovalsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ParentCommunicationPage = lazy(() => import("./pages/ParentCommunicationPage"));
const PlacementsPage = lazy(() => import("./pages/PlacementsPage"));
const PayrollSetupPage = lazy(() => import("./pages/PayrollSetupPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProjectRepositoryPage = lazy(() => import("./pages/ProjectRepositoryPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const RolePermissionsPage = lazy(() => import("./pages/RolePermissionsPage"));
const RoleWorkspacePage = lazy(() => import("./pages/RoleWorkspacePage"));
const StudentManagementPage = lazy(() => import("./pages/StudentManagementPage"));
const SyllabusTrackingPage = lazy(() => import("./pages/SyllabusTrackingPage"));
const TimetablePage = lazy(() => import("./pages/TimetablePage"));
const TransportAllocationsPage = lazy(() => import("./pages/TransportAllocationsPage"));
const TransportFleetPage = lazy(() => import("./pages/TransportFleetPage"));
const TransportRoutesPage = lazy(() => import("./pages/TransportRoutesPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-600">
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm shadow-sm">Loading Smart ERP workspace...</div>
  </div>
);

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

const directRoutes = [
  ["/admin/dashboard", ADMIN_ROLES, <DashboardPage />],
  ["/admin/users", ADMIN_ROLES, <UsersPage />],
  ["/admin/announcements", ADMIN_ROLES, <AnnouncementsPage />],
  ["/admin/ai-risk", ADMIN_ROLES, <AiRiskAnalysisPage />],
  ["/admin/roles-permissions", ADMIN_ROLES, <RolePermissionsPage />],
  ["/admin/global-settings", ADMIN_ROLES, <GlobalSettingsPage />],
  ["/admin/import-jobs", ADMIN_ROLES, <ImportJobsPage />],
  ["/admin/project-repo", ADMIN_ROLES, <ProjectRepositoryPage />],
  ["/admin/system-logs", ADMIN_ROLES, <AuditLogsPage />],
  ["/management/dashboard", MANAGEMENT_ROLES, <DashboardPage />],
  ["/management/finance-reports", MANAGEMENT_ROLES, <AnalyticsPage variant="finance" />],
  ["/management/academic-reports", MANAGEMENT_ROLES, <AnalyticsPage variant="academic" />],
  ["/management/ai-risk", MANAGEMENT_ROLES, <AiRiskAnalysisPage />],
  ["/management/approvals", MANAGEMENT_ROLES, <ManagementApprovalsPage />],
  ["/management/announcements", MANAGEMENT_ROLES, <AnnouncementsPage />],
  ["/registrar/dashboard", REGISTRAR_ROLES, <DashboardPage />],
  ["/registrar/admissions", REGISTRAR_ROLES, <AdmissionsPage />],
  ["/registrar/students", REGISTRAR_ROLES, <StudentManagementPage />],
  ["/registrar/courses", REGISTRAR_ROLES, <CoursesPage />],
  ["/registrar/ai-risk", REGISTRAR_ROLES, <AiRiskAnalysisPage />],
  ["/registrar/announcements", REGISTRAR_ROLES, <AnnouncementsPage />],
  ["/admission/dashboard", ADMISSION_ROLES, <DashboardPage />],
  ["/admission/leads", ADMISSION_ROLES, <AdmissionsPage view="leads" />],
  ["/admission/applications", ADMISSION_ROLES, <AdmissionsPage view="applications" />],
  ["/admission/onboarding", ADMISSION_ROLES, <AdmissionOnboardingPage />],
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
  ["/hod/student-risk", HOD_ROLES, <AiRiskAnalysisPage />],
  ["/hod/department-notices", HOD_ROLES, <AnnouncementsPage />],
  ["/teacher/dashboard", TEACHER_ROLES, <DashboardPage />],
  ["/teacher/my-classes", TEACHER_ROLES, <CoursesPage view="classes" />],
  ["/teacher/attendance", TEACHER_ROLES, <AttendancePage />],
  ["/teacher/assignments", TEACHER_ROLES, <AssignmentsPage />],
  ["/teacher/materials", TEACHER_ROLES, <CoursesPage view="materials" />],
  ["/teacher/timetable", TEACHER_ROLES, <TimetablePage />],
  ["/teacher/student-risk", TEACHER_ROLES, <AiRiskAnalysisPage />],
  ["/teacher/announcements", TEACHER_ROLES, <AnnouncementsPage />],
  ["/student/dashboard", STUDENT_ROLES, <DashboardPage />],
  ["/student/profile", STUDENT_ROLES, <ProfilePage />],
  ["/student/attendance-report", STUDENT_ROLES, <AttendancePage />],
  ["/student/timetable", STUDENT_ROLES, <TimetablePage />],
  ["/student/assignments", STUDENT_ROLES, <AssignmentsPage />],
  ["/student/materials", STUDENT_ROLES, <CoursesPage view="materials" />],
  ["/student/results", STUDENT_ROLES, <ResultsPage />],
  ["/student/fees", STUDENT_ROLES, <FeesPage />],
  ["/student/ai-risk", STUDENT_ROLES, <AiRiskAnalysisPage />],
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
  ["/parent/ai-risk", PARENT_ROLES, <AiRiskAnalysisPage />],
  ["/parent/announcements", PARENT_ROLES, <AnnouncementsPage />],
  ["/parent/messages", PARENT_ROLES, <ParentCommunicationPage />],
  ["/hostel/dashboard", HOSTEL_ROLES, <DashboardPage />],
  ["/hostel/rooms", HOSTEL_ROLES, <HostelRoomsPage />],
  ["/hostel/gate-passes", HOSTEL_ROLES, <HostelGatePassesPage />],
  ["/hostel/maintenance", HOSTEL_ROLES, <HostelMaintenancePage />],
  ["/hostel/fees", HOSTEL_ROLES, <FeesPage />],
  ["/hostel/announcements", HOSTEL_ROLES, <AnnouncementsPage />],
  ["/transport/dashboard", TRANSPORT_ROLES, <DashboardPage />],
  ["/transport/routes", TRANSPORT_ROLES, <TransportRoutesPage />],
  ["/transport/allocations", TRANSPORT_ROLES, <TransportAllocationsPage />],
  ["/transport/fleet", TRANSPORT_ROLES, <TransportFleetPage />],
  ["/transport/payments", TRANSPORT_ROLES, <FeesPage />],
  ["/transport/announcements", TRANSPORT_ROLES, <AnnouncementsPage />],
];

const placeholderRoutes = [];

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
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
};

const App = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/*" element={<ProtectedRoute><RoleAwareRoutes /></ProtectedRoute>} />
    </Routes>
  </Suspense>
);

export default App;
