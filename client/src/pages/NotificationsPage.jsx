import { useEffect, useState } from "react";
import ContentState from "../components/ui/ContentState";
import SectionCard from "../components/ui/SectionCard";
import api from "../services/api";
import { formatDate } from "../utils/formatters";

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get("/erp/notifications");
        setItems(Array.isArray(response.data) ? response.data : response.data?.rows || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const markSeen = async (notificationId) => {
    await api.patch(`/erp/notifications/${notificationId}/read`);
    setItems((prev) => prev.map((item) => (item._id === notificationId ? { ...item, isRead: true } : item)));
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Notifications" subtitle="Central inbox for role-based real-time alerts and ERP updates.">
        {loading ? (
          <ContentState tone="loading" title="Loading notifications" description="Your latest alerts are being fetched." compact />
        ) : error ? (
          <ContentState tone="error" title="Unable to load notifications" description={error} compact />
        ) : !items.length ? (
          <ContentState tone="empty" title="No notifications yet" description="New alerts, reminders, and ERP updates will appear here." compact />
        ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
                {!item.isRead ? (
                  <button
                    type="button"
                    onClick={() => markSeen(item._id)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                  >
                    Mark as seen
                  </button>
                ) : (
                  <span className="text-xs font-medium text-emerald-600">Seen</span>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </SectionCard>
    </div>
  );
};

export default NotificationsPage;
