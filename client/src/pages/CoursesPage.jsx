import { useEffect, useState } from "react";
import BulkImportCard from "../components/ui/BulkImportCard";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "../utils/access";

const CoursesPage = ({ view = "overview" }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseForm, setCourseForm] = useState({
    title: "",
    code: "",
    department: "",
    academicYear: "",
    teacher: "",
    students: [],
    description: "",
  });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    course: "",
    teacher: "",
    credits: 3,
  });
  const [materialForm, setMaterialForm] = useState({
    courseId: "",
    title: "",
    type: "pdf",
    url: "",
    subject: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isMaterialsView = view === "materials";
  const isClassesView = view === "classes";

  const loadPageData = async () => {
    const [courseResponse, subjectResponse] = await Promise.all([
      api.get("/erp/courses"),
      api.get("/erp/subjects"),
    ]);

    setCourses(courseResponse.data);
    setSubjects(subjectResponse.data);

    if (hasPermission(user, PERMISSIONS.USERS_MANAGE)) {
      const usersResponse = await api.get("/erp/users");
      setTeachers(usersResponse.data.filter((item) => ["faculty-professor", "hod"].includes(item.role)));
      setStudents(usersResponse.data.filter((item) => item.role === "student"));
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleCourseChange = (event) => {
    const { name, value } = event.target;
    setCourseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (event) => {
    const { name, value } = event.target;
    setSubjectForm((prev) => ({ ...prev, [name]: name === "credits" ? Number(value) : value }));
  };

  const handleMaterialChange = (event) => {
    const { name, value } = event.target;
    setMaterialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = (studentId) => {
    setCourseForm((prev) => ({
      ...prev,
      students: prev.students.includes(studentId)
        ? prev.students.filter((id) => id !== studentId)
        : [...prev.students, studentId],
    }));
  };

  const createCourse = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/erp/courses", courseForm);
      setSuccess("Course created successfully.");
      setCourseForm({
        title: "",
        code: "",
        department: "",
        academicYear: "",
        teacher: "",
        students: [],
        description: "",
      });
      await loadPageData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create course.");
    }
  };

  const createSubject = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/erp/subjects", subjectForm);
      setSuccess("Subject created successfully.");
      setSubjectForm({
        name: "",
        code: "",
        course: "",
        teacher: "",
        credits: 3,
      });
      await loadPageData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create subject.");
    }
  };

  const removeCourse = async (courseId) => {
    await api.delete(`/erp/courses/${courseId}`);
    await loadPageData();
  };

  const removeSubject = async (subjectId) => {
    await api.delete(`/erp/subjects/${subjectId}`);
    await loadPageData();
  };

  const createMaterial = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post(`/erp/courses/${materialForm.courseId}/materials`, {
        title: materialForm.title,
        type: materialForm.type,
        url: materialForm.url,
        subject: materialForm.subject || undefined,
      });
      setSuccess("Study material uploaded successfully.");
      setMaterialForm({
        courseId: "",
        title: "",
        type: "pdf",
        url: "",
        subject: "",
      });
      await loadPageData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload material.");
    }
  };

  const removeMaterial = async (courseId, materialId) => {
    await api.delete(`/erp/courses/${courseId}/materials/${materialId}`);
    await loadPageData();
  };

  const materialSubjects = subjects.filter(
    (subject) => !materialForm.courseId || subject.course?._id === materialForm.courseId || subject.course === materialForm.courseId
  );

  return (
    <div className="space-y-6">
      {hasPermission(user, PERMISSIONS.COURSES_MANAGE) && !isMaterialsView ? (
        <BulkImportCard
          title="Bulk Course Import"
          subtitle="Upload course sheets from Excel, PDF, Word, or CSV."
          target="courses"
          sampleHeaders={["title", "code", "department", "academicYear", "teacherEmployeeId", "teacherEmail", "studentRollNumbers", "description"]}
          helperText="Registrar, HOD, or academic administration can upload structured course lists. The importer links teachers by employee code or email and can also enroll students using comma-separated roll numbers."
          onImported={loadPageData}
        />
      ) : null}

      {hasPermission(user, PERMISSIONS.COURSES_MANAGE) && !isMaterialsView ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Create Course" subtitle="Set program ownership, academic year, and student enrollment.">
            <form onSubmit={createCourse} className="grid gap-4">
              <input
                name="title"
                value={courseForm.title}
                onChange={handleCourseChange}
                required
                placeholder="Course title"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="code"
                  value={courseForm.code}
                  onChange={handleCourseChange}
                  required
                  placeholder="Course code"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
                <input
                  name="department"
                  value={courseForm.department}
                  onChange={handleCourseChange}
                  required
                  placeholder="Department"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="academicYear"
                  value={courseForm.academicYear}
                  onChange={handleCourseChange}
                  required
                  placeholder="Academic year"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
                <select
                  name="teacher"
                  value={courseForm.teacher}
                  onChange={handleCourseChange}
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
              </div>
              <textarea
                name="description"
                value={courseForm.description}
                onChange={handleCourseChange}
                rows={4}
                placeholder="Course description"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
              />
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm text-slate-600">Enroll students</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {students.map((student) => (
                    <label key={student._id} className="flex items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={courseForm.students.includes(student._id)}
                        onChange={() => handleStudentToggle(student._id)}
                      />
                      <span>
                        {student.name} {student.rollNumber ? `(${student.rollNumber})` : ""} {student.className ? `- ${student.className}` : ""}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
                Create Course
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Create Subject" subtitle="Attach subjects to a course and assign the responsible teacher.">
            <form onSubmit={createSubject} className="grid gap-4">
              <input
                name="name"
                value={subjectForm.name}
                onChange={handleSubjectChange}
                required
                placeholder="Subject name"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="code"
                  value={subjectForm.code}
                  onChange={handleSubjectChange}
                  required
                  placeholder="Subject code"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
                <input
                  name="credits"
                  type="number"
                  min="1"
                  value={subjectForm.credits}
                  onChange={handleSubjectChange}
                  required
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
              </div>
              <select
                name="course"
                value={subjectForm.course}
                onChange={handleSubjectChange}
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
                name="teacher"
                value={subjectForm.teacher}
                onChange={handleSubjectChange}
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
              <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">
                Create Subject
              </button>
            </form>
          </SectionCard>
        </section>
      ) : null}

      {(hasPermission(user, PERMISSIONS.MATERIALS_MANAGE) || hasPermission(user, PERMISSIONS.COURSES_MANAGE)) ? (
        <SectionCard title="Study Materials" subtitle="Share PDFs, YouTube videos, PPTs, Word files, and links with students.">
          <form onSubmit={createMaterial} className="grid gap-4 md:grid-cols-2">
            <select name="courseId" value={materialForm.courseId} onChange={handleMaterialChange} required className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
              <option value="">Select course</option>
              {courses
                .filter((course) => hasPermission(user, PERMISSIONS.COURSES_MANAGE) || course.teacher?._id === user._id)
                .map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
            </select>
            <select name="subject" value={materialForm.subject} onChange={handleMaterialChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
              <option value="">All subjects</option>
              {materialSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
            <input name="title" value={materialForm.title} onChange={handleMaterialChange} required placeholder="Material title" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <select name="type" value={materialForm.type} onChange={handleMaterialChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
              <option value="pdf">PDF</option>
              <option value="youtube">YouTube</option>
              <option value="ppt">PPT</option>
              <option value="word">Word</option>
              <option value="link">Link</option>
            </select>
            <input name="url" value={materialForm.url} onChange={handleMaterialChange} required placeholder="Material URL" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none md:col-span-2" />
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2">
              Upload Material
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title={isMaterialsView ? "Materials Repository" : "Courses & Materials"}
        subtitle={isMaterialsView ? "Access shared PDFs, videos, PPTs, Word files, and other learning resources by course." : "Track program ownership, class rosters, and department coverage."}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <article key={course._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{course.code}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{course.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{course.description}</p>
              {!isMaterialsView ? (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div>
                    <p className="text-slate-400">Department</p>
                    <p>{course.department}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Teacher</p>
                    <p>{course.teacher?.name}</p>
                    <p className="text-xs text-slate-400">{course.teacher?.employeeId || ""}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Academic Year</p>
                    <p>{course.academicYear}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Students</p>
                    <p>{course.students?.length || 0}</p>
                  </div>
                </div>
              ) : null}
              {hasPermission(user, PERMISSIONS.COURSES_MANAGE) && !isMaterialsView ? (
                <button type="button" onClick={() => removeCourse(course._id)} className="mt-4 text-sm text-red-500">
                  Remove Course
                </button>
              ) : null}
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-900">Study Materials</p>
                <div className="mt-3 space-y-3">
                  {(course.materials || []).length ? (
                    course.materials.map((material) => (
                      <div key={material._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-slate-900">{material.title}</p>
                            <p className="text-sm text-slate-600">
                              {material.type.toUpperCase()} {material.subject?.name ? `| ${material.subject.name}` : ""}
                            </p>
                            <a href={material.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-blue-600">
                              Open material
                            </a>
                          </div>
                          {hasPermission(user, PERMISSIONS.MATERIALS_MANAGE) ? (
                            <button type="button" onClick={() => removeMaterial(course._id, material._id)} className="text-sm text-red-500">
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No study materials uploaded yet.</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      {!isMaterialsView ? (
        <SectionCard title={isClassesView ? "Class Subjects" : "Subjects"} subtitle="Subject catalog mapped to courses and faculty ownership.">
        <div className="grid gap-4 lg:grid-cols-2">
          {subjects.map((subject) => (
            <article key={subject._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{subject.code}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{subject.name}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div>
                  <p className="text-slate-400">Course</p>
                  <p>{subject.course?.title}</p>
                </div>
                <div>
                  <p className="text-slate-400">Teacher</p>
                  <p>{subject.teacher?.name}</p>
                  <p className="text-xs text-slate-400">{subject.teacher?.employeeId || ""}</p>
                </div>
                <div>
                  <p className="text-slate-400">Credits</p>
                  <p>{subject.credits}</p>
                </div>
              </div>
              {hasPermission(user, PERMISSIONS.SUBJECTS_MANAGE) ? (
                <button type="button" onClick={() => removeSubject(subject._id)} className="mt-4 text-sm text-red-500">
                  Remove Subject
                </button>
              ) : null}
            </article>
          ))}
        </div>
        </SectionCard>
      ) : null}
    </div>
  );
};

export default CoursesPage;
