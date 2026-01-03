import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // desktop collapse state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // mobile overlay
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const isWorker = user?.role === "worker";

  const toggleDesktopSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const isSidebarVisible = mobileSidebarOpen || sidebarOpen;

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar - Only show if NOT worker */}
      {!isWorker && (
        <Sidebar
          isOpen={isSidebarVisible}
          isDesktopOpen={sidebarOpen}
          onClose={closeMobileSidebar}
          onToggleDesktop={toggleDesktopSidebar}
          mobileSidebarOpen={mobileSidebarOpen}
        />
      )}

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          !isWorker && sidebarOpen ? (isRTL ? "lg:mr-64" : "lg:ml-64") : "w-full"
        }`}
      >
        <Navbar
          onMenuClick={toggleMobileSidebar}
          onDesktopToggle={toggleDesktopSidebar}
          isDesktopSidebarOpen={sidebarOpen}
        />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
