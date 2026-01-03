import { useState, useEffect, useCallback } from "react";
import {
  Menu,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  X,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Lock,
  ChevronDown,
  User
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { notificationsAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ChangePasswordModal from "../components/common/ChangePasswordModal";
import { useSocket } from "../context/SocketContext";
import useClickOutside from "../hooks/useClickOutside";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ onMenuClick, onDesktopToggle, isDesktopSidebarOpen }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Click Outside Hook
  const notificationsRef = useClickOutside(() => setShowNotifications(false));
  const profileRef = useClickOutside(() => setShowProfileMenu(false));

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationsAPI.getNotifications({
        limit: 10,
        unreadOnly: false,
      });

      const data = response.data.data || [];
      setNotifications(data);
      setUnreadCount(data.length); // Everything in DB is effectively unread now because we delete on read
    } catch (error) {
      if (error.response?.status !== 429) {
        console.error("Error fetching notifications:", error);
      }
    }
  }, [user]);

  const socket = useSocket();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep only last 10
        setUnreadCount(prev => prev + 1);
      };

      socket.on('new_notification', handleNewNotification);
      
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [user, fetchNotifications, socket]);

  const handleNotificationClick = async (n) => {
    try {
      // 1. Delete from database (as requested)
      await notificationsAPI.deleteNotification(n._id);
      
      // 2. Remove from local state
      setNotifications(prev => prev.filter(item => item._id !== n._id));
      setUnreadCount(prev => Math.max(0, prev - (n.read ? 0 : 1)));

      // 3. Navigate based on type and data
      if (n.data) {
        const role = user?.role;
        
        if (n.data.relatedTask) {
          if (role === 'admin') {
            navigate(`/admin/tasks/${n.data.relatedTask}`);
          } else if (role === 'worker') {
            navigate(`/worker/tasks/${n.data.relatedTask}`);
          } else {
            // Clients or others go to their dashboard/portal
            navigate(role === 'client' ? '/client/dashboard' : '/');
          }
        } else if (n.data.relatedInvoice) {
          const route = role === 'client' ? `/client/dashboard` : 
                        role === 'accountant' ? `/accountant/invoices` : 
                        role === 'admin' ? `/admin/tasks` : `/`; // Admin might view invoices in tasks or a generic list if exists
          navigate(route);
        } else if (n.type === 'low-stock') {
          navigate(role === 'admin' ? '/admin/inventory' : '/');
        } else if (n.data.siteId) {
          if (role === 'admin') {
            navigate(`/admin/sites/${n.data.siteId}/sections`);
          } else if (role === 'accountant') {
            navigate('/accountant/sites');
          } else {
            navigate('/');
          }
        }
      }
      
      // 4. Close dropdown
      setShowNotifications(false);
    } catch (error) {
      console.error("Error handling notification click:", error);
      // Even if delete fails, still try to navigate
      setShowNotifications(false);
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

  // Dropdown Animation Variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40 transition-all duration-300">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        
        {/* Left Section: Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 transition-all shrink-0 active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>

          <button
            onClick={onDesktopToggle}
            className="hidden lg:flex p-2 rounded-xl text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 transition-all shrink-0 active:scale-95"
          >
            {isRTL ? (
              isDesktopSidebarOpen ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />
            ) : isDesktopSidebarOpen ? (
              ""
            ) : (
              <ChevronsRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 transition-all shrink-0 active:scale-95 hidden sm:flex"
              title={t("common.back", "Back")}
          >
             <ArrowLeft className="w-5 h-5" />
          </button>
          
          <LanguageSwitcher />

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl transition-all duration-200 active:scale-95 border border-transparent
                ${showNotifications ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}
              `}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className={`absolute top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden ${isRTL ? "left-0" : "right-0"}`}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 text-sm">
                      {t("navbar.notifications")}
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                         <button
                            onClick={markAllAsRead}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            {t("navbar.markAllAsRead")}
                          </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                          <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">{t("navbar.noNotifications")}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 ${!n.read ? "bg-emerald-50/30" : ""}`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                n.type === 'invoice-generated' ? 'bg-blue-100 text-blue-600' : 
                                n.type === 'task-assigned' ? 'bg-purple-100 text-purple-600' : 
                                n.type === 'task-completed' ? 'bg-green-100 text-green-600' : 
                                n.type === 'low-stock' ? 'bg-orange-100 text-orange-600' : 
                                'bg-gray-100 text-gray-600'
                              }`}>
                              {n.type === 'invoice-generated' ? <DollarSignSymbol className="w-5 h-5"/> : 
                               n.type === 'task-assigned' ? '📋' : 
                               n.type === 'task-completed' ? '✅' : 
                               n.type === 'low-stock' ? '⚠️' : '🔔'}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start mb-1">
                                  <p className={`text-sm font-semibold truncate ${!n.read ? "text-gray-900" : "text-gray-700"}`}>
                                    {n.subject}
                                  </p>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                    {getTimeAgo(n.createdAt)}
                                  </span>
                               </div>
                               <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                 {n.message}
                               </p>
                            </div>
                            {!n.read && (
                              <div className="self-center">
                                <span className="block w-2 h-2 bg-emerald-500 rounded-full" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                     <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                           {t("navbar.viewAllNotifications")}
                        </button>
                     </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* User Profile */}
          <div className="relative" ref={profileRef}>
             <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 p-1 pr-3 rounded-full border transition-all duration-200 active:scale-95
                   ${showProfileMenu ? "border-emerald-200 bg-emerald-50/50 ring-2 ring-emerald-100" : "border-gray-200 hover:bg-gray-50 hover:border-gray-300 bg-white"}
              `}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                 {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start pr-1">
                 <span className="text-xs font-bold text-gray-700 leading-none mb-0.5 max-w-[80px] truncate">{user?.name}</span>
                 <span className="text-[10px] text-gray-400 font-medium uppercase">{t(`roles.${user?.role}`)}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className={`absolute top-full mt-3 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden ${isRTL ? "left-0" : "right-0"}`}
                >
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                    <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{user?.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
                    >
                      <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Lock className="w-4 h-4" />
                      </div>
                      {t("auth.changePassword")}
                    </button>
                    
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                    >
                      <div className="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                         <LogOut className="w-4 h-4" />
                      </div>
                      {t("common.logout")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <ChangePasswordModal 
         isOpen={isChangePasswordOpen}
         onClose={() => setIsChangePasswordOpen(false)}
      />

    </nav>
  );
};

// Helper component for the Dollar Sign in notifications to avoid icon conflict if needed, 
// though we can just use Lucide's. 
// Using a simple text for now or import it from lucide if not imported.
const DollarSignSymbol = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

export default Navbar;
