import { useEffect, useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";

const TimetablePage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    course: "",
    subject: "",
    teacher: "",
    day: "Monday",
    startTime: "",
    endTime: "",
    room: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const loadData = async () => {
    const timetableResponse = await api.get("/erp/timetable");
    setEntries(timetableResponse.data);

    if (hasPermission(user, PERMISSIONS.TIMETABLE_MANAGE)) {
      const [courseResponse, subjectResponse, userResponse] = await Promise.all([
        api.get("/erp/courses"),
        api.get("/erp/subjects"),
        api.get("/erp/users"),
      ]);

      setCourses(courseResponse.data);
      setSubjects(subjectResponse.data);
      setTeachers(userResponse.data.filter((item) => item.role === "teacher"));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/erp/timetable", form);
      setMessage("Timetable entry created successfully.");
      setForm({
        course: "",
        subject: "",
        teacher: "",
        day: "Monday",
        startTime: "",
        endTime: "",
        room: "",
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create timetable entry.");
    }
  };

  const removeEntry = async (entryId) => {
    await api.delete(`/erp/timetable/${entryId}`);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {hasPermission(user, PERMISSIONS.TIMETABLE_MANAGE) ? (
        <SectionCard title="Create Timetable Entry" subtitle="Assign course sessions to subject, teacher, day, time, and room.">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
            <select
              name="teacher"
              value={form.teacher}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} ({teacher.employeeId || "No code"})
                </option>
              ))}
            </select>
            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
            <input
              name="room"
              value={form.room}
              onChange={handleChange}
              placeholder="Room / Lab"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none md:col-span-2"
            />
            {error ? <p className="text-sm text-red-500 md:col-span-2">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">
              Create Timetable Entry
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title="Timetable" subtitle="Table-based weekly view for easier reading.">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">Time</th>
                {days.map((day) => (
                  <th key={day} className="border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...new Set(entries.map((entry) => `${entry.startTime} - ${entry.endTime}`))].map((slot) => (
                <tr key={slot}>
                  <td className="border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">{slot}</td>
                  {days.map((day) => {
                    const entry = entries.find(
                      (item) => item.day === day && `${item.startTime} - ${item.endTime}` === slot
                    );

                    return (
                      <td key={`${day}-${slot}`} className="border border-slate-200 px-4 py-3 align-top text-sm text-slate-700">
                        {entry ? (
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{entry.subject?.name}</p>
                            <p>{entry.course?.title}</p>
                            <p>{entry.teacher?.name}</p>
                            <p>{entry.room}</p>
                            {hasPermission(user, PERMISSIONS.TIMETABLE_MANAGE) ? (
                              <button type="button" onClick={() => removeEntry(entry._id)} className="text-red-500">
                                Remove
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default TimetablePage;
