import Assignment from "../models/Assignment.js";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Fee from "../models/Fee.js";
import Result from "../models/Result.js";
import User from "../models/User.js";
import { hasPermission, isParentRole, isStudentRole, isTeachingRole, PERMISSIONS, ROLES } from "./constants.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getRiskLevel = (score) => {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 60) {
    return "high";
  }

  if (score >= 35) {
    return "moderate";
  }

  return "low";
};

const formatPercent = (value) => `${Math.round(value)}%`;

const buildLocalNarrative = (profile) => {
  const factorLine = profile.factors.length
    ? profile.factors.map((factor) => factor.label).join(", ")
    : "No strong negative indicators were detected";

  return {
    provider: "local-deterministic",
    summary: `${profile.student.name} is currently in the ${profile.riskLevel} risk band with a score of ${profile.riskScore}/100. The strongest signals are ${factorLine}.`,
    keyConcerns: profile.factors.slice(0, 3).map((factor) => factor.label),
    interventions: [
      profile.metrics.attendancePercentage < 75
        ? "Schedule attendance follow-up and track the next two weeks closely."
        : "Maintain the current class participation rhythm.",
      profile.metrics.averageMarks < 65
        ? "Arrange short remedial practice for the weakest subjects before the next assessment."
        : "Keep reinforcing high-performing subjects with revision checkpoints.",
      profile.metrics.missingAssignments > 0
        ? "Clear overdue assignments and define a submission recovery plan."
        : "Preserve assignment discipline and continue on-time submissions.",
    ],
    parentDraft:
      `Dear Parent/Guardian,\n\nThis is a Smart ERP progress update for ${profile.student.name}. ` +
      `${profile.student.name} currently has ${formatPercent(profile.metrics.attendancePercentage)} attendance, ` +
      `${profile.metrics.averageMarks}% average marks, and ${profile.metrics.missingAssignments} missing assignments. ` +
      `We recommend a short review meeting and closer monitoring over the next academic cycle.\n\nRegards,\nSmart ERP`,
    disclaimer: "This advisory note is generated from ERP activity signals and should support, not replace, faculty judgment.",
  };
};

const calculateAttendanceMetrics = (attendanceRows, studentId) => {
  let totalClasses = 0;
  let attendedClasses = 0;
  let absentClasses = 0;
  let lateClasses = 0;

  attendanceRows.forEach((row) => {
    row.records.forEach((record) => {
      if (String(record.student) !== String(studentId) && String(record.student?._id) !== String(studentId)) {
        return;
      }

      totalClasses += 1;
      if (record.status === "present") {
        attendedClasses += 1;
      } else if (record.status === "late") {
        attendedClasses += 1;
        lateClasses += 1;
      } else {
        absentClasses += 1;
      }
    });
  });

  const attendancePercentage = totalClasses ? (attendedClasses / totalClasses) * 100 : 0;

  return {
    totalClasses,
    attendedClasses,
    absentClasses,
    lateClasses,
    attendancePercentage,
  };
};

const calculateAcademicMetrics = (results) => {
  if (!results.length) {
    return {
      averageMarks: 0,
      recentAverageMarks: 0,
      resultCount: 0,
      markTrend: "insufficient-data",
      weakestSubjects: [],
    };
  }

  const sorted = [...results].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const overallAverage = sorted.reduce((sum, item) => sum + item.marksObtained, 0) / sorted.length;
  const recent = sorted.slice(-3);
  const recentAverage = recent.reduce((sum, item) => sum + item.marksObtained, 0) / recent.length;
  const subjectMap = new Map();

  sorted.forEach((item) => {
    const subjectName = item.exam?.subject?.name || "Subject";
    if (!subjectMap.has(subjectName)) {
      subjectMap.set(subjectName, []);
    }
    subjectMap.get(subjectName).push(item.marksObtained);
  });

  const weakestSubjects = [...subjectMap.entries()]
    .map(([name, marks]) => ({
      name,
      average: Math.round(marks.reduce((sum, value) => sum + value, 0) / marks.length),
    }))
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  let markTrend = "stable";
  if (recentAverage <= overallAverage - 10) {
    markTrend = "declining";
  } else if (recentAverage >= overallAverage + 8) {
    markTrend = "improving";
  }

  return {
    averageMarks: Math.round(overallAverage),
    recentAverageMarks: Math.round(recentAverage),
    resultCount: sorted.length,
    markTrend,
    weakestSubjects,
  };
};

const calculateAssignmentMetrics = (assignments, studentId) => {
  const now = new Date();
  let missingAssignments = 0;
  let submittedAssignments = 0;
  let overdueAssignments = 0;

  assignments.forEach((assignment) => {
    const submitted = assignment.submissions.some((submission) => String(submission.student) === String(studentId));

    if (submitted) {
      submittedAssignments += 1;
      return;
    }

    missingAssignments += 1;
    if (assignment.dueDate && new Date(assignment.dueDate) < now) {
      overdueAssignments += 1;
    }
  });

  return {
    totalAssignments: assignments.length,
    submittedAssignments,
    missingAssignments,
    overdueAssignments,
    submissionPercentage: assignments.length ? (submittedAssignments / assignments.length) * 100 : 0,
  };
};

const calculateFeeMetrics = (fees) => {
  const pendingFees = fees.filter((fee) => fee.status !== "paid");
  return {
    totalFees: fees.length,
    pendingFees: pendingFees.length,
    pendingFeeAmount: pendingFees.reduce((sum, fee) => sum + Math.max((fee.totalAmount || 0) - (fee.paidAmount || 0), 0), 0),
  };
};

const buildFactors = (metrics) => {
  const factors = [];

  if (metrics.attendancePercentage < 60) {
    factors.push({ label: `Attendance is critically low at ${formatPercent(metrics.attendancePercentage)}`, severity: "high" });
  } else if (metrics.attendancePercentage < 75) {
    factors.push({ label: `Attendance is below the recommended threshold at ${formatPercent(metrics.attendancePercentage)}`, severity: "medium" });
  }

  if (metrics.averageMarks < 50) {
    factors.push({ label: `Average marks are weak at ${metrics.averageMarks}%`, severity: "high" });
  } else if (metrics.averageMarks < 65) {
    factors.push({ label: `Average marks need improvement at ${metrics.averageMarks}%`, severity: "medium" });
  }

  if (metrics.markTrend === "declining") {
    factors.push({ label: "Recent marks show a declining trend", severity: "medium" });
  }

  if (metrics.overdueAssignments >= 3) {
    factors.push({ label: `${metrics.overdueAssignments} assignments are overdue`, severity: "high" });
  } else if (metrics.missingAssignments > 0) {
    factors.push({ label: `${metrics.missingAssignments} assignment submissions are still pending`, severity: "medium" });
  }

  if (metrics.pendingFeeAmount > 0) {
    factors.push({ label: `Pending fee amount is ${metrics.pendingFeeAmount}`, severity: "low" });
  }

  return factors;
};

const calculateRiskBreakdown = (metrics) => {
  const contributions = [];

  if (metrics.attendancePercentage < 60) {
    contributions.push({ key: "attendance", label: "Attendance below 60%", points: 35 });
  } else if (metrics.attendancePercentage < 75) {
    contributions.push({ key: "attendance", label: "Attendance below 75%", points: 20 });
  } else if (metrics.attendancePercentage < 85) {
    contributions.push({ key: "attendance", label: "Attendance below 85%", points: 8 });
  }

  if (metrics.averageMarks < 50) {
    contributions.push({ key: "marks", label: "Average marks below 50%", points: 28 });
  } else if (metrics.averageMarks < 65) {
    contributions.push({ key: "marks", label: "Average marks below 65%", points: 18 });
  } else if (metrics.averageMarks < 75) {
    contributions.push({ key: "marks", label: "Average marks below 75%", points: 8 });
  }

  if (metrics.markTrend === "declining") {
    contributions.push({ key: "trend", label: "Marks trend is declining", points: 12 });
  }

  if (metrics.overdueAssignments >= 3) {
    contributions.push({ key: "assignments", label: "Three or more assignments are overdue", points: 18 });
  } else if (metrics.missingAssignments >= 1) {
    contributions.push({ key: "assignments", label: "Assignments are pending submission", points: 9 });
  }

  if (metrics.pendingFeeAmount > 0) {
    contributions.push({ key: "fees", label: "There is a pending fee balance", points: 6 });
  }

  if (!metrics.resultCount && metrics.attendancePercentage < 75) {
    contributions.push({ key: "records", label: "Low attendance with limited published results", points: 8 });
  }

  return contributions;
};

const calculateRiskScore = (metrics) => {
  const contributions = calculateRiskBreakdown(metrics);
  const score = contributions.reduce((sum, item) => sum + item.points, 0);
  return clamp(Math.round(score), 0, 100);
};

export const getAccessibleStudents = async (user, { search = "", studentId } = {}) => {
  if (isStudentRole(user.role)) {
    return User.find({ _id: user._id, role: ROLES.STUDENT });
  }

  if (isParentRole(user.role)) {
    return User.find({ parentEmail: user.email, role: ROLES.STUDENT }).sort({ name: 1 });
  }

  const searchRegex = search ? new RegExp(search, "i") : null;
  const baseQuery = {
    role: ROLES.STUDENT,
    ...(studentId ? { _id: studentId } : {}),
    ...(searchRegex
      ? {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { rollNumber: searchRegex },
            { className: searchRegex },
          ],
        }
      : {}),
  };

  if (hasPermission(user, PERMISSIONS.USERS_MANAGE) || hasPermission(user, PERMISSIONS.ANALYTICS_VIEW)) {
    return User.find(baseQuery).sort({ name: 1 }).limit(studentId ? 1 : 25);
  }

  if (isTeachingRole(user.role) || hasPermission(user, PERMISSIONS.STUDENTS_MANAGE)) {
    const courseQuery = isTeachingRole(user.role) ? { teacher: user._id } : { department: user.department };
    const courses = await Course.find(courseQuery).select("students");
    const allowedStudentIds = [...new Set(courses.flatMap((course) => course.students.map((id) => String(id))))];

    if (!allowedStudentIds.length) {
      return [];
    }

    return User.find({
      ...baseQuery,
      _id: { $in: allowedStudentIds },
    })
      .sort({ name: 1 })
      .limit(studentId ? 1 : 25);
  }

  return [];
};

export const buildStudentRiskProfile = async (studentInput) => {
  const student = studentInput?._id
    ? studentInput
    : await User.findById(studentInput).select("name email rollNumber className department section academicSession batchId parentEmail");

  if (!student) {
    return null;
  }

  const [attendanceRows, results, fees, courses] = await Promise.all([
    Attendance.find({ "records.student": student._id }).select("date records"),
    Result.find({ student: student._id })
      .populate({
        path: "exam",
        populate: [{ path: "subject", select: "name" }],
      })
      .sort({ createdAt: 1 }),
    Fee.find({ student: student._id }).sort({ dueDate: 1 }),
    Course.find({ students: student._id }).select("_id title code"),
  ]);

  const assignments = await Assignment.find({ course: { $in: courses.map((course) => course._id) } })
    .select("title dueDate submissions")
    .sort({ dueDate: 1 });

  const attendanceMetrics = calculateAttendanceMetrics(attendanceRows, student._id);
  const academicMetrics = calculateAcademicMetrics(results);
  const assignmentMetrics = calculateAssignmentMetrics(assignments, student._id);
  const feeMetrics = calculateFeeMetrics(fees);

  const metrics = {
    ...attendanceMetrics,
    ...academicMetrics,
    ...assignmentMetrics,
    ...feeMetrics,
  };

  const riskScore = calculateRiskScore(metrics);
  const riskLevel = getRiskLevel(riskScore);
  const factors = buildFactors(metrics);
  const breakdown = calculateRiskBreakdown(metrics);

  return {
    student: {
      _id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      className: student.className,
      department: student.department,
      section: student.section,
      academicSession: student.academicSession,
    },
    metrics: {
      attendancePercentage: Math.round(metrics.attendancePercentage),
      totalClasses: metrics.totalClasses,
      averageMarks: metrics.averageMarks,
      recentAverageMarks: metrics.recentAverageMarks,
      resultCount: metrics.resultCount,
      markTrend: metrics.markTrend,
      missingAssignments: metrics.missingAssignments,
      overdueAssignments: metrics.overdueAssignments,
      submittedAssignments: metrics.submittedAssignments,
      submissionPercentage: Math.round(metrics.submissionPercentage),
      pendingFees: metrics.pendingFees,
      pendingFeeAmount: metrics.pendingFeeAmount,
      weakestSubjects: metrics.weakestSubjects,
    },
    factors,
    scoreBreakdown: breakdown,
    riskScore,
    riskLevel,
    recommendedActions: [
      metrics.attendancePercentage < 75 ? "Monitor attendance against the next two academic weeks." : "Keep attendance discipline stable.",
      metrics.averageMarks < 65 ? "Plan a focused academic support session for weaker subjects." : "Continue current study rhythm with subject revision checkpoints.",
      metrics.missingAssignments > 0 ? "Follow up on unfinished assignments and confirm recovery deadlines." : "Maintain consistent submission behaviour.",
    ],
    aiNarrative: buildLocalNarrative({
      student,
      metrics: {
        ...metrics,
        attendancePercentage: Math.round(metrics.attendancePercentage),
      },
      factors,
      riskScore,
      riskLevel,
    }),
  };
};
