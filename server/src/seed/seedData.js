import dotenv from "dotenv";
import ApprovalItem from "../models/ApprovalItem.js";
import { connectDB } from "../config/db.js";
import Admission from "../models/Admission.js";
import Announcement from "../models/Announcement.js";
import Assignment from "../models/Assignment.js";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Exam from "../models/Exam.js";
import Fee from "../models/Fee.js";
import FinanceTransaction from "../models/FinanceTransaction.js";
import Invoice from "../models/Invoice.js";
import Notification from "../models/Notification.js";
import Placement from "../models/Placement.js";
import PayrollConfig from "../models/PayrollConfig.js";
import PayrollRun from "../models/PayrollRun.js";
import Result from "../models/Result.js";
import StaffAttendance from "../models/StaffAttendance.js";
import Subject from "../models/Subject.js";
import SyllabusProgress from "../models/SyllabusProgress.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import Book from "../models/Book.js";
import LeaveRequest from "../models/LeaveRequest.js";
import LibraryCirculation from "../models/LibraryCirculation.js";
import { getDefaultPermissions, ROLES } from "../utils/constants.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    Announcement.deleteMany(),
    ApprovalItem.deleteMany(),
    Admission.deleteMany(),
    Assignment.deleteMany(),
    Attendance.deleteMany(),
    Book.deleteMany(),
    Course.deleteMany(),
    Exam.deleteMany(),
    Fee.deleteMany(),
    FinanceTransaction.deleteMany(),
    Invoice.deleteMany(),
    LeaveRequest.deleteMany(),
    LibraryCirculation.deleteMany(),
    Notification.deleteMany(),
    Placement.deleteMany(),
    PayrollConfig.deleteMany(),
    PayrollRun.deleteMany(),
    Result.deleteMany(),
    StaffAttendance.deleteMany(),
    Subject.deleteMany(),
    SyllabusProgress.deleteMany(),
    User.deleteMany(),
    Timetable.deleteMany(),
  ]);

  const [admin, director, registrar, admissionCell, hod, faculty, accountant, hrManager, placementCell, librarian, hostelWarden, transportManager, systemAdmin, student, parent] = await User.create([
    {
      name: "Aarav Sharma",
      email: "admin@smarterp.edu",
      password: "Admin@123",
      role: ROLES.SUPER_ADMIN,
      permissions: getDefaultPermissions(ROLES.SUPER_ADMIN),
      department: "Administration",
    },
    {
      name: "Dr. Niharika Bose",
      email: "director@smarterp.edu",
      password: "Leader@123",
      role: ROLES.DIRECTOR_PRINCIPAL,
      permissions: getDefaultPermissions(ROLES.DIRECTOR_PRINCIPAL),
      department: "Leadership",
    },
    {
      name: "Karan Malhotra",
      email: "registrar@smarterp.edu",
      password: "Admin@123",
      role: ROLES.REGISTRAR,
      permissions: getDefaultPermissions(ROLES.REGISTRAR),
      department: "Registrar Office",
    },
    {
      name: "Ishita Anand",
      email: "admissions@smarterp.edu",
      password: "Admin@123",
      role: ROLES.ADMISSION_CELL,
      permissions: getDefaultPermissions(ROLES.ADMISSION_CELL),
      department: "Admissions",
    },
    {
      name: "Drishti Rao",
      email: "hod.cs@smarterp.edu",
      password: "Faculty@123",
      role: ROLES.HOD,
      permissions: getDefaultPermissions(ROLES.HOD),
      department: "Computer Science",
      employeeId: "HOD-401",
    },
    {
      name: "Meera Verma",
      email: "faculty@smarterp.edu",
      password: "Teacher@123",
      role: ROLES.FACULTY_PROFESSOR,
      permissions: getDefaultPermissions(ROLES.FACULTY_PROFESSOR),
      department: "Computer Science",
      employeeId: "FAC-104",
    },
    {
      name: "Pawan Tiwari",
      email: "accountant@smarterp.edu",
      password: "Finance@123",
      role: ROLES.ACCOUNTANT,
      permissions: getDefaultPermissions(ROLES.ACCOUNTANT),
      department: "Finance",
      employeeId: "ACC-204",
    },
    {
      name: "Sonal Kapoor",
      email: "hr@smarterp.edu",
      password: "HR@12345",
      role: ROLES.HR_MANAGER,
      permissions: getDefaultPermissions(ROLES.HR_MANAGER),
      department: "Human Resources",
      employeeId: "HR-118",
    },
    {
      name: "Pooja Menon",
      email: "placement@smarterp.edu",
      password: "Placement@123",
      role: ROLES.PLACEMENT_CELL,
      permissions: getDefaultPermissions(ROLES.PLACEMENT_CELL),
      department: "Training And Placement",
      employeeId: "PLC-510",
    },
    {
      name: "Rakesh Suri",
      email: "library@smarterp.edu",
      password: "Library@123",
      role: ROLES.LIBRARIAN,
      permissions: getDefaultPermissions(ROLES.LIBRARIAN),
      department: "Library",
    },
    {
      name: "Savita Nair",
      email: "hostel@smarterp.edu",
      password: "Hostel@123",
      role: ROLES.HOSTEL_WARDEN,
      permissions: getDefaultPermissions(ROLES.HOSTEL_WARDEN),
      department: "Hostel",
    },
    {
      name: "Prakash Jain",
      email: "transport@smarterp.edu",
      password: "Transport@123",
      role: ROLES.TRANSPORT_MANAGER,
      permissions: getDefaultPermissions(ROLES.TRANSPORT_MANAGER),
      department: "Transport",
    },
    {
      name: "Aditi Rao",
      email: "sysadmin@smarterp.edu",
      password: "System@123",
      role: ROLES.SYSTEM_ADMIN,
      permissions: getDefaultPermissions(ROLES.SYSTEM_ADMIN),
      department: "IT & Systems",
    },
    {
      name: "Riya Singh",
      email: "student@smarterp.edu",
      password: "Student@123",
      role: ROLES.STUDENT,
      permissions: getDefaultPermissions(ROLES.STUDENT),
      className: "BCA - Sem 4",
      rollNumber: "BCA24017",
      parentEmail: "parent@smarterp.edu",
    },
    {
      name: "Anita Singh",
      email: "parent@smarterp.edu",
      password: "Parent@123",
      role: ROLES.PARENT_GUARDIAN,
      permissions: getDefaultPermissions(ROLES.PARENT_GUARDIAN),
    },
  ]);

  const course = await Course.create({
    title: "Bachelor of Computer Applications",
    code: "BCA-2026",
    department: "Computer Science",
    academicYear: "2026-27",
    teacher: faculty._id,
    students: [student._id],
    description: "Industry-oriented curriculum with project-led learning.",
  });

  const subject = await Subject.create({
    name: "Advanced Web Engineering",
    code: "AWE-401",
    course: course._id,
    teacher: faculty._id,
    credits: 4,
  });

  const exam = await Exam.create({
    title: "Advanced Web Engineering Midterm",
    course: course._id,
    subject: subject._id,
    examDate: new Date("2026-04-15T09:00:00.000Z"),
    maxMarks: 100,
    examType: "midterm",
    room: "Hall A",
  });

  await Promise.all([
    Admission.create({
      studentName: "Kabir Mehta",
      email: "kabir.admission@example.edu",
      phone: "9876543210",
      program: "BCA",
      academicYear: "2026-27",
      source: "social-media",
      documentsVerified: true,
      score: 88,
      status: "verified",
      notes: "Strong entrance profile and early application.",
    }),
    Announcement.create({
      title: "Semester Kickoff",
      content: "Classes begin Monday at 9:00 AM. Timetables and materials are now live.",
      audience: [ROLES.FACULTY_PROFESSOR, ROLES.STUDENT, ROLES.PARENT_GUARDIAN],
      author: admin._id,
      priority: "high",
    }),
    Timetable.create({
      course: course._id,
      subject: subject._id,
      teacher: faculty._id,
      day: "Monday",
      startTime: "09:00",
      endTime: "10:30",
      room: "Lab 3",
    }),
    Assignment.create({
      title: "Build a Faculty Portal",
      description: "Create a responsive portal with authentication and usage analytics.",
      subject: subject._id,
      course: course._id,
      teacher: faculty._id,
      dueDate: new Date("2026-04-20T18:00:00.000Z"),
      submissions: [{ student: student._id }],
    }),
    Attendance.create({
      course: course._id,
      subject: subject._id,
      date: new Date("2026-04-01T00:00:00.000Z"),
      records: [{ student: student._id, status: "present" }],
    }),
    Fee.create({
      student: student._id,
      academicYear: "2026-27",
      totalAmount: 85000,
      paidAmount: 40000,
      dueDate: new Date("2026-05-10T00:00:00.000Z"),
      status: "partial",
    }),
    Result.create({
      exam: exam._id,
      student: student._id,
      marksObtained: 84,
      grade: "A",
      feedback: "Strong problem-solving and clear architecture choices.",
      publishedAt: new Date("2026-04-02T10:00:00.000Z"),
    }),
    Placement.create({
      companyName: "Infosphere Labs",
      roleTitle: "Frontend Developer Intern",
      description: "Work on React-based internal products with mentorship from senior engineers.",
      location: "Bengaluru",
      packageLpa: 6.5,
      eligibility: "BCA/B.Tech final year, strong JavaScript fundamentals",
      deadline: new Date("2026-04-25T00:00:00.000Z"),
      postedBy: placementCell._id,
      applications: [{ student: student._id, status: "applied" }],
    }),
    Notification.create({
      recipient: student._id,
      title: "Welcome to Smart ERP",
      message: "Your student dashboard is ready with timetable, fees, and announcements.",
      type: "success",
    }),
    Notification.create({
      recipient: parent._id,
      title: "Parent Portal Activated",
      message: "You can now monitor fees, exam results, and academic updates for your linked student.",
      type: "success",
    }),
    Notification.create({
      recipient: director._id,
      title: "Leadership Dashboard Ready",
      message: "Leadership analytics, approvals, and institutional summaries are available.",
      type: "success",
    }),
    Notification.create({
      recipient: hod._id,
      title: "Department Dashboard Ready",
      message: "Your HOD analytics and faculty oversight panels are available.",
      type: "success",
    }),
    Notification.create({
      recipient: systemAdmin._id,
      title: "System Administration Active",
      message: "User control, permissions, and support monitoring modules are ready.",
      type: "success",
    }),
    StaffAttendance.create({
      staff: faculty._id,
      date: new Date("2026-04-09T00:00:00.000Z"),
      status: "present",
      checkIn: "09:02",
      checkOut: "16:45",
      remarks: "Completed full teaching schedule.",
      recordedBy: hrManager._id,
    }),
    StaffAttendance.create({
      staff: librarian._id,
      date: new Date("2026-04-09T00:00:00.000Z"),
      status: "present",
      checkIn: "08:55",
      checkOut: "17:10",
      recordedBy: hrManager._id,
    }),
    LeaveRequest.create({
      employee: faculty._id,
      leaveType: "casual",
      fromDate: new Date("2026-04-18T00:00:00.000Z"),
      toDate: new Date("2026-04-19T00:00:00.000Z"),
      reason: "Academic conference participation.",
      status: "pending",
    }),
    PayrollConfig.create({
      employee: faculty._id,
      basicSalary: 62000,
      allowances: 8000,
      deductions: 3500,
      paymentCycle: "monthly",
      effectiveFrom: new Date("2026-04-01T00:00:00.000Z"),
      bankName: "State Bank of India",
      accountNumber: "XXXX123456",
    }),
    PayrollRun.create({
      employee: faculty._id,
      month: "2026-04",
      grossPay: 70000,
      deductions: 3500,
      netPay: 66500,
      status: "processed",
      remarks: "Includes mentoring allowance.",
      processedBy: accountant._id,
    }),
    Book.create({
      title: "Modern Web Architecture",
      accessionNumber: "LIB-1001",
      author: "R. Narayan",
      category: "Technology",
      isbn: "978-93-00000-01-1",
      publisher: "Academic Press",
      shelf: "T-14",
      copiesTotal: 4,
      copiesAvailable: 3,
    }),
    Book.create({
      title: "Data Structures Mastery",
      accessionNumber: "LIB-1002",
      author: "S. Iyer",
      category: "Computer Science",
      isbn: "978-93-00000-02-8",
      publisher: "Campus Books",
      shelf: "CS-04",
      copiesTotal: 6,
      copiesAvailable: 6,
    }),
    FinanceTransaction.create({
      title: "Semester Fee Installment",
      category: "fee",
      type: "credit",
      amount: 40000,
      transactionDate: new Date("2026-04-03T00:00:00.000Z"),
      reference: "RCPT-2045",
      relatedStudent: student._id,
      createdBy: accountant._id,
      notes: "Partial semester fee received.",
    }),
    FinanceTransaction.create({
      title: "Library Resource Procurement",
      category: "vendor",
      type: "debit",
      amount: 18500,
      transactionDate: new Date("2026-04-05T00:00:00.000Z"),
      reference: "VNDR-882",
      relatedEmployee: librarian._id,
      createdBy: accountant._id,
      notes: "Payment for new technical references.",
    }),
    Invoice.create({
      title: "Library Books Procurement",
      vendorName: "Campus Books Distributors",
      invoiceNumber: "INV-LIB-2026-01",
      category: "vendor",
      amount: 18500,
      dueDate: new Date("2026-04-18T00:00:00.000Z"),
      status: "approved",
      notes: "Approved for April procurement cycle.",
      createdBy: accountant._id,
    }),
    ApprovalItem.create({
      title: "Computer Lab Upgrade Budget",
      requestType: "budget",
      department: "Computer Science",
      amount: 250000,
      requestedBy: hod._id,
      status: "pending",
      notes: "Request for workstation refresh and projector replacement.",
    }),
    SyllabusProgress.create({
      subject: subject._id,
      course: course._id,
      faculty: faculty._id,
      unitTitle: "React Router And Secure Access Patterns",
      plannedHours: 12,
      completedHours: 8,
      completionPercent: 67,
      status: "in-progress",
      targetDate: new Date("2026-04-20T00:00:00.000Z"),
      notes: "Students completed role-aware routing lab.",
      updatedBy: hod._id,
    }),
  ]);

  const [bookOne] = await Book.find({ accessionNumber: "LIB-1001" });
  await LibraryCirculation.create({
    book: bookOne._id,
    member: student._id,
    issueDate: new Date("2026-04-04T00:00:00.000Z"),
    dueDate: new Date("2026-04-12T00:00:00.000Z"),
    status: "issued",
  });

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
