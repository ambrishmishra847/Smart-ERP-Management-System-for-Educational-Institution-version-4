import Admission from "../models/Admission.js";
import AiRiskHistory from "../models/AiRiskHistory.js";
import Announcement from "../models/Announcement.js";
import AuditLog from "../models/AuditLog.js";
import Assignment from "../models/Assignment.js";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Exam from "../models/Exam.js";
import Fee from "../models/Fee.js";
import GlobalSetting from "../models/GlobalSetting.js";
import ImportJob from "../models/ImportJob.js";
import Notification from "../models/Notification.js";
import Placement from "../models/Placement.js";
import Result from "../models/Result.js";
import StudentIntervention from "../models/StudentIntervention.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import { getIO } from "../config/socket.js";
import { writeAuditLog } from "../utils/audit.js";
import { generateAiRiskNarrative, isAiProviderConfigured } from "../utils/aiRiskNarrative.js";
import { parseImportFile } from "../utils/importParser.js";
import { getImportTemplate, getImportTemplateList } from "../utils/importTemplates.js";
import { buildPaginatedResponse, buildRegexSearch, parseListQuery } from "../utils/queryHelpers.js";
import { buildStudentRiskProfile, getAccessibleStudents } from "../utils/studentRisk.js";
import {
  getDefaultPermissions,
  hasPermission,
  isParentRole,
  isStudentRole,
  isTeachingRole,
  PERMISSIONS,
  ROLES,
} from "../utils/constants.js";
import { sendMail } from "../utils/sendMail.js";

const emitNotification = async (recipient, title, message, type = "info") => {
  const notification = await Notification.create({ recipient, title, message, type });
  const io = getIO();

  if (io) {
    io.to(`user:${recipient}`).emit("notification:new", notification);
  }
};

const buildMonthQuery = (month) => {
  if (!month) {
    return null;
  }

  const [year, monthIndex] = String(month).split("-").map(Number);

  if (!year || !monthIndex) {
    return null;
  }

  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);
  return { $gte: start, $lt: end };
};

const applyScopeMetadata = (req, payload = {}) => ({
  institutionId: payload.institutionId || req.user?.institutionId || req.user?.scope?.institution,
  campusId: payload.campusId || req.user?.campusId || req.user?.scope?.campus,
  departmentId: payload.departmentId || req.user?.departmentId || req.user?.scope?.department,
  academicSession: payload.academicSession || req.user?.academicSession || req.user?.scope?.academicSession,
  batchId: payload.batchId || req.user?.batchId || req.user?.scope?.batchId,
  section: payload.section || req.user?.section || req.user?.scope?.section,
});

const canAccessStudentRisk = async (user, studentId) => {
  const students = await getAccessibleStudents(user, { studentId });
  return students.some((student) => String(student._id) === String(studentId));
};

const buildImportScope = (req) => ({
  institutionId: req.user?.institutionId || req.user?.scope?.institution,
  campusId: req.user?.campusId || req.user?.scope?.campus,
  departmentId: req.user?.departmentId || req.user?.scope?.department,
  academicSession: req.user?.academicSession || req.user?.scope?.academicSession,
  batchId: req.user?.batchId || req.user?.scope?.batchId,
  section: req.user?.section || req.user?.scope?.section,
});

const summarizeImportErrors = (errors = []) => {
  const duplicateCount = errors.filter((item) => /already exists|already|duplicate/i.test(item.message || "")).length;
  return {
    duplicateCount,
    validationErrorCount: errors.length - duplicateCount,
  };
};

const importEntityModels = {
  Admission,
  Announcement,
  Course,
  Fee,
  Placement,
  User,
};

const deleteImportedEntity = async (entity) => {
  const model = importEntityModels[entity.entityType];
  if (!model || !entity.entityId) {
    return { removed: false, missing: true, note: `Unsupported entity type ${entity.entityType || "unknown"}.` };
  }

  const existing = await model.findById(entity.entityId);
  if (!existing) {
    return { removed: false, missing: true, note: `${entity.entityType} ${entity.entityId} was already missing.` };
  }

  await model.findByIdAndDelete(entity.entityId);
  return { removed: true, missing: false, note: `${entity.entityType} ${entity.entityId} rolled back.` };
};

export const getUsers = async (req, res) => {
  const { page, limit, skip, search, sort, paginationRequested } = parseListQuery(req.query, {
    defaultLimit: 100,
    allowedSortFields: ["createdAt", "name", "email", "role", "className", "department"],
  });

  const filters = {
    ...buildRegexSearch(search, ["name", "email", "username", "rollNumber", "employeeId", "className", "department"]),
    ...(req.query.role ? { role: req.query.role } : {}),
    ...(req.query.status === "suspended" ? { isSuspended: true } : {}),
    ...(req.query.status === "active" ? { isSuspended: false } : {}),
  };

  const [users, total] = await Promise.all([
    User.find(filters).select("-password").sort(sort).skip(skip).limit(limit),
    User.countDocuments(filters),
  ]);

  if (paginationRequested || search || req.query.role || req.query.status) {
    return res.json(buildPaginatedResponse({ rows: users, total, page, limit }));
  }

  res.json(users);
};

export const getAuditLogs = async (req, res) => {
  const { page, limit, skip, search, sort } = parseListQuery(req.query, {
    defaultLimit: 50,
    allowedSortFields: ["timestamp", "action", "entityType", "status", "actorRole"],
    defaultSort: { timestamp: -1 },
  });

  const query = {
    ...(req.query.entityType ? { entityType: req.query.entityType } : {}),
    ...(req.query.action ? { action: req.query.action } : {}),
    ...(req.query.status ? { status: req.query.status } : {}),
    ...buildRegexSearch(search, ["action", "entityType", "entityId", "actorRole"]),
  };

  const [rows, total] = await Promise.all([
    AuditLog.find(query).populate("actor", "name email role").sort(sort).skip(skip).limit(limit),
    AuditLog.countDocuments(query),
  ]);

  res.json(buildPaginatedResponse({ rows, total, page, limit }));
};

export const getManagedUsers = async (req, res) => {
  const { role, q = "" } = req.query;
  const search = String(q).trim();
  const searchRegex = search ? new RegExp(search, "i") : null;

  if (hasPermission(req.user, PERMISSIONS.USERS_MANAGE)) {
    const { page, limit, skip, sort } = parseListQuery(req.query, {
      defaultLimit: 100,
      allowedSortFields: ["name", "email", "className", "department", "rollNumber", "employeeId", "createdAt"],
    });
    const query = {
      ...(role ? { role } : {}),
      ...(searchRegex
        ? {
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { className: searchRegex },
              { department: searchRegex },
              { rollNumber: searchRegex },
              { employeeId: searchRegex },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort(Object.keys(sort).length ? sort : { name: 1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    if (req.query.page || req.query.limit || search || role) {
      return res.json(buildPaginatedResponse({ rows: users, total, page, limit }));
    }
    return res.json(users);
  }

  if (hasPermission(req.user, PERMISSIONS.STUDENTS_MANAGE)) {
    const courses = await Course.find({ teacher: req.user._id }).select("students");
    const studentIds = courses.length
      ? [...new Set(courses.flatMap((course) => course.students.map((id) => String(id))))]
      : (await User.find({ role: ROLES.STUDENT }).select("_id")).map((user) => String(user._id));
    const { page, limit, skip } = parseListQuery(req.query, { defaultLimit: 100 });
    const studentQuery = {
      _id: { $in: studentIds },
      role: ROLES.STUDENT,
      ...(searchRegex
        ? {
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { className: searchRegex },
              { rollNumber: searchRegex },
            ],
          }
        : {}),
    };
    const [users, total] = await Promise.all([
      User.find(studentQuery).select("-password").sort({ name: 1 }).skip(skip).limit(limit),
      User.countDocuments(studentQuery),
    ]);
    if (req.query.page || req.query.limit || search) {
      return res.json(buildPaginatedResponse({ rows: users, total, page, limit }));
    }
    return res.json(users);
  }

  return res.status(403).json({ message: "Access denied." });
};

export const createUser = async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Please select a role." });
  }

  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {
    return res.status(400).json({ message: "A user with this email already exists." });
  }

  const user = await User.create({
    ...req.body,
    ...applyScopeMetadata(req, req.body),
    mustChangePassword: req.body.mustChangePassword ?? true,
    permissions: req.body.permissions?.length ? req.body.permissions : getDefaultPermissions(role),
  });
  const safeUser = await User.findById(user._id).select("-password");

  await emitNotification(
    user._id,
    "Account Created",
    "Your Smart ERP account has been created. Please sign in with your assigned credentials.",
    "success"
  );

  await writeAuditLog(req, {
    action: "users.create",
    entityType: "User",
    entityId: String(user._id),
    after: {
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
      campusId: user.campusId,
      departmentId: user.departmentId,
    },
  });

  res.status(201).json(safeUser);
};

export const deleteUser = async (req, res) => {
  const existingUser = await User.findById(req.params.id).select("-password");
  const user = await User.findByIdAndDelete(req.params.id);

  if (existingUser) {
    await writeAuditLog(req, {
      action: "users.delete",
      entityType: "User",
      entityId: String(existingUser._id),
      before: {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  }

  res.json({ message: `${user?.name || "User"} removed successfully.` });
};

export const updateUserSuspension = async (req, res) => {
  const { isSuspended, reason = "" } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot suspend your own account." });
  }

  user.isSuspended = Boolean(isSuspended);
  user.suspensionReason = user.isSuspended ? String(reason).trim() : "";
  user.suspendedAt = user.isSuspended ? new Date() : null;
  user.suspendedBy = user.isSuspended ? req.user._id : null;
  await user.save();

  await writeAuditLog(req, {
    action: user.isSuspended ? "users.suspend" : "users.restore",
    entityType: "User",
    entityId: String(user._id),
    before: {
      isSuspended: !user.isSuspended,
    },
    after: {
      isSuspended: user.isSuspended,
      suspensionReason: user.suspensionReason,
    },
  });

  if (user.isSuspended) {
    await emitNotification(
      user._id,
      "Account Suspended",
      user.suspensionReason || "Your ERP access has been suspended by an administrator.",
      "warning"
    );
  } else {
    await emitNotification(user._id, "Account Restored", "Your ERP access has been restored.", "success");
  }

  const safeUser = await User.findById(user._id).select("-password");
  res.json(safeUser);
};

export const getImportTemplates = async (req, res) => {
  res.json(getImportTemplateList());
};

export const getImportHistory = async (req, res) => {
  const { page, limit, skip } = parseListQuery(req.query, {
    defaultLimit: 20,
    allowedSortFields: ["createdAt", "target", "mode"],
  });
  const query = {
    ...(req.query.target ? { target: req.query.target } : {}),
  };

  const [rows, total] = await Promise.all([
    ImportJob.find(query).populate("createdBy", "name role").sort({ createdAt: -1 }).skip(skip).limit(limit),
    ImportJob.countDocuments(query),
  ]);

  res.json(buildPaginatedResponse({ rows, total, page, limit }));
};

export const getImportJobDetails = async (req, res) => {
  const job = await ImportJob.findById(req.params.id).populate("createdBy", "name role").populate("rolledBackBy", "name role");

  if (!job) {
    return res.status(404).json({ message: "Import job not found." });
  }

  res.json(job);
};

export const previewImportRecords = async (req, res) => {
  const { target } = req.params;
  const template = getImportTemplate(target);

  if (!template) {
    return res.status(400).json({ message: "Unsupported import target." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file to preview." });
  }

  const parsedRows = await parseImportFile(req.file);
  if (!parsedRows.length) {
    return res.status(400).json({ message: "No usable rows could be extracted from the uploaded file." });
  }

  const models = { Admission, Announcement, Course, Fee, Placement, User };
  const summary = {
    target,
    mode: "preview",
    fileName: req.file.originalname,
    totalRows: parsedRows.length,
    imported: 0,
    skipped: 0,
    errors: [],
    preview: [],
    rowDetails: [],
  };

  for (let index = 0; index < parsedRows.length; index += 1) {
    try {
      const mapped = await template.mapRow(parsedRows[index], { req, models });
      const validationError = template.validate(mapped, { req, models });
      const duplicateCheck = validationError || !template.checkDuplicate
        ? { isDuplicate: false }
        : await template.checkDuplicate(mapped, { req, models });

      if (validationError) {
        summary.skipped += 1;
        summary.errors.push({ row: index + 2, message: validationError });
        summary.rowDetails.push({
          row: index + 2,
          status: "validation-error",
          message: validationError,
          mapped,
        });
      } else if (duplicateCheck?.isDuplicate) {
        summary.skipped += 1;
        summary.errors.push({ row: index + 2, message: duplicateCheck.message });
        summary.rowDetails.push({
          row: index + 2,
          status: "duplicate",
          message: duplicateCheck.message,
          mapped,
        });
      } else {
        summary.imported += 1;
        summary.rowDetails.push({
          row: index + 2,
          status: "ready",
          message: "Ready to import.",
          mapped,
        });
      }

      if (summary.preview.length < 10) {
        summary.preview.push({
          row: index + 2,
          mapped,
          valid: !validationError && !duplicateCheck?.isDuplicate,
          duplicate: Boolean(duplicateCheck?.isDuplicate),
          duplicateMessage: duplicateCheck?.message || "",
          validationError,
        });
      }
    } catch (error) {
      summary.skipped += 1;
      summary.errors.push({ row: index + 2, message: error.message || "Row preview failed." });
      summary.rowDetails.push({
        row: index + 2,
        status: "error",
        message: error.message || "Row preview failed.",
        mapped: null,
      });
    }
  }

  const errorSummary = summarizeImportErrors(summary.errors);
  const job = await ImportJob.create({
    ...buildImportScope(req),
    target,
    mode: "preview",
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    totalRows: summary.totalRows,
    imported: summary.imported,
    skipped: summary.skipped,
    duplicateCount: errorSummary.duplicateCount,
    validationErrorCount: errorSummary.validationErrorCount,
    preview: summary.preview,
    errors: summary.errors.slice(0, 25),
    rowDetails: summary.rowDetails.slice(0, 100),
    createdBy: req.user._id,
  });

  await writeAuditLog(req, {
    action: "imports.preview",
    entityType: "Import",
    entityId: String(job._id),
    metadata: summary,
  });

  res.status(201).json({
    ...summary,
    duplicateCount: errorSummary.duplicateCount,
    validationErrorCount: errorSummary.validationErrorCount,
    jobId: String(job._id),
  });
};

export const importRecords = async (req, res) => {
  const { target } = req.params;
  const template = getImportTemplate(target);

  if (!template) {
    return res.status(400).json({ message: "Unsupported import target." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file to import." });
  }

  const parsedRows = await parseImportFile(req.file);
  if (!parsedRows.length) {
    return res.status(400).json({ message: "No usable rows could be extracted from the uploaded file." });
  }

  const models = { Admission, Announcement, Course, Fee, Placement, User };
  const summary = {
    target,
    mode: "commit",
    fileName: req.file.originalname,
    totalRows: parsedRows.length,
    imported: 0,
    skipped: 0,
    errors: [],
    preview: [],
    rowDetails: [],
    createdEntities: [],
  };

  for (let index = 0; index < parsedRows.length; index += 1) {
    try {
      const mapped = await template.mapRow(parsedRows[index], { req, models });
      const validationError = template.validate(mapped, { req, models });

      if (validationError) {
        summary.skipped += 1;
        summary.errors.push({ row: index + 2, message: validationError });
        summary.rowDetails.push({
          row: index + 2,
          status: "validation-error",
          message: validationError,
          mapped,
        });
        continue;
      }

      const result = await template.create(mapped, { req, models, emitNotification });

      if (result?.skipped) {
        summary.skipped += 1;
        summary.errors.push({ row: index + 2, message: result.reason });
        summary.rowDetails.push({
          row: index + 2,
          status: /duplicate|already/i.test(result.reason || "") ? "duplicate" : "skipped",
          message: result.reason,
          mapped,
        });
        continue;
      }

      summary.imported += 1;
      if (result?.createdEntity) {
        summary.createdEntities.push(result.createdEntity);
      }
      summary.rowDetails.push({
        row: index + 2,
        status: "imported",
        message: "Imported successfully.",
        mapped,
        createdEntity: result?.createdEntity || null,
      });
      if (summary.preview.length < 5) {
        summary.preview.push({
          row: index + 2,
          mapped,
          valid: true,
          duplicate: false,
          validationError: null,
        });
      }
    } catch (error) {
      summary.skipped += 1;
      summary.errors.push({ row: index + 2, message: error.message || "Row import failed." });
      summary.rowDetails.push({
        row: index + 2,
        status: "error",
        message: error.message || "Row import failed.",
        mapped: null,
      });
    }
  }

  const errorSummary = summarizeImportErrors(summary.errors);
  const job = await ImportJob.create({
    ...buildImportScope(req),
    target,
    mode: "commit",
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    totalRows: summary.totalRows,
    imported: summary.imported,
    skipped: summary.skipped,
    duplicateCount: errorSummary.duplicateCount,
    validationErrorCount: errorSummary.validationErrorCount,
    preview: summary.preview,
    errors: summary.errors.slice(0, 25),
    rowDetails: summary.rowDetails.slice(0, 100),
    createdEntities: summary.createdEntities,
    createdBy: req.user._id,
  });

  await writeAuditLog(req, {
    action: "imports.run",
    entityType: "Import",
    entityId: String(job._id),
    metadata: summary,
  });

  res.status(201).json({
    ...summary,
    duplicateCount: errorSummary.duplicateCount,
    validationErrorCount: errorSummary.validationErrorCount,
    jobId: String(job._id),
  });
};

export const rollbackImportJob = async (req, res) => {
  const job = await ImportJob.findById(req.params.id);

  if (!job) {
    return res.status(404).json({ message: "Import job not found." });
  }

  if (job.mode !== "commit") {
    return res.status(400).json({ message: "Only committed imports can be rolled back." });
  }

  if (job.status === "rolled-back") {
    return res.status(400).json({ message: "This import job has already been rolled back." });
  }

  const createdEntities = Array.isArray(job.createdEntities) ? job.createdEntities.slice().reverse() : [];
  const results = [];

  for (const entity of createdEntities) {
    results.push(await deleteImportedEntity(entity));
  }

  const rolledBackCount = results.filter((item) => item.removed).length;
  const missingCount = results.filter((item) => item.missing).length;
  job.status = "rolled-back";
  job.rolledBackAt = new Date();
  job.rolledBackBy = req.user._id;
  job.rollbackSummary = {
    rolledBackCount,
    missingCount,
    notes: results.map((item) => item.note),
  };
  await job.save();

  await writeAuditLog(req, {
    action: "imports.rollback",
    entityType: "Import",
    entityId: String(job._id),
    metadata: {
      target: job.target,
      rolledBackCount,
      missingCount,
    },
  });

  res.json({
    message: "Import rollback completed.",
    rolledBackCount,
    missingCount,
    notes: job.rollbackSummary.notes,
  });
};

export const getCourses = async (req, res) => {
  const query =
    isTeachingRole(req.user.role)
      ? { teacher: req.user._id }
      : isStudentRole(req.user.role)
        ? { students: req.user._id }
        : {};

  const courses = await Course.find(query)
    .populate("teacher", "name email")
    .populate("students", "name email className rollNumber")
    .populate("materials.subject", "name")
    .populate("materials.uploadedBy", "name role employeeId");
  res.json(courses);
};

export const createCourse = async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
};

export const deleteCourse = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Course removed successfully." });
};

export const getSubjects = async (req, res) => {
  const subjects = await Subject.find().populate("course", "title").populate("teacher", "name employeeId role");
  res.json(subjects);
};

export const createSubject = async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json(subject);
};

export const deleteSubject = async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ message: "Subject removed successfully." });
};

export const getAnnouncements = async (req, res) => {
  if (!hasPermission(req.user, PERMISSIONS.ANNOUNCEMENTS_VIEW) && !hasPermission(req.user, PERMISSIONS.ANNOUNCEMENTS_MANAGE)) {
    return res.status(403).json({ message: "Access denied." });
  }

  const query = hasPermission(req.user, PERMISSIONS.ANNOUNCEMENTS_MANAGE)
    ? {
        ...(req.query.priority ? { priority: req.query.priority } : {}),
        ...buildRegexSearch(String(req.query.q || "").trim(), ["title", "content"]),
      }
    : {
        audience: req.user.role,
        ...(req.query.priority ? { priority: req.query.priority } : {}),
        ...buildRegexSearch(String(req.query.q || "").trim(), ["title", "content"]),
      };

  const { page, limit, skip, sort, paginationRequested } = parseListQuery(req.query, {
    defaultLimit: 50,
    allowedSortFields: ["createdAt", "priority", "title"],
  });

  const [announcements, total] = await Promise.all([
    Announcement.find(query).populate("author", "name role").sort(sort).skip(skip).limit(limit),
    Announcement.countDocuments(query),
  ]);

  if (paginationRequested || req.query.q || req.query.priority) {
    return res.json(buildPaginatedResponse({ rows: announcements, total, page, limit }));
  }

  res.json(announcements);
};

export const createAnnouncement = async (req, res) => {
  const announcement = await Announcement.create({
    ...req.body,
    ...applyScopeMetadata(req, req.body),
    author: req.user._id,
  });

  const recipients = await User.find({ role: { $in: announcement.audience } }).select("_id email name");
  await Promise.all(
    recipients.map((recipient) =>
      emitNotification(recipient._id, "New Announcement", announcement.title, announcement.priority)
    )
  );

  await Promise.all(
    recipients
      .filter((recipient) => recipient.email)
      .map((recipient) =>
        sendMail({
          to: recipient.email,
          subject: `[Smart ERP] ${announcement.title}`,
          html: `
            <div style="font-family:Arial,sans-serif;color:#0f172a">
              <h2>${announcement.title}</h2>
              <p>${announcement.content}</p>
              <p><strong>Priority:</strong> ${announcement.priority}</p>
              <p>This update was sent from Smart ERP.</p>
            </div>
          `,
        }).catch(() => null)
      )
  );

  await writeAuditLog(req, {
    action: "announcements.create",
    entityType: "Announcement",
    entityId: String(announcement._id),
    after: {
      title: announcement.title,
      priority: announcement.priority,
      audience: announcement.audience,
    },
  });

  res.status(201).json(announcement);
};

export const deleteAnnouncement = async (req, res) => {
  const existingAnnouncement = await Announcement.findById(req.params.id);
  const filter =
    req.user.role === ROLES.SUPER_ADMIN ? { _id: req.params.id } : { _id: req.params.id, author: req.user._id };
  await Announcement.findOneAndDelete(filter);

  if (existingAnnouncement) {
    await writeAuditLog(req, {
      action: "announcements.delete",
      entityType: "Announcement",
      entityId: String(existingAnnouncement._id),
      before: {
        title: existingAnnouncement.title,
        priority: existingAnnouncement.priority,
        audience: existingAnnouncement.audience,
      },
    });
  }

  res.json({ message: "Announcement removed successfully." });
};

export const getTimetable = async (req, res) => {
  let timetableQuery = {};

  if (isTeachingRole(req.user.role)) {
    timetableQuery = { teacher: req.user._id };
  }

  if (isStudentRole(req.user.role)) {
    const courses = await Course.find({ students: req.user._id }).select("_id");
    timetableQuery = { course: { $in: courses.map((course) => course._id) } };
  }

  const timetable = await Timetable.find(timetableQuery)
    .populate("course", "title")
    .populate("subject", "name")
    .populate("teacher", "name");
  res.json(timetable);
};

export const createTimetable = async (req, res) => {
  const conflictingEntry = await Timetable.findOne({
    day: req.body.day,
    $or: [{ teacher: req.body.teacher }, { room: req.body.room }],
    startTime: { $lt: req.body.endTime },
    endTime: { $gt: req.body.startTime },
  })
    .populate("teacher", "name")
    .populate("course", "title");

  if (conflictingEntry) {
    return res.status(400).json({
      message: `Conflict detected with ${conflictingEntry.course?.title || "an existing class"} for ${
        conflictingEntry.teacher?.name || "this teacher"
      } in room ${conflictingEntry.room}.`,
    });
  }

  const entry = await Timetable.create(req.body);
  res.status(201).json(entry);
};

export const deleteTimetable = async (req, res) => {
  await Timetable.findByIdAndDelete(req.params.id);
  res.json({ message: "Timetable entry removed successfully." });
};

export const getAssignments = async (req, res) => {
  let query = {};

  if (isTeachingRole(req.user.role)) {
    query = { teacher: req.user._id };
  }

  if (isStudentRole(req.user.role)) {
    const courses = await Course.find({ students: req.user._id }).select("_id");
    query = { course: { $in: courses.map((course) => course._id) } };
  }

  const assignments = await Assignment.find(query)
    .populate("course", "title")
    .populate("subject", "name")
    .populate("teacher", "name")
    .populate("submissions.student", "name rollNumber");
  res.json(assignments);
};

export const createAssignment = async (req, res) => {
  const assignment = await Assignment.create({
    ...req.body,
    teacher: req.user._id,
  });

  const course = await Course.findById(assignment.course);
  await Promise.all(
    course.students.map((studentId) =>
      emitNotification(studentId, "New Assignment", assignment.title, "info")
    )
  );

  res.status(201).json(assignment);
};

export const deleteAssignment = async (req, res) => {
  const filter =
    req.user.role === ROLES.SUPER_ADMIN ? { _id: req.params.id } : { _id: req.params.id, teacher: req.user._id };
  await Assignment.findOneAndDelete(filter);
  res.json({ message: "Assignment removed successfully." });
};

export const submitAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  const existingSubmission = assignment.submissions.find(
    (submission) => String(submission.student) === String(req.user._id)
  );

  if (existingSubmission) {
    existingSubmission.fileUrl = req.body.fileUrl;
    existingSubmission.submittedAt = new Date();
  } else {
    assignment.submissions.push({
      student: req.user._id,
      fileUrl: req.body.fileUrl,
      submittedAt: new Date(),
    });
  }

  await assignment.save();
  res.json(assignment);
};

export const getAttendance = async (req, res) => {
  const { month, subject, course, student } = req.query;
  let query = {};

  if (isTeachingRole(req.user.role)) {
    const subjects = await Subject.find({ teacher: req.user._id }).select("_id");
    query = { subject: { $in: subjects.map((subject) => subject._id) } };
  }

  if (isStudentRole(req.user.role)) {
    query = { "records.student": req.user._id };
  }

  if (isParentRole(req.user.role)) {
    const students = await User.find({ parentEmail: req.user.email, role: ROLES.STUDENT }).select("_id");
    query = { "records.student": { $in: students.map((student) => student._id) } };
  }

  const monthQuery = buildMonthQuery(month);
  if (monthQuery) {
    query.date = monthQuery;
  }

  if (subject) {
    query.subject = subject;
  }

  if (course) {
    query.course = course;
  }

  if (student && (hasPermission(req.user, PERMISSIONS.USERS_MANAGE) || isTeachingRole(req.user.role))) {
    query["records.student"] = student;
  }

  const attendance = await Attendance.find(query)
    .populate("course", "title")
    .populate("subject", "name")
    .populate("records.student", "name className rollNumber");
  res.json(attendance);
};

export const markAttendance = async (req, res) => {
  const subject = await Subject.findById(req.body.subject);

  if (!subject || String(subject.teacher) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only mark attendance for your assigned subjects." });
  }

  if (String(subject.course) !== String(req.body.course)) {
    return res.status(400).json({ message: "Selected subject does not belong to the chosen course." });
  }

  const course = await Course.findById(req.body.course).select("students");
  const allowedStudentIds = new Set(course?.students.map((id) => String(id)) || []);
  const invalidRecord = req.body.records.find((item) => !allowedStudentIds.has(String(item.student)));

  if (invalidRecord) {
    return res.status(400).json({ message: "Attendance can only be marked for students enrolled in the selected course." });
  }

  const attendance = await Attendance.findOneAndUpdate(
    {
      course: req.body.course,
      subject: req.body.subject,
      date: new Date(req.body.date),
    },
    {
      ...req.body,
      date: new Date(req.body.date),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(attendance);
};

export const deleteAttendance = async (req, res) => {
  await Attendance.findByIdAndDelete(req.params.id);
  res.json({ message: "Attendance record removed successfully." });
};

export const getFees = async (req, res) => {
  let query = {};

  if (isStudentRole(req.user.role)) {
    query = { student: req.user._id };
  }

  if (isParentRole(req.user.role)) {
    const students = await User.find({ parentEmail: req.user.email, role: ROLES.STUDENT }).select("_id");
    query = { student: { $in: students.map((student) => student._id) } };
  }

  const fees = await Fee.find(query).populate("student", "name className rollNumber");
  res.json(fees);
};

export const createFee = async (req, res) => {
  const fee = await Fee.create(req.body);
  await emitNotification(fee.student, "Fee Record Updated", "Your fee status has been updated.", "warning");
  res.status(201).json(fee);
};

export const deleteFee = async (req, res) => {
  await Fee.findByIdAndDelete(req.params.id);
  res.json({ message: "Fee record removed successfully." });
};

export const getNotifications = async (req, res) => {
  const { page, limit, skip, paginationRequested } = parseListQuery(req.query, {
    defaultLimit: 20,
    allowedSortFields: ["createdAt"],
  });
  const query = {
    recipient: req.user._id,
    ...(req.query.isRead === "true" ? { isRead: true } : {}),
    ...(req.query.isRead === "false" ? { isRead: false } : {}),
  };
  const [notifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
  ]);

  if (req.query.page || req.query.isRead) {
    return res.json(buildPaginatedResponse({ rows: notifications, total, page, limit }));
  }

  res.json(notifications);
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  res.json(notification);
};

export const getAdmissions = async (req, res) => {
  const { page, limit, skip, sort, search, paginationRequested } = parseListQuery(req.query, {
    defaultLimit: 100,
    allowedSortFields: ["createdAt", "studentName", "program", "status", "score", "academicYear"],
  });
  const query = {
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.program ? { program: req.query.program } : {}),
    ...buildRegexSearch(search, ["studentName", "email", "program", "academicYear", "notes"]),
  };

  const [admissions, total] = await Promise.all([
    Admission.find(query).sort(sort).skip(skip).limit(limit),
    Admission.countDocuments(query),
  ]);

  if (paginationRequested || search || req.query.status || req.query.program) {
    return res.json(buildPaginatedResponse({ rows: admissions, total, page, limit }));
  }

  res.json(admissions);
};

export const createAdmission = async (req, res) => {
  const admission = await Admission.create({
    ...req.body,
    ...applyScopeMetadata(req, req.body),
  });

  await writeAuditLog(req, {
    action: "admissions.create",
    entityType: "Admission",
    entityId: String(admission._id),
    after: {
      studentName: admission.studentName,
      email: admission.email,
      program: admission.program,
      status: admission.status,
    },
  });

  res.status(201).json(admission);
};

export const updateAdmission = async (req, res) => {
  const allowedFields = [
    "studentName",
    "email",
    "phone",
    "program",
    "academicYear",
    "source",
    "documentsVerified",
    "score",
    "status",
    "notes",
  ];

  const payload = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  if ("score" in payload) {
    payload.score = Number(payload.score || 0);
  }

  const admission = await Admission.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

  if (!admission) {
    return res.status(404).json({ message: "Admission record not found." });
  }

  await writeAuditLog(req, {
    action: "admissions.update",
    entityType: "Admission",
    entityId: String(admission._id),
    after: payload,
  });

  res.json(admission);
};

export const deleteAdmission = async (req, res) => {
  const existingAdmission = await Admission.findById(req.params.id);
  await Admission.findByIdAndDelete(req.params.id);

  if (existingAdmission) {
    await writeAuditLog(req, {
      action: "admissions.delete",
      entityType: "Admission",
      entityId: String(existingAdmission._id),
      before: {
        studentName: existingAdmission.studentName,
        email: existingAdmission.email,
        status: existingAdmission.status,
      },
    });
  }

  res.json({ message: "Admission lead removed successfully." });
};

export const getExams = async (req, res) => {
  let query = {};

  if (isStudentRole(req.user.role)) {
    const courses = await Course.find({ students: req.user._id }).select("_id");
    query = { course: { $in: courses.map((course) => course._id) } };
  }

  if (isTeachingRole(req.user.role)) {
    const subjects = await Subject.find({ teacher: req.user._id }).select("_id");
    query = { subject: { $in: subjects.map((subject) => subject._id) } };
  }

  const exams = await Exam.find(query)
    .populate("course", "title")
    .populate("subject", "name")
    .sort({ examDate: 1 });
  res.json(exams);
};

export const createExam = async (req, res) => {
  const exam = await Exam.create(req.body);
  res.status(201).json(exam);
};

export const deleteExam = async (req, res) => {
  await Exam.findByIdAndDelete(req.params.id);
  res.json({ message: "Exam removed successfully." });
};

export const getResults = async (req, res) => {
  let query = {};

  if (isStudentRole(req.user.role)) {
    query = { student: req.user._id };
  }

  if (isParentRole(req.user.role)) {
    const students = await User.find({ parentEmail: req.user.email, role: ROLES.STUDENT }).select("_id");
    query = { student: { $in: students.map((student) => student._id) } };
  }

  const results = await Result.find(query)
    .populate({
      path: "exam",
      populate: [
        { path: "subject", select: "name" },
        { path: "course", select: "title" },
      ],
    })
    .populate("student", "name className rollNumber")
    .sort({ createdAt: -1 });

  res.json(results);
};

export const createResult = async (req, res) => {
  const result = await Result.create({
    ...req.body,
    publishedAt: new Date(),
  });

  await emitNotification(
    result.student,
    "Result Published",
    "A new exam result has been published to your Smart ERP profile.",
    "success"
  );

  res.status(201).json(result);
};

export const deleteResult = async (req, res) => {
  await Result.findByIdAndDelete(req.params.id);
  res.json({ message: "Result removed successfully." });
};

export const getPlacements = async (req, res) => {
  const { page, limit, skip, sort, search, paginationRequested } = parseListQuery(req.query, {
    defaultLimit: 50,
    allowedSortFields: ["createdAt", "companyName", "deadline", "packageLpa", "roleTitle"],
  });
  const query = {
    ...(req.query.active === "true" ? { deadline: { $gte: new Date() } } : {}),
    ...buildRegexSearch(search, ["companyName", "roleTitle", "location", "eligibility"]),
  };
  const [placements, total] = await Promise.all([
    Placement.find(query)
      .populate("postedBy", "name role")
      .populate("applications.student", "name className rollNumber")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Placement.countDocuments(query),
  ]);

  if (paginationRequested || search || req.query.active) {
    return res.json(buildPaginatedResponse({ rows: placements, total, page, limit }));
  }

  res.json(placements);
};

export const createPlacement = async (req, res) => {
  const placement = await Placement.create({
    ...req.body,
    ...applyScopeMetadata(req, req.body),
    postedBy: req.user._id,
  });

  const students = await User.find({ role: ROLES.STUDENT }).select("_id email");
  await Promise.all(
    students.map((student) =>
      emitNotification(student._id, "New Placement Drive", `${placement.companyName} - ${placement.roleTitle}`, "info")
    )
  );

  await writeAuditLog(req, {
    action: "placements.create",
    entityType: "Placement",
    entityId: String(placement._id),
    after: {
      companyName: placement.companyName,
      roleTitle: placement.roleTitle,
      deadline: placement.deadline,
    },
  });
  res.status(201).json(placement);
};

export const applyToPlacement = async (req, res) => {
  const placement = await Placement.findById(req.params.id);

  if (placement.applications.some((application) => String(application.student) === String(req.user._id))) {
    return res.status(400).json({ message: "You have already applied to this placement." });
  }

  placement.applications.push({ student: req.user._id });
  await placement.save();

  if (placement.postedBy) {
    await emitNotification(placement.postedBy, "Placement Application", `${req.user.name} applied for ${placement.companyName}`, "success");
  }

  res.json(placement);
};

export const addCourseMaterial = async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: "Course not found." });
  }

  if (isTeachingRole(req.user.role) && String(course.teacher) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only upload materials for your assigned courses." });
  }

  course.materials.push({
    ...req.body,
    uploadedBy: req.user._id,
  });
  await course.save();

  const populatedCourse = await Course.findById(req.params.id)
    .populate("materials.subject", "name")
    .populate("materials.uploadedBy", "name role employeeId");

  await Promise.all(
    course.students.map((studentId) =>
      emitNotification(studentId, "New Study Material", req.body.title || "A new material has been uploaded.", "info")
    )
  );

  res.status(201).json(populatedCourse.materials.at(-1));
};

export const deleteCourseMaterial = async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: "Course not found." });
  }

  if (isTeachingRole(req.user.role) && String(course.teacher) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only remove materials for your assigned courses." });
  }

  course.materials = course.materials.filter((material) => String(material._id) !== String(req.params.materialId));
  await course.save();
  res.json({ message: "Study material removed successfully." });
};

export const deletePlacement = async (req, res) => {
  const existingPlacement = await Placement.findById(req.params.id);
  const filter =
    req.user.role === ROLES.SUPER_ADMIN ? { _id: req.params.id } : { _id: req.params.id, postedBy: req.user._id };
  await Placement.findOneAndDelete(filter);

  if (existingPlacement) {
    await writeAuditLog(req, {
      action: "placements.delete",
      entityType: "Placement",
      entityId: String(existingPlacement._id),
      before: {
        companyName: existingPlacement.companyName,
        roleTitle: existingPlacement.roleTitle,
        deadline: existingPlacement.deadline,
      },
    });
  }

  res.json({ message: "Placement opportunity removed successfully." });
};

export const getAnalytics = async (req, res) => {
  if (req.user.role === ROLES.SUPER_ADMIN) {
    const [
      usersByRole,
      feeByStatus,
      admissionsByStatus,
      placements,
      examsByType,
      topCourses,
    ] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", value: { $sum: 1 } } }]),
      Fee.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }]),
      Admission.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }]),
      Placement.find().populate("applications.student", "_id"),
      Exam.aggregate([{ $group: { _id: "$examType", value: { $sum: 1 } } }]),
      Course.find().populate("students", "_id").populate("teacher", "name"),
    ]);

    return res.json({
      summary: {
        totalUsers: usersByRole.reduce((sum, item) => sum + item.value, 0),
        activePlacements: placements.length,
        totalApplications: placements.reduce((sum, item) => sum + item.applications.length, 0),
        verifiedAdmissions: admissionsByStatus.find((item) => item._id === "verified")?.value || 0,
      },
      insights: {
        predictive: [
          "Admission momentum is strongest in verified and under-review leads.",
          placements.length > 0
            ? "Placement participation is active enough to forecast higher application volume next cycle."
            : "Low placement activity suggests outreach is needed before the next drive.",
        ],
        prescriptive: [
          "Follow up with unverified admissions within 48 hours.",
          "Open new placement drives for final-year batches and track application conversion weekly.",
        ],
      },
      charts: {
        usersByRole: usersByRole.map((item) => ({ name: item._id, value: item.value })),
        feeByStatus: feeByStatus.map((item) => ({ name: item._id, value: item.value })),
        admissionsByStatus: admissionsByStatus.map((item) => ({ name: item._id, value: item.value })),
        examsByType: examsByType.map((item) => ({ name: item._id, value: item.value })),
        placementApplications: placements.map((item) => ({ name: item.companyName, value: item.applications.length })),
        topCourses: topCourses.map((item) => ({ name: item.title, students: item.students.length })),
      },
    });
  }

  if (isTeachingRole(req.user.role)) {
    const teacherSubjects = await Subject.find({ teacher: req.user._id }).select("_id");
    const teacherCourses = await Course.find({ teacher: req.user._id }).populate("students", "_id");
    const [assignmentCount, examCount, attendanceCount] = await Promise.all([
      Assignment.countDocuments({ teacher: req.user._id }),
      Exam.countDocuments({ subject: { $in: teacherSubjects.map((item) => item._id) } }),
      Attendance.countDocuments({ subject: { $in: teacherSubjects.map((item) => item._id) } }),
    ]);

    return res.json({
      summary: {
        totalCourses: teacherCourses.length,
        totalStudents: teacherCourses.reduce((sum, item) => sum + item.students.length, 0),
        assignments: assignmentCount,
        exams: examCount,
      },
      insights: {
        mastery: teacherCourses.map((course) => ({
          topic: course.title,
          status: course.students.length > 0 ? "Track concept mastery with next assessment" : "No active student roster",
        })),
        prescriptive: [
          "Re-teach topics with low assignment completion before the next exam.",
          "Use quick quizzes to validate concept retention after each unit.",
        ],
      },
      charts: {
        courseStrength: teacherCourses.map((item) => ({ name: item.title, value: item.students.length })),
        workload: [
          { name: "Assignments", value: assignmentCount },
          { name: "Exams", value: examCount },
          { name: "Attendance", value: attendanceCount },
        ],
      },
    });
  }

  const [studentResults, studentAssignments, studentFees] = await Promise.all([
    Result.find({ student: req.user._id }).populate({
      path: "exam",
      populate: { path: "subject", select: "name" },
    }),
    Assignment.find({ "submissions.student": req.user._id }).populate("subject", "name"),
    Fee.find({ student: req.user._id }),
  ]);

  const avgMarks =
    studentResults.length > 0
      ? Math.round(studentResults.reduce((sum, item) => sum + item.marksObtained, 0) / studentResults.length)
      : 0;
  const pendingFees = studentFees.filter((item) => item.status !== "paid").length;
  const riskLevel = avgMarks < 60 || pendingFees > 0 ? "High" : avgMarks < 75 ? "Moderate" : "Low";

  res.json({
    summary: {
      results: studentResults.length,
      assignments: studentAssignments.length,
      pendingFees,
      avgMarks,
      riskLevel,
    },
    insights: {
      predictive: [
        `Early warning status: ${riskLevel} academic risk.`,
        avgMarks < 70
          ? "Performance trend suggests remedial support before the next exam cycle."
          : "Current score trend indicates stable progress.",
      ],
      prescriptive: [
        avgMarks < 70 ? "Review weak subjects and schedule a short remedial quiz this week." : "Maintain revision consistency and attempt advanced practice.",
        pendingFees > 0 ? "Clear pending fee records to avoid administrative blockers." : "Fee status is healthy for the current term.",
      ],
      engagement: [
        `Assignments tracked: ${studentAssignments.length}`,
        `Published results reviewed: ${studentResults.length}`,
      ],
    },
    charts: {
      resultsBySubject: studentResults.map((item) => ({
        name: item.exam?.subject?.name || "Exam",
        value: item.marksObtained,
      })),
      feeByStatus: studentFees.map((item) => ({ name: item.academicYear, value: item.paidAmount })),
    },
  });
};

export const getStudentRiskOverview = async (req, res) => {
  const { q = "", studentId } = req.query;
  const accessibleStudents = await getAccessibleStudents(req.user, {
    search: String(q).trim(),
    studentId,
  });

  const profiles = await Promise.all(accessibleStudents.map((student) => buildStudentRiskProfile(student)));

  res.json(
    profiles
      .filter(Boolean)
      .sort((a, b) => b.riskScore - a.riskScore)
  );
};

export const getStudentRiskHistory = async (req, res) => {
  const { id } = req.params;
  const allowed = await canAccessStudentRisk(req.user, id);

  if (!allowed) {
    return res.status(403).json({ message: "You do not have access to this student risk history." });
  }

  const rows = await AiRiskHistory.find({ student: id })
    .populate("generatedBy", "name role")
    .sort({ createdAt: -1 })
    .limit(12);

  const trend = rows
    .slice()
    .reverse()
    .map((item) => ({
      name: new Date(item.createdAt).toISOString().slice(0, 10),
      score: item.riskScore,
      level: item.riskLevel,
    }));

  res.json({ rows, trend });
};

export const getStudentInterventions = async (req, res) => {
  const { id } = req.params;
  const allowed = await canAccessStudentRisk(req.user, id);

  if (!allowed) {
    return res.status(403).json({ message: "You do not have access to this student intervention history." });
  }

  const rows = await StudentIntervention.find({ student: id })
    .populate("student", "name rollNumber className")
    .populate("createdBy", "name role")
    .populate("updatedBy", "name role")
    .sort({ createdAt: -1 });

  res.json(rows);
};

export const createStudentIntervention = async (req, res) => {
  const { id } = req.params;
  const allowed = await canAccessStudentRisk(req.user, id);

  if (!allowed) {
    return res.status(403).json({ message: "You do not have access to create interventions for this student." });
  }

  const intervention = await StudentIntervention.create({
    student: id,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    category: req.body.category,
    status: req.body.status || "pending",
    priority: req.body.priority || "moderate",
    title: req.body.title,
    notes: req.body.notes || "",
    nextFollowUpAt: req.body.nextFollowUpAt || null,
  });

  await writeAuditLog(req, {
    action: "ai-risk.intervention-create",
    entityType: "StudentIntervention",
    entityId: String(intervention._id),
    after: {
      student: id,
      category: intervention.category,
      status: intervention.status,
      priority: intervention.priority,
    },
  });

  const hydrated = await StudentIntervention.findById(intervention._id)
    .populate("student", "name rollNumber className")
    .populate("createdBy", "name role")
    .populate("updatedBy", "name role");

  res.status(201).json(hydrated);
};

export const updateStudentIntervention = async (req, res) => {
  const intervention = await StudentIntervention.findById(req.params.interventionId);

  if (!intervention) {
    return res.status(404).json({ message: "Intervention record not found." });
  }

  const allowed = await canAccessStudentRisk(req.user, intervention.student);

  if (!allowed) {
    return res.status(403).json({ message: "You do not have access to update this intervention." });
  }

  intervention.category = req.body.category || intervention.category;
  intervention.status = req.body.status || intervention.status;
  intervention.priority = req.body.priority || intervention.priority;
  intervention.title = req.body.title || intervention.title;
  intervention.notes = req.body.notes ?? intervention.notes;
  intervention.nextFollowUpAt = req.body.nextFollowUpAt || null;
  intervention.updatedBy = req.user._id;
  if (intervention.status === "completed" || intervention.status === "closed") {
    intervention.completedAt = req.body.completedAt || new Date();
  }
  await intervention.save();

  await writeAuditLog(req, {
    action: "ai-risk.intervention-update",
    entityType: "StudentIntervention",
    entityId: String(intervention._id),
    after: {
      status: intervention.status,
      priority: intervention.priority,
      nextFollowUpAt: intervention.nextFollowUpAt,
    },
  });

  const hydrated = await StudentIntervention.findById(intervention._id)
    .populate("student", "name rollNumber className")
    .populate("createdBy", "name role")
    .populate("updatedBy", "name role");

  res.json(hydrated);
};

export const getStudentRiskAnalysis = async (req, res) => {
  const { id } = req.params;
  const allowed = await canAccessStudentRisk(req.user, id);

  if (!allowed) {
    return res.status(403).json({ message: "You do not have access to this student risk profile." });
  }

  const profile = await buildStudentRiskProfile(id);
  const settings = await GlobalSetting.findOne().select("aiProvider");

  if (!profile) {
    return res.status(404).json({ message: "Student record not found." });
  }

  let aiNarrative = profile.aiNarrative;
  let providerStatus = isAiProviderConfigured(settings?.aiProvider) ? "enabled" : "fallback";

  try {
    const generated = await generateAiRiskNarrative(profile, settings?.aiProvider);
    if (generated) {
      aiNarrative = generated;
      providerStatus = "enabled";
    }
  } catch (error) {
    providerStatus = "fallback";
    aiNarrative = {
      ...profile.aiNarrative,
      provider: "local-deterministic",
      disclaimer: `${profile.aiNarrative.disclaimer} External AI generation was unavailable, so the local advisory summary is being shown.`,
    };
  }

  await writeAuditLog(req, {
    action: "ai-risk.generate",
    entityType: "StudentRisk",
    entityId: String(profile.student._id),
    metadata: {
      providerStatus,
      riskLevel: profile.riskLevel,
      riskScore: profile.riskScore,
    },
  });

  await AiRiskHistory.create({
    student: profile.student._id,
    generatedBy: req.user._id,
    providerStatus,
    providerName: aiNarrative?.provider || "local-deterministic",
    riskScore: profile.riskScore,
    riskLevel: profile.riskLevel,
    metrics: profile.metrics,
    factors: profile.factors,
  });

  const recentHistory = await AiRiskHistory.find({ student: profile.student._id }).sort({ createdAt: -1 }).limit(12);
  const interventions = await StudentIntervention.find({ student: profile.student._id })
    .populate("createdBy", "name role")
    .populate("updatedBy", "name role")
    .sort({ createdAt: -1 })
    .limit(12);
  const trend = recentHistory
    .slice()
    .reverse()
    .map((item) => ({
      name: new Date(item.createdAt).toISOString().slice(0, 10),
      score: item.riskScore,
      level: item.riskLevel,
    }));

  res.json({
    ...profile,
    aiNarrative,
    providerStatus,
    history: recentHistory,
    trend,
    interventions,
  });
};
