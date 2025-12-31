import { Edit, Trash2, Power, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";
import WorkerStatusBadge from "./WorkerStatusBadge";

const WorkersTable = ({
  workers,
  onEdit,
  onToggleStatus,
  onRowClick,
  onDelete,
  pagination,
  onPageChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              {t("components.tables.name")}
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              {t("components.tables.email")}
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              {t("components.tables.phone")}
            </th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">
              {t("common.status")}
            </th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">
              {t("common.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr
              key={worker._id}
              onClick={() => onRowClick && onRowClick(worker)}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td className="py-4 px-6">
                <div className="font-medium text-gray-900">{worker.name}</div>
              </td>
              <td className="py-4 px-6 text-gray-600">{worker.email}</td>
              <td className="py-4 px-6 text-gray-600">{worker.phone || "-"}</td>
              <td className="py-4 px-6">
                <div className="flex justify-center">
                  <WorkerStatusBadge isActive={worker.isActive} />
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to={`/admin/workers/${worker._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title={t("common.view")}
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(worker);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 transition"
                    title={t("common.edit")}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(worker);
                    }}
                    className={`transition ${
                      worker.isActive
                        ? "text-red-600 hover:text-red-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                    title={
                      worker.isActive
                        ? t("common.deactivate")
                        : t("common.activate")
                    }
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(worker);
                    }}
                    className="text-red-600 hover:text-red-900 transition"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination component */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        totalCount={pagination.total}
        limit={pagination.limit}
      />
    </div>
  );
};

export default WorkersTable;
