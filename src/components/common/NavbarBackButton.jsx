import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

const NavbarBackButton = ({ className = "", icon: CustomIcon }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { logout, isAuthenticated } = useAuth();

  const currentPath = location.pathname;

  const logoutPaths = ["/admin", "/worker", "/client/dashboard"];

  const isOnDashboardPath = logoutPaths.includes(currentPath);

  const canGoBack = window.history.length > 1 && location.key !== "default";

  if (isOnDashboardPath && isAuthenticated) {
    const handleLogout = () => {
      logout();
      navigate("/login");
    };

    return (
      <Button
        variant="ghost-success"
        icon={LogOut}
        onClick={handleLogout}
        rotateIcon={false}
        aria-label={t("common.logout")}
        className={`flex items-center gap-2 ${className}`}
      >
        <span className="hidden lg:inline-block">{t("common.logout")}</span>
      </Button>
    );
  }

  if (!canGoBack) {
    return null;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const Icon = CustomIcon || ArrowLeft;

  return (
    <Button
      variant="ghost-success"
      icon={Icon}
      onClick={handleBack}
      rotateIcon={false}
      aria-label={t("common.back")}
      className={className}
    />
  );
};

export default NavbarBackButton;
