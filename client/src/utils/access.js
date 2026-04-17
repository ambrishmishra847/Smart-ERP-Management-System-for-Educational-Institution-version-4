export const PERMISSIONS = {
  ALL: "*",
  DASHBOARD_VIEW: "dashboard.view",
  USERS_MANAGE: "users.manage",
  STUDENTS_MANAGE: "students.manage",
  TEACHERS_MANAGE: "teachers.manage",
  PARENTS_MANAGE: "parents.manage",
  ADMISSIONS_MANAGE: "admissions.manage",
  COURSES_MANAGE: "courses.manage",
  SUBJECTS_MANAGE: "subjects.manage",
  TIMETABLE_MANAGE: "timetable.manage",
  TIMETABLE_VIEW: "timetable.view",
  ATTENDANCE_MARK: "attendance.mark",
  ATTENDANCE_VIEW: "attendance.view",
  ASSIGNMENTS_MANAGE: "assignments.manage",
  ASSIGNMENTS_SUBMIT: "assignments.submit",
  RESULTS_MANAGE: "results.manage",
  RESULTS_VIEW: "results.view",
  FEES_MANAGE: "fees.manage",
  FEES_VIEW: "fees.view",
  ANNOUNCEMENTS_MANAGE: "announcements.manage",
  ANNOUNCEMENTS_VIEW: "announcements.view",
  PLACEMENTS_MANAGE: "placements.manage",
  PLACEMENTS_APPLY: "placements.apply",
  ANALYTICS_VIEW: "analytics.view",
  MATERIALS_MANAGE: "materials.manage",
  MATERIALS_VIEW: "materials.view",
  NOTIFICATIONS_VIEW: "notifications.view",
  RECORDS_MANAGE: "records.manage",
  PAYROLL_MANAGE: "payroll.manage",
  STAFF_MANAGE: "staff.manage",
  LIBRARY_MANAGE: "library.manage",
  HOSTEL_MANAGE: "hostel.manage",
  TRANSPORT_MANAGE: "transport.manage",
  SUPPORT_MANAGE: "support.manage",
  APPROVALS_MANAGE: "approvals.manage",
};

export const hasPermission = (user, permission) => {
  const permissions = user?.permissions || [];
  return permissions.includes(PERMISSIONS.ALL) || permissions.includes(permission);
};

export const roleGroups = {
  system: [
    { key: "super-admin", label: "Super Admin", hint: "Use admin email, username, or code" },
    { key: "system-admin", label: "System Admin", hint: "Use system admin email, username, or code" },
  ],
  leadership: [
    { key: "director-principal", label: "Director / Principal", hint: "Use leadership email or username" },
  ],
  administration: [
    { key: "registrar", label: "Registrar", hint: "Use registrar email or username" },
    { key: "admission-cell", label: "Admission Cell", hint: "Use admissions office email or username" },
    { key: "accountant", label: "Accountant", hint: "Use accountant email or employee code" },
    { key: "hr-manager", label: "HR Manager", hint: "Use HR email or employee code" },
  ],
  faculty: [
    { key: "hod", label: "HOD", hint: "Use HOD email, username, or employee code" },
    { key: "faculty-professor", label: "Faculty / Professor", hint: "Use employee code, email, or username" },
  ],
  services: [
    { key: "placement-cell", label: "Placement Cell", hint: "Use placement office email or employee code" },
    { key: "librarian", label: "Librarian", hint: "Use librarian email or employee code" },
    { key: "hostel-warden", label: "Hostel Warden", hint: "Use hostel office email or username" },
    { key: "transport-manager", label: "Transport Manager", hint: "Use transport office email or username" },
  ],
  learners: [
    { key: "student", label: "Student", hint: "Use roll number, email, or username" },
  ],
  family: [
    { key: "parent-guardian", label: "Parent / Guardian", hint: "Use parent email or username" },
  ],
};

export const allRoleOptions = Object.values(roleGroups).flat();
