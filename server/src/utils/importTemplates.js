import Course from "../models/Course.js";
import Fee from "../models/Fee.js";
import User from "../models/User.js";
import { getDefaultPermissions, ROLES } from "./constants.js";

const truthy = new Set(["true", "yes", "y", "1", "verified", "accepted"]);

const firstValue = (row, keys = []) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }
  return "";
};

const asString = (value) => String(value ?? "").trim();
const asNumber = (value, fallback = 0) => {
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
};
const asBoolean = (value) => truthy.has(String(value ?? "").trim().toLowerCase());

const admissionSourceAliases = {
  website: "website",
  web: "website",
  online: "website",
  portal: "website",
  social: "social-media",
  "social-media": "social-media",
  socialmedia: "social-media",
  instagram: "social-media",
  facebook: "social-media",
  linkedin: "social-media",
  "walk-in": "walk-in",
  walkin: "walk-in",
  campus: "walk-in",
  referral: "referral",
  reference: "referral",
  campaign: "campaign",
  excel: "campaign",
  docx: "campaign",
  pdf: "campaign",
  csv: "campaign",
  import: "campaign",
};

const normalizeAdmissionSource = (value) => {
  const normalized = asString(value).toLowerCase().replace(/\s+/g, "-");
  return admissionSourceAliases[normalized] || "website";
};

const admissionStatusAliases = {
  lead: "lead",
  new: "lead",
  review: "under-review",
  "under-review": "under-review",
  underreview: "under-review",
  pending: "under-review",
  verified: "verified",
  accepted: "accepted",
  enrolled: "enrolled",
  rejected: "rejected",
};

const normalizeAdmissionStatus = (value) => {
  const normalized = asString(value).toLowerCase().replace(/\s+/g, "-");
  return admissionStatusAliases[normalized] || "lead";
};

const findStudent = async (row) => {
  const rollNumber = asString(firstValue(row, ["rollnumber", "rollno", "studentrollnumber"]));
  const email = asString(firstValue(row, ["studentemail", "email"])).toLowerCase();

  if (rollNumber) {
    return User.findOne({ rollNumber });
  }
  if (email) {
    return User.findOne({ email });
  }
  return null;
};

const findTeacher = async (row) => {
  const employeeId = asString(firstValue(row, ["teacheremployeeid", "employeeid", "teachercode"]));
  const email = asString(firstValue(row, ["teacheremail", "email"])).toLowerCase();

  if (employeeId) {
    return User.findOne({ employeeId });
  }
  if (email) {
    return User.findOne({ email });
  }
  return null;
};

const buildCreatedEntityResult = (entityType, created, summary) => ({
  created,
  createdEntity: {
    entityType,
    entityId: String(created._id),
    summary,
  },
});

export const importConfigs = {
  admissions: {
    label: "Admissions",
    sampleHeaders: ["studentName", "email", "phone", "program", "academicYear", "source", "documentsVerified", "score", "status", "notes"],
    async mapRow(row) {
      return {
        studentName: asString(firstValue(row, ["studentname", "applicantname", "name"])),
        email: asString(firstValue(row, ["email", "studentemail"])).toLowerCase(),
        phone: asString(firstValue(row, ["phone", "mobile", "contactnumber"])),
        program: asString(firstValue(row, ["program", "programme", "course"])),
        academicYear: asString(firstValue(row, ["academicyear", "year", "session"])),
        source: normalizeAdmissionSource(firstValue(row, ["source"])),
        documentsVerified: asBoolean(firstValue(row, ["documentsverified", "verified", "docsverified"])),
        score: asNumber(firstValue(row, ["score", "meritscore", "percentage"]), 0),
        status: normalizeAdmissionStatus(firstValue(row, ["status"])),
        notes: asString(firstValue(row, ["notes", "remark", "remarks"])),
      };
    },
    validate(mapped) {
      if (!mapped.studentName || !mapped.email || !mapped.program || !mapped.academicYear) {
        return "Required fields: studentName, email, program, academicYear";
      }
      return null;
    },
    async checkDuplicate(mapped, { models }) {
      const existing = await models.Admission.findOne({ email: mapped.email, academicYear: mapped.academicYear });
      return existing
        ? {
            isDuplicate: true,
            message: "Admission already exists for this email and academic year.",
          }
        : { isDuplicate: false };
    },
    async create(mapped, { models }) {
      const existing = await models.Admission.findOne({ email: mapped.email, academicYear: mapped.academicYear });
      if (existing) {
        return { skipped: true, reason: "Admission already exists for this email and academic year." };
      }
      const created = await models.Admission.create(mapped);
      return buildCreatedEntityResult("Admission", created, {
        studentName: created.studentName,
        email: created.email,
        academicYear: created.academicYear,
      });
    },
  },
  students: {
    label: "Students",
    sampleHeaders: ["name", "email", "rollNumber", "className", "parentEmail", "password", "phone"],
    async mapRow(row) {
      return {
        name: asString(firstValue(row, ["name", "studentname"])),
        email: asString(firstValue(row, ["email", "studentemail"])).toLowerCase(),
        rollNumber: asString(firstValue(row, ["rollnumber", "rollno"])),
        className: asString(firstValue(row, ["classname", "class", "program", "course"])),
        parentEmail: asString(firstValue(row, ["parentemail", "guardianemail"])).toLowerCase(),
        password: asString(firstValue(row, ["password"])) || "Student@123",
        phone: asString(firstValue(row, ["phone", "mobile"])),
        username: asString(firstValue(row, ["username"])).toLowerCase(),
      };
    },
    validate(mapped) {
      if (!mapped.name || !mapped.email || !mapped.rollNumber || !mapped.className) {
        return "Required fields: name, email, rollNumber, className";
      }
      return null;
    },
    async checkDuplicate(mapped, { models }) {
      const existing = await models.User.findOne({ $or: [{ email: mapped.email }, { rollNumber: mapped.rollNumber }] });
      return existing
        ? {
            isDuplicate: true,
            message: "Student with this email or roll number already exists.",
          }
        : { isDuplicate: false };
    },
    async create(mapped, { models }) {
      const existing = await models.User.findOne({ $or: [{ email: mapped.email }, { rollNumber: mapped.rollNumber }] });
      if (existing) {
        return { skipped: true, reason: "Student with this email or roll number already exists." };
      }
      const created = await models.User.create({
        ...mapped,
        role: ROLES.STUDENT,
        permissions: getDefaultPermissions(ROLES.STUDENT),
      });
      return buildCreatedEntityResult("User", created, {
        name: created.name,
        email: created.email,
        rollNumber: created.rollNumber,
      });
    },
  },
  staff: {
    label: "Staff / Teachers",
    sampleHeaders: ["name", "email", "employeeId", "department", "role", "password", "username", "phone"],
    async mapRow(row) {
      const mappedRole = asString(firstValue(row, ["role", "staffrole"])).toLowerCase() || ROLES.FACULTY_PROFESSOR;
      return {
        name: asString(firstValue(row, ["name", "staffname", "teachername"])),
        email: asString(firstValue(row, ["email", "staffemail", "teacheremail"])).toLowerCase(),
        employeeId: asString(firstValue(row, ["employeeid", "employeecode", "teachercode"])),
        department: asString(firstValue(row, ["department"])),
        role: mappedRole,
        password: asString(firstValue(row, ["password"])) || "Faculty@123",
        username: asString(firstValue(row, ["username"])).toLowerCase(),
        phone: asString(firstValue(row, ["phone", "mobile"])),
      };
    },
    validate(mapped) {
      if (!mapped.name || !mapped.email || !mapped.employeeId || !mapped.role) {
        return "Required fields: name, email, employeeId, role";
      }
      return null;
    },
    async checkDuplicate(mapped, { models }) {
      const existing = await models.User.findOne({ $or: [{ email: mapped.email }, { employeeId: mapped.employeeId }] });
      return existing
        ? {
            isDuplicate: true,
            message: "Staff member with this email or employee code already exists.",
          }
        : { isDuplicate: false };
    },
    async create(mapped, { models }) {
      const existing = await models.User.findOne({ $or: [{ email: mapped.email }, { employeeId: mapped.employeeId }] });
      if (existing) {
        return { skipped: true, reason: "Staff member with this email or employee code already exists." };
      }
      const created = await models.User.create({
        ...mapped,
        permissions: getDefaultPermissions(mapped.role),
      });
      return buildCreatedEntityResult("User", created, {
        name: created.name,
        email: created.email,
        employeeId: created.employeeId,
        role: created.role,
      });
    },
  },
  fees: {
    label: "Fee Records",
    sampleHeaders: ["rollNumber", "studentEmail", "academicYear", "totalAmount", "paidAmount", "dueDate", "status"],
    async mapRow(row) {
      return {
        academicYear: asString(firstValue(row, ["academicyear", "year", "session"])),
        totalAmount: asNumber(firstValue(row, ["totalamount", "amount", "feeamount"])),
        paidAmount: asNumber(firstValue(row, ["paidamount", "paid"])),
        dueDate: asString(firstValue(row, ["duedate"])),
        status: asString(firstValue(row, ["status"])).toLowerCase() || "pending",
        rollNumber: asString(firstValue(row, ["rollnumber", "rollno"])),
        studentEmail: asString(firstValue(row, ["studentemail", "email"])).toLowerCase(),
      };
    },
    validate(mapped) {
      if ((!mapped.rollNumber && !mapped.studentEmail) || !mapped.academicYear || !mapped.dueDate) {
        return "Required fields: rollNumber or studentEmail, academicYear, dueDate";
      }
      return null;
    },
    async checkDuplicate(mapped, { models }) {
      const student = await findStudent({
        rollnumber: mapped.rollNumber,
        studentemail: mapped.studentEmail,
      });
      if (!student) {
        return { isDuplicate: false };
      }
      const existing = await models.Fee.findOne({ student: student._id, academicYear: mapped.academicYear });
      return existing
        ? {
            isDuplicate: true,
            message: "Fee record already exists for this student and academic year.",
          }
        : { isDuplicate: false };
    },
    async create(mapped, { models }) {
      const student = await findStudent({
        rollnumber: mapped.rollNumber,
        studentemail: mapped.studentEmail,
      });
      if (!student) {
        return { skipped: true, reason: "Student not found for fee record." };
      }
      const existing = await models.Fee.findOne({ student: student._id, academicYear: mapped.academicYear });
      if (existing) {
        return { skipped: true, reason: "Fee record already exists for this student and academic year." };
      }
      const created = await models.Fee.create({
        student: student._id,
        academicYear: mapped.academicYear,
        totalAmount: mapped.totalAmount,
        paidAmount: mapped.paidAmount,
        dueDate: new Date(mapped.dueDate),
        status: mapped.status,
      });
      return buildCreatedEntityResult("Fee", created, {
        student: student.name,
        academicYear: created.academicYear,
        totalAmount: created.totalAmount,
      });
    },
  },
  courses: {
    label: "Courses",
    sampleHeaders: ["title", "code", "department", "academicYear", "teacherEmployeeId", "teacherEmail", "studentRollNumbers", "description"],
    async mapRow(row) {
      return {
        title: asString(firstValue(row, ["title", "coursetitle", "course"])),
        code: asString(firstValue(row, ["code", "coursecode"])),
        department: asString(firstValue(row, ["department"])),
        academicYear: asString(firstValue(row, ["academicyear", "year", "session"])),
        teacherEmployeeId: asString(firstValue(row, ["teacheremployeeid", "employeeid", "teachercode"])),
        teacherEmail: asString(firstValue(row, ["teacheremail"])).toLowerCase(),
        studentRollNumbers: asString(firstValue(row, ["studentrollnumbers", "studentrolls", "students"]))
          .split(/[,;|]/)
          .map((value) => value.trim())
          .filter(Boolean),
        description: asString(firstValue(row, ["description", "notes"])),
      };
    },
    validate(mapped) {
      if (!mapped.title || !mapped.code || !mapped.department || !mapped.academicYear || (!mapped.teacherEmployeeId && !mapped.teacherEmail)) {
        return "Required fields: title, code, department, academicYear, teacherEmployeeId or teacherEmail";
      }
      return null;
    },
    async checkDuplicate(mapped, { models }) {
      const existing = await models.Course.findOne({ code: mapped.code });
      return existing
        ? {
            isDuplicate: true,
            message: "Course code already exists.",
          }
        : { isDuplicate: false };
    },
    async create(mapped, { models }) {
      const teacher = await findTeacher({
        teacheremployeeid: mapped.teacherEmployeeId,
        teacheremail: mapped.teacherEmail,
      });
      if (!teacher) {
        return { skipped: true, reason: "Assigned teacher not found." };
      }
      const existing = await models.Course.findOne({ code: mapped.code });
      if (existing) {
        return { skipped: true, reason: "Course code already exists." };
      }

      const students = mapped.studentRollNumbers.length
        ? await models.User.find({ rollNumber: { $in: mapped.studentRollNumbers }, role: ROLES.STUDENT }).select("_id")
        : [];

      const created = await models.Course.create({
        title: mapped.title,
        code: mapped.code,
        department: mapped.department,
        academicYear: mapped.academicYear,
        teacher: teacher._id,
        students: students.map((student) => student._id),
        description: mapped.description,
      });
      return buildCreatedEntityResult("Course", created, {
        title: created.title,
        code: created.code,
        teacher: teacher.name,
      });
    },
  },
  placements: {
    label: "Placement Drives",
    sampleHeaders: ["companyName", "roleTitle", "description", "location", "packageLpa", "eligibility", "deadline"],
    async mapRow(row) {
      return {
        companyName: asString(firstValue(row, ["companyname", "company"])),
        roleTitle: asString(firstValue(row, ["roletitle", "role", "position"])),
        description: asString(firstValue(row, ["description", "details"])),
        location: asString(firstValue(row, ["location", "city"])),
        packageLpa: asNumber(firstValue(row, ["packagelpa", "package", "ctc"]), 0),
        eligibility: asString(firstValue(row, ["eligibility", "criteria"])),
        deadline: asString(firstValue(row, ["deadline", "lastdate"])),
      };
    },
    validate(mapped) {
      if (!mapped.companyName || !mapped.roleTitle || !mapped.description || !mapped.deadline) {
        return "Required fields: companyName, roleTitle, description, deadline";
      }
      return null;
    },
    async checkDuplicate(mapped, { models }) {
      const existing = await models.Placement.findOne({
        companyName: mapped.companyName,
        roleTitle: mapped.roleTitle,
        deadline: new Date(mapped.deadline),
      });
      return existing
        ? {
            isDuplicate: true,
            message: "Placement drive already exists for this company, role, and deadline.",
          }
        : { isDuplicate: false };
    },
    async create(mapped, { models, req }) {
      const existing = await models.Placement.findOne({
        companyName: mapped.companyName,
        roleTitle: mapped.roleTitle,
        deadline: new Date(mapped.deadline),
      });
      if (existing) {
        return { skipped: true, reason: "Placement drive already exists for this company, role, and deadline." };
      }
      const created = await models.Placement.create({
        ...mapped,
        deadline: new Date(mapped.deadline),
        postedBy: req.user._id,
        institutionId: req.user?.institutionId || "",
        campusId: req.user?.campusId || "",
        departmentId: req.user?.departmentId || "",
        academicSession: req.user?.academicSession || "",
      });
      return buildCreatedEntityResult("Placement", created, {
        companyName: created.companyName,
        roleTitle: created.roleTitle,
        deadline: created.deadline,
      });
    },
  },
  announcements: {
    label: "Announcements",
    sampleHeaders: ["title", "content", "priority", "audience"],
    async mapRow(row) {
      return {
        title: asString(firstValue(row, ["title", "announcementtitle"])),
        content: asString(firstValue(row, ["content", "message", "body"])),
        priority: asString(firstValue(row, ["priority"])).toLowerCase() || "medium",
        audience: asString(firstValue(row, ["audience", "roles"]))
          .split(/[,;|]/)
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      };
    },
    validate(mapped) {
      if (!mapped.title || !mapped.content) {
        return "Required fields: title, content";
      }
      return null;
    },
    async checkDuplicate(mapped, { models }) {
      const existing = await models.Announcement.findOne({
        title: mapped.title,
        content: mapped.content,
      });
      return existing
        ? {
            isDuplicate: true,
            message: "Announcement with the same title and content already exists.",
          }
        : { isDuplicate: false };
    },
    async create(mapped, { models, req }) {
      const existing = await models.Announcement.findOne({
        title: mapped.title,
        content: mapped.content,
      });
      if (existing) {
        return { skipped: true, reason: "Announcement with the same title and content already exists." };
      }
      const created = await models.Announcement.create({
        title: mapped.title,
        content: mapped.content,
        priority: ["low", "medium", "high"].includes(mapped.priority) ? mapped.priority : "medium",
        audience: mapped.audience.length ? mapped.audience : [ROLES.FACULTY_PROFESSOR, ROLES.STUDENT],
        author: req.user._id,
        institutionId: req.user?.institutionId || "",
        campusId: req.user?.campusId || "",
        departmentId: req.user?.departmentId || "",
        academicSession: req.user?.academicSession || "",
      });
      return buildCreatedEntityResult("Announcement", created, {
        title: created.title,
        priority: created.priority,
        audience: created.audience,
      });
    },
  },
};

export const getImportTemplate = (target) => importConfigs[target];

export const getImportTemplateList = () =>
  Object.entries(importConfigs).map(([key, value]) => ({
    key,
    label: value.label,
    sampleHeaders: value.sampleHeaders,
  }));
