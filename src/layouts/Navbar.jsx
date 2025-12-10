import { useState, useEffect } from 'react';
import { Menu, Bell, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Navbar = ({ onMenuClick }) => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

 
useEffect(() => {
  if (user) {
    fetchNotifications();
    // ✅ تقليل التكرار من 30 ثانية إلى دقيقة واحدة
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }
}, [user]);

const fetchNotifications = async () => {
  try {
    // ✅ إضافة تأخير عشوائي لتوزيع الطلبات
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000));
    
    const response = await notificationsAPI.getNotifications({ 
      limit: 10,
      unreadOnly: true // ✅ جلب غير المقروءة فقط
    });
    const data = response.data.data || [];
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  } catch (error) {
    // ✅ تجاهل أخطاء 429 بصمت
    if (error.response?.status !== 429) {
      console.error('Error fetching notifications:', error);
    }
  }
};

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    return '📢';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Menu Button (Mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-w-[calc(100vw-2rem)]`}>
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm">No notifications</p>
                    </div>
                  ) : (
                    <>
                      {unreadCount > 0 && (
                        <div className="p-2 border-b border-gray-100">
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 w-full text-center py-1"
                          >
                            Mark all as read
                          </button>
                        </div>
                      )}

                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkAsRead(notification._id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1 break-words">
                                {notification.title}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-600 mb-1 break-words">
                                {notification.message}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400">
                                {getTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-2 sm:p-3 border-t border-gray-200 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                      }}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 py-1"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;