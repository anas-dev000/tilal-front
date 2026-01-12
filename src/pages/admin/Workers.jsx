/* eslint-disable no-unused-vars */
// src/pages/admin/Workers.jsx - REFACTORED WITH REACT QUERY
import { useState, useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React Query hooks
// React Query hooks
import { 
  useWorkers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser, 
  useToggleUserStatus 
} from "../../hooks/queries/useUsers";

// Components
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Skeleton, { TableSkeleton } from "../../components/common/Skeleton";
import WorkerModal from "./WorkerModal";
import WorkersTable from "../../components/workers/WorkersTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import AdminChangePasswordModal from "../../components/admin/AdminChangePasswordModal";

const PAGE_SIZE = 10;

const Workers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | active | inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedWorkerForPassword, setSelectedWorkerForPassword] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    worker: null,
    action: "",
  });

  // ==================== Data Fetching with React Query ====================
  const { data: workersData, isLoading, error } = useWorkers({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm,
    isActive: activeTab === "all" ? undefined : activeTab === "active",
  });

  const allWorkers = workersData?.data || [];
  const totalCount = workersData?.total || 0;
  const totalPages = workersData?.totalPages || 0;

  const createWorkerMutation = useCreateUser();
  const updateWorkerMutation = useUpdateUser();
  const deleteWorkerMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();

  // Handlers
  const handleRowClick = useCallback((worker) => {
    navigate(`/admin/workers/${worker._id}`);
  }, [navigate]);

  const handleEdit = useCallback((worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  }, []);

  const handleChangePassword = useCallback((worker) => {
    setSelectedWorkerForPassword(worker);
    setIsPasswordModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedWorker(null);
  }, []);

  const handleToggleStatus = useCallback((worker) => {
    setConfirmModal({
      isOpen: true,
      worker,
      action: worker.isActive ? "deactivate" : "activate",
    });
  }, []);

  const handleDelete = useCallback((worker) => {
    setConfirmModal({
      isOpen: true,
      worker,
      action: "delete",
    });
  }, []);

  const confirmToggle = useCallback(() => {
    if (!confirmModal.worker) return;

    toggleStatusMutation.mutate(confirmModal.worker._id, {
      onSuccess: () => {
        setConfirmModal({ isOpen: false, worker: null, action: "" });
      },
    });
  }, [confirmModal.worker, toggleStatusMutation]);

  const confirmDelete = useCallback(() => {
    if (!confirmModal.worker) return;

    deleteWorkerMutation.mutate(confirmModal.worker._id, {
      onSuccess: () => {
        setConfirmModal({ isOpen: false, worker: null, action: "" });
      },
    });
  }, [confirmModal.worker, deleteWorkerMutation]);

  const handleConfirmModalClose = useCallback(() => {
    setConfirmModal({ isOpen: false, worker: null, action: "" });
  }, []);

  // ==================== Render ====================
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="200px" height="40px" />
          <Skeleton variant="rectangle" width="120px" height="40px" />
        </div>
        <Card>
          <div className="p-6 border-b border-gray-200 flex justify-between gap-4">
             <Skeleton variant="rectangle" width="300px" height="40px" />
             <div className="flex gap-4">
               <Skeleton variant="rectangle" width="80px" height="40px" />
               <Skeleton variant="rectangle" width="80px" height="40px" />
               <Skeleton variant="rectangle" width="80px" height="40px" />
             </div>
          </div>
          <TableSkeleton rows={10} />
        </Card>
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
          {t("admin.workers.title")}
        </h1>
        <Button
          onClick={() => {
            setSelectedWorker(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          {t("admin.workers.addWorker")}
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

            <div className="flex border-b border-gray-200">
              <TabButton
                active={activeTab === "all"}
                onClick={() => {
                  setActiveTab("all");
                  setCurrentPage(1);
                }}
                icon={Users}
                label={`${t("common.all")} (${totalCount})`}
                color="blue"
              />
              <TabButton
                active={activeTab === "active"}
                onClick={() => {
                  setActiveTab("active");
                  setCurrentPage(1);
                }}
                icon={UserCheck}
                label={t("admin.workers.active")}
                color="green"
              />
              <TabButton
                active={activeTab === "inactive"}
                onClick={() => {
                  setActiveTab("inactive");
                  setCurrentPage(1);
                }}
                icon={UserX}
                label={t("admin.workers.inactive")}
                color="red"
              />
            </div>
          </div>
        </div>

        {/* Table / Empty State */}
        {allWorkers.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <WorkersTable
            workers={allWorkers}
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
      {/* Modal for Creating/Editing Worker */}
      <WorkerModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        worker={selectedWorker}
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
          setSelectedWorkerForPassword(null);
        }}
        user={selectedWorkerForPassword}
      />
    </div>
  );
};

// Memoized TabButton component to prevent re-renders
const TabButton = memo(({ active, onClick, icon: Icon, label, color }) => {
  const colorClasses = {
    blue: active ? "border-blue-600 text-blue-600" : "",
    green: active ? "border-green-600 text-green-600" : "",
    red: active ? "border-red-600 text-red-600" : "",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
        active
          ? colorClasses[color]
          : "border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
});

TabButton.displayName = 'TabButton';

// Memoized EmptyState component
const EmptyState = memo(() => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12">
      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-500">{t("common.noData")}</p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default Workers;