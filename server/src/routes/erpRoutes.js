import express from "express";
import multer from "multer";
import {
  applyToPlacement,
  addCourseMaterial,
  createAdmission,
  createAnnouncement,
  createAssignment,
  createCourse,
  createExam,
  createFee,
  createPlacement,
  createResult,
  createSubject,
  createTimetable,
  createUser,
  deleteAdmission,
  deleteAnnouncement,
  deleteAssignment,
  deleteAttendance,
  deleteCourse,
  deleteCourseMaterial,
  deleteExam,
  deleteFee,
  deletePlacement,
  deleteResult,
  deleteSubject,
  deleteTimetable,
  deleteUser,
  getAuditLogs,
  getAnalytics,
  getAdmissions,
  getAnnouncements,
  getAssignments,
  getAttendance,
  getCourses,
  getExams,
  getFees,
  getImportTemplates,
  getManagedUsers,
  getNotifications,
  getPlacements,
  getResults,
  getSubjects,
  getTimetable,
  getUsers,
  importRecords,
  markAttendance,
  markNotificationRead,
  submitAssignment,
  updateAdmission,
  updateUserSuspension,
} from "../controllers/erpController.js";
import { authorize, authorizePermission, protect } from "../middleware/authMiddleware.js";
import { PERMISSIONS, ROLES } from "../utils/constants.js";
import {
  createBook,
  createFinanceTransaction,
  createInvoice,
  createLeaveRequest,
  createPayrollRun,
  createApprovalItem,
  createSyllabusProgress,
  deleteBook,
  deleteFinanceTransaction,
  deleteInvoice,
  deletePayrollRun,
  deleteApprovalItem,
  deleteSyllabusProgress,
  getApprovalItems,
  getBooks,
  getEmployees,
  getFinanceTransactions,
  getFinanceParticipants,
  getInvoices,
  getLeaveRequests,
  getLibraryCirculation,
  getLibraryMembers,
  getPayrollConfigs,
  getPayrollRuns,
  getStaffAttendance,
  getSyllabusProgress,
  issueLibraryBook,
  returnLibraryBook,
  reviewLeaveRequest,
  reviewApprovalItem,
  savePayrollConfig,
  saveStaffAttendance,
  updatePayrollRun,
  updateSyllabusProgress,
} from "../controllers/operationsController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);

router.get(
  "/import/templates",
  authorizePermission(PERMISSIONS.ADMISSIONS_MANAGE, PERMISSIONS.USERS_MANAGE, PERMISSIONS.FEES_MANAGE, PERMISSIONS.COURSES_MANAGE),
  getImportTemplates
);
router.post(
  "/import/:target",
  authorizePermission(PERMISSIONS.ADMISSIONS_MANAGE, PERMISSIONS.USERS_MANAGE, PERMISSIONS.FEES_MANAGE, PERMISSIONS.COURSES_MANAGE),
  upload.single("file"),
  importRecords
);

router
  .route("/users")
  .get(authorizePermission(PERMISSIONS.USERS_MANAGE), getUsers)
  .post(authorizePermission(PERMISSIONS.USERS_MANAGE), createUser);
router.get("/audit-logs", authorizePermission(PERMISSIONS.USERS_MANAGE, PERMISSIONS.SUPPORT_MANAGE), getAuditLogs);
router.get("/managed-users", authorizePermission(PERMISSIONS.STUDENTS_MANAGE, PERMISSIONS.USERS_MANAGE), getManagedUsers);
router.delete("/users/:id", authorizePermission(PERMISSIONS.USERS_MANAGE), deleteUser);
router.patch("/users/:id/suspension", authorizePermission(PERMISSIONS.USERS_MANAGE), updateUserSuspension);

router
  .route("/admissions")
  .get(authorizePermission(PERMISSIONS.ADMISSIONS_MANAGE), getAdmissions)
  .post(authorizePermission(PERMISSIONS.ADMISSIONS_MANAGE), createAdmission);
router.delete("/admissions/:id", authorizePermission(PERMISSIONS.ADMISSIONS_MANAGE), deleteAdmission);
router.patch("/admissions/:id", authorizePermission(PERMISSIONS.ADMISSIONS_MANAGE), updateAdmission);

router
  .route("/courses")
  .get(getCourses)
  .post(authorizePermission(PERMISSIONS.COURSES_MANAGE), createCourse);
router.delete("/courses/:id", authorizePermission(PERMISSIONS.COURSES_MANAGE), deleteCourse);
router.post("/courses/:id/materials", authorizePermission(PERMISSIONS.MATERIALS_MANAGE), addCourseMaterial);
router.delete("/courses/:id/materials/:materialId", authorizePermission(PERMISSIONS.MATERIALS_MANAGE), deleteCourseMaterial);

router
  .route("/subjects")
  .get(getSubjects)
  .post(authorizePermission(PERMISSIONS.SUBJECTS_MANAGE), createSubject);
router.delete("/subjects/:id", authorizePermission(PERMISSIONS.SUBJECTS_MANAGE), deleteSubject);

router
  .route("/announcements")
  .get(getAnnouncements)
  .post(authorizePermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE), createAnnouncement);
router.delete("/announcements/:id", authorizePermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE), deleteAnnouncement);

router
  .route("/timetable")
  .get(getTimetable)
  .post(authorizePermission(PERMISSIONS.TIMETABLE_MANAGE), createTimetable);
router.delete("/timetable/:id", authorizePermission(PERMISSIONS.TIMETABLE_MANAGE), deleteTimetable);

router
  .route("/assignments")
  .get(getAssignments)
  .post(authorizePermission(PERMISSIONS.ASSIGNMENTS_MANAGE), createAssignment);
router.delete("/assignments/:id", authorizePermission(PERMISSIONS.ASSIGNMENTS_MANAGE), deleteAssignment);

router.post("/assignments/:id/submit", authorizePermission(PERMISSIONS.ASSIGNMENTS_SUBMIT), submitAssignment);

router
  .route("/attendance")
  .get(getAttendance)
  .post(authorizePermission(PERMISSIONS.ATTENDANCE_MARK), markAttendance);
router.delete("/attendance/:id", authorizePermission(PERMISSIONS.ATTENDANCE_MARK, PERMISSIONS.USERS_MANAGE), deleteAttendance);

router
  .route("/fees")
  .get(getFees)
  .post(authorizePermission(PERMISSIONS.FEES_MANAGE), createFee);
router.delete("/fees/:id", authorizePermission(PERMISSIONS.FEES_MANAGE), deleteFee);

router
  .route("/exams")
  .get(getExams)
  .post(authorizePermission(PERMISSIONS.RESULTS_MANAGE), createExam);
router.delete("/exams/:id", authorizePermission(PERMISSIONS.RESULTS_MANAGE), deleteExam);

router
  .route("/results")
  .get(getResults)
  .post(authorizePermission(PERMISSIONS.RESULTS_MANAGE), createResult);
router.delete("/results/:id", authorizePermission(PERMISSIONS.RESULTS_MANAGE), deleteResult);

router
  .route("/placements")
  .get(getPlacements)
  .post(authorizePermission(PERMISSIONS.PLACEMENTS_MANAGE), createPlacement);
router.delete("/placements/:id", authorizePermission(PERMISSIONS.PLACEMENTS_MANAGE), deletePlacement);
router.post("/placements/:id/apply", authorizePermission(PERMISSIONS.PLACEMENTS_APPLY), applyToPlacement);

router.get("/analytics", getAnalytics);

router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationRead);

router.get("/hr/employees", authorizePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.USERS_MANAGE), getEmployees);
router.get("/hr/attendance", authorizePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.ATTENDANCE_VIEW), getStaffAttendance);
router.post("/hr/attendance", authorizePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.ATTENDANCE_VIEW), saveStaffAttendance);
router.get("/hr/leave-requests", authorizePermission(PERMISSIONS.APPROVALS_MANAGE, PERMISSIONS.STAFF_MANAGE), getLeaveRequests);
router.post("/hr/leave-requests", authorizePermission(PERMISSIONS.APPROVALS_MANAGE, PERMISSIONS.STAFF_MANAGE), createLeaveRequest);
router.patch("/hr/leave-requests/:id", authorizePermission(PERMISSIONS.APPROVALS_MANAGE), reviewLeaveRequest);
router.get("/hr/payroll", authorizePermission(PERMISSIONS.PAYROLL_MANAGE), getPayrollConfigs);
router.post("/hr/payroll", authorizePermission(PERMISSIONS.PAYROLL_MANAGE), savePayrollConfig);

router.route("/library/books").get(authorizePermission(PERMISSIONS.LIBRARY_MANAGE), getBooks).post(authorizePermission(PERMISSIONS.LIBRARY_MANAGE), createBook);
router.delete("/library/books/:id", authorizePermission(PERMISSIONS.LIBRARY_MANAGE), deleteBook);
router.get("/library/circulation", authorizePermission(PERMISSIONS.LIBRARY_MANAGE), getLibraryCirculation);
router.post("/library/circulation", authorizePermission(PERMISSIONS.LIBRARY_MANAGE), issueLibraryBook);
router.patch("/library/circulation/:id/return", authorizePermission(PERMISSIONS.LIBRARY_MANAGE), returnLibraryBook);
router.get("/library/members", authorizePermission(PERMISSIONS.LIBRARY_MANAGE), getLibraryMembers);

router.route("/finance/transactions").get(authorizePermission(PERMISSIONS.FEES_MANAGE, PERMISSIONS.PAYROLL_MANAGE), getFinanceTransactions).post(authorizePermission(PERMISSIONS.FEES_MANAGE, PERMISSIONS.PAYROLL_MANAGE), createFinanceTransaction);
router.delete("/finance/transactions/:id", authorizePermission(PERMISSIONS.FEES_MANAGE, PERMISSIONS.PAYROLL_MANAGE), deleteFinanceTransaction);
router.get("/finance/participants", authorizePermission(PERMISSIONS.FEES_MANAGE, PERMISSIONS.PAYROLL_MANAGE), getFinanceParticipants);
router.route("/finance/invoices").get(authorizePermission(PERMISSIONS.FEES_MANAGE, PERMISSIONS.PAYROLL_MANAGE), getInvoices).post(authorizePermission(PERMISSIONS.FEES_MANAGE, PERMISSIONS.PAYROLL_MANAGE), createInvoice);
router.delete("/finance/invoices/:id", authorizePermission(PERMISSIONS.FEES_MANAGE, PERMISSIONS.PAYROLL_MANAGE), deleteInvoice);
router.route("/finance/payroll-runs").get(authorizePermission(PERMISSIONS.PAYROLL_MANAGE), getPayrollRuns).post(authorizePermission(PERMISSIONS.PAYROLL_MANAGE), createPayrollRun);
router.patch("/finance/payroll-runs/:id", authorizePermission(PERMISSIONS.PAYROLL_MANAGE), updatePayrollRun);
router.delete("/finance/payroll-runs/:id", authorizePermission(PERMISSIONS.PAYROLL_MANAGE), deletePayrollRun);

router.route("/management/approvals").get(authorizePermission(PERMISSIONS.APPROVALS_MANAGE), getApprovalItems).post(authorizePermission(PERMISSIONS.APPROVALS_MANAGE), createApprovalItem);
router.patch("/management/approvals/:id", authorizePermission(PERMISSIONS.APPROVALS_MANAGE), reviewApprovalItem);
router.delete("/management/approvals/:id", authorizePermission(PERMISSIONS.APPROVALS_MANAGE), deleteApprovalItem);

router.route("/hod/syllabus-progress").get(authorizePermission(PERMISSIONS.COURSES_MANAGE, PERMISSIONS.SUBJECTS_MANAGE), getSyllabusProgress).post(authorizePermission(PERMISSIONS.COURSES_MANAGE, PERMISSIONS.SUBJECTS_MANAGE), createSyllabusProgress);
router.patch("/hod/syllabus-progress/:id", authorizePermission(PERMISSIONS.COURSES_MANAGE, PERMISSIONS.SUBJECTS_MANAGE), updateSyllabusProgress);
router.delete("/hod/syllabus-progress/:id", authorizePermission(PERMISSIONS.COURSES_MANAGE, PERMISSIONS.SUBJECTS_MANAGE), deleteSyllabusProgress);

export default router;
