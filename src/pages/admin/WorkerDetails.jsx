// src/pages/admin/WorkerDetails.jsx
/* eslint-disable no-unused-vars */
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit, Power } from "lucide-react";
import { useMemo, useCallback, memo, useState } from "react";

// React Query hooks
import { useUser, useUpdateUser } from "../../hooks/queries/useUsers";
import { useTasks } from "../../hooks/queries/useTasks";

// Components
import Loading from "../../components/common/Loading";
import Skeleton, { CardSkeleton, TableSkeleton } from "../../components/common/Skeleton";
import WorkerStatsGrid from "../../components/workers/WorkerStatsGrid";
import WorkerTaskList from "../../components/workers/WorkerTaskList";
import WorkerModal from "./WorkerModal";
import ConfirmationModal from "../../components/workers/ConfirmationModal";

const WorkerDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // Local state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "", // "activate" | "deactivate"
  });

  // ==================== Data Fetching ====================
  const {
    data: worker,
    isLoading: isWorkerLoading,
    error: workerError,
  } = useUser(id);

  const { data: tasksData, isLoading: isTasksLoading } = useTasks({
    worker: id,
  });
  
  const tasks = tasksData?.data || [];

  const updateUserMutation = useUpdateUser();

  const isLoading = isWorkerLoading || isTasksLoading;

  // ==================== Memoized Values ====================
  const joinDate = useMemo(() => {
    if (!worker?.createdAt) return "—";
    return new Date(worker.createdAt).toLocaleDateString();
  }, [worker?.createdAt]);

  const statusText = useMemo(() => {
    return worker?.isActive
      ? t("admin.workerDetails.active")
      : t("admin.workerDetails.inactive");
  }, [worker?.isActive, t]);

  const statusColor = useMemo(() => {
    return worker?.isActive ? "text-green-600" : "text-red-600";
  }, [worker?.isActive]);

  // ==================== Handlers ====================
  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleToggleStatus = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      action: worker?.isActive ? "deactivate" : "activate",
    });
  }, [worker?.isActive]);

  const handleConfirmModalClose = useCallback(() => {
    setConfirmModal({ isOpen: false, action: "" });
  }, []);

  const confirmToggleStatus = useCallback(() => {
    if (!worker) return;

    updateUserMutation.mutate(
      {
        id: worker._id,
        data: { isActive: !worker.isActive },
      },
      {
        onSuccess: () => {
          handleConfirmModalClose();
        },
      }
    );
  }, [worker, updateUserMutation, handleConfirmModalClose]);

  // ==================== Render ====================
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="300px" height="48px" />
          <div className="flex gap-2">
            <Skeleton variant="rectangle" width="100px" height="40px" />
            <Skeleton variant="rectangle" width="100px" height="40px" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton className="lg:col-span-1" />
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (workerError || !worker) {
    return (
      <div className="text-center py-12 text-red-600">
        {t("admin.workerDetails.notFound")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{worker.name}</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            {t("common.edit")}
          </button>

          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              worker.isActive
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            <Power className="w-4 h-4" />
            {worker.isActive ? t("common.deactivate") : t("common.activate")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 flex items-center justify-center shrink-0">
                <span className="text-green-600 font-semibold text-3xl">
                  {worker?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold">{worker.name}</h2>
                <p className="text-gray-600">{worker.email}</p>
                <p className="text-sm text-gray-500">{worker.phone}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("admin.workerDetails.status")}
                </span>
                <span className={`font-medium ${statusColor}`}>
                  {statusText}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("admin.workerDetails.joinDate")}
                </span>
                <span>{joinDate}</span>
              </div>
            </div>

            {/* Notes */}
            {worker.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  {t("admin.workerDetails.notes")}
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {worker.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <WorkerStatsGrid worker={worker} totalTasks={tasks.length} />
          <WorkerTaskList tasks={tasks} />
        </div>
      </div>

      {/* ==================== Modals ==================== */}
      <WorkerModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        worker={worker}
        // onSuccess not needed → invalidation is handled inside useUpdateUser
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleConfirmModalClose}
        onConfirm={confirmToggleStatus}
        title={
          confirmModal.action === "deactivate"
            ? t("admin.workers.deactivateWorker")
            : t("admin.workers.activateWorker")
        }
        message={`${t("common.areYouSure")} ${
          confirmModal.action === "deactivate"
            ? t("common.deactivate")
            : t("common.activate")
        } ${t("common.thisWorker")}?`}
        confirmText={
          confirmModal.action === "deactivate"
            ? t("common.deactivate")
            : t("common.activate")
        }
        confirmVariant={
          confirmModal.action === "deactivate" ? "warning" : "success"
        }
      />
    </div>
  );
};

// Optional: memoize if parent re-renders frequently
export default memo(WorkerDetails);
