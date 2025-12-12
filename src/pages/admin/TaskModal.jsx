/* eslint-disable no-unused-vars */
// frontend/src/pages/admin/TaskModal.jsx - ✅ UPDATED: Multiple Sections Support + preFillSite Handling
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  MapPin,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  X,
  Search,
} from "lucide-react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { tasksAPI, sitesAPI, usersAPI } from "../../services/api";
import ReactSelect from "react-select";

const fetchSiteDetails = async (siteId) => {
  const response = await sitesAPI.getSite(siteId);
  return response.data.data;
};

const TaskModal = ({ isOpen, onClose, task, onSuccess, preFillSite }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [siteSearch, setSiteSearch] = useState("");
  const [workers, setWorkers] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

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

  useEffect(() => {
    fetchData();
  }, []);

  // Filter sites based on search
  useEffect(() => {
    if (siteSearch.trim()) {
      const filtered = sites.filter(
        (site) =>
          site.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
          site.client?.name.toLowerCase().includes(siteSearch.toLowerCase())
      );
      setFilteredSites(filtered);
    } else {
      setFilteredSites(sites);
    }
  }, [siteSearch, sites]);

  useEffect(() => {
    let isCancelled = false;

    if (!task) {
      reset({
        title: "",
        description: "",
        site: "",
        sections: [],
        client: "",
        worker: "",
        scheduledDate: "",
      });

      setSelectedSite(null);
      setAvailableSections([]);
      setSelectedSections([]);
      return;
    }

    reset({
      ...task,
      site: task.site?._id || "",
      sections: task.sections || [],
      client: task.client?._id || "",
      worker: task.worker?._id || "",
    });

    if (!task.site?._id) {
      setSelectedSite(null);
      setAvailableSections([]);
      setSelectedSections(task.sections || []);
      return;
    }

    const load = async () => {
      try {
        const siteData = await fetchSiteDetails(task.site._id);

        if (isCancelled) return;

        setSelectedSite(siteData);
        setAvailableSections(siteData.sections || []);
        setSelectedSections(task.sections || []);

        if (siteData.client?._id) {
          setValue("client", siteData.client._id);
        }
      } catch (err) {
        if (isCancelled) return;

        console.error("Error loading site:", err);
        setSelectedSite(null);
        setAvailableSections([]);
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [task, reset, setValue]);

  // ✅ NEW: Handle preFillSite
  useEffect(() => {
    if (preFillSite && !task) {
      setValue("site", preFillSite._id);
      const loadPreFillSite = async () => {
        try {
          const response = await sitesAPI.getSite(preFillSite._id);
          const siteData = response.data.data;
          setSelectedSite(siteData);
          setAvailableSections(siteData.sections || []);
          if (siteData.client?._id) {
            setValue("client", siteData.client._id);
          }
        } catch (error) {
          console.error("Error loading pre-filled site:", error);
        }
      };
      loadPreFillSite();
    }
  }, [preFillSite, task, setValue]);

  useEffect(() => {
    if (watchSite && !preFillSite) {
      // Avoid reloading if pre-filled
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

      loadSiteDetails(watchSite);
    } else if (!watchSite) {
      setSelectedSite(null);
      setAvailableSections([]);
      setSelectedSections([]);
      setValue("client", "");
      setValue("sections", []);
    }
  }, [watchSite, setValue, preFillSite]);

  // Filter sites based on search
  useEffect(() => {
    if (siteSearch.trim()) {
      const filtered = sites.filter(
        (site) =>
          site.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
          site.client?.name.toLowerCase().includes(siteSearch.toLowerCase())
      );
      setFilteredSites(filtered);
    } else {
      setFilteredSites(sites);
    }
  }, [siteSearch, sites]);

  const fetchData = async () => {
    try {
      const [sitesRes, workersRes] = await Promise.all([
        sitesAPI.getAllSites(),
        usersAPI.getWorkers(),
      ]);
      setSites(sitesRes.data.data || []);
      setFilteredSites(sitesRes.data.data || []);
      setWorkers(workersRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const toggleSection = (sectionId) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const onSubmit = async (data) => {
    if (selectedSections.length === 0) {
      setError("Please select at least one section");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...data,
        sections: selectedSections,
      };

      let response;
      if (task) {
        response = await tasksAPI.updateTask(task._id, payload);
      } else {
        response = await tasksAPI.createTask(payload);
      }

      onSuccess(response.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getSectionLastStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? t("admin.tasks.editTask") : t("admin.tasks.createTask")}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Title */}
        <Input
          label={t("admin.tasks.taskTitle")}
          {...register("title", { required: "Title is required" })}
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
              required: "Description is required",
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

        {/* Site Selection with Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Site <span className="text-red-500">*</span>
          </label>

          {/* Site Select */}
          <ReactSelect
            placeholder="Search and select site..."
            value={
              selectedSite
                ? {
                    value: selectedSite._id,
                    label: `${selectedSite.name} - ${selectedSite.client?.name}`,
                  }
                : null
            }
            onChange={(option) => {
              setSelectedSite(sites.find((s) => s._id === option.value));
              setValue("site", option.value);
            }}
            options={filteredSites.map((site) => ({
              value: site._id,
              label: `${site.name} - ${site.client?.name || ""}`,
            }))}
            isClearable
            className="w-full"
          />
          {errors.site && (
            <p className="mt-1 text-sm text-red-500">{errors.site.message}</p>
          )}

          {filteredSites.length === 0 && siteSearch && (
            <p className="mt-1 text-sm text-gray-500">
              No sites found matching "{siteSearch}"
            </p>
          )}
        </div>

        {/* Sections Multi-Select */}
        {availableSections.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-600" />
              Select Sections ({availableSections.length} available)
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
            {selectedSections.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                Please select at least one section
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
              placeholder="Select worker (optional)"
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
          </div>

          {/* Scheduled Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.tasks.dueDate")} *
            </label>
            <Input
              type="date"
              {...register("scheduledDate", { required: "Date is required" })}
              error={errors.scheduledDate?.message}
              required
            />
          </div>
        </div>

        {/* Info Message */}
        {!task && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Note:</p>
              <p>
                Workers will see reference images from ALL selected sections
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
