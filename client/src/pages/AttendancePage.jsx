import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";
import { formatDate } from "../utils/formatters";

const statusColor = {
  present: "bg-emerald-500",
  absent: "bg-rose-500",
  late: "bg-amber-400",
};

const buildCalendar = (attendanceRows, studentId, month) => {
  const [year, monthIndex] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const statusByDay = {};

  attendanceRows.forEach((row) => {
    const rowDate = new Date(row.date);
    const sameMonth = rowDate.getFullYear() === year && rowDate.getMonth() + 1 === monthIndex;
    if (!sameMonth) {
      return;
    }

    const day = rowDate.getDate();
    const record = row.records.find((item) => item.student?._id === studentId);
    if (record) {
      statusByDay[day] = record.status;
    }
  });

  return Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    status: statusByDay[index + 1] || "none",
  }));
};

const getMonthOptions = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
};

const AttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("");
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("");
  const [form, setForm] = useState({
    course: "",
    subject: "",
    date: new Date().toISOString().slice(0, 10),
    records: [],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMonth) {
        params.set("month", selectedMonth);
      }
      if (selectedSubjectFilter) {
        params.set("subject", selectedSubjectFilter);
      }
      if (selectedStudentFilter) {
        params.set("student", selectedStudentFilter);
      }

      const attendanceResponse = await api.get(`/erp/attendance${params.toString() ? `?${params.toString()}` : ""}`);
      setRecords(Array.isArray(attendanceResponse.data) ? attendanceResponse.data : attendanceResponse.data?.rows || []);

      if (hasPermission(user, PERMISSIONS.ATTENDANCE_MARK)) {
        const [courseResponse, subjectResponse, managedUsersResponse] = await Promise.all([
          api.get("/erp/courses"),
          api.get("/erp/subjects"),
          api.get("/erp/managed-users"),
        ]);
        const allSubjects = Array.isArray(subjectResponse.data) ? subjectResponse.data : subjectResponse.data?.rows || [];
        setCourses(Array.isArray(courseResponse.data) ? courseResponse.data : courseResponse.data?.rows || []);
        setSubjects(allSubjects.filter((subject) => subject.teacher?._id === user._id || subject.teacher === user._id));
        setStudents(Array.isArray(managedUsersResponse.data) ? managedUsersResponse.data : managedUsersResponse.data?.rows || []);
      }

      if (hasPermission(user, PERMISSIONS.USERS_MANAGE)) {
        const [courseResponse, subjectResponse, managedUsersResponse] = await Promise.all([
          api.get("/erp/courses"),
          api.get("/erp/subjects"),
          api.get("/erp/managed-users?role=student"),
        ]);
        setCourses(Array.isArray(courseResponse.data) ? courseResponse.data : courseResponse.data?.rows || []);
        setSubjects(Array.isArray(subjectResponse.data) ? subjectResponse.data : subjectResponse.data?.rows || []);
        setStudents(Array.isArray(managedUsersResponse.data) ? managedUsersResponse.data : managedUsersResponse.data?.rows || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedSubjectFilter, selectedStudentFilter]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const relevantSubjects = useMemo(() => {
    if (!form.course) {
      return subjects;
    }

    return subjects.filter((subject) => subject.course?._id === form.course || subject.course === form.course);
  }, [subjects, form.course]);

  const relevantStudents = useMemo(() => {
    if (!form.course) {
      return [];
    }

    const course = courses.find((item) => item._id === form.course);
    const rosterIds = new Set((course?.students || []).map((student) => String(student._id || student)));
    return students.filter((student) => rosterIds.has(String(student._id)));
  }, [courses, students, form.course]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      records: relevantStudents.map((student) => ({
        student: student._id,
        status: prev.records.find((item) => item.student === student._id)?.status || "present",
        name: student.name,
        rollNumber: student.rollNumber,
      })),
    }));
  }, [relevantStudents]);

  const updateStatus = (studentId, status) => {
    setForm((prev) => ({
      ...prev,
      records: prev.records.map((item) => (item.student === studentId ? { ...item, status } : item)),
    }));
  };

  const submitAttendance = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/erp/attendance", {
        course: form.course,
        subject: form.subject,
        date: form.date,
        records: form.records.map((item) => ({ student: item.student, status: item.status })),
      });
      setMessage("Attendance saved successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save attendance.");
    }
  };

  const filteredStudents = useMemo(() => {
    const base = hasPermission(user, PERMISSIONS.ATTENDANCE_MARK) ? relevantStudents : students;
    if (!search.trim()) {
      return base;
    }

    const q = search.toLowerCase();
    return base.filter(
      (student) =>
        student.name?.toLowerCase().includes(q) ||
        student.rollNumber?.toLowerCase().includes(q) ||
        student.className?.toLowerCase().includes(q)
    );
  }, [students, relevantStudents, search, user.role]);

  const currentStudentId =
    hasPermission(user, PERMISSIONS.ASSIGNMENTS_SUBMIT)
      ? user._id
      : !hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE) && hasPermission(user, PERMISSIONS.RESULTS_VIEW)
        ? records[0]?.records?.[0]?.student?._id
        : null;

  const attendanceSummary = useMemo(() => {
    if (!currentStudentId) {
      return { total: 0, present: 0, percentage: 0 };
    }

    let total = 0;
    let present = 0;

    records.forEach((row) => {
      const record = row.records.find((item) => item.student?._id === currentStudentId);
      if (record) {
        total += 1;
        if (record.status === "present" || record.status === "late") {
          present += 1;
        }
      }
    });

    return { total, present, percentage: total ? Math.round((present / total) * 100) : 0 };
  }, [records, currentStudentId]);

  const attendanceCalendar = currentStudentId ? buildCalendar(records, currentStudentId, selectedMonth) : [];

  const teacherRows = filteredStudents.map((student) => {
    const relatedRows = records.filter((row) => row.records.some((item) => item.student?._id === student._id));
    const presentCount = relatedRows.filter((row) =>
      row.records.some((item) => item.student?._id === student._id && (item.status === "present" || item.status === "late"))
    ).length;
    const totalCount = relatedRows.length;

    return {
      studentId: student._id,
      name: student.name,
      rollNumber: student.rollNumber || "-",
      className: student.className || "-",
      attendance: `${totalCount ? Math.round((presentCount / totalCount) * 100) : 0}%`,
      records: totalCount,
    };
  });

  if (hasPermission(user, PERMISSIONS.ASSIGNMENTS_SUBMIT) || (!hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE) && hasPermission(user, PERMISSIONS.RESULTS_VIEW))) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            {getMonthOptions().map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <SectionCard title="Attendance Percentage" subtitle="Percentage of classes attended.">
            <p className="text-4xl font-semibold text-slate-900">{attendanceSummary.percentage}%</p>
          </SectionCard>
          <SectionCard title="Classes Attended" subtitle="Present or late sessions counted as attended.">
            <p className="text-4xl font-semibold text-slate-900">{attendanceSummary.present}</p>
          </SectionCard>
          <SectionCard title="Total Classes" subtitle="Attendance records for the selected month.">
            <p className="text-4xl font-semibold text-slate-900">{attendanceSummary.total}</p>
          </SectionCard>
        </section>

        <SectionCard title="Attendance Calendar" subtitle="Monthly visual attendance record.">
          <div className="grid grid-cols-7 gap-3">
            {attendanceCalendar.map((item) => (
              <div key={item.day} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-sm font-medium text-slate-900">{item.day}</p>
                <div className={`mx-auto mt-2 h-3 w-3 rounded-full ${statusColor[item.status] || "bg-slate-300"}`} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Attendance Log" subtitle="Session-by-session attendance visibility.">
          <DataTable
            loading={loading}
            error={!records.length ? error : ""}
            emptyMessage="No attendance sessions were found for the selected month."
            mobileTitleKey="date"
            rowKey={(row) => `${row.date}-${row.subject}`}
            columns={[
              { key: "date", label: "Date" },
              { key: "subject", label: "Subject" },
              { key: "course", label: "Course" },
              { key: "status", label: "Status" },
            ]}
            rows={records
              .map((row) => {
                const record = row.records.find((item) => item.student?._id === currentStudentId);
                return record
                  ? {
                      date: formatDate(row.date),
                      subject: row.subject?.name,
                      course: row.course?.title,
                      status: record.status,
                    }
                  : null;
              })
              .filter(Boolean)}
          />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasPermission(user, PERMISSIONS.ATTENDANCE_MARK) ? (
        <SectionCard title="Mark Attendance" subtitle="Attendance marking is now course and subject based.">
          <form onSubmit={submitAttendance} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <select name="course" value={form.course} onChange={handleFormChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
              <select name="subject" value={form.subject} onChange={handleFormChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
                <option value="">Select subject</option>
                {relevantSubjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
              <input name="date" type="date" value={form.date} onChange={handleFormChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-slate-900">Student Attendance Sheet</p>
                <p className="text-sm text-slate-500">Students are loaded from the selected course roster.</p>
              </div>
              {filteredStudents.map((student) => (
                <div key={student._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4">
                  <div>
                    <p className="font-medium text-slate-900">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.rollNumber || "-"} {student.className ? `| ${student.className}` : ""}</p>
                  </div>
                  <div className="flex gap-2">
                    {["present", "absent", "late"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateStatus(student._id, status)}
                        className={`rounded-lg px-3 py-2 text-sm ${form.records.find((item) => item.student === student._id)?.status === status ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
                      >
                    {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">Save Attendance</button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title={hasPermission(user, PERMISSIONS.ATTENDANCE_MARK) ? "Student Attendance Reports" : "Attendance Overview"} subtitle="Filter by month, subject, and student to inspect both collective and individual attendance.">
        <div className="mb-4 grid gap-4 md:grid-cols-4">
          <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            {getMonthOptions().map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select value={selectedSubjectFilter} onChange={(event) => setSelectedSubjectFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
          {(hasPermission(user, PERMISSIONS.ATTENDANCE_MARK) || hasPermission(user, PERMISSIONS.USERS_MANAGE)) ? (
            <select value={selectedStudentFilter} onChange={(event) => setSelectedStudentFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
              <option value="">All students</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>{student.name} ({student.rollNumber || "-"})</option>
              ))}
            </select>
          ) : null}
          {(hasPermission(user, PERMISSIONS.ATTENDANCE_MARK) || hasPermission(user, PERMISSIONS.USERS_MANAGE)) ? (
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or roll number" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          ) : null}
        </div>

        {(hasPermission(user, PERMISSIONS.ATTENDANCE_MARK) || hasPermission(user, PERMISSIONS.USERS_MANAGE)) && teacherRows.length > 0 ? (
          <DataTable
            loading={loading}
            error={!teacherRows.length ? error : ""}
            emptyMessage="No student attendance rows match the current filters."
            mobileTitleKey="name"
            rowKey={(row) => row.studentId}
            columns={[
              { key: "name", label: "Student" },
              { key: "rollNumber", label: "Roll Number" },
              { key: "className", label: "Class" },
              { key: "attendance", label: "Attendance %" },
              { key: "records", label: "Sessions" },
            ]}
            rows={teacherRows}
          />
        ) : (
          <DataTable
            loading={loading}
            error={!records.length ? error : ""}
            emptyMessage="No attendance records are available for the current filters."
            mobileTitleKey="date"
            rowKey={(row) => `${row.date}-${row.subject}`}
            columns={[
              { key: "date", label: "Date" },
              { key: "subject", label: "Subject" },
              { key: "course", label: "Course" },
              { key: "records", label: "Student Records" },
            ]}
            rows={records.map((record) => ({
              date: formatDate(record.date),
              subject: record.subject?.name,
              course: record.course?.title,
              records: record.records.map((item) => `${item.student?.name} (${item.student?.rollNumber || "-"}) : ${item.status}`).join(", "),
            }))}
          />
        )}
      </SectionCard>
    </div>
  );
};

export default AttendancePage;
