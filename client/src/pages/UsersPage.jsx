import { useEffect, useState } from "react";
import BulkImportCard from "../components/ui/BulkImportCard";
import DataTable from "../components/ui/DataTable";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { allRoleOptions } from "../utils/access";

const manageableRoles = allRoleOptions;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "faculty-professor",
    username: "",
    department: "",
    employeeId: "",
    className: "",
    rollNumber: "",
    parentEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    const response = await api.get("/erp/users");
    setUsers(response.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name !== "role") {
        return { ...prev, [name]: value };
      }

      return {
        ...prev,
        role: value,
        department: ["director-principal", "registrar", "admission-cell", "hod", "faculty-professor", "accountant", "hr-manager", "placement-cell", "librarian", "hostel-warden", "transport-manager", "system-admin"].includes(value) ? prev.department : "",
        employeeId: ["hod", "faculty-professor", "accountant", "hr-manager", "placement-cell", "system-admin"].includes(value) ? prev.employeeId : "",
        className: value === "student" ? prev.className : "",
        rollNumber: value === "student" ? prev.rollNumber : "",
        parentEmail: value === "student" ? prev.parentEmail : "",
      };
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "faculty-professor",
      username: "",
      department: "",
      employeeId: "",
      className: "",
      rollNumber: "",
      parentEmail: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload =
        ["hod", "faculty-professor", "accountant", "hr-manager", "placement-cell", "system-admin"].includes(form.role)
          ? {
              name: form.name,
              username: form.username || undefined,
              email: form.email,
              password: form.password,
              role: form.role,
              department: form.department,
              employeeId: form.employeeId,
            }
          : form.role === "student"
            ? {
                name: form.name,
                username: form.username || undefined,
                email: form.email,
                password: form.password,
                role: form.role,
                className: form.className,
                rollNumber: form.rollNumber,
                parentEmail: form.parentEmail,
              }
            : {
                name: form.name,
                username: form.username || undefined,
                email: form.email,
                password: form.password,
                role: form.role,
              };

      await api.post("/erp/users", payload);
      setSuccess("User account created successfully.");
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeUser = async (userId) => {
    await api.delete(`/erp/users/${userId}`);
    await loadUsers();
  };

  const toggleSuspension = async (user) => {
    setError("");
    setSuccess("");

    try {
      const reason = user.isSuspended
        ? ""
        : window.prompt(`Suspend ${user.name}. Enter a reason for the suspension:`, user.suspensionReason || "");

      if (!user.isSuspended && reason === null) {
        return;
      }

      await api.patch(`/erp/users/${user._id}/suspension`, {
        isSuspended: !user.isSuspended,
        reason: String(reason || "").trim(),
      });

      setSuccess(user.isSuspended ? `${user.name} has been restored.` : `${user.name} has been suspended.`);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user access state.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-2">
        <BulkImportCard
          title="Bulk Student Import"
          subtitle="Upload roll-based student lists from Excel, PDF, Word, or CSV."
          target="students"
          sampleHeaders={["name", "email", "rollNumber", "className", "parentEmail", "password", "phone"]}
          helperText="Use this for newly admitted or migrated student records. The importer can create student accounts in bulk when the uploaded document contains these core columns."
          onImported={loadUsers}
        />
        <BulkImportCard
          title="Bulk Staff / Teacher Import"
          subtitle="Upload faculty and operational staff lists in one batch."
          target="staff"
          sampleHeaders={["name", "email", "employeeId", "department", "role", "password", "username", "phone"]}
          helperText="Upload departmental staff rosters with role and employee code columns to create teachers, HR, accountant, placement, librarian, and other staff accounts faster."
          onImported={loadUsers}
        />
      </section>

      <SectionCard
        title="Create Role-Based Users"
        subtitle="Add leadership, administration, faculty, service, student, and parent users directly from the ERP control panel."
      >
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">Full Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">Username</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">Temporary Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">Role</span>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              {manageableRoles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          {["director-principal", "registrar", "admission-cell", "hod", "faculty-professor", "accountant", "hr-manager", "placement-cell", "librarian", "hostel-warden", "transport-manager", "system-admin"].includes(form.role) ? (
            <>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Department</span>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
              </label>

              {["hod", "faculty-professor", "accountant", "hr-manager", "placement-cell", "system-admin"].includes(form.role) ? (
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-700">Employee / Role Code</span>
                  <input
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  />
                </label>
              ) : null}
            </>
          ) : ["student"].includes(form.role) ? (
            <>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Class / Program</span>
                <input
                  name="className"
                  value={form.className}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Roll Number</span>
                <input
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Linked Parent Email</span>
                <input
                  name="parentEmail"
                  type="email"
                  value={form.parentEmail}
                  onChange={handleChange}
                  placeholder="Parent login email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                />
              </label>
            </>
          ) : (
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Parent accounts can be linked to students by using the same email in the student's `Linked Parent Email` field.
            </div>
          )}

          <div className="lg:col-span-2">
            {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
            {success ? <p className="mb-3 text-sm text-emerald-600">{success}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? "Creating user..."
                : `Create ${manageableRoles.find((item) => item.key === form.role)?.label || "User"}`}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Students Management" subtitle="Search and manage student accounts separately for easier administration.">
        <div className="mb-4">
          <input
            value={studentSearch}
            onChange={(event) => setStudentSearch(event.target.value)}
            placeholder="Search by name, roll number, class, or email"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "className", label: "Class" },
            { key: "rollNumber", label: "Roll Number" },
            { key: "status", label: "Status" },
            { key: "parentEmail", label: "Linked Parent" },
            { key: "actions", label: "Actions" },
          ]}
          rows={users
            .filter((user) => user.role === "student")
            .filter((user) => {
              const q = studentSearch.toLowerCase();
              return !q
                || user.name?.toLowerCase().includes(q)
                || user.email?.toLowerCase().includes(q)
                || user.className?.toLowerCase().includes(q)
                || user.rollNumber?.toLowerCase().includes(q);
            })
            .map((user) => ({
            name: user.name,
            email: user.email,
            className: user.className || "-",
            rollNumber: user.rollNumber || "-",
            status: user.isSuspended ? `Suspended${user.suspensionReason ? `: ${user.suspensionReason}` : ""}` : "Active",
            parentEmail: user.parentEmail || "-",
            actions: (
              <div className="flex gap-3">
                <button type="button" onClick={() => toggleSuspension(user)} className="text-amber-700">
                  {user.isSuspended ? "Restore" : "Suspend"}
                </button>
                <button type="button" onClick={() => removeUser(user._id)} className="text-red-600">
                  Remove
                </button>
              </div>
            ),
          }))}
        />
      </SectionCard>

      <SectionCard title="Faculty And Staff Management" subtitle="Search and manage teachers, coordinators, officers, and operational staff.">
        <div className="mb-4">
          <input
            value={teacherSearch}
            onChange={(event) => setTeacherSearch(event.target.value)}
            placeholder="Search by name, employee code, department, or email"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
          />
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "department", label: "Department" },
            { key: "employeeId", label: "Employee Code" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={users
            .filter((user) => !["student", "parent-guardian"].includes(user.role))
            .filter((user) => {
              const q = teacherSearch.toLowerCase();
              return !q
                || user.name?.toLowerCase().includes(q)
                || user.email?.toLowerCase().includes(q)
                || user.department?.toLowerCase().includes(q)
                || user.employeeId?.toLowerCase().includes(q);
            })
            .map((user) => ({
              name: user.name,
              email: user.email,
              department: `${user.role}${user.department ? ` / ${user.department}` : ""}` || "-",
              employeeId: user.employeeId || user.username || "-",
              status: user.isSuspended ? `Suspended${user.suspensionReason ? `: ${user.suspensionReason}` : ""}` : "Active",
              actions: (
                <div className="flex gap-3">
                  <button type="button" onClick={() => toggleSuspension(user)} className="text-amber-700">
                    {user.isSuspended ? "Restore" : "Suspend"}
                  </button>
                  <button type="button" onClick={() => removeUser(user._id)} className="text-red-600">
                    Remove
                  </button>
                </div>
              ),
            }))}
        />
      </SectionCard>

      <SectionCard title="Parents Management" subtitle="Linked parent and guardian visibility with contact records.">
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={users.filter((user) => user.role === "parent-guardian").map((user) => ({
            name: user.name,
            email: user.email,
            status: user.isSuspended ? `Suspended${user.suspensionReason ? `: ${user.suspensionReason}` : ""}` : "Active",
            actions: (
              <div className="flex gap-3">
                <button type="button" onClick={() => toggleSuspension(user)} className="text-amber-700">
                  {user.isSuspended ? "Restore" : "Suspend"}
                </button>
                <button type="button" onClick={() => removeUser(user._id)} className="text-red-600">
                  Remove
                </button>
              </div>
            ),
          }))}
        />
      </SectionCard>
    </div>
  );
};

export default UsersPage;
