import Admission from "../models/Admission.js";
import AiRiskHistory from "../models/AiRiskHistory.js";
import Announcement from "../models/Announcement.js";
import Assignment from "../models/Assignment.js";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Exam from "../models/Exam.js";
import Fee from "../models/Fee.js";
import GlobalSetting from "../models/GlobalSetting.js";
import ImportJob from "../models/ImportJob.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Notification from "../models/Notification.js";
import Placement from "../models/Placement.js";
import PayrollRun from "../models/PayrollRun.js";
import Result from "../models/Result.js";
import StaffAttendance from "../models/StaffAttendance.js";
import StudentIntervention from "../models/StudentIntervention.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { hasPermission, isParentRole, isStudentRole, isTeachingRole, PERMISSIONS, ROLES } from "../utils/constants.js";

const getAttendanceNumbers = (rows, studentId = null) => {
  let total = 0;
  let present = 0;
  let absent = 0;
  let late = 0;

  rows.forEach((row) => {
    row.records.forEach((record) => {
      if (studentId && String(record.student) !== String(studentId) && String(record.student?._id) !== String(studentId)) {
        return;
      }

      total += 1;
      if (record.status === "present") {
        present += 1;
      }
      if (record.status === "absent") {
        absent += 1;
      }
      if (record.status === "late") {
        late += 1;
        present += 1;
      }
    });
  });

  return {
    total,
    present,
    absent,
    late,
    percentage: total ? Math.round((present / total) * 100) : 0,
  };
};

const getMonthlyGrowth = (students) => {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    months.push({ name: key, value: 0 });
  }

  students.forEach((student) => {
    const created = new Date(student.createdAt);
    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
    const bucket = months.find((item) => item.name === key);
    if (bucket) {
      bucket.value += 1;
    }
  });

  return months;
};

export const getDashboard = async (req, res) => {
  const { role, _id } = req.user;

  const [notifications, announcements] = await Promise.all([
    Notification.find({ recipient: _id }).sort({ createdAt: -1 }).limit(5),
    Announcement.find({ audience: role }).sort({ createdAt: -1 }).limit(5).populate("author", "name role"),
  ]);

  if (hasPermission(req.user, PERMISSIONS.USERS_MANAGE)) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [students, teachers, totalCourses, totalSubjects, attendances, placements, recentAdmissions, settings, aiRiskRows, interventions, importJobs, aiGenerationsWeek, providerTestsWeek, providerFailuresWeek, interventionActionsWeek, importPreviewsWeek, latestAiAction] = await Promise.all([
      User.find({ role: ROLES.STUDENT }).select("createdAt"),
      User.countDocuments({ role: { $in: [ROLES.FACULTY_PROFESSOR, ROLES.HOD] } }),
      Course.countDocuments(),
      Subject.countDocuments(),
      Attendance.find().select("records"),
      Placement.find().select("applications deadline"),
      Admission.countDocuments({ status: { $in: ["lead", "under-review", "verified"] } }),
      GlobalSetting.findOne().select("aiProvider updatedAt"),
      AiRiskHistory.find().sort({ createdAt: -1 }).limit(50).select("riskLevel riskScore student createdAt"),
      StudentIntervention.find({ status: { $in: ["pending", "in-progress"] } }).select("status priority"),
      ImportJob.find({ mode: "commit" }).sort({ createdAt: -1 }).limit(10).select("imported skipped target createdAt"),
      AuditLog.countDocuments({ action: "ai-risk.generate", timestamp: { $gte: since } }),
      AuditLog.countDocuments({ action: "ai-provider.test", status: "success", timestamp: { $gte: since } }),
      AuditLog.countDocuments({ action: "ai-provider.test", status: "failure", timestamp: { $gte: since } }),
      AuditLog.countDocuments({ action: { $in: ["ai-risk.intervention-create", "ai-risk.intervention-update"] }, timestamp: { $gte: since } }),
      AuditLog.countDocuments({ action: "imports.preview", timestamp: { $gte: since } }),
      AuditLog.findOne({ action: { $in: ["ai-risk.generate", "ai-provider.test"] } }).sort({ timestamp: -1 }).select("action timestamp status"),
    ]);

    const attendanceStats = getAttendanceNumbers(attendances);
    const activePlacements = placements.filter((item) => !item.deadline || new Date(item.deadline) >= new Date()).length;
    const highRiskStudents = new Set(aiRiskRows.filter((item) => ["high", "critical"].includes(item.riskLevel)).map((item) => String(item.student))).size;
    const latestRiskScore = aiRiskRows[0]?.riskScore || 0;
    const latestImports = importJobs.reduce((sum, job) => sum + (job.imported || 0), 0);

    return res.json({
      metrics: [
        { label: "Total Students", value: students.length, trend: "Live enrollment" },
        { label: "Total Teachers", value: teachers, trend: "Faculty roster" },
        { label: "Total Courses", value: totalCourses, trend: `${totalSubjects} subjects active` },
        { label: "Average Attendance", value: `${attendanceStats.percentage}%`, trend: "Institution-wide" },
        { label: "Active Placements", value: activePlacements, trend: `${placements.reduce((sum, item) => sum + item.applications.length, 0)} applications` },
        { label: "Admissions Pipeline", value: recentAdmissions, trend: "Under process" },
      ],
      charts: {
        attendance: getMonthlyGrowth(students),
      },
      aiOverview: {
        configured: Boolean(settings?.aiProvider?.apiUrl && (settings?.aiProvider?.apiKey || settings?.aiProvider?.presetKey === "ollama")),
        providerName: settings?.aiProvider?.providerName || "local-only",
        presetKey: settings?.aiProvider?.presetKey || "custom",
        highRiskStudents,
        pendingInterventions: interventions.length,
        latestRiskScore,
        importsLastTenRuns: latestImports,
        lastSettingsUpdate: settings?.updatedAt || null,
        usage: {
          aiGenerationsWeek,
          providerTestsWeek,
          providerFailuresWeek,
          interventionActionsWeek,
          importPreviewsWeek,
          latestAiActionAt: latestAiAction?.timestamp || null,
          latestAiActionType: latestAiAction?.action || null,
          latestAiActionStatus: latestAiAction?.status || "success",
        },
      },
      attendanceBreakdown: [
        { name: "present", value: attendanceStats.present },
        { name: "absent", value: attendanceStats.absent },
        { name: "late", value: attendanceStats.late },
      ],
      placements,
      notifications,
      announcements,
    });
  }

  if (isTeachingRole(role)) {
    const [courses, subjects, assignments, timetable, attendanceRows, results] = await Promise.all([
      Course.find({ teacher: _id }).populate("students", "name rollNumber"),
      Subject.find({ teacher: _id }),
      Assignment.find({ teacher: _id }).sort({ dueDate: 1 }).limit(5).populate("course", "title"),
      Timetable.find({ teacher: _id }).sort({ day: 1, startTime: 1 }).limit(6).populate("subject", "name").populate("course", "title"),
      Attendance.find({ subject: { $in: (await Subject.find({ teacher: _id }).select("_id")).map((item) => item._id) } }),
      Result.find().populate({ path: "exam", populate: { path: "subject", select: "teacher name" } }),
    ]);

    const teacherSubjectIds = new Set(subjects.map((subject) => String(subject._id)));
    const teacherResults = results.filter((item) => teacherSubjectIds.has(String(item.exam?.subject?._id)));
    const avgMarks = teacherResults.length
      ? Math.round(teacherResults.reduce((sum, item) => sum + item.marksObtained, 0) / teacherResults.length)
      : 0;
    const taughtStudentIds = [...new Set(courses.flatMap((course) => course.students.map((student) => String(student._id))))];
    const [riskRows, interventions] = await Promise.all([
      AiRiskHistory.find({ student: { $in: taughtStudentIds } }).sort({ createdAt: -1 }).limit(100).select("student riskLevel riskScore createdAt"),
      StudentIntervention.find({ student: { $in: taughtStudentIds }, status: { $in: ["pending", "in-progress"] } }).select("status priority"),
    ]);

    const weeklyTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayLabel, index) => {
      const relatedRows = attendanceRows.filter((row) => new Date(row.date).getDay() === ((index + 1) % 7));
      const stats = getAttendanceNumbers(relatedRows);
      return { name: dayLabel, value: stats.percentage };
    });

    const roleInsights =
      role === ROLES.HOD
        ? {
            title: "Department Drilldown",
            subtitle: "Faculty workload, syllabus momentum, and department-level student risk.",
            cards: [
              { label: "Department Courses", value: courses.length, detail: "Courses managed in your department" },
              { label: "Faculty Subjects", value: subjects.length, detail: "Subjects currently assigned" },
              { label: "High Risk Students", value: new Set(riskRows.filter((item) => ["high", "critical"].includes(item.riskLevel)).map((item) => String(item.student))).size, detail: "Need review this week" },
              { label: "Pending Actions", value: interventions.length, detail: "Interventions awaiting closure" },
            ],
          }
        : null;

    return res.json({
      metrics: [
        { label: "Students Today Present", value: getAttendanceNumbers(attendanceRows).present, trend: "Marked sessions" },
        { label: "Assignments", value: assignments.length, trend: "Managed by you" },
        { label: "Total Subjects", value: subjects.length, trend: "Assigned to you" },
        { label: "Class Performance", value: `${avgMarks}%`, trend: "Average marks across subjects" },
      ],
      charts: {
        grading: weeklyTrend,
      },
      aiOverview: {
        highRiskStudents: new Set(riskRows.filter((item) => ["high", "critical"].includes(item.riskLevel)).map((item) => String(item.student))).size,
        pendingInterventions: interventions.length,
        latestRiskScore: riskRows[0]?.riskScore || 0,
        usage: {
          aiGenerationsWeek: riskRows.length,
        },
      },
      roleInsights,
      timetable,
      assignments,
      notifications,
      announcements,
    });
  }

  if (isParentRole(role)) {
    const students = await User.find({ parentEmail: req.user.email, role: ROLES.STUDENT }).select("_id name className");
    const studentIds = students.map((student) => student._id);
    const [fees, results, attendanceRows] = await Promise.all([
      Fee.find({ student: { $in: studentIds } }).populate("student", "name"),
      Result.find({ student: { $in: studentIds } }).populate("student", "name").populate({
        path: "exam",
        populate: { path: "subject", select: "name" },
      }),
      Attendance.find({ "records.student": { $in: studentIds } }).populate("records.student", "name"),
    ]);

    const attendanceStats = getAttendanceNumbers(attendanceRows);

    return res.json({
      metrics: [
        { label: "Linked Students", value: students.length, trend: "Family view" },
        { label: "Attendance", value: `${attendanceStats.percentage}%`, trend: "Child attendance" },
        { label: "Results Published", value: results.length, trend: "Latest outcomes" },
        { label: "Alerts", value: notifications.length, trend: "Recent updates" },
      ],
      charts: {
        progress: results.slice(0, 6).map((item) => ({
          name: item.exam?.subject?.name || "Exam",
          score: item.marksObtained,
        })),
      },
      fees,
      results,
      notifications,
      announcements,
    });
  }

  if (!isStudentRole(role)) {
    if (role === ROLES.REGISTRAR) {
      const [studentsCount, admissionsOpen, verifiedAdmissions, coursesCount, subjectsCount, recentResults] = await Promise.all([
        User.countDocuments({ role: ROLES.STUDENT }),
        Admission.countDocuments({ status: { $in: ["lead", "under-review"] } }),
        Admission.countDocuments({ status: "verified" }),
        Course.countDocuments(),
        Subject.countDocuments(),
        Result.countDocuments(),
      ]);

      return res.json({
        metrics: [
          { label: "Students", value: studentsCount, trend: "Registered student records" },
          { label: "Open Admissions", value: admissionsOpen, trend: "Lead and review stage" },
          { label: "Verified Admissions", value: verifiedAdmissions, trend: "Ready for onboarding" },
          { label: "Academic Catalog", value: `${coursesCount} / ${subjectsCount}`, trend: "Courses / subjects" },
        ],
        charts: {
          attendance: [
            { name: "Students", value: studentsCount },
            { name: "Open Admissions", value: admissionsOpen },
            { name: "Verified", value: verifiedAdmissions },
            { name: "Published Results", value: recentResults },
          ],
        },
        roleInsights: {
          title: "Registrar Drilldown",
          subtitle: "Academic records, pipeline health, and catalog readiness.",
          cards: [
            { label: "Student Registry", value: studentsCount, detail: "Active student records in ERP" },
            { label: "Pending Admissions", value: admissionsOpen, detail: "Need review or verification" },
            { label: "Verified For Onboarding", value: verifiedAdmissions, detail: "Ready to convert to enrolled students" },
            { label: "Published Results", value: recentResults, detail: "Results already available to students" },
          ],
        },
        notifications,
        announcements,
      });
    }

    if (role === ROLES.PLACEMENT_CELL) {
      const [allPlacements, shortlistedCandidates, selectedCandidates] = await Promise.all([
        Placement.find().sort({ deadline: 1 }).limit(20),
        Placement.countDocuments({ "applications.status": "shortlisted" }),
        Placement.countDocuments({ "applications.status": "selected" }),
      ]);
      const activeDrives = allPlacements.filter((item) => !item.deadline || new Date(item.deadline) >= new Date()).length;
      const totalApplications = allPlacements.reduce((sum, item) => sum + item.applications.length, 0);

      return res.json({
        metrics: [
          { label: "Active Drives", value: activeDrives, trend: "Recruitment cycles in progress" },
          { label: "Applications", value: totalApplications, trend: "Across recent drives" },
          { label: "Shortlisted", value: shortlistedCandidates, trend: "Moved to next round" },
          { label: "Selected", value: selectedCandidates, trend: "Offers in pipeline" },
        ],
        charts: {
          attendance: allPlacements.map((item) => ({ name: item.companyName, value: item.applications.length })),
        },
        roleInsights: {
          title: "Placement Drilldown",
          subtitle: "Drive conversion, applicant movement, and corporate activity.",
          cards: [
            { label: "Companies Live", value: activeDrives, detail: "Companies with open or active drives" },
            { label: "Total Applications", value: totalApplications, detail: "Recent student applications" },
            { label: "Shortlisted", value: shortlistedCandidates, detail: "Candidates progressing further" },
            { label: "Selected", value: selectedCandidates, detail: "Offer-stage candidates" },
          ],
        },
        placements: allPlacements,
        notifications,
        announcements,
      });
    }

    if (role === ROLES.ACCOUNTANT) {
      const [fees, payrollRuns, dueFees, paidFees, invoicesPending] = await Promise.all([
        Fee.find().sort({ dueDate: 1 }).limit(20),
        PayrollRun.countDocuments(),
        Fee.countDocuments({ status: { $ne: "paid" } }),
        Fee.aggregate([{ $group: { _id: null, totalPaid: { $sum: "$paidAmount" } } }]),
        Fee.countDocuments({ status: "pending" }),
      ]);

      return res.json({
        metrics: [
          { label: "Open Fee Records", value: dueFees, trend: "Need collection follow-up" },
          { label: "Collected", value: paidFees[0]?.totalPaid || 0, trend: "Total recorded paid amount" },
          { label: "Payroll Runs", value: payrollRuns, trend: "Processed payroll cycles" },
          { label: "Pending Fee Cases", value: invoicesPending, trend: "Awaiting payment closure" },
        ],
        charts: {
          attendance: fees.slice(0, 8).map((item) => ({ name: item.academicYear, value: item.paidAmount || 0 })),
        },
        roleInsights: {
          title: "Finance Drilldown",
          subtitle: "Collection pressure, payroll throughput, and fee follow-up readiness.",
          cards: [
            { label: "Collection Cases", value: dueFees, detail: "Fee accounts not fully paid" },
            { label: "Recorded Collections", value: paidFees[0]?.totalPaid || 0, detail: "Total paid amount captured" },
            { label: "Payroll Executions", value: payrollRuns, detail: "Salary processing runs completed" },
            { label: "Pending Closures", value: invoicesPending, detail: "Fee entries still open" },
          ],
        },
        notifications,
        announcements,
      });
    }

    if (role === ROLES.HR_MANAGER) {
      const [employees, leaveRequests, openLeaves, attendanceRows, payrollRuns] = await Promise.all([
        User.countDocuments({ role: { $nin: [ROLES.STUDENT, ROLES.PARENT_GUARDIAN] } }),
        LeaveRequest.countDocuments(),
        LeaveRequest.countDocuments({ status: "pending" }),
        StaffAttendance.countDocuments(),
        PayrollRun.countDocuments(),
      ]);

      return res.json({
        metrics: [
          { label: "Employees", value: employees, trend: "Staff master records" },
          { label: "Leave Requests", value: leaveRequests, trend: "All logged requests" },
          { label: "Pending Approvals", value: openLeaves, trend: "Need HR review" },
          { label: "Payroll Runs", value: payrollRuns, trend: "Completed payroll cycles" },
        ],
        charts: {
          attendance: [
            { name: "Employees", value: employees },
            { name: "Attendance Logs", value: attendanceRows },
            { name: "Pending Leave", value: openLeaves },
            { name: "Payroll Runs", value: payrollRuns },
          ],
        },
        roleInsights: {
          title: "HR Drilldown",
          subtitle: "Staff record health, attendance capture, and approval queue volume.",
          cards: [
            { label: "Staff Records", value: employees, detail: "Employees active in ERP" },
            { label: "Attendance Logs", value: attendanceRows, detail: "Captured staff attendance entries" },
            { label: "Leave Queue", value: openLeaves, detail: "Approvals still pending" },
            { label: "Payroll Runs", value: payrollRuns, detail: "Processed salary cycles" },
          ],
        },
        notifications,
        announcements,
      });
    }

    const [students, placements, admissions, fees] = await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      Placement.find().sort({ createdAt: -1 }).limit(5),
      Admission.countDocuments(),
      Fee.aggregate([{ $group: { _id: null, totalPaid: { $sum: "$paidAmount" }, totalDue: { $sum: "$totalAmount" } } }]),
    ]);

    return res.json({
      metrics: [
        { label: "Students", value: students, trend: "Institution records" },
        { label: "Admissions", value: admissions, trend: "Lead to enrollment" },
        { label: "Placement Drives", value: placements.length, trend: "Active coordination" },
        { label: "Fee Collection", value: fees[0]?.totalPaid || 0, trend: `of ${fees[0]?.totalDue || 0}` },
      ],
      charts: {
        attendance: placements.map((item, index) => ({ name: item.companyName || `Drive ${index + 1}`, value: item.applications?.length || 0 })),
      },
      notifications,
      announcements,
      placements,
    });
  }

  const studentCourses = await Course.find({ students: _id }).select("_id title");
  const courseIds = studentCourses.map((course) => course._id);
  const [assignments, timetable, attendance, fees, results, placements] = await Promise.all([
    Assignment.find({ course: { $in: courseIds } }).sort({ dueDate: 1 }).limit(10).populate("subject", "name"),
    Timetable.find({ course: { $in: courseIds } }).limit(6).populate("subject", "name").populate("teacher", "name"),
    Attendance.find({ "records.student": _id }).sort({ date: -1 }).populate("subject", "name").populate("course", "title"),
    Fee.find({ student: _id }).sort({ dueDate: 1 }),
    Result.find({ student: _id }).populate({
      path: "exam",
      populate: { path: "subject", select: "name" },
    }),
    Placement.find().sort({ deadline: 1 }).limit(5),
  ]);

  const attendanceStats = getAttendanceNumbers(attendance, _id);
  const submittedCount = assignments.filter((assignment) =>
    assignment.submissions.some((submission) => String(submission.student) === String(_id))
  ).length;
  const [riskRows, interventions] = await Promise.all([
    AiRiskHistory.find({ student: _id }).sort({ createdAt: -1 }).limit(12).select("riskLevel riskScore createdAt"),
    StudentIntervention.find({ student: _id }).sort({ createdAt: -1 }).limit(5).select("status priority title"),
  ]);

  res.json({
    metrics: [
      { label: "Attendance", value: `${attendanceStats.percentage}%`, trend: "Classes attended" },
      { label: "Assignments", value: assignments.length, trend: `${submittedCount} submitted` },
      { label: "Latest Notices", value: announcements.length, trend: "Unread updates" },
      { label: "Results", value: results.length, trend: "Published" },
    ],
    charts: {
      progress: results.map((item) => ({
        name: item.exam?.subject?.name || "Subject",
        score: item.marksObtained,
      })),
    },
    assignments,
    timetable,
    attendance,
    fees,
    results,
    placements,
    aiOverview: {
      currentRiskLevel: riskRows[0]?.riskLevel || "low",
      currentRiskScore: riskRows[0]?.riskScore || 0,
      openInterventions: interventions.filter((item) => ["pending", "in-progress"].includes(item.status)).length,
      usage: {
        aiGenerationsWeek: riskRows.length,
      },
    },
    interventions,
    notifications,
    announcements,
  });
};
