import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";

const StudentManagementPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const managedUsersUrl = hasPermission(user, PERMISSIONS.USERS_MANAGE) ? "/erp/managed-users?role=student" : "/erp/managed-users";
      const [studentsResponse, attendanceResponse, resultsResponse, assignmentsResponse] = await Promise.all([
        api.get(managedUsersUrl),
        api.get("/erp/attendance"),
        api.get("/erp/results"),
        api.get("/erp/assignments"),
      ]);

      const studentRows = Array.isArray(studentsResponse.data) ? studentsResponse.data : studentsResponse.data?.rows || [];
      setStudents(studentRows);
      setAttendance(Array.isArray(attendanceResponse.data) ? attendanceResponse.data : attendanceResponse.data?.rows || []);
      setResults(Array.isArray(resultsResponse.data) ? resultsResponse.data : resultsResponse.data?.rows || []);
      setAssignments(Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : assignmentsResponse.data?.rows || []);
      if (studentRows.length && !selectedStudentId) {
        setSelectedStudentId(studentRows[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(
      (student) =>
        !q ||
        student.name?.toLowerCase().includes(q) ||
        student.rollNumber?.toLowerCase().includes(q) ||
        student.className?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const selectedStudent = students.find((student) => student._id === selectedStudentId) || filteredStudents[0];
  const selectedStudentAttendance = attendance.filter((row) =>
    row.records.some((record) => record.student?._id === selectedStudent?._id)
  );
  const selectedStudentResults = results.filter((result) => result.student?._id === selectedStudent?._id);
  const selectedStudentSubmissions = assignments
    .map((assignment) => ({
      assignment,
      submission: assignment.submissions?.find((submission) => submission.student?._id === selectedStudent?._id),
    }))
    .filter((item) => item.submission);
  const presentCount = selectedStudentAttendance.filter((row) =>
    row.records.some(
      (record) =>
        record.student?._id === selectedStudent?._id && (record.status === "present" || record.status === "late")
    )
  ).length;
  const attendancePercentage = selectedStudentAttendance.length
    ? Math.round((presentCount / selectedStudentAttendance.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <SectionCard title="Student Management" subtitle="Search and inspect individual or collective student reports.">
        <div className="mb-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student by name, roll number, or class"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />
        </div>
        <DataTable
          loading={loading}
          error={error}
          emptyMessage="No students are available in this workspace yet."
          mobileTitleKey="name"
          rowKey={(row) => row.id}
          columns={[
            { key: "name", label: "Student" },
            { key: "rollNumber", label: "Roll Number" },
            { key: "className", label: "Class" },
            { key: "action", label: "Action" },
          ]}
          rows={filteredStudents.map((student) => ({
            id: student._id,
            name: student.name,
            rollNumber: student.rollNumber || "-",
            className: student.className || "-",
            action: (
              <button type="button" onClick={() => setSelectedStudentId(student._id)} className="text-blue-600">
                View Report
              </button>
            ),
          }))}
        />
      </SectionCard>

      {selectedStudent ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <SectionCard title="Attendance %" subtitle={selectedStudent.name}>
              <p className="text-4xl font-semibold text-slate-900">{attendancePercentage}%</p>
            </SectionCard>
            <SectionCard title="Results Published" subtitle="Assessment visibility">
              <p className="text-4xl font-semibold text-slate-900">{selectedStudentResults.length}</p>
            </SectionCard>
            <SectionCard title="Assignments Submitted" subtitle="Submission tracking">
              <p className="text-4xl font-semibold text-slate-900">{selectedStudentSubmissions.length}</p>
            </SectionCard>
          </section>

          <SectionCard title="Attendance Report" subtitle="Individual student attendance report.">
            <DataTable
              loading={loading}
              error={!selectedStudentAttendance.length ? error : ""}
              emptyMessage="No attendance entries are available for this student yet."
              mobileTitleKey="date"
              rowKey={(row) => `${row.date}-${row.subject}`}
              columns={[
                { key: "date", label: "Date" },
                { key: "subject", label: "Subject" },
                { key: "status", label: "Status" },
              ]}
              rows={selectedStudentAttendance.map((row) => ({
                date: new Date(row.date).toLocaleDateString("en-IN"),
                subject: row.subject?.name,
                status: row.records.find((record) => record.student?._id === selectedStudent._id)?.status || "-",
              }))}
            />
          </SectionCard>

          <SectionCard title="Academic Report" subtitle="Subject-level performance and assignment record.">
            <DataTable
              loading={loading}
              error={!selectedStudentResults.length ? error : ""}
              emptyMessage="No results are available for this student yet."
              mobileTitleKey="subject"
              rowKey={(row) => `${row.subject}-${row.marks}`}
              columns={[
                { key: "subject", label: "Subject" },
                { key: "marks", label: "Marks" },
                { key: "grade", label: "Grade" },
              ]}
              rows={selectedStudentResults.map((result) => ({
                subject: result.exam?.subject?.name || "-",
                marks: result.marksObtained,
                grade: result.grade || "-",
              }))}
            />
          </SectionCard>
        </>
      ) : null}

      {hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE) ? (
        <SectionCard title="Collective Attendance View" subtitle="Teacher-level overview across all managed students.">
          <DataTable
            loading={loading}
            error={error}
            emptyMessage="No collective attendance data is available yet."
            mobileTitleKey="name"
            rowKey={(row) => row.id}
            columns={[
              { key: "name", label: "Student" },
              { key: "rollNumber", label: "Roll Number" },
              { key: "attendance", label: "Attendance %" },
              { key: "submissions", label: "Assignments Submitted" },
            ]}
            rows={students.map((student) => {
              const studentRows = attendance.filter((row) =>
                row.records.some((record) => record.student?._id === student._id)
              );
              const studentPresent = studentRows.filter((row) =>
                row.records.some(
                  (record) =>
                    record.student?._id === student._id && (record.status === "present" || record.status === "late")
                )
              ).length;
              const percentage = studentRows.length ? Math.round((studentPresent / studentRows.length) * 100) : 0;
              const submissions = assignments.filter((assignment) =>
                assignment.submissions?.some((submission) => submission.student?._id === student._id)
              ).length;

              return {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber || "-",
                attendance: `${percentage}%`,
                submissions,
              };
            })}
          />
        </SectionCard>
      ) : null}
    </div>
  );
};

export default StudentManagementPage;
