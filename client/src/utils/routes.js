export const rolePortalConfig = {
  "super-admin": {
    home: "/admin/dashboard",
    links: {
      dashboard: "/admin/dashboard",
      users: "/admin/users",
      announcements: "/admin/announcements",
      rolesPermissions: "/admin/roles-permissions",
      globalSettings: "/admin/global-settings",
      systemLogs: "/admin/system-logs",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  "system-admin": {
    home: "/admin/dashboard",
    links: {
      dashboard: "/admin/dashboard",
      users: "/admin/users",
      rolesPermissions: "/admin/roles-permissions",
      globalSettings: "/admin/global-settings",
      systemLogs: "/admin/system-logs",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  "director-principal": {
    home: "/management/dashboard",
    links: {
      dashboard: "/management/dashboard",
      financeReports: "/management/finance-reports",
      academicReports: "/management/academic-reports",
      approvals: "/management/approvals",
      announcements: "/management/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  registrar: {
    home: "/registrar/dashboard",
    links: {
      dashboard: "/registrar/dashboard",
      admissions: "/registrar/admissions",
      students: "/registrar/students",
      courses: "/registrar/courses",
      announcements: "/registrar/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  "admission-cell": {
    home: "/admission/dashboard",
    links: {
      dashboard: "/admission/dashboard",
      leads: "/admission/leads",
      applications: "/admission/applications",
      onboarding: "/admission/onboarding",
      announcements: "/admission/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  accountant: {
    home: "/finance/dashboard",
    links: {
      dashboard: "/finance/dashboard",
      feeCollection: "/finance/fee-collection",
      invoices: "/finance/invoices",
      payroll: "/finance/payroll",
      transactions: "/finance/transactions",
      announcements: "/finance/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  "hr-manager": {
    home: "/hr/dashboard",
    links: {
      dashboard: "/hr/dashboard",
      employees: "/hr/employees",
      attendance: "/hr/attendance",
      leaveRequests: "/hr/leave-requests",
      payrollSetup: "/hr/payroll-setup",
      announcements: "/hr/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  hod: {
    home: "/hod/dashboard",
    links: {
      dashboard: "/hod/dashboard",
      faculty: "/hod/faculty",
      timetableBuilder: "/hod/timetable-builder",
      syllabusTracking: "/hod/syllabus-tracking",
      departmentNotices: "/hod/department-notices",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  "faculty-professor": {
    home: "/teacher/dashboard",
    links: {
      dashboard: "/teacher/dashboard",
      myClasses: "/teacher/my-classes",
      attendance: "/teacher/attendance",
      assignments: "/teacher/assignments",
      materials: "/teacher/materials",
      timetable: "/teacher/timetable",
      announcements: "/teacher/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  student: {
    home: "/student/dashboard",
    links: {
      dashboard: "/student/dashboard",
      profile: "/student/profile",
      attendance: "/student/attendance-report",
      timetable: "/student/timetable",
      assignments: "/student/assignments",
      materials: "/student/materials",
      results: "/student/results",
      fees: "/student/fees",
      announcements: "/student/announcements",
      notifications: "/notifications",
    },
  },
  "parent-guardian": {
    home: "/parent/dashboard",
    links: {
      dashboard: "/parent/dashboard",
      attendance: "/parent/attendance",
      results: "/parent/results",
      fees: "/parent/fees",
      announcements: "/parent/announcements",
      messages: "/parent/messages",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  librarian: {
    home: "/library/dashboard",
    links: {
      dashboard: "/library/dashboard",
      catalog: "/library/catalog",
      circulation: "/library/circulation",
      members: "/library/members",
      fines: "/library/fines",
      announcements: "/library/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  "placement-cell": {
    home: "/placement/dashboard",
    links: {
      dashboard: "/placement/dashboard",
      companies: "/placement/companies",
      drives: "/placement/drives",
      students: "/placement/students",
      reports: "/placement/reports",
      announcements: "/placement/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  "hostel-warden": {
    home: "/hostel/dashboard",
    links: {
      dashboard: "/hostel/dashboard",
      rooms: "/hostel/rooms",
      gatePasses: "/hostel/gate-passes",
      maintenance: "/hostel/maintenance",
      fees: "/hostel/fees",
      announcements: "/hostel/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
  "transport-manager": {
    home: "/transport/dashboard",
    links: {
      dashboard: "/transport/dashboard",
      routes: "/transport/routes",
      allocations: "/transport/allocations",
      fleet: "/transport/fleet",
      payments: "/transport/payments",
      announcements: "/transport/announcements",
      notifications: "/notifications",
      profile: "/profile",
    },
  },
};

export const getPortalConfig = (role) => rolePortalConfig[role] || {};

export const getDefaultRoute = (user) => getPortalConfig(user?.role).home || "/profile";

export const getPortalPath = (user, key, fallback = "/") => {
  const path = getPortalConfig(user?.role).links?.[key];
  return path || fallback;
};
