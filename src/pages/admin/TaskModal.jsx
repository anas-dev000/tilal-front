// frontend/src/pages/admin/TaskModal.jsx - ✅ SIMPLIFIED
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { MapPin, Layers, Image as ImageIcon, AlertCircle } from "lucide-react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { tasksAPI, sitesAPI, usersAPI } from "../../services/api";

const TaskModal = ({ isOpen, onClose, task, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: task || {},
  });

  const watchSite = watch("site");
  const watchSection = watch("section");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (task) {
      reset({
        ...task,
        site: task.site?._id || "",
        section: task.section || "",
        client: task.client?._id || "",
        worker: task.worker?._id || "",
      });

      if (task.site?._id) {
        loadSiteDetails(task.site._id);
      }
    } else {
      reset({
        title: "",
        description: "",
        site: "",
        section: "",
        client: "",
        worker: "",
        scheduledDate: "",
      });
    }
  }, [task, reset]);

  useEffect(() => {
    if (watchSite) {
      loadSiteDetails(watchSite);
    } else {
      setSelectedSite(null);
      setAvailableSections([]);
      setSelectedSection(null);
      setValue("client", "");
      setValue("section", "");
    }
  }, [watchSite]);

  useEffect(() => {
    if (watchSection && availableSections.length > 0) {
      const section = availableSections.find((s) => s._id === watchSection);
      setSelectedSection(section);
    } else {
      setSelectedSection(null);
    }
  }, [watchSection, availableSections]);

  const fetchData = async () => {
    try {
      const [sitesRes, workersRes] = await Promise.all([
        sitesAPI.getAllSites(),
        usersAPI.getWorkers(),
      ]);

      setSites(sitesRes.data.data || []);
      setWorkers(workersRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const loadSiteDetails = async (siteId) => {
    try {
      const response = await sitesAPI.getSite(siteId);
      const siteData = response.data.data;

      setSelectedSite(siteData);
      setAvailableSections(siteData.sections || []);

      if (siteData.client?._id) {
        setValue("client", siteData.client._id);
      }
    } catch (error) {
      console.error("Error loading site:", error);
      setSelectedSite(null);
      setAvailableSections([]);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      if (!data.site) {
        setError("Please select a site");
        setLoading(false);
        return;
      }

      if (!data.section) {
        setError("Please select a section");
        setLoading(false);
        return;
      }

      if (!data.client) {
        setError("Client is required");
        setLoading(false);
        return;
      }

      const taskData = {
        ...data,
        site: data.site,
        section: data.section,
        client: data.client,
        worker: data.worker || null,
      };

      if (task) {
        await tasksAPI.updateTask(task._id, taskData);
      } else {
        await tasksAPI.createTask(taskData);
      }

      onSuccess();
      onClose();
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? t("common.edit") : t("admin.tasks.createTask")}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Name */}
        <Input
          label={t("admin.tasks.taskName")}
          {...register("title", { required: "Task name is required" })}
          error={errors.title?.message}
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.tasks.description")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Site Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Site <span className="text-red-500">*</span>
          </label>
          <select
            {...register("site", { required: "Site is required" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select site...</option>
            {sites.map((site) => (
              <option key={site._id} value={site._id}>
                {site.name} ({site.client?.name})
              </option>
            ))}
          </select>
          {errors.site && (
            <p className="mt-1 text-sm text-red-500">{errors.site.message}</p>
          )}
        </div>

        {/* Site Preview */}
        {selectedSite && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              {selectedSite.coverImage?.url ? (
                <img
                  src={selectedSite.coverImage.url}
                  alt={selectedSite.name}
                  className="w-16 h-16 rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded flex items-center justify-center shrink-0">
                  <MapPin className="w-8 h-8 text-primary-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">
                  {selectedSite.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Client: {selectedSite.client?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Type: {selectedSite.siteType} • Area: {selectedSite.totalArea}
                  m²
                </p>
                <p className="text-sm text-primary-600 font-medium mt-1">
                  <Layers className="w-4 h-4 inline mr-1" />
                  {selectedSite.sections?.length || 0} sections available
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Selection */}
        {availableSections.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Layers className="w-4 h-4 inline mr-1" />
              Section <span className="text-red-500">*</span>
            </label>
            <select
              {...register("section", { required: "Section is required" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select section...</option>
              {availableSections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.name}
                  {section.referenceImages?.length > 0 &&
                    ` (${section.referenceImages.length} ref. images)`}
                </option>
              ))}
            </select>
            {errors.section && (
              <p className="mt-1 text-sm text-red-500">
                {errors.section.message}
              </p>
            )}
          </div>
        )}

        {/* Section Preview */}
        {selectedSection && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Selected Section: {selectedSection.name}
            </h4>
            {selectedSection.description && (
              <p className="text-sm text-gray-600 mb-2">
                {selectedSection.description}
              </p>
            )}
            {selectedSection.area > 0 && (
              <p className="text-sm text-gray-700">
                Area: {selectedSection.area}m²
              </p>
            )}
            {selectedSection.referenceImages?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  Reference Images ({selectedSection.referenceImages.length})
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {selectedSection.referenceImages
                    .slice(0, 8)
                    .map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`Ref ${idx + 1}`}
                        className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(img.url, "_blank")}
                      />
                    ))}
                  {selectedSection.referenceImages.length > 8 && (
                    <div className="w-full h-16 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-600">
                      +{selectedSection.referenceImages.length - 8} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Client (Auto-filled) */}
        <Input
          label="Client"
          value={selectedSite?.client?.name || "Select a site first"}
          disabled
          className="bg-gray-100"
        />
        <input type="hidden" {...register("client")} />

        {/* Worker Selection */}
        <Select
          label={t("admin.tasks.assignedTo")}
          {...register("worker")}
          options={workers.map((w) => ({ value: w._id, label: w.name }))}
          placeholder="Select worker (optional)"
        />

        {/* Scheduled Date */}
        <Input
          label={t("admin.tasks.dueDate")}
          type="date"
          {...register("scheduledDate", { required: "Date is required" })}
          error={errors.scheduledDate?.message}
          required
        />

        {/* Info Message */}
        {!task && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Note:</p>
              <p>
                Workers will see reference images from the selected section
                during task execution.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
