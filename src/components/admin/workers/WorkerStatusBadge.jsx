import { useTranslation } from "react-i18next";

const WorkerStatusBadge = ({ isActive }) => {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}
    >
      {isActive ? t("status.active") : t("status.inactive")}
    </span>
  );
};

export default WorkerStatusBadge;
