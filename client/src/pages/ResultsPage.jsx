import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";
import { formatDate } from "../utils/formatters";

const ResultsPage = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [examForm, setExamForm] = useState({
    title: "",
    course: "",
    subject: "",
    examDate: "",
    maxMarks: "",
    examType: "midterm",
    room: "",
  });
  const [resultForm, setResultForm] = useState({
    exam: "",
    student: "",
    marksObtained: "",
    grade: "",
    feedback: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [examsResponse, resultsResponse] = await Promise.all([api.get("/erp/exams"), api.get("/erp/results")]);
      setExams(Array.isArray(examsResponse.data) ? examsResponse.data : examsResponse.data?.rows || []);
      setResults(Array.isArray(resultsResponse.data) ? resultsResponse.data : resultsResponse.data?.rows || []);

      if (hasPermission(user, PERMISSIONS.RESULTS_MANAGE)) {
        const [coursesResponse, subjectsResponse, usersResponse] = await Promise.all([
          api.get("/erp/courses"),
          api.get("/erp/subjects"),
          api.get("/erp/users"),
        ]);
        const allUsers = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data?.rows || [];
        setCourses(Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data?.rows || []);
        setSubjects(Array.isArray(subjectsResponse.data) ? subjectsResponse.data : subjectsResponse.data?.rows || []);
        setStudents(allUsers.filter((item) => item.role === "student"));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load results data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExamChange = (event) => {
    const { name, value } = event.target;
    setExamForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResultChange = (event) => {
    const { name, value } = event.target;
    setResultForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitExam = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/erp/exams", {
        ...examForm,
        maxMarks: Number(examForm.maxMarks),
      });
      setMessage("Exam created successfully.");
      setExamForm({
        title: "",
        course: "",
        subject: "",
        examDate: "",
        maxMarks: "",
        examType: "midterm",
        room: "",
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create exam.");
    }
  };

  const submitResult = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/erp/results", {
        ...resultForm,
        marksObtained: Number(resultForm.marksObtained),
      });
      setMessage("Result published successfully.");
      setResultForm({
        exam: "",
        student: "",
        marksObtained: "",
        grade: "",
        feedback: "",
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to publish result.");
    }
  };

  const removeExam = async (examId) => {
    await api.delete(`/erp/exams/${examId}`);
    await loadData();
  };

  const removeResult = async (resultId) => {
    await api.delete(`/erp/results/${resultId}`);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {hasPermission(user, PERMISSIONS.RESULTS_MANAGE) ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Create Exam" subtitle="Plan exam cycles, rooms, and academic assessments.">
            <form onSubmit={submitExam} className="grid gap-4">
              <input
                name="title"
                value={examForm.title}
                onChange={handleExamChange}
                required
                placeholder="Exam title"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
              <select
                name="course"
                value={examForm.course}
                onChange={handleExamChange}
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <select
                name="subject"
                value={examForm.subject}
                onChange={handleExamChange}
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="examDate"
                  type="datetime-local"
                  value={examForm.examDate}
                  onChange={handleExamChange}
                  required
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
                <input
                  name="maxMarks"
                  type="number"
                  min="1"
                  value={examForm.maxMarks}
                  onChange={handleExamChange}
                  required
                  placeholder="Max marks"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  name="examType"
                  value={examForm.examType}
                  onChange={handleExamChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                >
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="practical">Practical</option>
                  <option value="final">Final</option>
                </select>
                <input
                  name="room"
                  value={examForm.room}
                  onChange={handleExamChange}
                  placeholder="Room"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-tide"
                />
              </div>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
                Create Exam
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Publish Result" subtitle="Release marks, grades, and feedback to students and parents.">
            <form onSubmit={submitResult} className="grid gap-4">
              <select
                name="exam"
                value={resultForm.exam}
                onChange={handleResultChange}
                required
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">Select exam</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.title}
                  </option>
                ))}
              </select>
              <select
                name="student"
                value={resultForm.student}
                onChange={handleResultChange}
                required
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-tide"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.rollNumber || "No roll"})
                  </option>
                ))}
              </select>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="marksObtained"
                  type="number"
                  min="0"
                  value={resultForm.marksObtained}
                  onChange={handleResultChange}
                  required
                  placeholder="Marks obtained"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
                <input
                  name="grade"
                  value={resultForm.grade}
                  onChange={handleResultChange}
                  placeholder="Grade"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
              </div>
              <textarea
                name="feedback"
                value={resultForm.feedback}
                onChange={handleResultChange}
                rows={4}
                placeholder="Teacher feedback"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
                Publish Result
              </button>
            </form>
          </SectionCard>
        </section>
      ) : null}

      <SectionCard title="Scheduled Exams" subtitle="Assessment calendar across courses and subjects.">
        <DataTable
          loading={loading}
          error={!exams.length ? error : ""}
          emptyMessage="No exams have been scheduled yet."
          mobileTitleKey="title"
          rowKey={(row) => row.id}
          columns={[
            { key: "title", label: "Exam" },
            { key: "course", label: "Course" },
            { key: "subject", label: "Subject" },
            { key: "date", label: "Date" },
            { key: "maxMarks", label: "Max Marks" },
            { key: "type", label: "Type" },
            ...(hasPermission(user, PERMISSIONS.RESULTS_MANAGE) ? [{ key: "actions", label: "Actions" }] : []),
          ]}
          rows={exams.map((exam) => ({
            id: exam._id,
            title: exam.title,
            course: exam.course?.title,
            subject: exam.subject?.name,
            date: formatDate(exam.examDate),
            maxMarks: exam.maxMarks,
            type: exam.examType,
            actions:
              hasPermission(user, PERMISSIONS.RESULTS_MANAGE) ? (
                <button type="button" onClick={() => removeExam(exam._id)} className="text-red-500">
                  Remove
                </button>
              ) : undefined,
          }))}
        />
      </SectionCard>

      <SectionCard title="Published Results" subtitle="Student outcomes with academic feedback and marks.">
        <DataTable
          loading={loading}
          error={!results.length ? error : ""}
          emptyMessage="No results have been published yet."
          mobileTitleKey="student"
          rowKey={(row) => row.id}
          columns={[
            { key: "student", label: "Student" },
            { key: "exam", label: "Exam" },
            { key: "subject", label: "Subject" },
            { key: "marks", label: "Marks" },
            { key: "grade", label: "Grade" },
            { key: "feedback", label: "Feedback" },
            ...(hasPermission(user, PERMISSIONS.RESULTS_MANAGE) ? [{ key: "actions", label: "Actions" }] : []),
          ]}
          rows={results.map((result) => ({
            id: result._id,
            student: result.student ? `${result.student.name} (${result.student.rollNumber || "-"})` : "-",
            exam: result.exam?.title,
            subject: result.exam?.subject?.name,
            marks: result.marksObtained,
            grade: result.grade || "-",
            feedback: result.feedback || "-",
            actions:
              hasPermission(user, PERMISSIONS.RESULTS_MANAGE) ? (
                <button type="button" onClick={() => removeResult(result._id)} className="text-red-500">
                  Remove
                </button>
              ) : undefined,
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default ResultsPage;
