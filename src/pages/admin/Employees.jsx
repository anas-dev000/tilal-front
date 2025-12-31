/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React Query hooks
import { 
  useEmployees, // Updated hook
  useDeleteUser, 
  useToggleUserStatus 
} from "../../hooks/queries/useUsers";

// Components
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import EmployeeModal from "../../components/employees/EmployeeModal";
import EmployeesTable from "../../components/employees/EmployeesTable";
import ConfirmationModal from "../../components/workers/ConfirmationModal";
import AdminChangePasswordModal from "../../components/admin/AdminChangePasswordModal";

const PAGE_SIZE = 10;

const Employees = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | active | inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeForPassword, setSelectedEmployeeForPassword] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    employee: null,
    action: "",
  });

  // ==================== Data Fetching with React Query ====================
  const [selectedRole, setSelectedRole] = useState("all"); // all | worker | accountant

  // ==================== Data Fetching with React Query ====================
  const { data: employeesData, isLoading, error } = useEmployees({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm,
    isActive: activeTab === "all" ? undefined : activeTab === "active",
    // Pass role filter to hook if backend supports it, otherwise filter client-side below
    role: selectedRole === "all" ? undefined : selectedRole 
  });

  // Client-side filtering if hook returns mixed list (fallback)
  const allEmployees = useMemo(() => {
    let users = employeesData?.data || [];
    if (selectedRole !== "all") {
      users = users.filter(u => u.role === selectedRole);
    }
    return users;
  }, [employeesData?.data, selectedRole]);

  const totalCount = allEmployees.length;
  // Recalculate pagination for client-side filtered list
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const deleteUserMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();

  // Handlers
  const handleRowClick = useCallback((employee) => {
    // Navigate to details based on role, or a generic detail page
    // For now we kept worker details, we might need a general user detail page
    // Assuming /admin/workers/:id works for now or redirects correctly
    navigate(`/admin/workers/${employee._id}`); 
  }, [navigate]);

  const handleEdit = useCallback((employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  }, []);

  const handleChangePassword = useCallback((employee) => {
    setSelectedEmployeeForPassword(employee);
    setIsPasswordModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  }, []);

  const handleToggleStatus = useCallback((employee) => {
    setConfirmModal({
      isOpen: true,
      employee,
      action: employee.isActive ? "deactivate" : "activate",
    });
  }, []);

  const handleDelete = useCallback((employee) => {
    setConfirmModal({
      isOpen: true,
      employee,
      action: "delete",
    });
  }, []);

  const confirmToggle = useCallback(() => {
    if (!confirmModal.employee) return;

    toggleStatusMutation.mutate(confirmModal.employee._id, {
      onSuccess: () => {
        setConfirmModal({ isOpen: false, employee: null, action: "" });
      },
    });
  }, [confirmModal.employee, toggleStatusMutation]);

  const confirmDelete = useCallback(() => {
    if (!confirmModal.employee) return;

    deleteUserMutation.mutate(confirmModal.employee._id, {
      onSuccess: () => {
        setConfirmModal({ isOpen: false, employee: null, action: "" });
      },
    });
  }, [confirmModal.employee, deleteUserMutation]);

  const handleConfirmModalClose = useCallback(() => {
    setConfirmModal({ isOpen: false, employee: null, action: "" });
  }, []);

  // ==================== Render ====================
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin h-8 w-8 mx-auto border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {t("common.errorLoadingData")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("admin.employees.title")}
        </h1>
        <Button
          onClick={() => {
            setSelectedEmployee(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          {t("admin.employees.addEmployee")}
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Filters & Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder={t("common.searchByNameEmailPhone")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-col gap-4">
              {/* Role Filter */}
              <div className="flex border-b border-gray-200 w-full sm:w-auto overflow-x-auto">
                <TabButton
                  active={selectedRole === "all"}
                  onClick={() => {
                    setSelectedRole("all");
                    setCurrentPage(1);
                  }}
                  icon={Users}
                  label={t("common.all")}
                  color="blue"
                />
                <TabButton
                  active={selectedRole === "worker"}
                  onClick={() => {
                    setSelectedRole("worker");
                    setCurrentPage(1);
                  }}
                  icon={UserCheck}
                  label={t("roles.worker")}
                  color="green"
                />
                <TabButton
                  active={selectedRole === "accountant"}
                  onClick={() => {
                    setSelectedRole("accountant");
                    setCurrentPage(1);
                  }}
                  icon={UserCheck}
                  label={t("roles.accountant")}
                  color="purple"
                />
              </div>

              {/* Status Filter (Secondary) */}
              <div className="flex border-b border-gray-200 w-full sm:w-auto overflow-x-auto">
                 <TabButton
                  active={activeTab === "all"}
                  onClick={() => {
                    setActiveTab("all");
                    setCurrentPage(1);
                  }}
                  label={t("status.all")}
                  color="gray"
                  simple={true}
                />
                <TabButton
                  active={activeTab === "active"}
                  onClick={() => {
                    setActiveTab("active");
                    setCurrentPage(1);
                  }}
                  label={t("status.active")}
                  color="green"
                  simple={true}
                />
                <TabButton
                  active={activeTab === "inactive"}
                  onClick={() => {
                    setActiveTab("inactive");
                    setCurrentPage(1);
                  }}
                  label={t("status.inactive")}
                  color="red"
                  simple={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table / Empty State */}
        {allEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">{t("common.noData")}</p>
          </div>
        ) : (
          <EmployeesTable
            employees={allEmployees}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onChangePassword={handleChangePassword}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
            pagination={{
              page: currentPage,
              totalPages,
              total: totalCount,
              limit: PAGE_SIZE,
            }}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Modals */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        employee={selectedEmployee}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleConfirmModalClose}
        onConfirm={confirmModal.action === "delete" ? confirmDelete : confirmToggle}
        title={
          confirmModal.action === "delete"
            ? t("common.confirmDelete")
            : confirmModal.action === "deactivate"
            ? t("admin.workers.deactivateWorker")
            : t("admin.workers.activateWorker")
        }
        message={
          confirmModal.action === "delete"
            ? t("common.actionIrreversible")
            : `${t("common.areYouSure")} ${
                confirmModal.action === "deactivate"
                  ? t("common.deactivate")
                  : t("common.activate")
              } ${t("common.thisWorker")}?`
        }
        confirmText={
          confirmModal.action === "delete"
            ? t("common.delete")
            : confirmModal.action === "deactivate"
            ? t("common.deactivate")
            : t("common.activate")
        }
        confirmVariant={
          confirmModal.action === "delete"
            ? "danger"
            : confirmModal.action === "deactivate"
            ? "warning"
            : "success"
        }
      />

      <AdminChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setSelectedEmployeeForPassword(null);
        }}
        user={selectedEmployeeForPassword}
      />
    </div>
  );
};

// Memoized TabButton component to prevent re-renders
const TabButton = ({ active, onClick, icon: Icon, label, color, simple }) => {
  const colorClasses = {
    blue: active ? "border-blue-600 text-blue-600" : "",
    green: active ? "border-green-600 text-green-600" : "",
    red: active ? "border-red-600 text-red-600" : "",
    purple: active ? "border-purple-600 text-purple-600" : "",
    gray: active ? "border-gray-600 text-gray-600" : "",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
        active
          ? colorClasses[color]
          : "border-transparent text-gray-600 hover:text-gray-900"
      } ${simple ? "text-sm" : ""}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
};

export default Employees;
