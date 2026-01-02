// src/pages/admin/EmployeeDetails.jsx
/* eslint-disable no-unused-vars */
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit, Power, Save, FileText } from "lucide-react";
import { useMemo, useCallback, memo, useState, useEffect } from "react";
import { toast } from "sonner";

// React Query hooks
import { useUser, useUpdateUser } from "../../hooks/queries/useUsers";
import { useTasks } from "../../hooks/queries/useTasks";

// Components
import Loading from "../../components/common/Loading";
import Skeleton, { CardSkeleton, TableSkeleton } from "../../components/common/Skeleton";
import WorkerStatsGrid from "../../components/workers/WorkerStatsGrid";
import WorkerTaskList from "../../components/workers/WorkerTaskList";
import EmployeeModal from "../../components/employees/EmployeeModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Button from "../../components/common/Button";

const EmployeeDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // Local state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "", // "activate" | "deactivate"
  });

  // ==================== Data Fetching ====================
  const {
    data: employee,
    isLoading: isEmployeeLoading,
    error: employeeError,
  } = useUser(id);

  // Only fetch tasks if the user is a worker
  const isWorker = employee?.role === "worker";
  const { data: tasksData, isLoading: isTasksLoading } = useTasks(
    { worker: id },
    { enabled: !!id && isWorker }
  );
  
  const tasks = tasksData?.data || [];

  const updateUserMutation = useUpdateUser();

  const isLoading = isEmployeeLoading || (isWorker && isTasksLoading);

  // Sync notes when employee data loads
  useEffect(() => {
    if (employee?.notes) {
      setNotes(employee.notes);
    }
  }, [employee?.notes]);

  // ==================== Memoized Values ====================
  const joinDate = useMemo(() => {
    if (!employee?.createdAt) return "—";
    return new Date(employee.createdAt).toLocaleDateString();
  }, [employee?.createdAt]);

  const statusText = useMemo(() => {
    return employee?.isActive
      ? t("admin.workerDetails.active")
      : t("admin.workerDetails.inactive");
  }, [employee?.isActive, t]);

  const statusColor = useMemo(() => {
    return employee?.isActive ? "text-green-600" : "text-red-600";
  }, [employee?.isActive]);

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
      action: employee?.isActive ? "deactivate" : "activate",
    });
  }, [employee?.isActive]);

  const handleConfirmModalClose = useCallback(() => {
    setConfirmModal({ isOpen: false, action: "" });
  }, []);

  const confirmToggleStatus = useCallback(() => {
    if (!employee) return;

    updateUserMutation.mutate(
      {
        id: employee._id,
        data: { isActive: !employee.isActive },
      },
      {
        onSuccess: () => {
          handleConfirmModalClose();
        },
      }
    );
  }, [employee, updateUserMutation, handleConfirmModalClose]);

  const handleSaveNotes = async () => {
    if (!employee) return;
    setIsSavingNotes(true);
    try {
      await updateUserMutation.mutateAsync({
        id: employee._id,
        data: { notes },
      });
      toast.success(t("common.updatedSuccessfully"));
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

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

  if (employeeError || !employee) {
    return (
      <div className="text-center py-12 text-red-600">
        {t("admin.workerDetails.notFound")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/employees')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← {t("common.back")}
          </button>
          <h1 className="text-3xl font-bold">{employee.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            employee.role === 'worker' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {t(`roles.${employee.role}`)}
          </span>
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
              employee.isActive
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            <Power className="w-4 h-4" />
            {employee.isActive ? t("common.deactivate") : t("common.activate")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 flex items-center justify-center shrink-0">
                <span className="text-primary-600 font-semibold text-3xl">
                  {employee?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>

              <div className="overflow-hidden">
                <h2 className="text-2xl font-bold truncate">{employee.name}</h2>
                <p className="text-gray-600 truncate">{employee.email}</p>
                <p className="text-sm text-gray-500">{employee.phone}</p>
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

            {/* Notes Section - Now editable directly */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    {t("admin.workers.notes")}
                  </h4>
                </div>
                {notes !== (employee.notes || "") && (
                  <Button
                    onClick={handleSaveNotes}
                    size="sm"
                    isLoading={isSavingNotes}
                    icon={Save}
                  >
                    {t("common.save")}
                  </Button>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("admin.workers.notesPlaceholder") || "Add notes about this employee..."}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-sm text-gray-700 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Role Specific Content */}
        <div className="lg:col-span-2 space-y-6">
          {isWorker ? (
            <>
              <WorkerStatsGrid worker={employee} totalTasks={tasks.length} />
              <WorkerTaskList tasks={tasks} />
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-gray-200 min-h-[400px]">
              <div className="bg-purple-100 p-4 rounded-full">
                <FileText className="w-12 h-12 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("roles.accountant")}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  {/* Providing a more descriptive empty state for accountants */}
                  Accountant details focus on administrative notes and profile management. Task tracking is currently optimized for workers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== Modals ==================== */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        employee={employee}
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

export default memo(EmployeeDetails);
