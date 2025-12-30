// frontend/src/pages/admin/TaskModal.jsx - FIXED EDIT MODE
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  MapPin,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  X,
} from "lucide-react";

// React Query hooks
import { useSites } from "../../hooks/queries/useSites";
import { useWorkers } from "../../hooks/queries/useUsers";
import { useCreateTask, useUpdateTask } from "../../hooks/queries/useTasks";

import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ReactSelect from "react-select";
import { toast } from "sonner";

const TaskModal = ({ isOpen, onClose, task, preFillSite }) => {
  const { t } = useTranslation();

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  // Data fetching with React Query
  const { data: sites = [] } = useSites();
  const { data: workers = [] } = useWorkers();

  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      site: "",
      sections: [],
      worker: "",
      scheduledDate: "",
    },
  });

  const watchSite = watch("site");

  // ✅ FIXED: Reset form and local state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      // 🔧 Edit Mode - Load existing task data
      console.log("📝 Edit Mode - Loading task:", task);

      // Reset form with task data
      reset({
        title: task.title || "",
        description: task.description || "",
        site: task.site?._id || "",
        worker: task.worker?._id || "",
        scheduledDate: task.scheduledDate
          ? new Date(task.scheduledDate).toISOString().split("T")[0]
          : "",
      });

      // Set selected site
      const siteData = task.site;
      setSelectedSite(siteData);
      setSelectedClient(siteData?.client?._id || null);
      setAvailableSections(siteData?.sections || []);

      // ✅ CRITICAL: Set selected sections from task
      const taskSectionIds = task.sections?.map((s) => 
        typeof s === 'string' ? s : s._id
      ) || [];
      setSelectedSections(taskSectionIds);

      console.log("✅ Loaded sections:", taskSectionIds);
    } else {
      // 🆕 Create Mode - Fresh form
      console.log("🆕 Create Mode");

      reset({
        title: "",
        description: "",
        site: preFillSite?._id || "",
        sections: [],
        worker: "",
        scheduledDate: "",
      });

      setSelectedSections([]);
      setSelectedSite(preFillSite || null);
      setAvailableSections(preFillSite?.sections || []);
      setSelectedClient(preFillSite?.client?._id || null);
    }

    setSubmitAttempted(false);
  }, [isOpen, task, preFillSite, reset]);

  // Load site details when site ID changes (only in create mode)
  useEffect(() => {
    // Skip if we're in edit mode with existing task
    if (task) return;

    if (!watchSite) {
      setSelectedSite(null);
      setAvailableSections([]);
      setSelectedSections([]);
      return;
    }

    const foundSite = sites.find((s) => s._id === watchSite);
    if (foundSite) {
      setSelectedSite(foundSite);
      setAvailableSections(foundSite.sections || []);
      setSelectedClient(foundSite.client?._id || null);
    }
  }, [watchSite, sites, task]);

  const toggleSection = useCallback((sectionId) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const onSubmit = useCallback(
    async (data) => {
      setSubmitAttempted(true);

      // Complete client-side validation
      if (!data.title?.trim()) {
        toast.error(t("admin.tasks.titleRequired"));
        return;
      }

      if (selectedSections.length === 0) {
        toast.error(t("admin.tasks.selectAtLeastOneSection"));
        return;
      }

      if (!data.worker) {
        toast.error(t("admin.tasks.workerRequired"));
        return;
      }

      if (!watchSite) {
        toast.error(t("admin.tasks.siteRequired"));
        return;
      }

      if (!data.scheduledDate) {
        toast.error(t("admin.tasks.dueDateRequired"));
        return;
      }

      try {
        // ✅ FIXED: Prepare payload with sections
        const payload = {
          title: data.title.trim(),
          description: data.description?.trim() || "",
          site: watchSite,
          sections: selectedSections, // ✅ This is the key fix
          worker: data.worker,
          scheduledDate: data.scheduledDate,
          client: selectedClient || task?.client?._id,
        };

        console.log("📤 Submitting payload:", payload);

        if (task) {
          await updateTaskMutation.mutateAsync({
            id: task._id,
            data: payload,
          });
        } else {
          await createTaskMutation.mutateAsync(payload);
        }

        // Success - close modal
        onClose();
      } catch (err) {
        console.error("❌ Submit error:", err);
        toast.error(err.response?.data?.message || t("common.errorOccurred"));
      }
    },
    [
      task,
      selectedClient,
      selectedSections,
      watchSite,
      updateTaskMutation,
      createTaskMutation,
      onClose,
      t,
    ]
  );

  const getSectionLastStatusColor = useCallback((status) => {
    const colors = {
      completed: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? t("admin.tasks.editTask") : t("admin.tasks.createTask")}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <Input
          label={t("admin.tasks.taskTitle")}
          {...register("title", { required: t("admin.tasks.titleRequired") })}
          error={errors.title?.message}
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.tasks.description")}
          </label>
          <textarea
            {...register("description", {
              required: t("admin.tasks.descriptionRequired"),
            })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Detailed task instructions..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Site Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {t("common.site")} <span className="text-red-500">*</span>
          </label>

          <ReactSelect
            placeholder="Search and select site..."
            value={
              selectedSite
                ? {
                    value: selectedSite._id,
                    label: `${selectedSite.name} - ${
                      selectedSite.client?.name || ""
                    }`,
                  }
                : null
            }
            onChange={(option) => {
              const selected = sites.find((s) => s._id === option?.value);
              setSelectedSite(selected);
              setSelectedClient(selected?.client?._id || null);
              setValue("site", option?.value || "");
              
              // Clear sections when site changes
              setAvailableSections(selected?.sections || []);
              setSelectedSections([]);
            }}
            options={sites.map((site) => ({
              value: site._id,
              label: `${site.name} - ${site.client?.name || ""}`,
            }))}
            isDisabled={!!task} // ✅ Disable site change in edit mode
            isClearable={!task}
            className="w-full"
          />

          {submitAttempted && !watchSite && (
            <p className="text-sm text-red-500 mt-1">
              {t("admin.tasks.siteRequired")}
            </p>
          )}
        </div>

        {/* Sections Multi-Select */}
        {availableSections.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-600" />
              {t("admin.tasks.selectSections")} ({availableSections.length}{" "}
              available)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
              {availableSections.map((section) => {
                const isSelected = selectedSections.includes(section._id);
                return (
                  <div
                    key={section._id}
                    onClick={() => toggleSection(section._id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="font-medium text-sm text-gray-900">
                            {section.name}
                          </span>
                        </div>
                        {section.description && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>
                      {section.lastTaskStatus && (
                        <span
                          className={`px-2 py-1 text-xs rounded border ${getSectionLastStatusColor(
                            section.lastTaskStatus
                          )}`}
                        >
                          {section.lastTaskStatus}
                        </span>
                      )}
                    </div>
                    {section.referenceImages?.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <ImageIcon className="w-3 h-3" />
                        {section.referenceImages.length} ref. images
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {submitAttempted && selectedSections.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                {t("admin.tasks.selectAtLeastOneSection")}
              </p>
            )}
          </div>
        )}

        {/* Selected Sections Preview */}
        {selectedSections.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-600" />
              Selected Sections ({selectedSections.length})
            </h4>
            <div className="space-y-2">
              {selectedSections.map((sectionId) => {
                const section = availableSections.find(
                  (s) => s._id === sectionId
                );
                if (!section) return null;
                return (
                  <div
                    key={sectionId}
                    className="flex items-center justify-between bg-white p-3 rounded border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {section.name}
                      </p>
                      {section.description && (
                        <p className="text-xs text-gray-600 truncate">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSection(sectionId)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          {/* Worker Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.tasks.worker")} *
            </label>
            <ReactSelect
              placeholder="Select worker"
              value={
                workers.find((w) => w._id === watch("worker"))
                  ? {
                      value: watch("worker"),
                      label: workers.find((w) => w._id === watch("worker"))
                        .name,
                    }
                  : null
              }
              onChange={(option) =>
                setValue("worker", option ? option.value : "")
              }
              options={workers.map((w) => ({ value: w._id, label: w.name }))}
              isClearable
              className="w-full"
            />
            {submitAttempted && !watch("worker") && (
              <p className="text-sm text-red-500 mt-1">
                {t("admin.tasks.workerRequired")}
              </p>
            )}
          </div>

          {/* Scheduled Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.tasks.dueDate")} *
            </label>
            <Input
              type="date"
              {...register("scheduledDate", {
                required: t("admin.tasks.dueDateRequired"),
              })}
              error={errors.scheduledDate?.message}
            />
          </div>
        </div>

        {/* Info Message */}
        {!task && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Note:</p>
              <p>{t("admin.tasks.warning")}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={
              createTaskMutation.isPending || updateTaskMutation.isPending
            }
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={
              createTaskMutation.isPending || updateTaskMutation.isPending
            }
          >
            {createTaskMutation.isPending || updateTaskMutation.isPending
              ? t("common.loading")
              : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;