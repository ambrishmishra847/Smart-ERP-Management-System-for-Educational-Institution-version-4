import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { FiBookOpen, FiCalendar, FiClipboard, FiMessageSquare, FiUsers } from "react-icons/fi";
import MetricCard from "../components/ui/MetricCard";
import ContentState from "../components/ui/ContentState";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getPortalPath } from "../utils/routes";

const isStudentLike = (user) => hasPermission(user, PERMISSIONS.ASSIGNMENTS_SUBMIT);
const isFamilyLike = (user) =>
  hasPermission(user, PERMISSIONS.ATTENDANCE_VIEW) &&
  hasPermission(user, PERMISSIONS.RESULTS_VIEW) &&
  !hasPermission(user, PERMISSIONS.ASSIGNMENTS_SUBMIT) &&
  !hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE);
const isFacultyLike = (user) => hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE) && !hasPermission(user, PERMISSIONS.USERS_MANAGE);

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ metrics: [], charts: {}, notifications: [], announcements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/dashboard");
        setData(response.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load the dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const intervalId = window.setInterval(loadData, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return undefined;
    }

    const handleNotification = (notification) => {
      setData((prev) => ({
        ...prev,
        notifications: [notification, ...(prev.notifications || [])].slice(0, 5),
      }));
    };

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, []);

  const primaryChart = data.charts.attendance || data.charts.grading || data.charts.progress || [];
  const dashboardTitle =
    hasPermission(user, PERMISSIONS.USERS_MANAGE)
      ? "Administration Dashboard"
      : hasPermission(user, PERMISSIONS.ANALYTICS_VIEW)
        ? "Academic Operations Dashboard"
        : hasPermission(user, PERMISSIONS.ASSIGNMENTS_SUBMIT)
          ? "Student Dashboard"
          : "Family Dashboard";
  const welcomeLine = `Welcome back, ${user.name}. ${user.roleLabel || user.role} access is active.`;
  const quickActionsByRole = {
    "super-admin": [
      { label: "Add Student", to: getPortalPath(user, "users", "/admin/users"), icon: FiUsers },
      { label: "Add Teacher", to: getPortalPath(user, "users", "/admin/users"), icon: FiUsers },
      { label: "AI Risk Analysis", to: getPortalPath(user, "aiRisk", "/admin/ai-risk"), icon: FiClipboard },
      { label: "Create Course", to: "/registrar/courses", icon: FiBookOpen },
      { label: "Create Announcement", to: "/registrar/announcements", icon: FiMessageSquare },
    ],
    "director-principal": [
      { label: "Open Finance Reports", to: "/management/finance-reports", icon: FiBookOpen },
      { label: "Open Academic Reports", to: "/management/academic-reports", icon: FiClipboard },
      { label: "AI Risk Analysis", to: getPortalPath(user, "aiRisk", "/management/ai-risk"), icon: FiUsers },
      { label: "Review Approvals", to: "/management/approvals", icon: FiMessageSquare },
    ],
    registrar: [
      { label: "Review Admissions", to: "/registrar/admissions", icon: FiUsers },
      { label: "Open Students", to: "/registrar/students", icon: FiClipboard },
      { label: "AI Risk Analysis", to: getPortalPath(user, "aiRisk", "/registrar/ai-risk"), icon: FiMessageSquare },
      { label: "Manage Courses", to: "/registrar/courses", icon: FiBookOpen },
    ],
    "admission-cell": [
      { label: "Track Leads", to: "/admission/leads", icon: FiUsers },
      { label: "Review Applications", to: "/admission/applications", icon: FiClipboard },
      { label: "Prepare Onboarding", to: "/admission/onboarding", icon: FiBookOpen },
    ],
    "hr-manager": [
      { label: "Staff Attendance", to: "/hr/attendance", icon: FiClipboard },
      { label: "Leave Requests", to: "/hr/leave-requests", icon: FiMessageSquare },
      { label: "Payroll Setup", to: "/hr/payroll-setup", icon: FiBookOpen },
    ],
    accountant: [
      { label: "Collect Fees", to: "/finance/fee-collection", icon: FiClipboard },
      { label: "Review Invoices", to: "/finance/invoices", icon: FiMessageSquare },
      { label: "Open Ledger", to: "/finance/transactions", icon: FiBookOpen },
    ],
    hod: [
      { label: "Faculty Overview", to: "/hod/faculty", icon: FiUsers },
      { label: "Timetable Builder", to: "/hod/timetable-builder", icon: FiClipboard },
      { label: "AI Risk Analysis", to: getPortalPath(user, "aiRisk", "/hod/student-risk"), icon: FiMessageSquare },
      { label: "Syllabus Tracking", to: "/hod/syllabus-tracking", icon: FiBookOpen },
    ],
    "faculty-professor": [
      { label: "Mark Attendance", to: getPortalPath(user, "attendance", "/teacher/attendance"), icon: FiClipboard },
      { label: "Upload Assignment", to: getPortalPath(user, "assignments", "/teacher/assignments"), icon: FiClipboard },
      { label: "AI Risk Analysis", to: getPortalPath(user, "aiRisk", "/teacher/student-risk"), icon: FiUsers },
      { label: "Upload Material", to: getPortalPath(user, "materials", "/teacher/materials"), icon: FiBookOpen },
    ],
    "placement-cell": [
      { label: "Manage Companies", to: "/placement/companies", icon: FiUsers },
      { label: "Schedule Drives", to: "/placement/drives", icon: FiClipboard },
      { label: "Placement Reports", to: "/placement/reports", icon: FiBookOpen },
    ],
    librarian: [
      { label: "Catalog Books", to: "/library/catalog", icon: FiBookOpen },
      { label: "Issue / Return", to: "/library/circulation", icon: FiClipboard },
      { label: "Track Fines", to: "/library/fines", icon: FiMessageSquare },
    ],
    "hostel-warden": [
      { label: "Manage Rooms", to: "/hostel/rooms", icon: FiUsers },
      { label: "Gate Passes", to: "/hostel/gate-passes", icon: FiClipboard },
      { label: "Maintenance", to: "/hostel/maintenance", icon: FiMessageSquare },
    ],
    "transport-manager": [
      { label: "Manage Routes", to: "/transport/routes", icon: FiClipboard },
      { label: "Allocations", to: "/transport/allocations", icon: FiUsers },
      { label: "Fleet Logs", to: "/transport/fleet", icon: FiBookOpen },
    ],
    student: [
      { label: "View Timetable", to: getPortalPath(user, "timetable", "/student/timetable"), icon: FiCalendar },
      { label: "Open Assignments", to: getPortalPath(user, "assignments", "/student/assignments"), icon: FiClipboard },
      { label: "AI Risk Analysis", to: getPortalPath(user, "aiRisk", "/student/ai-risk"), icon: FiUsers },
      { label: "See Placements", to: "/placements", icon: FiBookOpen },
    ],
    "parent-guardian": [
      { label: "View Results", to: getPortalPath(user, "results", "/parent/results"), icon: FiClipboard },
      { label: "See Fees", to: getPortalPath(user, "fees", "/parent/fees"), icon: FiBookOpen },
      { label: "AI Risk Analysis", to: getPortalPath(user, "aiRisk", "/parent/ai-risk"), icon: FiUsers },
      { label: "Notices", to: "/notifications", icon: FiMessageSquare },
    ],
  };
  const quickActions = quickActionsByRole[user.role]
    || (hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE)
      ? quickActionsByRole["faculty-professor"]
      : hasPermission(user, PERMISSIONS.ASSIGNMENTS_SUBMIT)
        ? quickActionsByRole.student
        : quickActionsByRole["parent-guardian"]);
  const aiStatusSummary = data.aiOverview
    ? hasPermission(user, PERMISSIONS.USERS_MANAGE)
      ? `Provider: ${data.aiOverview.providerName || "local-only"} • High risk students: ${data.aiOverview.highRiskStudents || 0}`
      : hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE)
        ? `High risk students: ${data.aiOverview.highRiskStudents || 0} • Pending interventions: ${data.aiOverview.pendingInterventions || 0}`
      : `Current risk: ${data.aiOverview.currentRiskLevel || "low"} • Open interventions: ${data.aiOverview.openInterventions || 0}`
    : "AI analytics update automatically as student signals change.";
  const adminAiUsage = data.aiOverview?.usage || {};

  if (loading && !data.metrics.length) {
    return <ContentState tone="loading" title="Loading dashboard" description="Smart ERP is preparing your latest role-specific workspace." />;
  }

  if (error && !data.metrics.length) {
    return <ContentState tone="error" title="Unable to load dashboard" description={error} />;
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-4xl font-semibold text-slate-900">{dashboardTitle}</h1>
        <p className="mt-2 text-lg text-slate-500">{welcomeLine}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((item, index) => (
          <MetricCard key={item.label} item={item} index={index} />
        ))}
      </section>

      {data.roleInsights?.cards?.length ? (
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <SectionCard title={data.roleInsights.title} subtitle={data.roleInsights.subtitle}>
            <div className="space-y-3">
              {data.roleInsights.cards.map((card) => (
                <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{card.detail}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Operational Focus" subtitle="Role-specific decision support from the latest ERP signals.">
            <div className="grid gap-4 md:grid-cols-2">
              {data.roleInsights.cards.map((card) => (
                <div key={`${card.label}-focus`} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <SectionCard
          title={
            hasPermission(user, PERMISSIONS.USERS_MANAGE)
              ? "Student Enrollment Growth"
              : isFacultyLike(user)
                ? "Student Attendance Trend"
                : isStudentLike(user)
                  ? "Upcoming Assignments"
                  : "Student Progress"
          }
          subtitle={
            isFacultyLike(user)
              ? "Weekly overview of average attendance."
              : isStudentLike(user)
                ? "Your academic overview for the current cycle."
                : "Live academic trend overview."
          }
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {isFacultyLike(user) ? (
                <BarChart data={primaryChart}>
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#91c8ff" radius={[10, 10, 0, 0]} />
                </BarChart>
              ) : isStudentLike(user) ? (
                <BarChart data={primaryChart}>
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ffd166" radius={[10, 10, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={primaryChart}>
                  <defs>
                    <linearGradient id="fillTrend" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#91c8ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#91c8ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#91c8ff" fill="url(#fillTrend)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions" subtitle="Jump quickly to common tasks.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link key={action.label} to={action.to} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  <div className="mb-2 inline-flex rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Icon />
                  </div>
                  <p className="text-sm font-medium">{action.label}</p>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        <SectionCard title="Recent Activity" subtitle="Latest institutional movement.">
          <div className="space-y-4">
            {data.notifications?.map((item) => (
              <div key={item._id} className="border-l-2 border-blue-500 pl-4">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.message}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={isStudentLike(user) ? "Latest Notices" : "Latest Announcements"} subtitle="Institution-wide communication.">
          <div className="space-y-4">
            {data.announcements?.map((announcement) => (
              <div key={announcement._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-slate-900">{announcement.title}</p>
                  <span className="text-xs uppercase text-slate-400">{announcement.priority}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{announcement.content}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={
            isStudentLike(user)
              ? "Placement"
              : isFamilyLike(user)
                ? "Parent Insights"
                : isFacultyLike(user)
                  ? "Upcoming Classes"
                  : "Placement Overview"
          }
          subtitle="Focused operational summary."
        >
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AI & Risk Monitor</p>
              <p className="mt-2 font-medium text-slate-900">{aiStatusSummary}</p>
              <Link to={getPortalPath(user, "aiRisk", "/profile")} className="mt-3 inline-block text-sm font-medium text-blue-700">
                Open AI Risk Workspace
              </Link>
            </div>
            {isStudentLike(user) &&
              <>
                <Link to="/placements" className="block rounded-xl border border-slate-200 bg-slate-50 p-4">Upcoming Drives</Link>
                <Link to="/placements" className="block rounded-xl border border-slate-200 bg-slate-50 p-4">Applied Companies</Link>
                <Link to="/placements" className="block rounded-xl border border-slate-200 bg-slate-50 p-4">Deadline Reminders</Link>
              </>}
            {isFamilyLike(user) &&
              data.results?.map((result) => (
                <div key={result._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{result.student?.name || "Student"}: {result.exam?.subject?.name}</p>
                  <p className="mt-2">Marks: {result.marksObtained}</p>
                  <p>Grade: {result.grade || "-"}</p>
                </div>
              ))}
            {!isStudentLike(user) && (
              !isFamilyLike(user) ? (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  <Link to={isFacultyLike(user) ? "/analytics" : "/placements"} className="font-medium text-slate-900">
                    Real-time alerts, role-based access, and analytics are active.
                  </Link>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  <Link to={isFacultyLike(user) ? "/attendance" : "/fees"} className="font-medium text-slate-900">
                    {isFacultyLike(user)
                      ? "Open attendance sheets, assignments, and teaching schedules from here."
                      : `Fee status: ${data.fees?.[0]?.status || "pending"} | Paid ${formatCurrency(data.fees?.[0]?.paidAmount || 0)}`}
                  </Link>
                </div>
                {hasPermission(user, PERMISSIONS.USERS_MANAGE) ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                    <Link to={getPortalPath(user, "globalSettings", "/admin/global-settings")} className="font-medium text-slate-900">
                      {data.aiOverview?.configured ? "AI provider is configured and ready for advisory generation." : "AI provider is not configured yet. Open Global Settings to enable it."}
                    </Link>
                  </div>
                ) : null}
              </>
              ) : null
            )}
          </div>
        </SectionCard>
      </section>

      {data.aiOverview ? (
        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="AI Operations" subtitle="Current AI and intervention status across the ERP.">
            <div className="space-y-3">
              {hasPermission(user, PERMISSIONS.USERS_MANAGE) ? (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Provider</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{data.aiOverview.providerName || "local-only"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Pending interventions</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{data.aiOverview.pendingInterventions || 0}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">AI generations this week</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{adminAiUsage.aiGenerationsWeek || 0}</p>
                  </div>
                </>
              ) : hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE) ? (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">High risk students</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{data.aiOverview.highRiskStudents || 0}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Pending interventions</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{data.aiOverview.pendingInterventions || 0}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Current risk level</p>
                    <p className="mt-2 text-xl font-semibold capitalize text-slate-900">{data.aiOverview.currentRiskLevel || "low"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Open interventions</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{data.aiOverview.openInterventions || 0}</p>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Import Health" subtitle="Bulk data movement and onboarding readiness.">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Bulk import support</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Excel, PDF, DOCX, CSV</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Latest import throughput</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{data.aiOverview.importsLastTenRuns || 0}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="System Readiness" subtitle="Shows how the ERP has evolved beyond the initial milestone.">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Role modules live</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Admissions, AI, HR, Library, Hostel, Transport</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Last AI settings update</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{data.aiOverview.lastSettingsUpdate ? formatDate(data.aiOverview.lastSettingsUpdate) : "Not configured"}</p>
              </div>
            </div>
          </SectionCard>
        </section>
      ) : null}

      {hasPermission(user, PERMISSIONS.USERS_MANAGE) && data.aiOverview?.usage ? (
        <section className="grid gap-6 xl:grid-cols-4">
          <SectionCard title="AI Usage Analytics" subtitle="Weekly activity around provider tests, risk generation, and guided interventions.">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Risk analyses generated</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{adminAiUsage.aiGenerationsWeek || 0}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Provider Tests" subtitle="Connection validation activity for configured AI endpoints.">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Successful tests</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{adminAiUsage.providerTestsWeek || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Failed tests</p>
                <p className="mt-2 text-3xl font-semibold text-rose-700">{adminAiUsage.providerFailuresWeek || 0}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Intervention Workflow" subtitle="How actively the institution is acting on student risk signals.">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Intervention actions this week</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{adminAiUsage.interventionActionsWeek || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Import previews this week</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{adminAiUsage.importPreviewsWeek || 0}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Latest AI Activity" subtitle="Most recent AI-related action recorded in the audit trail.">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Latest action</p>
                <p className="mt-2 text-lg font-semibold capitalize text-slate-900">{adminAiUsage.latestAiActionType || "No activity yet"}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {adminAiUsage.latestAiActionAt ? formatDate(adminAiUsage.latestAiActionAt) : "The system has not recorded a recent AI event yet."}
                </p>
                <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${adminAiUsage.latestAiActionStatus === "failure" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {adminAiUsage.latestAiActionStatus || "success"}
                </p>
              </div>
            </div>
          </SectionCard>
        </section>
      ) : null}

      {isStudentLike(user) ? (
        <section className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="Subject Performance" subtitle="Performance by subject and published results.">
            <div className="space-y-3">
              {(data.results || []).map((result) => (
                <div key={result._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{result.exam?.subject?.name || "Subject"}</p>
                  <p className="mt-1 text-sm text-slate-600">Marks: {result.marksObtained}</p>
                  <p className="text-sm text-slate-600">Grade: {result.grade || "-"}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Attendance Summary" subtitle="Attendance and class participation overview.">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Attendance Percentage</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{data.metrics.find((item) => item.label === "Attendance")?.value || "0%"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Classes Recorded</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{data.attendance?.length || 0}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Assignment Submissions" subtitle="Track the assignments you have submitted.">
            <div className="space-y-3">
              {(data.assignments || []).map((assignment) => (
                <div key={assignment._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{assignment.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{assignment.subject?.name}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      ) : null}
    </div>
  );
};

export default DashboardPage;
