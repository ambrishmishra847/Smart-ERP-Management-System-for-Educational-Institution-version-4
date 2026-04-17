import { useEffect, useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { allRoleOptions, hasPermission, PERMISSIONS } from "../utils/access";

const announcementAudience = allRoleOptions.map((item) => ({ key: item.key, label: item.label }));

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "medium",
    audience: ["faculty-professor", "student"],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadItems = async () => {
    const response = await api.get("/erp/announcements");
    setItems(response.data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAudience = (role) => {
    setForm((prev) => ({
      ...prev,
      audience: prev.audience.includes(role)
        ? prev.audience.filter((item) => item !== role)
        : [...prev.audience, role],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/erp/announcements", form);
      setMessage("Announcement published successfully.");
      setForm({
        title: "",
        content: "",
        priority: "medium",
        audience: ["faculty-professor", "student"],
      });
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to publish announcement.");
    }
  };

  const removeAnnouncement = async (announcementId) => {
    await api.delete(`/erp/announcements/${announcementId}`);
    await loadItems();
  };

  return (
    <div className="space-y-6">
      {hasPermission(user, PERMISSIONS.ANNOUNCEMENTS_MANAGE) ? (
        <SectionCard title="Publish Announcement" subtitle="Broadcast academic or operational updates to selected roles.">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Announcement title"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={5}
              required
              placeholder="Announcement content"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm text-slate-600">Audience</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
        {announcementAudience.map((role) => (
                  <label key={role.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.audience.includes(role.key)}
                      onChange={() => toggleAudience(role.key)}
                    />
                    <span>{role.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
              Publish Announcement
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title="Announcements" subtitle="Institution messaging for faculty, students, and administration.">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
                  {item.priority}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.content}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                Audience: {item.audience.join(", ")}
              </p>
              {(hasPermission(user, PERMISSIONS.ANNOUNCEMENTS_MANAGE) || item.author?._id === user._id) ? (
                <button type="button" onClick={() => removeAnnouncement(item._id)} className="mt-4 text-sm text-red-500">
                  Remove Announcement
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default AnnouncementsPage;
