// frontend/src/pages/worker/TaskDetail.jsx - FINAL COMPLETE VERSION
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Clock,
  X,
  Plus,
  Minus,
  MapPin,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { tasksAPI, inventoryAPI } from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const TaskDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Reference-Based Image Upload
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [beforePreviews, setBeforePreviews] = useState([]);
  const [afterPreviews, setAfterPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ✅ Reference Images from Section
  const [referenceImages, setReferenceImages] = useState([]);

  // Materials Management
  const [availableInventory, setAvailableInventory] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  useEffect(() => {
    fetchTask();
    fetchInventory();
  }, [id]);

  useEffect(() => {
    if (task) {
      console.log("🔍 Task Status:", task.status);
      console.log("🖼️ Reference Images:", task.referenceImages);

      // ✅ Load reference images from task
      if (task.referenceImages && task.referenceImages.length > 0) {
        setReferenceImages(task.referenceImages);

        // Initialize arrays for reference-based upload
        const refCount = task.referenceImages.length;
        setBeforePreviews(new Array(refCount).fill(null));
        setAfterPreviews(new Array(refCount).fill(null));

        // ✅ LOAD EXISTING UPLOADED IMAGES (if any)
        if (task.images?.before) {
          const loadedBefore = [...new Array(refCount).fill(null)];
          task.images.before.forEach((img, idx) => {
            if (idx < refCount) {
              loadedBefore[idx] = { url: img.url, existing: true };
            }
          });
          setBeforePreviews(loadedBefore);
        }

        if (task.images?.after) {
          const loadedAfter = [...new Array(refCount).fill(null)];
          task.images.after.forEach((img, idx) => {
            if (idx < refCount) {
              loadedAfter[idx] = { url: img.url, existing: true };
            }
          });
          setAfterPreviews(loadedAfter);
        }
      } else {
        console.warn("⚠️ No reference images found");
      }

      // Load existing materials
      if (task.materials) {
        setSelectedMaterials(
          task.materials.map((m) => ({
            item: m.item?._id || m.item,
            name: m.name || m.item?.name,
            quantity: m.quantity,
            unit: m.unit || m.item?.unit,
            confirmed: m.confirmed || false,
          }))
        );
      }
    }
  }, [task]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTask(id);
      setTask(response.data.data);
    } catch (error) {
      console.error("Error fetching task:", error);
      alert("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getInventory();
      setAvailableInventory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  // ============================================
  // Material Management Functions
  // ============================================
  const handleAddMaterial = (inventoryItem) => {
    const existing = selectedMaterials.find(
      (m) => m.item === inventoryItem._id
    );
    if (existing) {
      alert("Material already added");
      return;
    }

    setSelectedMaterials([
      ...selectedMaterials,
      {
        item: inventoryItem._id,
        name: inventoryItem.name,
        quantity: 1,
        unit: inventoryItem.unit,
        confirmed: false,
      },
    ]);
    setShowAddMaterial(false);
  };

  const handleUpdateMaterialQuantity = (index, change) => {
    const updated = [...selectedMaterials];
    updated[index].quantity = Math.max(1, updated[index].quantity + change);
    setSelectedMaterials(updated);
  };

  const handleRemoveMaterial = (index) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const handleConfirmMaterials = async () => {
    try {
      await tasksAPI.updateTask(id, {
        materials: selectedMaterials.map((m) => ({
          ...m,
          confirmed: true,
          confirmedAt: new Date(),
        })),
      });

      alert("Materials confirmed successfully");
      fetchTask();
    } catch (error) {
      console.error("Error confirming materials:", error);
      alert("Failed to confirm materials");
    }
  };

  // ============================================
  // Image Upload Functions (Reference-Based)
  // ============================================
  const handleImageChange = async (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Extract index from input id (e.g., "before-0" → 0)

    try {
      setUploading(true);

      // Upload immediately
      const formData = new FormData();
      formData.append("images", file);
      formData.append("imageType", type);
      formData.append("isVisibleToClient", "true");

      await tasksAPI.uploadTaskImages(id, formData);

      // Refresh task to get updated images
      await fetchTask();

      alert(
        `${type === "before" ? "Before" : "After"} photo uploaded successfully!`
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (type, index) => {
    if (type === "before") {
      const newImages = [...beforeImages];
      const newPreviews = [...beforePreviews];
      newImages[index] = null;
      newPreviews[index] = null;
      setBeforeImages(newImages);
      setBeforePreviews(newPreviews);
    } else {
      const newImages = [...afterImages];
      const newPreviews = [...afterPreviews];
      newImages[index] = null;
      newPreviews[index] = null;
      setAfterImages(newImages);
      setAfterPreviews(newPreviews);
    }
  };

  // ============================================
  // Task Actions
  // ============================================
  const handleStartTask = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await tasksAPI.startTask(id, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            fetchTask();
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Could not get your location");
          }
        );
      }
    } catch (error) {
      console.error("Error starting task:", error);
      alert("Failed to start task");
    }
  };

  const handleFinishTask = async () => {
    try {
      // ✅ Validation for reference-based images
      const beforeCount = beforePreviews.filter((p) => p !== null).length;
      const afterCount = afterPreviews.filter((p) => p !== null).length;
      const refCount = referenceImages.length;

      if (refCount > 0) {
        if (beforeCount < refCount) {
          alert(
            `Please upload all ${refCount} before photos (${beforeCount}/${refCount} completed)`
          );
          return;
        }
        if (afterCount < refCount) {
          alert(
            `Please upload all ${refCount} after photos (${afterCount}/${refCount} completed)`
          );
          return;
        }
      } else {
        // Fallback: at least one before/after if no reference images
        if (beforeCount === 0) {
          alert("Please upload at least one before photo");
          return;
        }
        if (afterCount === 0) {
          alert("Please upload at least one after photo");
          return;
        }
      }

      if (selectedMaterials.length === 0) {
        alert("Please add materials used");
        return;
      }
      if (selectedMaterials.some((m) => !m.confirmed)) {
        alert("Please confirm all materials");
        return;
      }

      setUploading(true);

      // Upload before images (filter out nulls)
      const beforeFilesToUpload = beforeImages.filter((f) => f !== null);
      if (beforeFilesToUpload.length > 0) {
        const beforeFormData = new FormData();
        beforeFilesToUpload.forEach((file) => {
          beforeFormData.append("images", file);
        });
        beforeFormData.append("imageType", "before");
        beforeFormData.append("isVisibleToClient", "true");

        await tasksAPI.uploadTaskImages(id, beforeFormData);
      }

      // Upload after images (filter out nulls)
      const afterFilesToUpload = afterImages.filter((f) => f !== null);
      if (afterFilesToUpload.length > 0) {
        const afterFormData = new FormData();
        afterFilesToUpload.forEach((file) => {
          afterFormData.append("images", file);
        });
        afterFormData.append("imageType", "after");
        afterFormData.append("isVisibleToClient", "true");

        await tasksAPI.uploadTaskImages(id, afterFormData);
      }

      // Complete task with location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await tasksAPI.completeTask(id, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });

            alert("Task completed successfully!");
            navigate("/worker/tasks");
          },
          async (error) => {
            console.error("Geolocation error:", error);
            await tasksAPI.completeTask(id, {});
            alert("Task completed successfully!");
            navigate("/worker/tasks");
          }
        );
      }
    } catch (error) {
      console.error("Error finishing task:", error);
      alert(error.response?.data?.message || "Failed to complete task");
    } finally {
      setUploading(false);
    }
  };

  // ============================================
  // Helper Functions
  // ============================================
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const materialsConfirmed =
    selectedMaterials.length > 0 && selectedMaterials.every((m) => m.confirmed);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="secondary"
        icon={ArrowLeft}
        onClick={() => navigate("/worker/tasks")}
      >
        Back to Tasks
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============================================ */}
        {/* MAIN CONTENT - Left Column */}
        {/* ============================================ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info Card */}
          <Card>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-900">
                  {task.title}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    task.status
                  )}`}
                >
                  {t(`status.${task.status}`)}
                </span>
              </div>

              <p className="text-gray-600">{task.description}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-semibold">{task.client?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-semibold">
                    {new Date(task.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <p className="font-semibold text-orange-600">
                    {t(`priority.${task.priority}`)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-semibold">{task.category}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* ✅ Site & Section Info Card */}
          {task.site && (
            <Card title="📍 Site Information">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {task.site.coverImage?.url ? (
                    <img
                      src={task.site.coverImage.url}
                      alt={task.site.name}
                      className="w-20 h-20 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary-100 rounded flex items-center justify-center shrink-0">
                      <MapPin className="w-10 h-10 text-primary-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {task.site.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Type: {task.site.siteType} • Area: {task.site.totalArea}m²
                    </p>
                    {task.site.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {task.site.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section Info */}
                {task.section && referenceImages.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-5 h-5 text-primary-600" />
                      <h4 className="font-semibold text-gray-900">
                        Assigned Section:{" "}
                        {task.section.name || "Specific Section"}
                      </h4>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <strong>
                          {referenceImages.length} Reference Images
                        </strong>{" "}
                        available below
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Use these images as a guide for your work
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ✅ Reference Images with Before/After Upload */}
          {referenceImages.length > 0 && (
            <Card title="📸 Work Reference Guide">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium">
                    📋 Complete each section: Reference → Before → After
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Take photos from the same angle as the reference images
                  </p>
                </div>

                {/* Reference Image Cards */}
                <div className="space-y-6">
                  {referenceImages.map((refImg, refIndex) => (
                    <div
                      key={refIndex}
                      className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                          #{refIndex + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900">
                          {refImg.caption || `Work Area ${refIndex + 1}`}
                        </h4>
                      </div>

                      {/* 3-Column Layout: Reference | Before | After */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Reference Image */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            📋 Reference
                          </label>
                          <div className="relative">
                            <img
                              src={refImg.url}
                              alt={`Reference ${refIndex + 1}`}
                              className="w-full h-40 object-cover rounded-lg border-2 border-primary-300 bg-white cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(refImg.url, "_blank")}
                              style={{
                                display: "block",
                                backgroundColor: "#fff",
                              }}
                            />
                            <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Click to enlarge
                            </div>
                          </div>
                        </div>

                        {/* Before Photo Upload */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            📷 Before Work
                          </label>
                          {beforePreviews[refIndex] ? (
                            <div className="relative group">
                              <img
                                src={beforePreviews[refIndex].url}
                                alt={`Before ${refIndex + 1}`}
                                className="w-full h-40 object-cover rounded-lg border-2 border-blue-300"
                              />
                              {/* ✅ Only allow delete if NOT existing (newly uploaded) */}
                              {!beforePreviews[refIndex].existing &&
                                task.status !== "completed" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeImage("before", refIndex)
                                    }
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              {beforePreviews[refIndex].existing && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                  ✅ Uploaded
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange("before", e)}
                                className="hidden"
                                id={`before-${refIndex}`}
                                disabled={task.status === "completed"}
                              />
                              <label
                                htmlFor={`before-${refIndex}`}
                                className="cursor-pointer flex flex-col items-center"
                              >
                                <Camera className="w-8 h-8 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-600 text-center">
                                  Upload
                                  <br />
                                  Before Photo
                                </span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* After Photo Upload */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            ✅ After Work
                          </label>
                          {afterPreviews[refIndex] ? (
                            <div className="relative group">
                              <img
                                src={afterPreviews[refIndex].url}
                                alt={`After ${refIndex + 1}`}
                                className="w-full h-40 object-cover rounded-lg border-2 border-green-300"
                              />
                              {/* ✅ Only allow delete if NOT existing (newly uploaded) */}
                              {!afterPreviews[refIndex].existing &&
                                task.status !== "completed" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeImage("after", refIndex)
                                    }
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              {afterPreviews[refIndex].existing && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                  ✅ Uploaded
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center hover:border-green-400 hover:bg-green-50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange("after", e)}
                                className="hidden"
                                id={`after-${refIndex}`}
                                disabled={task.status === "completed"}
                              />
                              <label
                                htmlFor={`after-${refIndex}`}
                                className="cursor-pointer flex flex-col items-center"
                              >
                                <Camera className="w-8 h-8 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-600 text-center">
                                  Upload
                                  <br />
                                  After Photo
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <div
                          className={`flex items-center gap-1 ${
                            beforePreviews[refIndex]
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {beforePreviews[refIndex] ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          <span>Before</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div
                          className={`flex items-center gap-1 ${
                            afterPreviews[refIndex]
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {afterPreviews[refIndex] ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          <span>After</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall Progress */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Progress: {beforePreviews.filter((p) => p).length}/
                      {referenceImages.length} Before •{" "}
                      {afterPreviews.filter((p) => p).length}/
                      {referenceImages.length} After
                    </span>
                    {beforePreviews.filter((p) => p).length ===
                      referenceImages.length &&
                      afterPreviews.filter((p) => p).length ===
                        referenceImages.length && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ============================================ */}
        {/* SIDEBAR - Right Column */}
        {/* ============================================ */}
        <div className="space-y-6">
          {/* Materials Management Card */}
          <Card title={t("worker.materialsReceived")}>
            <div className="space-y-3">
              {selectedMaterials.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No materials added yet
                </div>
              ) : (
                selectedMaterials.map((material, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {material.name}
                        </p>
                        {material.confirmed && (
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Confirmed
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateMaterialQuantity(idx, -1)}
                          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={
                            task.status === "completed" || material.confirmed
                          }
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="text-sm px-3 py-1 bg-white border border-gray-300 rounded min-w-[60px] text-center">
                          {material.quantity} {material.unit}
                        </span>
                        <button
                          onClick={() => handleUpdateMaterialQuantity(idx, 1)}
                          className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={
                            task.status === "completed" || material.confirmed
                          }
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* ✅ DELETE BUTTON - ALWAYS SHOW IT! */}
                    {task.status !== "completed" && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${material.name}?`)) {
                            handleRemoveMaterial(idx);
                          }
                        }}
                        className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shrink-0"
                        title="Remove material"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))
              )}

              {task.status !== "completed" && (
                <>
                  {!showAddMaterial ? (
                    <button
                      onClick={() => setShowAddMaterial(true)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 text-sm text-gray-600 hover:text-primary-600 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-medium">Add Material</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <select
                        onChange={(e) => {
                          const item = availableInventory.find(
                            (i) => i._id === e.target.value
                          );
                          if (item) handleAddMaterial(item);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select material...</option>
                        {availableInventory.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name} ({item.quantity.current} {item.unit}{" "}
                            available)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowAddMaterial(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* ✅ Confirm Materials Button - Made it MORE VISIBLE */}
                  {selectedMaterials.length > 0 && !materialsConfirmed && (
                    <div className="pt-2 border-t border-gray-200">
                      <Button
                        className="w-full"
                        variant="success"
                        size="md"
                        onClick={handleConfirmMaterials}
                        icon={CheckCircle}
                      >
                        ✅ Confirm All Materials ({selectedMaterials.length})
                      </Button>
                      <p className="text-xs text-orange-600 text-center mt-2">
                        You must confirm materials before finishing task
                      </p>
                    </div>
                  )}
                </>
              )}

              {materialsConfirmed && (
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-800">
                    All Materials Confirmed ✅
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    You can now finish the task
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Task Time Card */}
          {task.startedAt && (
            <Card title={t("worker.taskTime")}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>
                    Started: {new Date(task.startedAt).toLocaleString()}
                  </span>
                </div>
                {task.completedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>
                      Completed: {new Date(task.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ✅ FINISH TASK BUTTON - ALWAYS SHOW IF NOT COMPLETED */}
          {task.status !== "completed" && (
            <Card title="🎯 Complete Task">
              <div className="space-y-3">
                {/* Debug Info */}
                <div className="bg-gray-100 p-2 rounded text-xs">
                  <p>
                    Current Status: <strong>{task.status}</strong>
                  </p>
                  <p>
                    Materials Confirmed:{" "}
                    <strong>{materialsConfirmed ? "Yes ✅" : "No ❌"}</strong>
                  </p>
                </div>

                <Button
                  className="w-full py-4 text-lg font-bold"
                  variant="success"
                  onClick={handleFinishTask}
                  disabled={
                    uploading ||
                    !materialsConfirmed ||
                    beforePreviews.filter((p) => p).length <
                      referenceImages.length ||
                    afterPreviews.filter((p) => p).length <
                      referenceImages.length
                  }
                >
                  {uploading ? "⏳ Uploading Images..." : "✅ Finish Task"}
                </Button>

                {!materialsConfirmed && (
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 text-center">
                    <p className="text-sm text-orange-800 font-bold">
                      Please confirm materials first!
                    </p>
                  </div>
                )}

                {materialsConfirmed && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-800 font-medium">
                      ✅ Ready to finish! Make sure all photos are uploaded
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ✅ Actions Card */}
          <Card title="⚡ Quick Actions">
            <div className="space-y-3">
              {task.status === "assigned" && (
                <Button
                  className="w-full py-3 text-base font-semibold"
                  onClick={handleStartTask}
                  icon={Clock}
                >
                  🚀 Start Task
                </Button>
              )}

              {task.status === "completed" && (
                <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold text-lg">
                    Task Completed! ✅
                  </p>
                  <p className="text-green-600 text-sm mt-1">Great job!</p>
                </div>
              )}

              {task.status === "in-progress" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-800 font-medium">
                    Task in progress...
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Complete materials and photos to finish
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
