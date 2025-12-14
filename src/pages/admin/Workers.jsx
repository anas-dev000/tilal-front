// src/pages/admin/Workers.jsx
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import WorkerModal from "./WorkerModal";
import WorkersTable from "../../components/workers/WorkersTable";
import ConfirmationModal from "../../components/workers/ConfirmationModal";
import { usersAPI } from "../../services/api";
import useWorkers from "../../hooks/useWorkers";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
const PAGE_SIZE = 10;

const Workers = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    worker: null,
    action: "",
  });
  const navigate = useNavigate();
const handleRowClick = (worker) => {
  navigate(`/admin/workers/${worker._id}`);
};
  const { allWorkers, loading, error, refetch } = useWorkers();

  const filteredWorkers = useMemo(() => {
    let filtered = allWorkers;

    if (activeTab === "active") filtered = filtered.filter((w) => w.isActive);
    if (activeTab === "inactive")
      filtered = filtered.filter((w) => !w.isActive);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.email.toLowerCase().includes(term) ||
          (w.phone && w.phone.includes(term))
      );
    }

    return filtered;
  }, [allWorkers, activeTab, searchTerm]);

  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredWorkers.slice(start, end);
  }, [filteredWorkers, currentPage]);

  const totalPages = Math.ceil(filteredWorkers.length / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const handleToggleStatus = (worker) => {
    setConfirmModal({
      isOpen: true,
      worker,
      action: worker.isActive ? "deactivate" : "activate",
    });
  };

  const confirmToggle = async () => {
    try {
      await usersAPI.updateUser(confirmModal.worker._id, {
        isActive: !confirmModal.worker.isActive,
      });
      refetch();
      setConfirmModal({ isOpen: false, worker: null, action: "" });
    } catch (err) {
      toast.error(t("common.errorOccurred", err), {
        duration: 5000,
      });
    }
  };

  const handleDelete = (worker) => {
    setConfirmModal({
      isOpen: true,
      worker,
      action: "delete",
    });
  };

  const confirmDelete = async () => {
    try {
      await usersAPI.deleteUser(confirmModal.worker._id);
      refetch();
      setConfirmModal({ isOpen: false, worker: null, action: "" });
    } catch (err) {
      toast.error(t("common.errorOccurred", err), {
        duration: 5000,
      });
    }
  };

  if (loading) return <Loading fullScreen />;
  if (error)
    return <div className="text-center py-12 text-red-600">{error}</div>;

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
            {allWorkers.filter((w) => w.isActive).length}{" "}
            {t("admin.workers.active")} {t("common.of")} {allWorkers.length}{" "}
            {t("admin.workers.total")}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
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
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4" />
              {t("common.all")} ({allWorkers.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "active"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              {t("admin.workers.active")} (
              {allWorkers.filter((w) => w.isActive).length})
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "inactive"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <UserX className="w-4 h-4" />
              {t("admin.workers.inactive")} (
              {allWorkers.filter((w) => !w.isActive).length})
            </button>
          </div>
        </div>

        {/* Table */}
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">{t("common.noData")}</p>
          </div>
        ) : (
          <WorkersTable
            workers={paginatedWorkers}
            onEdit={(w) => {
              setSelectedWorker(w);
              setIsModalOpen(true);
            }}
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
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorker(null);
        }}
        worker={selectedWorker}
        onSuccess={refetch}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={
          confirmModal.action === "delete" ? confirmDelete : confirmToggle
        }
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
              } ${t("common.thisWorker")}؟`
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

export default Workers;
