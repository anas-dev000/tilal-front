import { useState, useEffect, useCallback } from "react";
import { Menu, Bell, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { notificationsAPI } from "../services/api";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

let pollInterval = null;

const Navbar = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationsAPI.getNotifications({
        limit: 10,
        unreadOnly: true,
      });

      const data = response.data.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      if (error.response?.status !== 429) {
        console.error("Error fetching notifications:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    if (pollInterval) clearInterval(pollInterval);

    const intervalMs = import.meta.env.DEV ? 300000 : 60000;

    pollInterval = setInterval(fetchNotifications, intervalMs);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return t("navbar.justNow");
    if (seconds < 3600)
      return `${Math.floor(seconds / 60)}${t("navbar.minutesAgo")}`;
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)}${t("navbar.hoursAgo")}`;
    return `${Math.floor(seconds / 86400)}${t("navbar.daysAgo")}`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute ${
                  isRTL ? "left-0" : "right-0"
                } mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-w-[calc(100vw-2rem)]`}
              >
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {t("navbar.notifications")}
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm">
                        {t("navbar.noNotifications")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {unreadCount > 0 && (
                        <div className="p-2 border-b border-gray-100">
                          <button
                            onClick={markAllAsRead}
                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 w-full text-center py-1"
                          >
                            {t("navbar.markAllAsRead")}
                          </button>
                        </div>
                      )}

                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !n.read ? "bg-blue-50" : ""
                          }`}
                          onClick={() => !n.read && markAsRead(n._id)}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl shrink-0">
                              Notification
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                                {n.title}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
                                {n.message}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400">
                                {getTimeAgo(n.createdAt)}
                              </p>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2 sm:p-3 border-t border-gray-200 text-center">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 py-1"
                    >
                      {t("navbar.viewAllNotifications")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
