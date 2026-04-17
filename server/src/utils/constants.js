export const ROLES = {
  SUPER_ADMIN: "super-admin",
  DIRECTOR_PRINCIPAL: "director-principal",
  REGISTRAR: "registrar",
  ADMISSION_CELL: "admission-cell",
  HOD: "hod",
  FACULTY_PROFESSOR: "faculty-professor",
  STUDENT: "student",
  PARENT_GUARDIAN: "parent-guardian",
  ACCOUNTANT: "accountant",
  HR_MANAGER: "hr-manager",
  PLACEMENT_CELL: "placement-cell",
  LIBRARIAN: "librarian",
  TRANSPORT_MANAGER: "transport-manager",
  HOSTEL_WARDEN: "hostel-warden",
  SYSTEM_ADMIN: "system-admin",
};

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

export const ROLE_DEFINITIONS = {
  [ROLES.SUPER_ADMIN]: {
    label: "Super Admin",
    family: "administration",
    permissions: [PERMISSIONS.ALL],
  },
  [ROLES.DIRECTOR_PRINCIPAL]: {
    label: "Director / Principal",
    family: "leadership",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.APPROVALS_MANAGE,
      PERMISSIONS.FEES_VIEW,
      PERMISSIONS.PLACEMENTS_MANAGE,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.RECORDS_MANAGE,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.REGISTRAR]: {
    label: "Registrar",
    family: "administration",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.STUDENTS_MANAGE,
      PERMISSIONS.RECORDS_MANAGE,
      PERMISSIONS.RESULTS_VIEW,
      PERMISSIONS.ADMISSIONS_MANAGE,
      PERMISSIONS.COURSES_MANAGE,
      PERMISSIONS.SUBJECTS_MANAGE,
      PERMISSIONS.ANNOUNCEMENTS_MANAGE,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.ADMISSION_CELL]: {
    label: "Admission Cell",
    family: "administration",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ADMISSIONS_MANAGE,
      PERMISSIONS.STUDENTS_MANAGE,
      PERMISSIONS.FEES_MANAGE,
      PERMISSIONS.ANNOUNCEMENTS_MANAGE,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.HOD]: {
    label: "Head Of Department",
    family: "academics",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.STUDENTS_MANAGE,
      PERMISSIONS.COURSES_MANAGE,
      PERMISSIONS.SUBJECTS_MANAGE,
      PERMISSIONS.TIMETABLE_MANAGE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.RESULTS_MANAGE,
      PERMISSIONS.ASSIGNMENTS_MANAGE,
      PERMISSIONS.ANNOUNCEMENTS_MANAGE,
      PERMISSIONS.PLACEMENTS_MANAGE,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.MATERIALS_MANAGE,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.FACULTY_PROFESSOR]: {
    label: "Faculty / Professor",
    family: "academics",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.STUDENTS_MANAGE,
      PERMISSIONS.TIMETABLE_VIEW,
      PERMISSIONS.ATTENDANCE_MARK,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.ASSIGNMENTS_MANAGE,
      PERMISSIONS.RESULTS_MANAGE,
      PERMISSIONS.ANNOUNCEMENTS_MANAGE,
      PERMISSIONS.MATERIALS_MANAGE,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.ACCOUNTANT]: {
    label: "Accountant",
    family: "finance",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.FEES_MANAGE,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.HR_MANAGER]: {
    label: "HR Manager",
    family: "human-resources",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.STAFF_MANAGE,
      PERMISSIONS.APPROVALS_MANAGE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.PLACEMENT_CELL]: {
    label: "Placement Cell",
    family: "student-services",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.STUDENTS_MANAGE,
      PERMISSIONS.PLACEMENTS_MANAGE,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.LIBRARIAN]: {
    label: "Librarian",
    family: "student-services",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.LIBRARY_MANAGE,
      PERMISSIONS.FEES_MANAGE,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.HOSTEL_WARDEN]: {
    label: "Hostel Warden",
    family: "facilities",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.HOSTEL_MANAGE,
      PERMISSIONS.FEES_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.TRANSPORT_MANAGER]: {
    label: "Transport Manager",
    family: "facilities",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.TRANSPORT_MANAGE,
      PERMISSIONS.FEES_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.SYSTEM_ADMIN]: {
    label: "System Admin",
    family: "it-system",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.STAFF_MANAGE,
      PERMISSIONS.RECORDS_MANAGE,
      PERMISSIONS.SUPPORT_MANAGE,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.STUDENT]: {
    label: "Student",
    family: "end-user",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.TIMETABLE_VIEW,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.ASSIGNMENTS_SUBMIT,
      PERMISSIONS.RESULTS_VIEW,
      PERMISSIONS.FEES_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.PLACEMENTS_APPLY,
      PERMISSIONS.MATERIALS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
  [ROLES.PARENT_GUARDIAN]: {
    label: "Parent / Guardian",
    family: "end-user",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.RESULTS_VIEW,
      PERMISSIONS.FEES_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
  },
};

export const ROLES_LIST = Object.values(ROLES);
export const ROLE_OPTIONS = Object.entries(ROLE_DEFINITIONS).map(([value, config]) => ({ value, ...config }));

export const getRoleDefinition = (role) => ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS[ROLES.STUDENT];
export const getRoleLabel = (role) => getRoleDefinition(role).label;
export const getDefaultPermissions = (role) => getRoleDefinition(role).permissions;

export const hasPermission = (userOrRole, permission) => {
  const user =
    typeof userOrRole === "string"
      ? { role: userOrRole, permissions: getDefaultPermissions(userOrRole) }
      : userOrRole;

  const permissions = user?.permissions?.length ? user.permissions : getDefaultPermissions(user?.role);
  return permissions.includes(PERMISSIONS.ALL) || permissions.includes(permission);
};

export const isStudentRole = (role) => [ROLES.STUDENT].includes(role);
export const isParentRole = (role) => [ROLES.PARENT_GUARDIAN].includes(role);
export const isTeachingRole = (role) => [ROLES.HOD, ROLES.FACULTY_PROFESSOR].includes(role);
export const isAdminRole = (role) =>
  [ROLES.SUPER_ADMIN, ROLES.DIRECTOR_PRINCIPAL, ROLES.REGISTRAR, ROLES.ADMISSION_CELL, ROLES.ACCOUNTANT, ROLES.HR_MANAGER, ROLES.SYSTEM_ADMIN].includes(role);
