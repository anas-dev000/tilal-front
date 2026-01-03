// frontend/src/pages/worker/TaskDetail.jsx - PREMIUM REDESIGN
import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Video,
  Play,
  Mic,
  ChevronLeft,
  Calendar,
  User,
  Info,
  Layers,
  Eye
} from "lucide-react";

// React Query hooks
import {
  useTask,
  useUploadTaskImages,
  useStartTask,
  useCompleteTask,
} from "../../hooks/queries/useTasks";

import DeleteImageButton from "../../components/common/DeleteImageButton";
import MediaModal from "../../components/common/MediaModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Button from "../../components/common/Button";
import { CardSkeleton } from "../../components/common/Skeleton";

const TaskDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === "rtl";

  const { data: task, isLoading: taskLoading } = useTask(id);

  const uploadImagesMutation = useUploadTaskImages();
  const startTaskMutation = useStartTask();
  const completeTaskMutation = useCompleteTask();

  const [uploadingImages, setUploadingImages] = useState({});
  const [previewsByRef, setPreviewsByRef] = useState({});
  const [referenceImages, setReferenceImages] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  // Initialize Structure
  const initializeQTNStructure = useCallback((taskData) => {
    if (!taskData?.referenceImages || taskData.referenceImages.length === 0) {
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
  }, []);

  useEffect(() => {
    if (task) initializeQTNStructure(task);
  }, [task, initializeQTNStructure]);

  // Upload Logic
  const getUploadKey = useCallback((type, refIndex, qtnIndex) => `${type}-${refIndex}-${qtnIndex}`, []);

  const handleImageUpload = useCallback(async (type, refIndex, qtnIndex, file) => {
    if (!file || !id) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error(t("worker.errors.invalidFileType"));
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error(t("worker.errors.fileTooLarge"));
      return;
    }

    const uploadKey = getUploadKey(type, refIndex, qtnIndex);

    try {
      setUploadingImages((prev) => ({ ...prev, [uploadKey]: true }));
      toast.info(t("worker.uploading"));

      const formData = new FormData();
      formData.append("images", file);
      formData.append("imageType", type);
      formData.append("isVisibleToClient", "true");

      await uploadImagesMutation.mutateAsync({ id, formData });
      toast.success(t("worker.allPhotosUploaded"));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || t("worker.error"));
    } finally {
      setUploadingImages((prev) => {
        const newState = { ...prev };
        delete newState[uploadKey];
        return newState;
      });
    }
  }, [id, getUploadKey, uploadImagesMutation, t]);

  // Progress Calculation
  const progress = useMemo(() => {
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
  }, [referenceImages, previewsByRef]);

  const allPhotosComplete = progress.beforeCount === progress.total && progress.afterCount === progress.total;
  const hasAnyUploading = Object.keys(uploadingImages).length > 0;

  // Actions
  const handleStartTask = useCallback(async () => {
    const getLocation = () => new Promise((resolve, reject) => {
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

    const startWithPosition = async (position = null) => {
      try {
        await startTaskMutation.mutateAsync({
          id,
          data: position ? { latitude: position.coords.latitude, longitude: position.coords.longitude } : {},
        });
        toast.success(t("worker.taskOpened"));
      } catch (error) {
        toast.error(error.response?.data?.message || t("common.error"));
      }
    };

    try {
      const position = await getLocation();
      await startWithPosition(position);
    } catch (locationError) {
       if (locationError.code === 1) {
        toast.error(t("worker.locationDenied"), { duration: 6000 });
      } else if (locationError.code === 2) {
        setConfirmConfig({
          isOpen: true,
          title: t("worker.locationError"),
          message: t("worker.unableToGetLocation"),
          onConfirm: () => {
            startWithPosition(null);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          }
        });
      } else {
        toast.error(t("worker.locationError"));
      }
    }
  }, [id, startTaskMutation, t]);

  const handleFinishTask = useCallback(async () => {
    if (!allPhotosComplete) {
      toast.error(t("worker.completeAllLocations", { count: progress.total }), { duration: 5000 });
      return;
    }

    if (hasAnyUploading) {
      toast.info(t("worker.waitForUploads"));
      return;
    }

    const getLocation = () => new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error("Not supported"));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: Infinity,
      });
    });

    const completeWithPosition = async (position = null) => {
      try {
        await completeTaskMutation.mutateAsync({
          id,
          data: {
            location: position ? { latitude: position.coords.latitude, longitude: position.coords.longitude } : {},
          },
        });
        toast.success(t("common.success"));
        setTimeout(() => navigate("/worker/tasks"), 1000);
      } catch (error) {
        toast.error(error.response?.data?.message || t("common.error"));
      }
    };

    try {
      const position = await getLocation();
      await completeWithPosition(position);
    } catch (err) {
      setConfirmConfig({
        isOpen: true,
        title: t("worker.locationError"),
        message: t("worker.unableToGetLocation"),
        onConfirm: () => {
          completeWithPosition(null);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  }, [id, allPhotosComplete, progress.total, hasAnyUploading, completeTaskMutation, navigate, t]);


  // Helper Components
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      assigned: "bg-blue-100 text-blue-800 border-blue-200",
      "in-progress": "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
    };
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      assigned: <AlertCircle className="w-3 h-3" />,
      "in-progress": <Loader2 className="w-3 h-3 animate-spin" />,
      completed: <CheckCircle className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.pending}`}>
        {icons[status]}
        {t(`status.${status}`)}
      </span>
    );
  };

  const SkeletonLoader = () => (
    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    </div>
  );

  if (taskLoading) {
    return (
       <div className="max-w-5xl mx-auto p-4 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
       </div>
    );
  }

  if (!task) return <div className="text-center py-20 text-gray-500">{t("tasks.taskNotFound")}</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 p-2 sm:p-4 md:p-6 space-y-6 animate-fade-in">
       {/* Global Style for shimmer */}
       <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Media Modal */}
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        title={selectedMediaType === "video" ? t("worker.mediaModal.videoTitle") : t("worker.mediaModal.imageTitle")}
      />

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={t("common.confirm")}
      />

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium mb-2"
        >
          <ChevronLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          {t("common.back")}
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 relative z-10">
                <div>
                   <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">{task.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{task.client?.name}</span>
                        </div>
                        <span className="hidden sm:inline text-gray-300">|</span>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                        </div>
                         {task.site && (
                             <>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{task.site.name}</span>
                                </div>
                             </>
                         )}
                    </div>
                </div>
                <StatusBadge status={task.status} />
            </div>

            {/* Description Box */}
             <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/60">
                <div className="flex gap-2">
                    <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                        {task.description || t("tasks.noDescription")}
                    </p>
                </div>
             </div>
             
              {/* Voice Note */}
              {task.voiceRecording?.url && (
                <div className="mt-4 bg-linear-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-full shadow-xs shrink-0">
                    <Mic className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-indigo-900 mb-1">{t("worker.voiceInstructions") || "Instructions"}</p>
                    <audio
                      controls
                      src={task.voiceRecording.url}
                      className="w-full h-8"
                      preload="metadata"
                      style={{ height: '32px' }} 
                    />
                  </div>
                </div>
              )}
        </div>

        {/* Action Bar (Start/Complete) */}


        {/* Reference Locations */}
        {referenceImages.length > 0 && (
            <div className="space-y-8 mt-8">
                 <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-primary-600" />
                        {t("worker.workLocations")}
                    </h2>
                     <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                        {progress.beforeCount + progress.afterCount} / {progress.total * 2} {t("worker.photos")}
                    </span>
                 </div>

                 {referenceImages.map((ref, refIdx) => {
                     const qtn = ref.qtn || 1;
                     return (
                         <div key={refIdx} className="space-y-6">
                            {/* Reference Header */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                     {/* Media Preview */}
                                     <div 
                                        className="w-full md:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-gray-200 hover:border-primary-300 transition-colors group"
                                        onClick={() => { setSelectedMedia(ref.url); setSelectedMediaType(ref.mediaType || 'image'); setShowMediaModal(true); }}
                                     >
                                        {ref.mediaType === 'video' ? (
                                            <div className="w-full h-full flex items-center justify-center relative">
                                                <video src={ref.url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                <Play className="w-10 h-10 text-white absolute drop-shadow-md" />
                                            </div>
                                        ) : (
                                            <img src={ref.url} alt="Ref" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        )}
                                     </div>

                                     <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-2">
                                              <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-bold uppercase tracking-wider">
                                                 {t("worker.reference")} #{refIdx + 1}
                                              </span>
                                              <span className="text-gray-500 text-sm">{qtn} {t("worker.locations")}</span>
                                          </div>
                                          <p className="text-lg font-bold text-gray-900 mb-1 leading-snug">
                                              {ref.caption || t("worker.workArea")}
                                          </p>
                                          <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {t("worker.clickToEnlarge")}
                                          </p>
                                     </div>
                                </div>
                            </div>

                            {/* QTN Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {Array.from({ length: qtn }).map((_, locIdx) => {
                                    const beforeKey = getUploadKey("before", refIdx, locIdx);
                                    const afterKey = getUploadKey("after", refIdx, locIdx);
                                    const beforeData = previewsByRef[refIdx]?.[locIdx]?.before;
                                    const afterData = previewsByRef[refIdx]?.[locIdx]?.after;
                                    const isBeforeUploading = uploadingImages[beforeKey];
                                    const isAfterUploading = uploadingImages[afterKey];

                                    return (
                                        <div key={locIdx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-700">{t("worker.location")} #{locIdx + 1}</h3>
                                                {beforeData && afterData ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Before Upload */}
                                                <div className="space-y-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase block text-center">{t("worker.before")}</span>
                                                    {isBeforeUploading ? <SkeletonLoader /> : (
                                                        <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors group">
                                                            {beforeData ? (
                                                                <>
                                                                    {beforeData.mediaType === 'video' ? (
                                                                        <video src={beforeData.url} className="w-full h-full object-cover" onClick={() => {setSelectedMedia(beforeData.url); setSelectedMediaType('video'); setShowMediaModal(true)}} />
                                                                    ) : (
                                                                        <img src={beforeData.url} alt="Before" className="w-full h-full object-cover" onClick={() => {setSelectedMedia(beforeData.url); setSelectedMediaType('image'); setShowMediaModal(true)}} />
                                                                    )}
                                                                    {task.status !== "completed" && beforeData.existing && (
                                                                        <div className="absolute top-1 right-1 z-10">
                                                                             <DeleteImageButton
                                                                                imageData={{
                                                                                  cloudinaryId: task.images.before.find(img => img.url === beforeData.url)?.cloudinaryId,
                                                                                  mediaType: beforeData.mediaType,
                                                                                  _id: task.images.before.find(img => img.url === beforeData.url)?._id,
                                                                                }}
                                                                                entityType="task"
                                                                                entityId={task._id}
                                                                                imageType="before"
                                                                                onSuccess={() => {}} 
                                                                                size="sm"
                                                                             />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*,video/*" 
                                                                        className="hidden" 
                                                                        capture="environment"
                                                                        disabled={task.status === "completed"}
                                                                        onChange={(e) => handleImageUpload("before", refIdx, locIdx, e.target.files[0])}
                                                                    />
                                                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                                        <Camera className="w-5 h-5" />
                                                                    </div>
                                                                    <span className="text-xs text-center text-blue-600 font-medium px-2">{t("worker.upload")}</span>
                                                                </label>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* After Upload */}
                                                 <div className="space-y-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase block text-center">{t("worker.after")}</span>
                                                    {isAfterUploading ? <SkeletonLoader /> : (
                                                        <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors group">
                                                            {afterData ? (
                                                                <>
                                                                    {afterData.mediaType === 'video' ? (
                                                                        <video src={afterData.url} className="w-full h-full object-cover" onClick={() => {setSelectedMedia(afterData.url); setSelectedMediaType('video'); setShowMediaModal(true)}} />
                                                                    ) : (
                                                                        <img src={afterData.url} alt="After" className="w-full h-full object-cover" onClick={() => {setSelectedMedia(afterData.url); setSelectedMediaType('image'); setShowMediaModal(true)}} />
                                                                    )}
                                                                    {task.status !== "completed" && afterData.existing && (
                                                                        <div className="absolute top-1 right-1 z-10">
                                                                             <DeleteImageButton
                                                                                imageData={{
                                                                                  cloudinaryId: task.images.after.find(img => img.url === afterData.url)?.cloudinaryId,
                                                                                  mediaType: afterData.mediaType,
                                                                                  _id: task.images.after.find(img => img.url === afterData.url)?._id,
                                                                                }}
                                                                                entityType="task"
                                                                                entityId={task._id}
                                                                                imageType="after"
                                                                                onSuccess={() => {}} 
                                                                                size="sm"
                                                                             />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*,video/*" 
                                                                        className="hidden" 
                                                                        capture="environment"
                                                                        disabled={task.status === "completed"}
                                                                        onChange={(e) => handleImageUpload("after", refIdx, locIdx, e.target.files[0])}
                                                                    />
                                                                    <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                                        <Camera className="w-5 h-5" />
                                                                    </div>
                                                                    <span className="text-xs text-center text-green-600 font-medium px-2">{t("worker.upload")}</span>
                                                                </label>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                         </div>
                     );
                 })}
            </div>
        )}

        {/* Action Bar (Start/Complete) - Moved to bottom */}
        {!['completed', 'cancelled'].includes(task.status) && (
            <div className="mt-8 flex justify-center w-full pb-8">
                 <div className="w-full">
                    {task.status === "pending" || task.status === "assigned" ? (
                        <Button 
                            className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-200 rounded-xl"
                            onClick={handleStartTask}
                        >
                            <Play className="w-5 h-5 mr-2 fill-current" /> {t("worker.startTask")}
                        </Button>
                    ) : (
                        <Button 
                          className="w-full h-14 text-lg font-bold shadow-lg shadow-green-200 rounded-xl"
                          variant="success"
                          onClick={handleFinishTask}
                          disabled={!allPhotosComplete || hasAnyUploading}
                        >
                            <CheckCircle className="w-5 h-5 mr-2" /> {t("worker.finishTask")}
                        </Button>
                    )}
                 </div>
            </div>
        )}
    </div>
  );
};

export default TaskDetail;
