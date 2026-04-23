import Admission from "../models/Admission.js";
import ApprovalItem from "../models/ApprovalItem.js";
import Book from "../models/Book.js";
import FinanceTransaction from "../models/FinanceTransaction.js";
import Fee from "../models/Fee.js";
import GlobalSetting from "../models/GlobalSetting.js";
import HostelGatePass from "../models/HostelGatePass.js";
import HostelMaintenance from "../models/HostelMaintenance.js";
import HostelRoom from "../models/HostelRoom.js";
import Invoice from "../models/Invoice.js";
import LeaveRequest from "../models/LeaveRequest.js";
import LibraryCirculation from "../models/LibraryCirculation.js";
import ParentCommunication from "../models/ParentCommunication.js";
import PayrollConfig from "../models/PayrollConfig.js";
import PayrollRun from "../models/PayrollRun.js";
import StaffAttendance from "../models/StaffAttendance.js";
import SyllabusProgress from "../models/SyllabusProgress.js";
import TransportAllocation from "../models/TransportAllocation.js";
import TransportRoute from "../models/TransportRoute.js";
import TransportVehicle from "../models/TransportVehicle.js";
import User from "../models/User.js";
import { writeAuditLog } from "../utils/audit.js";
import { ROLES } from "../utils/constants.js";

const ensureNumeric = (value, fallback = 0) => Number(value ?? fallback);

const buildUsernameFromAdmission = (name = "", email = "", sequence = 1) => {
  const emailPrefix = String(email).split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") || "";
  const namePrefix = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10);

  return (emailPrefix || namePrefix || `student${sequence}`).toLowerCase();
};

const buildRollNumber = (program = "GEN", academicYear = "", sequence = 1) => {
  const programCode = String(program)
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 4) || "GEN";
  const yearCode = String(academicYear).replace(/\D/g, "").slice(-2) || "00";
  return `${programCode}${yearCode}${String(sequence).padStart(4, "0")}`;
};

export const getEmployees = async (req, res) => {
  const employees = await User.find({
    role: { $nin: [ROLES.STUDENT, ROLES.PARENT_GUARDIAN] },
  })
    .select("-password")
    .sort({ name: 1 });

  res.json(employees);
};

export const getStaffAttendance = async (req, res) => {
  const attendance = await StaffAttendance.find()
    .populate("staff", "name email employeeId department role")
    .populate("recordedBy", "name role")
    .sort({ date: -1, createdAt: -1 });

  res.json(attendance);
};

export const saveStaffAttendance = async (req, res) => {
  const records = Array.isArray(req.body.records) ? req.body.records : [];
  const saved = [];

  for (const record of records) {
    const attendance = await StaffAttendance.findOneAndUpdate(
      {
        staff: record.staff,
        date: new Date(req.body.date),
      },
      {
        staff: record.staff,
        date: new Date(req.body.date),
        status: record.status,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        remarks: record.remarks,
        recordedBy: req.user._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    saved.push(attendance);
  }

  res.status(201).json(saved);
};

export const getLeaveRequests = async (req, res) => {
  const leaves = await LeaveRequest.find()
    .populate("employee", "name email employeeId department role")
    .populate("reviewedBy", "name role")
    .sort({ createdAt: -1 });

  res.json(leaves);
};

export const createLeaveRequest = async (req, res) => {
  const leave = await LeaveRequest.create(req.body);
  const hydrated = await LeaveRequest.findById(leave._id)
    .populate("employee", "name email employeeId department role")
    .populate("reviewedBy", "name role");

  res.status(201).json(hydrated);
};

export const reviewLeaveRequest = async (req, res) => {
  const leave = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      reviewNotes: req.body.reviewNotes,
      reviewedBy: req.user._id,
    },
    { new: true }
  )
    .populate("employee", "name email employeeId department role")
    .populate("reviewedBy", "name role");

  res.json(leave);
};

export const getPayrollConfigs = async (req, res) => {
  const configs = await PayrollConfig.find()
    .populate("employee", "name email employeeId department role")
    .sort({ updatedAt: -1 });

  res.json(configs);
};

export const savePayrollConfig = async (req, res) => {
  const config = await PayrollConfig.findOneAndUpdate(
    { employee: req.body.employee },
    req.body,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("employee", "name email employeeId department role");

  res.status(201).json(config);
};

export const getBooks = async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
};

export const createBook = async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json(book);
};

export const deleteBook = async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book removed successfully." });
};

export const getLibraryCirculation = async (req, res) => {
  const circulation = await LibraryCirculation.find()
    .populate("book")
    .populate("member", "name email employeeId rollNumber className role")
    .sort({ issueDate: -1 });

  res.json(circulation);
};

export const issueLibraryBook = async (req, res) => {
  const book = await Book.findById(req.body.book);
  if (!book || book.copiesAvailable <= 0) {
    return res.status(400).json({ message: "Book is unavailable for issue." });
  }

  const circulation = await LibraryCirculation.create(req.body);
  book.copiesAvailable -= 1;
  await book.save();

  const hydrated = await LibraryCirculation.findById(circulation._id)
    .populate("book")
    .populate("member", "name email employeeId rollNumber className role");

  res.status(201).json(hydrated);
};

export const returnLibraryBook = async (req, res) => {
  const circulation = await LibraryCirculation.findById(req.params.id).populate("book");
  if (!circulation) {
    return res.status(404).json({ message: "Circulation record not found." });
  }

  circulation.returnedAt = req.body.returnedAt ? new Date(req.body.returnedAt) : new Date();
  circulation.fineAmount = Number(req.body.fineAmount || 0);
  circulation.status = "returned";
  await circulation.save();

  if (circulation.book) {
    circulation.book.copiesAvailable += 1;
    await circulation.book.save();
  }

  const hydrated = await LibraryCirculation.findById(circulation._id)
    .populate("book")
    .populate("member", "name email employeeId rollNumber className role");

  res.json(hydrated);
};

export const getLibraryMembers = async (req, res) => {
  const members = await User.find({
    role: { $in: [ROLES.STUDENT, ROLES.FACULTY_PROFESSOR, ROLES.HOD, ROLES.LIBRARIAN] },
  })
    .select("-password")
    .sort({ name: 1 });

  res.json(members);
};

export const getFinanceTransactions = async (req, res) => {
  const transactions = await FinanceTransaction.find()
    .populate("relatedStudent", "name rollNumber email")
    .populate("relatedEmployee", "name employeeId email")
    .populate("createdBy", "name role")
    .sort({ transactionDate: -1, createdAt: -1 });

  res.json(transactions);
};

export const getFinanceParticipants = async (req, res) => {
  const [students, employees] = await Promise.all([
    User.find({ role: ROLES.STUDENT }).select("-password").sort({ name: 1 }),
    User.find({ role: { $nin: [ROLES.STUDENT, ROLES.PARENT_GUARDIAN] } }).select("-password").sort({ name: 1 }),
  ]);

  res.json({ students, employees });
};

export const getInvoices = async (req, res) => {
  const invoices = await Invoice.find().populate("createdBy", "name role").sort({ dueDate: 1, createdAt: -1 });
  res.json(invoices);
};

export const createInvoice = async (req, res) => {
  const invoice = await Invoice.create({
    ...req.body,
    amount: Number(req.body.amount),
    createdBy: req.user._id,
  });
  const hydrated = await Invoice.findById(invoice._id).populate("createdBy", "name role");
  res.status(201).json(hydrated);
};

export const deleteInvoice = async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ message: "Invoice removed successfully." });
};

export const getPayrollRuns = async (req, res) => {
  const runs = await PayrollRun.find()
    .populate("employee", "name employeeId department role")
    .populate("processedBy", "name role")
    .sort({ month: -1, createdAt: -1 });
  res.json(runs);
};

export const createPayrollRun = async (req, res) => {
  const run = await PayrollRun.create({
    ...req.body,
    grossPay: Number(req.body.grossPay),
    deductions: Number(req.body.deductions || 0),
    netPay: Number(req.body.netPay),
    processedBy: req.user._id,
  });
  const hydrated = await PayrollRun.findById(run._id)
    .populate("employee", "name employeeId department role")
    .populate("processedBy", "name role");
  res.status(201).json(hydrated);
};

export const updatePayrollRun = async (req, res) => {
  const run = await PayrollRun.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      ...(req.body.grossPay !== undefined ? { grossPay: Number(req.body.grossPay) } : {}),
      ...(req.body.deductions !== undefined ? { deductions: Number(req.body.deductions) } : {}),
      ...(req.body.netPay !== undefined ? { netPay: Number(req.body.netPay) } : {}),
      processedBy: req.user._id,
    },
    { new: true }
  )
    .populate("employee", "name employeeId department role")
    .populate("processedBy", "name role");
  res.json(run);
};

export const deletePayrollRun = async (req, res) => {
  await PayrollRun.findByIdAndDelete(req.params.id);
  res.json({ message: "Payroll run removed successfully." });
};

export const getApprovalItems = async (req, res) => {
  const items = await ApprovalItem.find()
    .populate("requestedBy", "name role department employeeId")
    .populate("reviewedBy", "name role")
    .sort({ createdAt: -1 });
  res.json(items);
};

export const createApprovalItem = async (req, res) => {
  const item = await ApprovalItem.create({
    ...req.body,
    amount: Number(req.body.amount || 0),
    requestedBy: req.body.requestedBy || req.user._id,
  });
  const hydrated = await ApprovalItem.findById(item._id)
    .populate("requestedBy", "name role department employeeId")
    .populate("reviewedBy", "name role");
  res.status(201).json(hydrated);
};

export const reviewApprovalItem = async (req, res) => {
  const item = await ApprovalItem.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      notes: req.body.notes,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    },
    { new: true }
  )
    .populate("requestedBy", "name role department employeeId")
    .populate("reviewedBy", "name role");
  res.json(item);
};

export const deleteApprovalItem = async (req, res) => {
  await ApprovalItem.findByIdAndDelete(req.params.id);
  res.json({ message: "Approval item removed successfully." });
};

export const createFinanceTransaction = async (req, res) => {
  const transaction = await FinanceTransaction.create({
    ...req.body,
    amount: Number(req.body.amount),
    createdBy: req.user._id,
  });

  const hydrated = await FinanceTransaction.findById(transaction._id)
    .populate("relatedStudent", "name rollNumber email")
    .populate("relatedEmployee", "name employeeId email")
    .populate("createdBy", "name role");

  res.status(201).json(hydrated);
};

export const deleteFinanceTransaction = async (req, res) => {
  await FinanceTransaction.findByIdAndDelete(req.params.id);
  res.json({ message: "Transaction removed successfully." });
};

export const getSyllabusProgress = async (req, res) => {
  const rows = await SyllabusProgress.find()
    .populate("subject", "name code")
    .populate("course", "title code")
    .populate("faculty", "name employeeId role")
    .populate("updatedBy", "name role")
    .sort({ updatedAt: -1 });

  res.json(rows);
};

export const createSyllabusProgress = async (req, res) => {
  const progress = await SyllabusProgress.create({
    ...req.body,
    plannedHours: Number(req.body.plannedHours || 0),
    completedHours: Number(req.body.completedHours || 0),
    completionPercent: Number(req.body.completionPercent || 0),
    updatedBy: req.user._id,
  });

  const hydrated = await SyllabusProgress.findById(progress._id)
    .populate("subject", "name code")
    .populate("course", "title code")
    .populate("faculty", "name employeeId role")
    .populate("updatedBy", "name role");

  res.status(201).json(hydrated);
};

export const updateSyllabusProgress = async (req, res) => {
  const progress = await SyllabusProgress.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      plannedHours: Number(req.body.plannedHours || 0),
      completedHours: Number(req.body.completedHours || 0),
      completionPercent: Number(req.body.completionPercent || 0),
      updatedBy: req.user._id,
    },
    { new: true }
  )
    .populate("subject", "name code")
    .populate("course", "title code")
    .populate("faculty", "name employeeId role")
    .populate("updatedBy", "name role");

  res.json(progress);
};

export const deleteSyllabusProgress = async (req, res) => {
  await SyllabusProgress.findByIdAndDelete(req.params.id);
  res.json({ message: "Syllabus progress removed successfully." });
};

export const getGlobalSettings = async (req, res) => {
  const settings =
    (await GlobalSetting.findOne().populate("lastUpdatedBy", "name role")) ||
    (await GlobalSetting.create({ lastUpdatedBy: req.user._id }));

  res.json(settings);
};

export const saveGlobalSettings = async (req, res) => {
  const payload = {
    institutionName: req.body.institutionName,
    shortName: req.body.shortName,
    contactEmail: req.body.contactEmail,
    contactPhone: req.body.contactPhone,
    website: req.body.website,
    address: req.body.address,
    academicSession: req.body.academicSession,
    campusName: req.body.campusName,
    timezone: req.body.timezone,
    announcementFooter: req.body.announcementFooter,
    defaultStudentPassword: req.body.defaultStudentPassword,
    defaultFeeAmount: ensureNumeric(req.body.defaultFeeAmount, 0),
    defaultFeeDueDays: ensureNumeric(req.body.defaultFeeDueDays, 30),
    maintenanceMode: Boolean(req.body.maintenanceMode),
    lastUpdatedBy: req.user._id,
  };

  const existing = await GlobalSetting.findOne();
  const settings = await GlobalSetting.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).populate("lastUpdatedBy", "name role");

  await writeAuditLog(req, {
    action: "settings.update",
    entityType: "GlobalSetting",
    entityId: String(settings._id),
    before: existing
      ? {
          institutionName: existing.institutionName,
          academicSession: existing.academicSession,
          maintenanceMode: existing.maintenanceMode,
        }
      : null,
    after: {
      institutionName: settings.institutionName,
      academicSession: settings.academicSession,
      maintenanceMode: settings.maintenanceMode,
    },
  });

  res.status(201).json(settings);
};

export const getParentCommunications = async (req, res) => {
  const query =
    req.user.role === ROLES.PARENT_GUARDIAN
      ? { parent: req.user._id }
      : req.user.role === ROLES.STUDENT
        ? { student: req.user._id }
        : {};

  const [rows, students] = await Promise.all([
    ParentCommunication.find(query)
      .populate("parent", "name email")
      .populate("student", "name className rollNumber")
      .populate("respondedBy", "name role")
      .sort({ createdAt: -1 }),
    req.user.role === ROLES.PARENT_GUARDIAN
      ? User.find({ parentEmail: req.user.email, role: ROLES.STUDENT }).select("name className rollNumber")
      : req.user.role === ROLES.SUPER_ADMIN
        ? User.find({ role: ROLES.STUDENT }).select("name className rollNumber")
        : [],
  ]);

  res.json({ rows, students });
};

export const createParentCommunication = async (req, res) => {
  const communication = await ParentCommunication.create({
    parent: req.body.parent || req.user._id,
    student: req.body.student,
    category: req.body.category,
    subject: req.body.subject,
    message: req.body.message,
    preferredDate: req.body.preferredDate || null,
    createdBy: req.user._id,
  });

  const hydrated = await ParentCommunication.findById(communication._id)
    .populate("parent", "name email")
    .populate("student", "name className rollNumber")
    .populate("respondedBy", "name role");

  await writeAuditLog(req, {
    action: "parent-communication.create",
    entityType: "ParentCommunication",
    entityId: String(communication._id),
    after: {
      category: communication.category,
      subject: communication.subject,
      student: String(communication.student),
    },
  });

  res.status(201).json(hydrated);
};

export const updateParentCommunication = async (req, res) => {
  const communication = await ParentCommunication.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      responseMessage: req.body.responseMessage,
      respondedBy: req.user._id,
      respondedAt: new Date(),
    },
    { new: true }
  )
    .populate("parent", "name email")
    .populate("student", "name className rollNumber")
    .populate("respondedBy", "name role");

  if (!communication) {
    return res.status(404).json({ message: "Communication thread not found." });
  }

  await writeAuditLog(req, {
    action: "parent-communication.update",
    entityType: "ParentCommunication",
    entityId: String(communication._id),
    after: {
      status: communication.status,
      respondedBy: String(req.user._id),
    },
  });

  res.json(communication);
};

export const getAdmissionOnboarding = async (req, res) => {
  const admissions = await Admission.find({ status: { $in: ["accepted", "verified", "enrolled"] } })
    .populate("enrolledStudent", "name rollNumber email className")
    .sort({ updatedAt: -1, createdAt: -1 });

  const settings = await GlobalSetting.findOne();
  res.json({
    admissions,
    defaults: {
      defaultStudentPassword: settings?.defaultStudentPassword || "Student@123",
      defaultFeeAmount: settings?.defaultFeeAmount || 0,
      defaultFeeDueDays: settings?.defaultFeeDueDays || 30,
      academicSession: settings?.academicSession || "",
    },
  });
};

export const enrollAdmission = async (req, res) => {
  const admission = await Admission.findById(req.params.id);

  if (!admission) {
    return res.status(404).json({ message: "Admission record not found." });
  }

  if (!["accepted", "verified", "enrolled"].includes(admission.status)) {
    return res.status(400).json({ message: "Only verified or accepted applicants can be onboarded." });
  }

  if (admission.enrolledStudent) {
    const existingStudent = await User.findById(admission.enrolledStudent).select("-password");
    return res.json({ admission, student: existingStudent, message: "Admission already onboarded." });
  }

  const existingUser = await User.findOne({ email: admission.email });
  if (existingUser) {
    admission.status = "enrolled";
    admission.enrolledStudent = existingUser._id;
    admission.onboardedAt = new Date();
    await admission.save();
    return res.json({ admission, student: existingUser, message: "Existing user linked to admission." });
  }

  const settings = await GlobalSetting.findOne();
  const currentStudentCount = await User.countDocuments({ role: ROLES.STUDENT });
  const sequence = currentStudentCount + 1;
  const rollNumber = req.body.rollNumber || buildRollNumber(admission.program, admission.academicYear, sequence);

  let username = (req.body.username || buildUsernameFromAdmission(admission.studentName, admission.email, sequence)).toLowerCase();
  let usernameCounter = 1;
  while (await User.findOne({ username })) {
    username = `${username}${usernameCounter}`;
    usernameCounter += 1;
  }

  const student = await User.create({
    name: admission.studentName,
    username,
    email: admission.email,
    password: req.body.password || settings?.defaultStudentPassword || "Student@123",
    role: ROLES.STUDENT,
    phone: admission.phone,
    className: req.body.className || admission.program,
    rollNumber,
    parentEmail: req.body.parentEmail || admission.parentEmail || "",
    department: req.body.department || admission.departmentId || "",
    institutionId: admission.institutionId || req.user.institutionId,
    campusId: admission.campusId || req.user.campusId,
    departmentId: admission.departmentId || req.user.departmentId,
    academicSession: req.body.academicSession || admission.academicSession || settings?.academicSession || "",
    batchId: req.body.batchId || admission.batchId || "",
    section: req.body.section || admission.section || "",
    mustChangePassword: true,
  });

  const feeAmount = ensureNumeric(req.body.totalAmount, settings?.defaultFeeAmount || 0);
  if (feeAmount > 0) {
    await Fee.create({
      student: student._id,
      academicYear: admission.academicYear,
      totalAmount: feeAmount,
      paidAmount: 0,
      dueDate: new Date(Date.now() + ensureNumeric(settings?.defaultFeeDueDays, 30) * 24 * 60 * 60 * 1000),
      institutionId: admission.institutionId || req.user.institutionId,
      campusId: admission.campusId || req.user.campusId,
      departmentId: admission.departmentId || req.user.departmentId,
      academicSession: admission.academicSession || settings?.academicSession || "",
      batchId: admission.batchId || "",
      section: admission.section || "",
      status: "pending",
    });
  }

  admission.status = "enrolled";
  admission.enrolledStudent = student._id;
  admission.onboardedAt = new Date();
  await admission.save();

  await writeAuditLog(req, {
    action: "admissions.enroll",
    entityType: "Admission",
    entityId: String(admission._id),
    after: {
      enrolledStudent: String(student._id),
      rollNumber: student.rollNumber,
      className: student.className,
    },
  });

  const safeStudent = await User.findById(student._id).select("-password");
  res.status(201).json({ admission, student: safeStudent, message: "Student onboarded successfully." });
};

export const getHostelRooms = async (req, res) => {
  const rooms = await HostelRoom.find()
    .populate("occupants", "name rollNumber className")
    .sort({ block: 1, roomNumber: 1 });

  res.json(rooms);
};

export const createHostelRoom = async (req, res) => {
  const room = await HostelRoom.create({
    roomNumber: req.body.roomNumber,
    block: req.body.block,
    floor: req.body.floor,
    roomType: req.body.roomType,
    capacity: ensureNumeric(req.body.capacity, 1),
    status: req.body.status || "available",
    notes: req.body.notes,
  });

  res.status(201).json(await HostelRoom.findById(room._id).populate("occupants", "name rollNumber className"));
};

export const updateHostelRoom = async (req, res) => {
  const occupantIds = Array.isArray(req.body.occupants) ? req.body.occupants.filter(Boolean) : [];
  const capacity = ensureNumeric(req.body.capacity, 1);
  const status = req.body.status || (occupantIds.length >= capacity ? "full" : "available");

  const room = await HostelRoom.findByIdAndUpdate(
    req.params.id,
    {
      roomNumber: req.body.roomNumber,
      block: req.body.block,
      floor: req.body.floor,
      roomType: req.body.roomType,
      capacity,
      occupants: occupantIds,
      status,
      notes: req.body.notes,
    },
    { new: true, runValidators: true }
  ).populate("occupants", "name rollNumber className");

  if (!room) {
    return res.status(404).json({ message: "Hostel room not found." });
  }

  res.json(room);
};

export const deleteHostelRoom = async (req, res) => {
  await HostelRoom.findByIdAndDelete(req.params.id);
  res.json({ message: "Hostel room removed successfully." });
};

export const getHostelGatePasses = async (req, res) => {
  const rows = await HostelGatePass.find()
    .populate("student", "name rollNumber className")
    .populate("room", "roomNumber block")
    .populate("approvedBy", "name role")
    .sort({ createdAt: -1 });

  res.json(rows);
};

export const createHostelGatePass = async (req, res) => {
  const gatePass = await HostelGatePass.create({
    student: req.body.student,
    room: req.body.room || null,
    passType: req.body.passType,
    reason: req.body.reason,
    outDateTime: req.body.outDateTime,
    expectedReturnAt: req.body.expectedReturnAt,
    status: req.body.status || "pending",
    approvalNotes: req.body.approvalNotes,
    createdBy: req.user._id,
  });

  const hydrated = await HostelGatePass.findById(gatePass._id)
    .populate("student", "name rollNumber className")
    .populate("room", "roomNumber block")
    .populate("approvedBy", "name role");

  res.status(201).json(hydrated);
};

export const updateHostelGatePass = async (req, res) => {
  const update = {
    passType: req.body.passType,
    reason: req.body.reason,
    outDateTime: req.body.outDateTime,
    expectedReturnAt: req.body.expectedReturnAt,
    status: req.body.status,
    approvalNotes: req.body.approvalNotes,
    room: req.body.room || null,
    student: req.body.student,
  };

  if (["approved", "rejected", "returned", "out"].includes(req.body.status)) {
    update.approvedBy = req.user._id;
  }
  if (req.body.status === "returned") {
    update.returnedAt = req.body.returnedAt || new Date();
  }

  const gatePass = await HostelGatePass.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    .populate("student", "name rollNumber className")
    .populate("room", "roomNumber block")
    .populate("approvedBy", "name role");

  if (!gatePass) {
    return res.status(404).json({ message: "Gate pass not found." });
  }

  res.json(gatePass);
};

export const deleteHostelGatePass = async (req, res) => {
  await HostelGatePass.findByIdAndDelete(req.params.id);
  res.json({ message: "Gate pass removed successfully." });
};

export const getHostelMaintenance = async (req, res) => {
  const rows = await HostelMaintenance.find()
    .populate("room", "roomNumber block")
    .populate("requestedBy", "name role")
    .sort({ createdAt: -1 });

  res.json(rows);
};

export const createHostelMaintenance = async (req, res) => {
  const ticket = await HostelMaintenance.create({
    room: req.body.room || null,
    title: req.body.title,
    issueType: req.body.issueType,
    priority: req.body.priority,
    status: req.body.status || "open",
    assignedTo: req.body.assignedTo,
    requestedBy: req.user._id,
    resolutionNotes: req.body.resolutionNotes,
  });

  const hydrated = await HostelMaintenance.findById(ticket._id)
    .populate("room", "roomNumber block")
    .populate("requestedBy", "name role");

  res.status(201).json(hydrated);
};

export const updateHostelMaintenance = async (req, res) => {
  const ticket = await HostelMaintenance.findByIdAndUpdate(
    req.params.id,
    {
      room: req.body.room || null,
      title: req.body.title,
      issueType: req.body.issueType,
      priority: req.body.priority,
      status: req.body.status,
      assignedTo: req.body.assignedTo,
      resolutionNotes: req.body.resolutionNotes,
    },
    { new: true, runValidators: true }
  )
    .populate("room", "roomNumber block")
    .populate("requestedBy", "name role");

  if (!ticket) {
    return res.status(404).json({ message: "Maintenance ticket not found." });
  }

  res.json(ticket);
};

export const deleteHostelMaintenance = async (req, res) => {
  await HostelMaintenance.findByIdAndDelete(req.params.id);
  res.json({ message: "Maintenance ticket removed successfully." });
};

export const getTransportRoutes = async (req, res) => {
  const routes = await TransportRoute.find().sort({ routeName: 1 });
  res.json(routes);
};

export const createTransportRoute = async (req, res) => {
  const route = await TransportRoute.create({
    routeName: req.body.routeName,
    vehicleNumber: req.body.vehicleNumber,
    driverName: req.body.driverName,
    driverPhone: req.body.driverPhone,
    capacity: ensureNumeric(req.body.capacity, 40),
    departureTime: req.body.departureTime,
    returnTime: req.body.returnTime,
    stops: Array.isArray(req.body.stops) ? req.body.stops : String(req.body.stops || "").split(",").map((item) => item.trim()).filter(Boolean),
    notes: req.body.notes,
    active: req.body.active ?? true,
  });

  res.status(201).json(route);
};

export const updateTransportRoute = async (req, res) => {
  const route = await TransportRoute.findByIdAndUpdate(
    req.params.id,
    {
      routeName: req.body.routeName,
      vehicleNumber: req.body.vehicleNumber,
      driverName: req.body.driverName,
      driverPhone: req.body.driverPhone,
      capacity: ensureNumeric(req.body.capacity, 40),
      departureTime: req.body.departureTime,
      returnTime: req.body.returnTime,
      stops: Array.isArray(req.body.stops) ? req.body.stops : String(req.body.stops || "").split(",").map((item) => item.trim()).filter(Boolean),
      notes: req.body.notes,
      active: req.body.active ?? true,
    },
    { new: true, runValidators: true }
  );

  if (!route) {
    return res.status(404).json({ message: "Transport route not found." });
  }

  res.json(route);
};

export const deleteTransportRoute = async (req, res) => {
  await TransportRoute.findByIdAndDelete(req.params.id);
  res.json({ message: "Transport route removed successfully." });
};

export const getTransportAllocations = async (req, res) => {
  const rows = await TransportAllocation.find()
    .populate("route", "routeName vehicleNumber")
    .populate("rider", "name role rollNumber employeeId className")
    .sort({ createdAt: -1 });

  res.json(rows);
};

export const createTransportAllocation = async (req, res) => {
  const allocation = await TransportAllocation.create({
    route: req.body.route,
    rider: req.body.rider,
    stop: req.body.stop,
    seatNumber: req.body.seatNumber,
    shift: req.body.shift,
    feeStatus: req.body.feeStatus || "pending",
    status: req.body.status || "active",
    notes: req.body.notes,
  });

  const hydrated = await TransportAllocation.findById(allocation._id)
    .populate("route", "routeName vehicleNumber")
    .populate("rider", "name role rollNumber employeeId className");

  res.status(201).json(hydrated);
};

export const updateTransportAllocation = async (req, res) => {
  const allocation = await TransportAllocation.findByIdAndUpdate(
    req.params.id,
    {
      route: req.body.route,
      rider: req.body.rider,
      stop: req.body.stop,
      seatNumber: req.body.seatNumber,
      shift: req.body.shift,
      feeStatus: req.body.feeStatus,
      status: req.body.status,
      notes: req.body.notes,
    },
    { new: true, runValidators: true }
  )
    .populate("route", "routeName vehicleNumber")
    .populate("rider", "name role rollNumber employeeId className");

  if (!allocation) {
    return res.status(404).json({ message: "Allocation not found." });
  }

  res.json(allocation);
};

export const deleteTransportAllocation = async (req, res) => {
  await TransportAllocation.findByIdAndDelete(req.params.id);
  res.json({ message: "Transport allocation removed successfully." });
};

export const getTransportVehicles = async (req, res) => {
  const vehicles = await TransportVehicle.find().sort({ vehicleNumber: 1 });
  res.json(vehicles);
};

export const createTransportVehicle = async (req, res) => {
  const vehicle = await TransportVehicle.create({
    vehicleNumber: req.body.vehicleNumber,
    busName: req.body.busName,
    driverName: req.body.driverName,
    driverPhone: req.body.driverPhone,
    capacity: ensureNumeric(req.body.capacity, 40),
    insuranceExpiry: req.body.insuranceExpiry || null,
    fitnessExpiry: req.body.fitnessExpiry || null,
    lastServiceDate: req.body.lastServiceDate || null,
    status: req.body.status || "active",
    notes: req.body.notes,
  });

  res.status(201).json(vehicle);
};

export const updateTransportVehicle = async (req, res) => {
  const vehicle = await TransportVehicle.findByIdAndUpdate(
    req.params.id,
    {
      vehicleNumber: req.body.vehicleNumber,
      busName: req.body.busName,
      driverName: req.body.driverName,
      driverPhone: req.body.driverPhone,
      capacity: ensureNumeric(req.body.capacity, 40),
      insuranceExpiry: req.body.insuranceExpiry || null,
      fitnessExpiry: req.body.fitnessExpiry || null,
      lastServiceDate: req.body.lastServiceDate || null,
      status: req.body.status,
      notes: req.body.notes,
    },
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found." });
  }

  res.json(vehicle);
};

export const deleteTransportVehicle = async (req, res) => {
  await TransportVehicle.findByIdAndDelete(req.params.id);
  res.json({ message: "Transport vehicle removed successfully." });
};

export const getHostelStudents = async (req, res) => {
  const students = await User.find({ role: ROLES.STUDENT }).select("name rollNumber className email").sort({ name: 1 });
  res.json(students);
};

export const getTransportParticipantsExpanded = async (req, res) => {
  const riders = await User.find({ role: { $in: [ROLES.STUDENT, ROLES.FACULTY_PROFESSOR, ROLES.HOD, ROLES.ACCOUNTANT, ROLES.HR_MANAGER] } })
    .select("name role rollNumber employeeId className email")
    .sort({ name: 1 });
  res.json(riders);
};

export const getRolePermissionMatrix = async (req, res) => {
  const counts = await User.aggregate([{ $group: { _id: "$role", total: { $sum: 1 } } }]);
  res.json(counts);
};
