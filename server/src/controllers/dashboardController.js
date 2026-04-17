import Admission from "../models/Admission.js";
import Announcement from "../models/Announcement.js";
import Assignment from "../models/Assignment.js";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Exam from "../models/Exam.js";
import Fee from "../models/Fee.js";
import Notification from "../models/Notification.js";
import Placement from "../models/Placement.js";
import Result from "../models/Result.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
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
    const [students, teachers, totalCourses, totalSubjects, attendances, placements, recentAdmissions] = await Promise.all([
      User.find({ role: ROLES.STUDENT }).select("createdAt"),
      User.countDocuments({ role: ROLES.TEACHER }),
      Course.countDocuments(),
      Subject.countDocuments(),
      Attendance.find().select("records"),
      Placement.find().select("applications deadline"),
      Admission.countDocuments({ status: { $in: ["lead", "under-review", "verified"] } }),
    ]);

    const attendanceStats = getAttendanceNumbers(attendances);
    const activePlacements = placements.filter((item) => !item.deadline || new Date(item.deadline) >= new Date()).length;

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

    const weeklyTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayLabel, index) => {
      const relatedRows = attendanceRows.filter((row) => new Date(row.date).getDay() === ((index + 1) % 7));
      const stats = getAttendanceNumbers(relatedRows);
      return { name: dayLabel, value: stats.percentage };
    });

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
    notifications,
    announcements,
  });
};
