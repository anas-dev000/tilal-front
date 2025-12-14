// frontend/src/pages/worker/TaskDetail.jsx - WITH VIDEO SUPPORT & MEDIA MODAL
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DeleteImageButton from "../../components/common/DeleteImageButton";
import MediaModal from "../../components/common/MediaModal";
import { toast } from "sonner";
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
  AlertCircle,
  Loader2,
  Video,
  Play,
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

  // Track uploading state per image location
  const [uploadingImages, setUploadingImages] = useState({});

  // Materials
  const [availableInventory, setAvailableInventory] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  // QTN-Based Previews
  const [previewsByRef, setPreviewsByRef] = useState({});
  const [referenceImages, setReferenceImages] = useState([]);

  // Media Modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("image");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [taskRes, invRes] = await Promise.all([
          tasksAPI.getTask(id),
          inventoryAPI.getInventory(),
        ]);

        const taskData = taskRes.data.data;
        setTask(taskData);
        setAvailableInventory(invRes.data.data || []);

        initializeQTNStructure(taskData);
      } catch (error) {
        console.error("Error loading task:", error);
        toast.error("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const refreshTaskData = async () => {
    try {
      const res = await tasksAPI.getTask(id);
      setTask(res.data.data);
      initializeQTNStructure(res.data.data);
    } catch (error) {
      console.error("Error refreshing task:", error);
      toast.error("Failed to refresh task data");
    }
  };

  const initializeQTNStructure = (taskData) => {
    if (!taskData.referenceImages || taskData.referenceImages.length === 0) {
      setReferenceImages([]);
      setPreviewsByRef({});
      return;
    }

    const refs = taskData.referenceImages;
    setReferenceImages(refs);

    const previews = {};

    refs.forEach((ref, refIdx) => {
      const qtn = ref.qtn || 1;
      previews[refIdx] = {};
      for (let i = 0; i < qtn; i++) {
        previews[refIdx][i] = { before: null, after: null };
      }
    });

    let globalBeforeIdx = 0;
    let globalAfterIdx = 0;

    refs.forEach((ref, refIdx) => {
      const qtn = ref.qtn || 1;
      for (let qtnIdx = 0; qtnIdx < qtn; qtnIdx++) {
        if (taskData.images?.before?.[globalBeforeIdx]) {
          previews[refIdx][qtnIdx].before = {
            url: taskData.images.before[globalBeforeIdx].url,
            mediaType: taskData.images.before[globalBeforeIdx].mediaType || "image",
            existing: true,
          };
          globalBeforeIdx++;
        }
        if (taskData.images?.after?.[globalAfterIdx]) {
          previews[refIdx][qtnIdx].after = {
            url: taskData.images.after[globalAfterIdx].url,
            mediaType: taskData.images.after[globalAfterIdx].mediaType || "image",
            existing: true,
          };
          globalAfterIdx++;
        }
      }
    });

    setPreviewsByRef(previews);

    if (taskData.materials) {
      setSelectedMaterials(
        taskData.materials.map((m) => ({
          item: m.item?._id || m.item,
          name: m.name || m.item?.name,
          quantity: m.quantity,
          unit: m.unit || m.item?.unit,
          confirmed: m.confirmed || false,
        }))
      );
    }
  };

  // Generate unique key for each upload location
  const getUploadKey = (type, refIndex, qtnIndex) => {
    return `${type}-${refIndex}-${qtnIndex}`;
  };

  const handleImageUpload = async (type, refIndex, qtnIndex, file) => {
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Please select an image or video file");
      return;
    }

    // Validate file size (100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 100MB");
      return;
    }

    const uploadKey = getUploadKey(type, refIndex, qtnIndex);

    try {
      // Mark this specific location as uploading
      setUploadingImages((prev) => ({ ...prev, [uploadKey]: true }));

      toast.info(`Uploading ${isVideo ? "video" : "image"}...`);

      const formData = new FormData();
      formData.append("images", file);
      formData.append("imageType", type);
      formData.append("isVisibleToClient", "true");

      await tasksAPI.uploadTaskImages(id, formData);

      toast.success(`${isVideo ? "Video" : "Image"} uploaded successfully!`);

      // Refresh task data
      const res = await tasksAPI.getTask(id);
      setTask(res.data.data);
      initializeQTNStructure(res.data.data);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload. Please try again."
      );
    } finally {
      // Remove uploading state for this specific location
      setUploadingImages((prev) => {
        const newState = { ...prev };
        delete newState[uploadKey];
        return newState;
      });
    }
  };

  const calculateProgress = () => {
    let total = 0;
    let beforeCount = 0;
    let afterCount = 0;

    referenceImages.forEach((ref, refIdx) => {
      const qtn = ref.qtn || 1;
      total += qtn;
      for (let i = 0; i < qtn; i++) {
        if (previewsByRef[refIdx]?.[i]?.before) beforeCount++;
        if (previewsByRef[refIdx]?.[i]?.after) afterCount++;
      }
    });

    return { total, beforeCount, afterCount };
  };

  const {
    total: totalLocations,
    beforeCount,
    afterCount,
  } = calculateProgress();
  const allPhotosComplete =
    beforeCount === totalLocations && afterCount === totalLocations;

  // Check if any upload is in progress
  const hasAnyUploading = Object.keys(uploadingImages).length > 0;

  // Materials Handlers
  const handleAddMaterial = (item) => {
    if (selectedMaterials.find((m) => m.item === item._id)) {
      toast.warning("Material already added");
      return;
    }
    setSelectedMaterials([
      ...selectedMaterials,
      {
        item: item._id,
        name: item.name,
        quantity: 1,
        unit: item.unit,
        confirmed: false,
      },
    ]);
    setShowAddMaterial(false);
    toast.success(`${item.name} added`);
  };

  const handleUpdateMaterialQuantity = (index, change) => {
    const updated = [...selectedMaterials];
    updated[index].quantity = Math.max(1, updated[index].quantity + change);
    setSelectedMaterials(updated);
  };

  const handleRemoveMaterial = (index) => {
    const materialName = selectedMaterials[index].name;
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
    toast.success(`${materialName} removed`);
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
      const res = await tasksAPI.getTask(id);
      setTask(res.data.data);
      initializeQTNStructure(res.data.data);
      toast.success("Materials confirmed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm materials");
    }
  };

  const materialsConfirmed = selectedMaterials.every((m) => m.confirmed);

  // Task Actions
  const handleStartTask = async () => {
    try {
      const getLocation = () =>
        new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: Infinity,
          });
        });

      try {
        const position = await getLocation();
        await tasksAPI.startTask(id, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast.success("Task started successfully!");
        setLoading(true);
        const response = await tasksAPI.getTask(id);
        setTask(response.data.data);
        setLoading(false);
      } catch (locationError) {
        if (locationError.code === 1) {
          toast.error(
            "Location access denied. Please enable location access in your browser settings and try again.",
            { duration: 6000 }
          );
          return;
        } else if (locationError.code === 2) {
          const confirm = window.confirm(
            "Unable to get your location. Do you want to start the task without saving location?"
          );
          if (confirm) {
            await tasksAPI.startTask(id, {});
            toast.success("Task started successfully (location not saved)!");
            setLoading(true);
            const response = await tasksAPI.getTask(id);
            setTask(response.data.data);
            setLoading(false);
          }
          return;
        } else {
          toast.error("An error occurred while getting location. Please try again.");
          return;
        }
      }
    } catch (error) {
      console.error("Error starting task:", error);
      toast.error(error.response?.data?.message || "Failed to start task");
    }
  };

  const handleFinishTask = async () => {
    if (!allPhotosComplete) {
      toast.error(
        `Please upload all photos:\nBefore: ${beforeCount}/${totalLocations}\nAfter: ${afterCount}/${totalLocations}`,
        { duration: 5000 }
      );
      return;
    }

    if (!materialsConfirmed) {
      toast.warning("Please confirm all materials before finishing the task");
      return;
    }

    if (hasAnyUploading) {
      toast.info("Please wait for all images to finish uploading");
      return;
    }

    try {
      const getLocation = () =>
        new Promise((resolve, reject) => {
          if (!navigator.geolocation) reject(new Error("Not supported"));
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: Infinity,
          });
        });

      try {
        const pos = await getLocation();
        await tasksAPI.completeTask(id, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch (err) {
        if (err.code === 1) {
          toast.error("Location access denied.", { duration: 4000 });
          return;
        }
        const confirm = window.confirm("Complete without location?");
        if (!confirm) return;
        await tasksAPI.completeTask(id, {});
      }

      toast.success("Task completed successfully! 🎉", { duration: 4000 });
      setTimeout(() => navigate("/worker/tasks"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete task");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Open Media Modal
  const openMediaModal = (url, mediaType) => {
    setSelectedMedia(url);
    setSelectedMediaType(mediaType || "image");
    setShowMediaModal(true);
  };

  // Skeleton Loader Component with animated shimmer
  const SkeletonLoader = () => (
    <div className="relative w-full h-56 bg-gray-200 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Uploading...</p>
        </div>
      </div>
    </div>
  );

  if (loading) return <Loading fullScreen />;
  if (!task)
    return (
      <div className="text-center py-12 text-gray-500">Task not found</div>
    );

  return (
    <div className="space-y-6 pb-10">
      {/* Add shimmer animation to global styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Media Modal */}
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        title={selectedMediaType === "video" ? "Video Preview" : "Image Preview"}
      />

      <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
        {t("common.back")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info Card */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                  task.status
                )}`}
              >
                {t(`status.${task.status}`)}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{task.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Client:</span>{" "}
                <strong>{task.client?.name}</strong>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>{" "}
                <strong className="text-orange-600">
                  {t(`priority.${task.priority}`)}
                </strong>
              </div>
            </div>
          </Card>

          {/* Reference Guide with NEW LAYOUT */}
          {referenceImages.length > 0 && (
            <Card title="📸 Work Reference Guide">
              {/* Progress Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-10 h-10 text-indigo-600" />
                  <div>
                    <p className="text-xl font-bold text-indigo-900">
                      Total Required Locations
                    </p>
                    <p className="text-3xl font-extrabold text-indigo-700">
                      {totalLocations}
                    </p>
                    <p className="text-sm text-indigo-600">
                      Before: {beforeCount}/{totalLocations} • After:{" "}
                      {afterCount}/{totalLocations}
                    </p>
                  </div>
                  {allPhotosComplete && (
                    <CheckCircle className="w-12 h-12 text-green-600 ml-auto" />
                  )}
                </div>
              </div>

              <div className="space-y-12">
                {referenceImages.map((ref, refIdx) => {
                  const qtn = ref.qtn || 1;
                  const refMediaType = ref.mediaType || "image";
                  
                  return (
                    <div
                      key={refIdx}
                      className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl font-bold">
                            Reference #{refIdx + 1}
                          </span>
                          {qtn > 1 && (
                            <span className="bg-orange-500 px-5 py-2 rounded-full text-lg font-bold">
                              {qtn} Locations
                            </span>
                          )}
                        </div>
                        <span className="text-lg opacity-90">
                          {ref.caption || "Work Area"}
                        </span>
                      </div>

                      {/* NEW LAYOUT: Reference Left, QTN Rows Right */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 bg-gray-50">
                        {/* Reference Media - Left Column */}
                        <div className="lg:col-span-1 flex flex-col">
                          <h4 className="text-xl font-bold text-center mb-4 text-gray-800">
                            Reference {refMediaType === "video" ? "Video" : "Image"}
                          </h4>
                          
                          {refMediaType === "video" ? (
                            <div className="relative group">
                              <video
                                src={ref.url}
                                className="w-full h-60 object-cover rounded-xl shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                                onClick={() => openMediaModal(ref.url, "video")}
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none rounded-xl">
                                <Play className="w-16 h-16 text-white fill-white" />
                              </div>
                              <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                <span>VIDEO</span>
                              </div>
                            </div>
                          ) : (
                            <div className="relative group">
                              <img
                                src={ref.url}
                                alt="Reference"
                                className="w-full h-60 object-cover rounded-xl shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                                onClick={() => openMediaModal(ref.url, "image")}
                              />
                              <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                <ImageIcon className="w-4 h-4" />
                                <span>IMAGE</span>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-center mt-4 text-gray-600 font-medium">
                            Click to enlarge
                          </p>
                        </div>

                        {/* QTN Locations - Right 2 Columns */}
                        <div className="lg:col-span-2 space-y-8">
                          {Array.from({ length: qtn }, (_, locIdx) => {
                            const beforeKey = getUploadKey("before", refIdx, locIdx);
                            const afterKey = getUploadKey("after", refIdx, locIdx);
                            const isBeforeUploading = uploadingImages[beforeKey];
                            const isAfterUploading = uploadingImages[afterKey];

                            const beforeData = previewsByRef[refIdx]?.[locIdx]?.before;
                            const afterData = previewsByRef[refIdx]?.[locIdx]?.after;

                            return (
                              <div
                                key={locIdx}
                                className="bg-white rounded-xl shadow-md p-6 border border-gray-300"
                              >
                                <h4 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-3">
                                  <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
                                    Location #{locIdx + 1}
                                  </span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  {/* Before */}
                                  <div>
                                    <label className="block text-center text-md font-semibold text-gray-700 mb-3">
                                      Before Work
                                    </label>
                                    {isBeforeUploading ? (
                                      <SkeletonLoader />
                                    ) : beforeData ? (
                                      <div className="relative group">
                                        {beforeData.mediaType === "video" ? (
                                          <div className="relative">
                                            <video
                                              src={beforeData.url}
                                              className="w-full h-56 object-cover rounded-lg border-4 border-blue-400 shadow-md cursor-pointer hover:opacity-90 transition"
                                              onClick={() => openMediaModal(beforeData.url, "video")}
                                              preload="metadata"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none rounded-lg">
                                              <Play className="w-12 h-12 text-white fill-white" />
                                            </div>
                                            <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                                              VIDEO
                                            </div>
                                          </div>
                                        ) : (
                                          <img
                                            src={beforeData.url}
                                            alt="Before"
                                            className="w-full h-56 object-cover rounded-lg border-4 border-blue-400 shadow-md cursor-pointer hover:opacity-90 transition"
                                            onClick={() => openMediaModal(beforeData.url, "image")}
                                          />
                                        )}
                                        
                                        {beforeData.existing && (
                                          <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">
                                            Uploaded
                                          </div>
                                        )}
                                        
                                        {/* Delete Button */}
                                        {task.status !== "completed" && beforeData.existing && (
                                          <DeleteImageButton
                                            imageData={{
                                              cloudinaryId: task.images.before.find(
                                                (img) => img.url === beforeData.url
                                              )?.cloudinaryId,
                                              mediaType: beforeData.mediaType,
                                              _id: task.images.before.find(
                                                (img) => img.url === beforeData.url
                                              )?._id,
                                            }}
                                            entityType="task"
                                            entityId={task._id}
                                            imageType="before"
                                            onSuccess={refreshTaskData}
                                            position="top-left"
                                            size="md"
                                            showOnHover={true}
                                          />
                                        )}
                                      </div>
                                    ) : (
                                      <label className="block cursor-pointer">
                                        <input
                                          type="file"
                                          accept="image/*,video/*"
                                          className="hidden"
                                          disabled={task.status === "completed"}
                                          onChange={(e) =>
                                            handleImageUpload(
                                              "before",
                                              refIdx,
                                              locIdx,
                                              e.target.files[0]
                                            )
                                          }
                                        />
                                        <div className="h-56 border-4 border-dashed border-blue-400 rounded-lg flex flex-col items-center justify-center hover:bg-blue-50 transition">
                                          <div className="flex gap-3 mb-2">
                                            <Camera className="w-10 h-10 text-blue-500" />
                                            <Video className="w-10 h-10 text-blue-500" />
                                          </div>
                                          <span className="text-blue-600 font-medium">
                                            Upload Before
                                          </span>
                                          <span className="text-xs text-gray-500 mt-1">
                                            Image or Video
                                          </span>
                                        </div>
                                      </label>
                                    )}
                                  </div>

                                  {/* After */}
                                  <div>
                                    <label className="block text-center text-md font-semibold text-gray-700 mb-3">
                                      After Work
                                    </label>
                                    {isAfterUploading ? (
                                      <SkeletonLoader />
                                    ) : afterData ? (
                                      <div className="relative group">
                                        {afterData.mediaType === "video" ? (
                                          <div className="relative">
                                            <video
                                              src={afterData.url}
                                              className="w-full h-56 object-cover rounded-lg border-4 border-green-400 shadow-md cursor-pointer hover:opacity-90 transition"
                                              onClick={() => openMediaModal(afterData.url, "video")}
                                              preload="metadata"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none rounded-lg">
                                              <Play className="w-12 h-12 text-white fill-white" />
                                            </div>
                                            <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                                              VIDEO
                                            </div>
                                          </div>
                                        ) : (
                                          <img
                                            src={afterData.url}
                                            alt="After"
                                            className="w-full h-56 object-cover rounded-lg border-4 border-green-400 shadow-md cursor-pointer hover:opacity-90 transition"
                                            onClick={() => openMediaModal(afterData.url, "image")}
                                          />
                                        )}
                                        
                                        {afterData.existing && (
                                          <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">
                                            Uploaded
                                          </div>
                                        )}
                                        
                                        {/* Delete Button */}
                                        {task.status !== "completed" && afterData.existing && (
                                          <DeleteImageButton
                                            imageData={{
                                              cloudinaryId: task.images.after.find(
                                                (img) => img.url === afterData.url
                                              )?.cloudinaryId,
                                              mediaType: afterData.mediaType,
                                              _id: task.images.after.find(
                                                (img) => img.url === afterData.url
                                              )?._id,
                                            }}
                                            entityType="task"
                                            entityId={task._id}
                                            imageType="after"
                                            onSuccess={refreshTaskData}
                                            position="top-left"
                                            size="md"
                                            showOnHover={true}
                                          />
                                        )}
                                      </div>
                                    ) : (
                                      <label className="block cursor-pointer">
                                        <input
                                          type="file"
                                          accept="image/*,video/*"
                                          className="hidden"
                                          disabled={task.status === "completed"}
                                          onChange={(e) =>
                                            handleImageUpload(
                                              "after",
                                              refIdx,
                                              locIdx,
                                              e.target.files[0]
                                            )
                                          }
                                        />
                                        <div className="h-56 border-4 border-dashed border-green-400 rounded-lg flex flex-col items-center justify-center hover:bg-green-50 transition">
                                          <div className="flex gap-3 mb-2">
                                            <Camera className="w-10 h-10 text-green-500" />
                                            <Video className="w-10 h-10 text-green-500" />
                                          </div>
                                          <span className="text-green-600 font-medium">
                                            Upload After
                                          </span>
                                          <span className="text-xs text-gray-500 mt-1">
                                            Image or Video
                                          </span>
                                        </div>
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* Mini progress indicators */}
                                <div className="mt-4 flex justify-center gap-6 text-md">
                                  <span
                                    className={
                                      beforeData
                                        ? "text-green-600 font-bold"
                                        : "text-gray-400"
                                    }
                                  >
                                    {beforeData ? "✓" : "○"} Before
                                  </span>
                                  <span
                                    className={
                                      afterData
                                        ? "text-green-600 font-bold"
                                        : "text-gray-400"
                                    }
                                  >
                                    {afterData ? "✓" : "○"} After
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Final Progress */}
              <div className="mt-10 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 text-center">
                <p className="text-3xl font-bold text-green-800">
                  {beforeCount + afterCount} / {totalLocations * 2} Photos
                  Completed
                </p>
                {allPhotosComplete && (
                  <div className="mt-4 flex items-center justify-center gap-3 text-2xl text-green-600">
                    <CheckCircle className="w-12 h-12" />
                    <span>All photos uploaded successfully!</span>
                  </div>
                )}
                {hasAnyUploading && (
                  <div className="mt-4 flex items-center justify-center gap-3 text-lg text-blue-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Uploading images...</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Materials Card */}
          <Card title="Materials Used">
            <div className="space-y-4">
              {selectedMaterials.length === 0 ? (
                <p className="text-center text-gray-500 py-6">
                  No materials added
                </p>
              ) : (
                selectedMaterials.map((m, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold">{m.name}</p>
                      {m.confirmed && (
                        <span className="text-green-600 font-bold">
                          ✓ Confirmed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={task.status === "completed" || m.confirmed}
                        onClick={() => handleUpdateMaterialQuantity(idx, -1)}
                        className="p-2 border rounded disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg">
                        {m.quantity} {m.unit}
                      </span>
                      <button
                        disabled={task.status === "completed" || m.confirmed}
                        onClick={() => handleUpdateMaterialQuantity(idx, 1)}
                        className="p-2 border rounded disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      {task.status !== "completed" && (
                        <button
                          onClick={() => {
                            if (window.confirm("Remove this material?")) {
                              handleRemoveMaterial(idx);
                            }
                          }}
                          className="ml-auto text-red-600 hover:text-red-700"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {task.status !== "completed" && (
                <>
                  {!showAddMaterial ? (
                    <button
                      onClick={() => setShowAddMaterial(true)}
                      className="w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                    >
                      <Plus className="w-5 h-5" /> Add Material
                    </button>
                  ) : (
                    <div>
                      <select
                        onChange={(e) => {
                          const item = availableInventory.find(
                            (i) => i._id === e.target.value
                          );
                          if (item) handleAddMaterial(item);
                        }}
                        className="w-full p-3 border rounded mb-2"
                      >
                        <option value="">Select material...</option>
                        {availableInventory.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name} ({item.quantity.current} available)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowAddMaterial(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {selectedMaterials.length > 0 && !materialsConfirmed && (
                    <Button
                      onClick={handleConfirmMaterials}
                      variant="success"
                      className="w-full mt-4"
                    >
                      Confirm All Materials ({selectedMaterials.length})
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Task Action Buttons */}
          {task.status === "assigned" && (
            <Card title="Start Task">
              <Button
                variant="primary"
                className="w-full py-6 text-xl font-bold"
                onClick={handleStartTask}
              >
                <Clock className="w-6 h-6 inline mr-2" />
                Start Task
              </Button>
            </Card>
          )}

          {task.status === "in-progress" && (
            <Card title="Complete Task">
              <Button
                variant="success"
                className="w-full py-6 text-2xl font-bold"
                onClick={handleFinishTask}
                disabled={
                  hasAnyUploading || !allPhotosComplete || !materialsConfirmed
                }
              >
                {hasAnyUploading ? "Uploading..." : "Finish Task"}
              </Button>

              {!allPhotosComplete && (
                <p className="text-red-600 text-center mt-4 font-bold">
                  Complete all {totalLocations} locations first
                </p>
              )}

              {!materialsConfirmed && allPhotosComplete && (
                <p className="text-orange-600 text-center mt-4 font-bold">
                  Confirm materials before finishing
                </p>
              )}

              {hasAnyUploading && (
                <p className="text-blue-600 text-center mt-4 font-bold flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Please wait for uploads to complete
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;