import { Edit, Trash2, Power, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";

const ClientStatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const config = {
    active: {
      color: "bg-green-100 text-green-800",
      label: t("common.statuses.active"),
    },
    inactive: {
      color: "bg-gray-100 text-gray-800",
      label: t("common.statuses.inactive"),
    },
    suspended: {
      color: "bg-red-100 text-red-800",
      label: t("common.statuses.suspended"),
    },
  };

  const current = config[status] || config.inactive;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${current.color}`}
    >
      {current.label}
    </span>
  );
};

const ClientsTable = ({
  clients,
  onEdit,
  onToggleStatus,
  onDelete,
  pagination,
  onRowClick,
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
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              {t("components.tables.propertyType")}
            </th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">
              {t("components.tables.paymentType")}
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
          {clients.map((client) => (
            <tr
              key={client._id}
              onClick={() => onRowClick && onRowClick(client)}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td className="py-4 px-6">
                <div className="font-medium text-gray-900">{client.name}</div>
                {client.address?.city && (
                  <div className="text-sm text-gray-500">
                    {client.address.city}
                  </div>
                )}
              </td>
              <td className="py-4 px-6 text-gray-600">{client.email}</td>
              <td className="py-4 px-6 text-gray-600">{client.phone}</td>
              <td className="py-4 px-6">
                <span className="capitalize text-sm">
                  {client.propertyType === "residential"
                    ? t("admin.clientDetails.house")
                    : t("admin.clientDetails.building")}
                </span>
              </td>
              <td className="py-4 px-6">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    (client.paymentType || "online") === "cash"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {(client.paymentType || "online") === "cash"
                    ? t("admin.clientDetails.cash")
                    : t("admin.clientDetails.online")}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-center">
                  <ClientStatusBadge status={client.status} />
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to={`/admin/clients/${client._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title={t("common.view")}
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(client);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 transition"
                    title={t("common.edit")}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(client);
                    }}
                    className={`transition ${
                      client.status === "active"
                        ? "text-red-600 hover:text-red-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                    title={
                      client.status === "active"
                        ? t("common.deactivate")
                        : t("common.activate")
                    }
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(client);
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

export default ClientsTable;
