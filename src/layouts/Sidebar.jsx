import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  FileText,
  Package,
  Flower2,
  BarChart3,
  LogOut,
  X,
  MapPin,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: "/admin", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/admin/clients", icon: Users, label: t("nav.clients") },
    { path: "/admin/workers", icon: Briefcase, label: t("nav.workers") },
    { path: "/admin/sites", icon: MapPin, label: "Sites" },
    { path: "/admin/tasks", icon: CheckSquare, label: t("nav.tasks") },
    { path: "/admin/inventory", icon: Package, label: t("nav.inventory") },
  ];

  const workerMenuItems = [
    { path: "/worker", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/worker/tasks", icon: CheckSquare, label: t("worker.myTasks") },
  ];

  const menuItems = user?.role === "admin" ? adminMenuItems : workerMenuItems;

  const isActive = (path) => {
    if (path === "/admin" || path === "/worker") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Sidebar - بدون overlay أسود */}
      <aside
        className={`
          fixed top-0 h-full bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          w-64 sm:w-72 lg:w-64
          ${isRTL ? "right-0" : "left-0"}
          ${
            isOpen
              ? "translate-x-0"
              : isRTL
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Flower2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {/* {t('ar_additions.app.name')} */}
                شركة تلال
              </h1>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1 shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-3 sm:p-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-600 font-semibold text-base sm:text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">
                  {t(`ar_additions.roles.${user?.role}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg
                        transition-all duration-200
                        ${
                          active
                            ? "bg-green-50 text-green-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          active ? "text-green-600" : "text-gray-500"
                        }`}
                      />
                      <span className="text-sm sm:text-base truncate">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-3 sm:p-4 border-t border-gray-200 shrink-0">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 sm:px-4 sm:py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate">
                {t("common.logout")}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
