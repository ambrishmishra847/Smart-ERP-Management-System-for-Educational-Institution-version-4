import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { roleGroups } from "../utils/access";
import { getDefaultRoute } from "../utils/routes";

const administrationChoices = [
  { key: "system", label: "System" },
  { key: "leadership", label: "Leadership" },
  { key: "administration", label: "Administration" },
  { key: "faculty", label: "Faculty" },
  { key: "services", label: "Services" },
  { key: "learners", label: "Learners" },
  { key: "family", label: "Family" },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [group, setGroup] = useState(administrationChoices[0].key);
  const [mode, setMode] = useState(roleGroups.system[0]);
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const nextUser = await login(form);
      navigate(getDefaultRoute(nextUser));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-center font-display text-3xl font-semibold text-slate-900">Smart-ERP</h1>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {administrationChoices.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                const nextRole = roleGroups[item.key][0];
                setGroup(item.key);
                setMode(nextRole);
                setForm({ identifier: "", password: "" });
              }}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                group === item.key
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">Select Role</p>
          <div className="grid grid-cols-2 gap-2">
            {roleGroups[group].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setMode(item);
                  setForm({ identifier: "", password: "" });
                }}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  mode.key === item.key
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">{mode.hint}</span>
            <input
              value={form.identifier}
              onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
              placeholder="Enter email, username, roll number, or employee code"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
            />
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            {submitting ? "Signing in..." : `Login as ${mode.label}`}
          </button>
          <div className="text-center text-sm text-slate-500">
            <Link to="/forgot-password" className="font-medium text-slate-700 hover:text-slate-900">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
