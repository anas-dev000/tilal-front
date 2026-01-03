import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Package,
  Flower2,
  MapPin,
  ChevronsLeft,
  ChevronsRight,
  X,
  DollarSign,
  Settings
} from "lucide-react";

const Sidebar = ({
  isDesktopOpen,
  mobileSidebarOpen,
  onClose,
  onToggleDesktop,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: "/admin", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/admin/clients", icon: Users, label: t("nav.clients") },
    { path: "/admin/employees", icon: Briefcase, label: t("nav.employees") },
    { path: "/admin/invoices", icon: DollarSign, label: t("nav.invoices") },
    { path: "/admin/sites", icon: MapPin, label: t("nav.sites") },
    { path: "/admin/tasks", icon: CheckSquare, label: t("nav.tasks") },
    { path: "/admin/inventory", icon: Package, label: t("nav.inventory") },
  ];

  const workerMenuItems = [
    { path: "/worker", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/worker/tasks", icon: CheckSquare, label: t("worker.myTasks") },
  ];

  const accountantMenuItems = [
    { path: "/accountant", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/accountant/invoices", icon: Package, label: t("nav.invoices") },
    { path: "/accountant/sites", icon: MapPin, label: t("nav.sites") },
  ];

  const menuItems = 
    user?.role === "admin" ? adminMenuItems : 
    user?.role === "accountant" ? accountantMenuItems : 
    workerMenuItems;

  const isActive = (path) => {
    if (path === "/admin" || path === "/worker" || path === "/accountant") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isMobile = window.innerWidth < 1024;
  
  // Variants for animations
  const sidebarVariants = {
    open: { 
      x: 0, 
      width: isDesktopOpen ? (isMobile ? "100%" : "16rem") : "16rem",
      transition: { type: "spring", stiffness: 300, damping: 30 } 
    },
    closed: { 
      x: isRTL ? "100%" : "-100%", 
      width: 0,
       transition: { type: "spring", stiffness: 300, damping: 30 } 
    },
    desktopCollapsed: {
      width: 0, // Or "5rem" if we want a mini sidebar, but current design is full collapse
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} h-full z-50 bg-white shadow-2xl lg:shadow-xl transition-all duration-300
          ${isDesktopOpen ? "w-64" : "w-0"} 
          ${mobileSidebarOpen ? "translate-x-0" : (isRTL ? "translate-x-full" : "-translate-x-full")}
          lg:translate-x-0 overflow-hidden
        `}
        dir={isRTL ? "rtl" : "ltr"}
      >
         <div className="flex flex-col h-full min-w-[256px]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50/30">
             <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-xl shadow-sm">
                 <img src="/logo.PNG" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  {t("common.appName", "Tilal")}
                </h1>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {t("common.services", "Services")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Summary */}
          <div className="px-6 py-6 pb-2">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-800 text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{t(`roles.${user?.role}`)}</p>
                </div>
              </div>
          </div>


          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`
                    relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                    ${active 
                      ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {active && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full" 
                    />
                  )}
                  <Icon className={`w-5 h-5 ${active ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-sm font-medium ${active ? "font-bold" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

           {/* Footer / Toggle */}
          <div className="p-4 border-t border-gray-100 hidden lg:block">
            <button
              onClick={onToggleDesktop}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all"
            >
              {isRTL ? (
                <ChevronsRight className="w-5 h-5" />
              ) : (
                <ChevronsLeft className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {t("common.collapseSidebar", "Collapse")}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
