import { useEffect, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const SyllabusTrackingPage = () => {
  const [progressRows, setProgressRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({
    subject: "",
    course: "",
    faculty: "",
    unitTitle: "",
    plannedHours: "",
    completedHours: "",
    completionPercent: "",
    status: "not-started",
    targetDate: "",
    notes: "",
  });

  const load = async () => {
    const [progressResponse, coursesResponse, subjectsResponse] = await Promise.all([
      api.get("/erp/hod/syllabus-progress"),
      api.get("/erp/courses"),
      api.get("/erp/subjects"),
    ]);
    setProgressRows(progressResponse.data);
    setCourses(coursesResponse.data);
    setSubjects(subjectsResponse.data);
    setFaculty(
      Array.from(
        new Map(
          subjectsResponse.data
            .filter((subject) => subject.teacher?._id)
            .map((subject) => [
              subject.teacher._id,
              {
                _id: subject.teacher._id,
                name: subject.teacher.name,
                employeeId: subject.teacher.employeeId,
                role: subject.teacher.role,
              },
            ])
        ).values()
      )
    );
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      plannedHours: Number(form.plannedHours || 0),
      completedHours: Number(form.completedHours || 0),
      completionPercent: Number(form.completionPercent || 0),
    };

    if (editingId) {
      await api.patch(`/erp/hod/syllabus-progress/${editingId}`, payload);
    } else {
      await api.post("/erp/hod/syllabus-progress", payload);
    }

    setEditingId("");
    setForm({
      subject: "",
      course: "",
      faculty: "",
      unitTitle: "",
      plannedHours: "",
      completedHours: "",
      completionPercent: "",
      status: "not-started",
      targetDate: "",
      notes: "",
    });
    await load();
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      subject: item.subject?._id || "",
      course: item.course?._id || "",
      faculty: item.faculty?._id || "",
      unitTitle: item.unitTitle || "",
      plannedHours: item.plannedHours || "",
      completedHours: item.completedHours || "",
      completionPercent: item.completionPercent || "",
      status: item.status || "not-started",
      targetDate: item.targetDate ? new Date(item.targetDate).toISOString().slice(0, 10) : "",
      notes: item.notes || "",
    });
  };

  const remove = async (id) => {
    await api.delete(`/erp/hod/syllabus-progress/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Syllabus Tracking" subtitle="Track unit-level delivery, delays, and completion progress across subjects.">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <select value={form.course} onChange={(event) => setForm((prev) => ({ ...prev, course: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
          <select value={form.subject} onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
          <select value={form.faculty} onChange={(event) => setForm((prev) => ({ ...prev, faculty: event.target.value }))} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="">Select faculty</option>
            {faculty.map((member) => (
              <option key={member._id} value={member._id}>{member.name} ({member.employeeId || "-"})</option>
            ))}
          </select>
          <input value={form.unitTitle} onChange={(event) => setForm((prev) => ({ ...prev, unitTitle: event.target.value }))} required placeholder="Unit / module title" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.plannedHours} onChange={(event) => setForm((prev) => ({ ...prev, plannedHours: event.target.value }))} type="number" placeholder="Planned hours" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.completedHours} onChange={(event) => setForm((prev) => ({ ...prev, completedHours: event.target.value }))} type="number" placeholder="Completed hours" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <input value={form.completionPercent} onChange={(event) => setForm((prev) => ({ ...prev, completionPercent: event.target.value }))} type="number" min="0" max="100" placeholder="Completion %" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
          <input type="date" value={form.targetDate} onChange={(event) => setForm((prev) => ({ ...prev, targetDate: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} rows={4} placeholder="Notes / intervention details" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">
            {editingId ? "Update Progress" : "Add Progress Record"}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Progress Register" subtitle="Department-wide view of unit completion and delays.">
        <DataTable
          columns={[
            { key: "subject", label: "Subject" },
            { key: "faculty", label: "Faculty" },
            { key: "unit", label: "Unit" },
            { key: "progress", label: "Progress" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={progressRows.map((item) => ({
            subject: `${item.subject?.name || "-"} (${item.course?.title || "-"})`,
            faculty: item.faculty?.name || "-",
            unit: item.unitTitle,
            progress: `${item.completionPercent}% (${item.completedHours}/${item.plannedHours} hrs)`,
            status: item.status,
            actions: (
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(item)} className="text-blue-600">Edit</button>
                <button type="button" onClick={() => remove(item._id)} className="text-rose-600">Remove</button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default SyllabusTrackingPage;
