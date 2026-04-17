import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";
import { formatDate } from "../utils/formatters";

const AssignmentsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    course: "",
    dueDate: "",
    attachmentUrl: "",
  });
  const [submissionLinks, setSubmissionLinks] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const assignmentsResponse = await api.get("/erp/assignments");
    setItems(assignmentsResponse.data);

    if (hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE)) {
      const [courseResponse, subjectResponse] = await Promise.all([api.get("/erp/courses"), api.get("/erp/subjects")]);
      setCourses(courseResponse.data);
      setSubjects(subjectResponse.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createAssignment = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/erp/assignments", {
        ...form,
        attachments: form.attachmentUrl ? [form.attachmentUrl] : [],
      });
      setMessage("Assignment created successfully.");
      setForm({
        title: "",
        description: "",
        subject: "",
        course: "",
        dueDate: "",
        attachmentUrl: "",
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create assignment.");
    }
  };

  const submitAssignment = async (assignmentId) => {
    setMessage("");
    setError("");

    try {
      await api.post(`/erp/assignments/${assignmentId}/submit`, {
        fileUrl: submissionLinks[assignmentId],
      });
      setMessage("Assignment submitted successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit assignment.");
    }
  };

  const removeAssignment = async (assignmentId) => {
    await api.delete(`/erp/assignments/${assignmentId}`);
    await loadData();
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) {
      return items;
    }

    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.subject?.name?.toLowerCase().includes(q) ||
        item.course?.title?.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="space-y-6">
      {hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE) ? (
        <SectionCard title="Create Assignment" subtitle="Teachers can post assignments with PDF links and deadlines.">
          <form onSubmit={createAssignment} className="grid gap-4 md:grid-cols-2">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Assignment title"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
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
              value={form.subject}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <input
              name="attachmentUrl"
              value={form.attachmentUrl}
              onChange={handleChange}
              placeholder="PDF URL"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none md:col-span-2"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Assignment description"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none md:col-span-2"
            />
            {error ? <p className="text-sm text-red-500 md:col-span-2">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">
              Create Assignment
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title="Assignments" subtitle="Track assignment delivery, PDFs, and student submissions.">
        <div className="mb-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assignment, subject, or course"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.subject?.name}</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
                <span>Course: {item.course?.title}</span>
                <span>Due: {formatDate(item.dueDate)}</span>
                <span>Submissions: {item.submissions?.length || 0}</span>
              </div>
              {item.attachments?.[0] ? (
                <a href={item.attachments[0]} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-blue-600">
                  View PDF Attachment
                </a>
              ) : null}

              {hasPermission(user, PERMISSIONS.ASSIGNMENTS_SUBMIT) ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={submissionLinks[item._id] || ""}
                    onChange={(event) =>
                      setSubmissionLinks((prev) => ({ ...prev, [item._id]: event.target.value }))
                    }
                    placeholder="Submission PDF / file link"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => submitAssignment(item._id)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Submit Assignment
                  </button>
                </div>
              ) : null}

              {hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE) && item.submissions?.length ? (
                <div className="mt-5">
                  <DataTable
                    columns={[
                      { key: "student", label: "Student" },
                      { key: "submittedAt", label: "Submitted" },
                      { key: "fileUrl", label: "File" },
                    ]}
                    rows={item.submissions.map((submission) => ({
                      student: `${submission.student?.name || "Student"} (${submission.student?.rollNumber || "-"})`,
                      submittedAt: submission.submittedAt ? formatDate(submission.submittedAt) : "-",
                      fileUrl: submission.fileUrl ? (
                        <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600">
                          Open
                        </a>
                      ) : (
                        "-"
                      ),
                    }))}
                  />
                </div>
              ) : null}

              {hasPermission(user, PERMISSIONS.ASSIGNMENTS_MANAGE) ? (
                <button type="button" onClick={() => removeAssignment(item._id)} className="mt-4 text-sm text-red-500">
                  Remove Assignment
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default AssignmentsPage;
