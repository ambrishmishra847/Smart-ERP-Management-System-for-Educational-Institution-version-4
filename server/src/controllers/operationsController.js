import ApprovalItem from "../models/ApprovalItem.js";
import Book from "../models/Book.js";
import FinanceTransaction from "../models/FinanceTransaction.js";
import Invoice from "../models/Invoice.js";
import LeaveRequest from "../models/LeaveRequest.js";
import LibraryCirculation from "../models/LibraryCirculation.js";
import PayrollConfig from "../models/PayrollConfig.js";
import PayrollRun from "../models/PayrollRun.js";
import StaffAttendance from "../models/StaffAttendance.js";
import SyllabusProgress from "../models/SyllabusProgress.js";
import User from "../models/User.js";
import { ROLES } from "../utils/constants.js";

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
