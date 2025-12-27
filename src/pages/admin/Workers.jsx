/* eslint-disable no-unused-vars */
// src/pages/admin/Workers.jsx - REFACTORED WITH REACT QUERY
import { useState, useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React Query hooks
import { useUsers, useUpdateUser, useDeleteUser } from "../../hooks/queries/useUsers";

// Components
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import WorkerModal from "./WorkerModal";
import WorkersTable from "../../components/workers/WorkersTable";
import ConfirmationModal from "../../components/workers/ConfirmationModal";

const PAGE_SIZE = 10;

const Workers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    worker: null,
    action: "",
  });

  // React Query hooks
  const { data: allWorkers = [], isLoading, error } = useUsers({ role: "worker" });
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Memoized filtered workers
  const filteredWorkers = useMemo(() => {
    let filtered = allWorkers;

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter((w) => w.isActive);
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((w) => !w.isActive);
    }

    // Filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name?.toLowerCase().includes(term) ||
          w.email?.toLowerCase().includes(term) ||
          w.phone?.includes(term)
      );
    }

    return filtered;
  }, [allWorkers, activeTab, searchTerm]);

  // Memoized paginated workers
  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredWorkers.slice(start, start + PAGE_SIZE);
  }, [filteredWorkers, currentPage]);

  // Memoized stats
  const stats = useMemo(() => ({
    total: allWorkers.length,
    active: allWorkers.filter((w) => w.isActive).length,
    inactive: allWorkers.filter((w) => !w.isActive).length,
  }), [allWorkers]);

  const totalPages = Math.ceil(filteredWorkers.length / PAGE_SIZE);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  // Memoized handlers
  const handleRowClick = useCallback((worker) => {
    navigate(`/admin/workers/${worker._id}`);
  }, [navigate]);

  const handleToggleStatus = useCallback((worker) => {
    setConfirmModal({
      isOpen: true,
      worker,
      action: worker.isActive ? "deactivate" : "activate",
    });
  }, []);

  const confirmToggle = useCallback(() => {
    if (!confirmModal.worker) return;

    updateUserMutation.mutate(
      {
        id: confirmModal.worker._id,
        data: { isActive: !confirmModal.worker.isActive },
      },
      {
        onSuccess: () => {
          setConfirmModal({ isOpen: false, worker: null, action: "" });
        },
      }
    );
  }, [confirmModal.worker, updateUserMutation]);

  const handleDelete = useCallback((worker) => {
    setConfirmModal({
      isOpen: true,
      worker,
      action: "delete",
    });
  }, []);

  const confirmDelete = useCallback(() => {
    if (!confirmModal.worker) return;

    deleteUserMutation.mutate(confirmModal.worker._id, {
      onSuccess: () => {
        setConfirmModal({ isOpen: false, worker: null, action: "" });
      },
    });
  }, [confirmModal.worker, deleteUserMutation]);

  const handleEdit = useCallback((worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedWorker(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedWorker(null);
  }, []);

  const handleConfirmModalClose = useCallback(() => {
    setConfirmModal({ isOpen: false, worker: null, action: "" });
  }, []);

  if (isLoading) return <Loading fullScreen />;
  if (error) return (
    <div className="text-center py-12 text-red-600">
      {error.message || "Failed to load workers"}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("admin.workers.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredWorkers.length} {t("admin.workers.displayed")} •{" "}
            {stats.active} {t("admin.workers.active")} {t("common.of")}{" "}
            {stats.total} {t("admin.workers.total")}
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t("admin.workers.addWorker")}
        </Button>
      </div>

      {/* Search & Tabs */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder={t("common.searchByNameEmailPhone")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 border-b sm:border-b-0 border-gray-200">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              icon={Users}
              label={`${t("common.all")} (${stats.total})`}
              color="blue"
            />
            <TabButton
              active={activeTab === "active"}
              onClick={() => setActiveTab("active")}
              icon={UserCheck}
              label={`${t("admin.workers.active")} (${stats.active})`}
              color="green"
            />
            <TabButton
              active={activeTab === "inactive"}
              onClick={() => setActiveTab("inactive")}
              icon={UserX}
              label={`${t("admin.workers.inactive")} (${stats.inactive})`}
              color="red"
            />
          </div>
        </div>

        {/* Table */}
        {filteredWorkers.length === 0 ? (
          <EmptyState />
        ) : (
          <WorkersTable
            workers={paginatedWorkers}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
            pagination={{
              page: currentPage,
              totalPages,
              total: filteredWorkers.length,
              limit: PAGE_SIZE,
            }}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Modals */}
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