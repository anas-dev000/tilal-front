/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { 
  Edit, 
  Trash2, 
  MapPin, 
  Power, 
  PowerOff,
  UserCheck,
  UserX,
  Lock // Import Lock icon
} from "lucide-react";
import Badge from "../../common/Badge";
import { format } from "date-fns";

const EmployeesTable = ({ 
  employees, 
  onEdit, 
  onToggleStatus, 
  onChangePassword, // Prop for change password handler
  onDelete, 
  onRowClick, 
  pagination, 
  onPageChange 
}) => {
  const { t } = useTranslation();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="purple">{t("roles.admin")}</Badge>;
      case 'accountant':
        return <Badge variant="blue">{t("roles.accountant")}</Badge>;
      case 'worker':
        return <Badge variant="green">{t("roles.worker")}</Badge>;
      default:
        return <Badge variant="gray">{role}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 font-medium">{t("admin.workers.name")}</th>
            <th className="px-6 py-3 font-medium hidden sm:table-cell">
              {t("admin.workers.email")}
            </th>
            <th className="px-6 py-3 font-medium hidden md:table-cell">
              {t("admin.workers.phone")}
            </th>
            <th className="px-6 py-3 font-medium">
             Role {/** @todo: Translate this */}
            </th>
            <th className="px-6 py-3 font-medium text-center">
              {t("admin.workers.status")}
            </th>
            <th className="px-6 py-3 font-medium text-end">
              {t("admin.workers.actions")}
            </th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {employees.map((employee) => (
            <tr
              key={employee._id}
              className="hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => onRowClick(employee)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center overflow-hidden
                    text-base font-semibold border-2 shrink-0
                    ${employee.isActive 
                      ? 'bg-primary-50 text-primary-600 border-primary-100' 
                      : 'bg-gray-100 text-gray-500 border-gray-200'}
                  `}>
                    {employee.profilePicture ? (
                      <img 
                        src={employee.profilePicture} 
                        alt={employee.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      employee.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {employee.name}
                    </h3>
                    <p className="text-xs text-gray-500 sm:hidden">
                      {employee.role}
                    </p>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 hidden sm:table-cell text-gray-600">
                {employee.email}
              </td>
              
              <td className="px-6 py-4 hidden md:table-cell text-gray-600" dir="ltr">
                {employee.phone}
              </td>
              
              <td className="px-6 py-4">
                {getRoleBadge(employee.role)}
              </td>

              <td className="px-6 py-4 text-center">
                <Badge
                  variant={employee.isActive ? "success" : "secondary"}
                  icon={employee.isActive ? UserCheck : UserX}
                >
                  {employee.isActive
                    ? t("admin.workers.active")
                    : t("admin.workers.inactive")}
                </Badge>
              </td>

              <td className="px-6 py-4 text-end">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(employee)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Lock Button for Changing Password */}
                  {onChangePassword && (
                    <button
                      onClick={() => onChangePassword(employee)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title={t("auth.changePassword")}
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onToggleStatus(employee)}
                    className={`p-2 rounded-lg transition-colors ${
                      employee.isActive
                        ? "text-red-600 hover:bg-red-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={
                      employee.isActive
                        ? t("admin.workers.deactivateWorker")
                        : t("admin.workers.activateWorker")
                    }
                  >
                    {employee.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onDelete(employee)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500">
            {t("common.showing")} <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span> {t("common.to")} <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span> {t("common.of")} <span className="font-medium">
              {pagination.total}
            </span> {t("common.results")}
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.previous")}
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesTable;
