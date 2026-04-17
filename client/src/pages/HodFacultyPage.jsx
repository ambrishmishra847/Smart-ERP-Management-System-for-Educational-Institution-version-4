import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";

const HodFacultyPage = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const [coursesResponse, subjectsResponse] = await Promise.all([
        api.get("/erp/courses"),
        api.get("/erp/subjects"),
      ]);
      setCourses(coursesResponse.data);
      setSubjects(subjectsResponse.data);
    };

    load();
  }, []);

  const facultyRows = useMemo(() => {
    const byFaculty = new Map();

    subjects.forEach((subject) => {
      const teacher = subject.teacher;
      if (!teacher?._id) {
        return;
      }
      if (!byFaculty.has(teacher._id)) {
        byFaculty.set(teacher._id, {
          name: teacher.name,
          employeeId: teacher.employeeId || "-",
          subjects: [],
          courses: new Set(),
        });
      }
      const entry = byFaculty.get(teacher._id);
      entry.subjects.push(subject.name);
      if (subject.course?.title) {
        entry.courses.add(subject.course.title);
      }
    });

    return Array.from(byFaculty.values())
      .map((item) => ({
        ...item,
        courses: Array.from(item.courses),
      }))
      .filter((item) => {
        const q = search.toLowerCase();
        return !q || item.name.toLowerCase().includes(q) || item.employeeId.toLowerCase().includes(q);
      });
  }, [subjects, search]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Faculty" subtitle="Mapped in department subjects">
          <p className="text-4xl font-semibold text-slate-900">{facultyRows.length}</p>
        </SectionCard>
        <SectionCard title="Subjects" subtitle="Currently allocated">
          <p className="text-4xl font-semibold text-slate-900">{subjects.length}</p>
        </SectionCard>
        <SectionCard title="Courses" subtitle="Department batches under oversight">
          <p className="text-4xl font-semibold text-slate-900">{courses.length}</p>
        </SectionCard>
      </section>

      <SectionCard title="Faculty Allocation" subtitle="See department staff, their subjects, and course ownership.">
        <div className="mb-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search faculty" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Faculty" },
            { key: "employeeId", label: "Employee ID" },
            { key: "subjects", label: "Assigned Subjects" },
            { key: "courses", label: "Courses" },
          ]}
          rows={facultyRows.map((item) => ({
            name: item.name,
            employeeId: item.employeeId,
            subjects: item.subjects.join(", "),
            courses: item.courses.join(", "),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default HodFacultyPage;
