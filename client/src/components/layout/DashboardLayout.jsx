import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiBell, FiLogOut } from "react-icons/fi";
import { getNavigationForUser } from "../../data/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { connectSocket, disconnectSocket } from "../../services/socket";
import api from "../../services/api";
import { formatDate } from "../../utils/formatters";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navItems = getNavigationForUser(user);
  const [showNews, setShowNews] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const normalizeNotifications = (payload) => (
    Array.isArray(payload) ? payload : payload?.rows || []
  );

  useEffect(() => {
    if (!user?._id) {
      return undefined;
    }

    connectSocket(user._id);
    return () => disconnectSocket();
  }, [user]);

  useEffect(() => {
    if (!user?._id) {
      return undefined;
    }

    const loadNotifications = async () => {
      const response = await api.get("/erp/notifications?limit=6");
      setNotifications(normalizeNotifications(response.data));
    };

    loadNotifications();
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) {
      return undefined;
    }

    const socket = connectSocket(user._id);

    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 6));
    };

    socket.on("notification:new", handleNotification);
    return () => socket.off("notification:new", handleNotification);
  }, [user?._id]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markSeen = async (notificationId) => {
    await api.patch(`/erp/notifications/${notificationId}/read`);
    setNotifications((prev) => prev.map((item) => (item._id === notificationId ? { ...item, isRead: true } : item)));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[270px_1fr]">
        <aside className="bg-slate-950 p-5 text-white">
          <div className="border-b border-white/10 pb-6">
            <p className="font-display text-3xl font-semibold">Smart ERP</p>
          </div>

          <div className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      isActive ? "bg-slate-100 text-slate-900" : "text-slate-200 hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </aside>

        <main className="space-y-6 p-6">
          <header className="flex flex-col gap-4 border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-400">{user.roleLabel || user.role.replace("-", " ")}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">{user.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Role-based dashboard with controlled access and institution-wide modules.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNews((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600"
                >
                  <span className="relative">
                    <FiBell className="text-red-500" />
                    {unreadCount > 0 ? (
                      <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    ) : null}
                  </span>
                  News
                </button>

                {showNews ? (
                  <div className="absolute right-0 z-20 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold text-slate-900">Recent News</p>
                      <span className="text-xs text-slate-400">Latest actions</span>
                    </div>
                    <div className="space-y-3">
                      {notifications.length ? (
                        notifications.map((item) => (
                          <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-sm font-medium text-slate-900">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-600">{item.message}</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <p className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</p>
                              {!item.isRead ? (
                                <button
                                  type="button"
                                  onClick={() => markSeen(item._id)}
                                  className="rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-slate-700"
                                >
                                  Mark as seen
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-600">Seen</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No recent updates yet.</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
              >
                <span className="inline-flex items-center gap-2">
                  <FiLogOut />
                  Logout
                </span>
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
