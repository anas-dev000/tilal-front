// frontend/src/pages/admin/AdminTaskDetail.jsx - REFACTORED WITH REACT QUERY
import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Navigation,
  Star,
  MessageSquare,
  ThumbsUp,
  Play,
} from "lucide-react";

// React Query hooks
import { useTask, useUpdateTask } from "../../hooks/queries/useTasks";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import MediaModal from "../../components/common/MediaModal";
import { toast } from "sonner";

const AdminTaskDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const updateTaskMutation = useUpdateTask();

  const {
    data: task,
    isLoading,
    isError,
  } = useTask(id);

  // Local form state for review
  const [reviewStatus, setReviewStatus] = useState("pending");
  const [reviewComments, setReviewComments] = useState("");

  // Media modal state
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [selectedMediaTitle, setSelectedMediaTitle] = useState("");

  // Sync review state when task loads/changes
  useMemo(() => {
    if (task) {
      setReviewStatus(task.adminReview?.status || "pending");
      setReviewComments(task.adminReview?.comments || "");
    }
  }, [task]);

  // QTN-based previews (derived from task data)
  const previewsByRef = useMemo(() => {
    if (!task?.referenceImages?.length) return {};

    const initialPreviews = {};

    task.referenceImages.forEach((refImg, refIndex) => {
      const qtn = refImg.qtn || 1;
      initialPreviews[refIndex] = {};

      for (let qtnIdx = 0; qtnIdx < qtn; qtnIdx++) {
        initialPreviews[refIndex][qtnIdx] = { before: null, after: null };
      }
    });

    // Map existing before images
    if (task.images?.before) {
      let globalIndex = 0;
      task.referenceImages.forEach((refImg, refIndex) => {
        const qtn = refImg.qtn || 1;
        for (let qtnIdx = 0; qtnIdx < qtn; qtnIdx++) {
          if (task.images.before[globalIndex]) {
            initialPreviews[refIndex][qtnIdx].before = {
              url: task.images.before[globalIndex].url,
              _id: task.images.before[globalIndex]._id,
              mediaType: task.images.before[globalIndex].mediaType || "image",
              duration: task.images.before[globalIndex].duration,
            };
          }
          globalIndex++;
        }
      });
    }

    // Map existing after images
    if (task.images?.after) {
      let globalIndex = 0;
      task.referenceImages.forEach((refImg, refIndex) => {
        const qtn = refImg.qtn || 1;
        for (let qtnIdx = 0; qtnIdx < qtn; qtnIdx++) {
          if (task.images.after[globalIndex]) {
            initialPreviews[refIndex][qtnIdx].after = {
              url: task.images.after[globalIndex].url,
              _id: task.images.after[globalIndex]._id,
              mediaType: task.images.after[globalIndex].mediaType || "image",
              duration: task.images.after[globalIndex].duration,
              isVisibleToClient:
                task.images.after[globalIndex].isVisibleToClient || false,
            };
          }
          globalIndex++;
        }
      });
    }

    return initialPreviews;
  }, [task]);

  const handleSaveReview = useCallback(
    async (status) => {
      if (status === "rejected" && !reviewComments.trim()) {
        toast.error(t("admin.tasks.reviewCommentsRequired"), {
          duration: 5000,
        });
        return;
      }

      try {
        await updateTaskMutation.mutateAsync({
          id,
          data: {
            adminReview: {
              status,
              comments: reviewComments,
              reviewedAt: new Date(),
            },
          },
        });

        // toast + refetch handled inside mutation hook
      } catch (error) {
        console.error("Review save error:", error);
        // Error toast handled in hook, but keep fallback
        toast.error(t("common.errorOccurred"), { duration: 5000 });
      }
    },
    [id, reviewComments, updateTaskMutation, t]
  );

  const toggleImageVisibility = useCallback(
    async (imageId, imageType) => {
      if (!task?.images?.[imageType]) return;

      const updatedImages = task.images[imageType].map((img) =>
        img._id === imageId
          ? { ...img, isVisibleToClient: !img.isVisibleToClient }
          : img
      );

      try {
        await updateTaskMutation.mutateAsync({
          id,
          data: {
            [`images.${imageType}`]: updatedImages,
          },
        });
      } catch (error) {
        console.error("Toggle image visibility error:", error);
        toast.error(t("common.errorOccurred"), { duration: 5000 });
      }
    },
    [id, task?.images, updateTaskMutation, t]
  );

  const handleMediaClick = useCallback((media, title) => {
    setSelectedMedia(media.url);
    setSelectedMediaType(media.mediaType || "image");
    setSelectedMediaTitle(title);
  }, []);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (isError || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("admin.tasks.taskNotFound")}</p>
      </div>
    );
  }

  const referenceImages = task.referenceImages || [];

  return (
    <div className="space-y-6">
      <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
        {t("common.back")}
      </Button>

      {/* Header */}
      <Card>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {task.title}
            </h1>
            <p className="text-gray-600">{task.description}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                task.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : task.status === "in-progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {t(`status.${task.status}`)}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                reviewStatus === "approved"
                  ? "bg-green-100 text-green-800"
                  : reviewStatus === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {t("admin.tasks.review")}: {t(`status.${reviewStatus}`)}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Feedback Section */}
          {task.feedback && (
            <Card title={t("admin.tasks.clientFeedback")}>
              <div
                className={`rounded-xl p-5 border-2 ${
                  task.feedback.isSatisfiedOnly
                    ? "bg-green-50 border-green-200"
                    : task.feedback.rating >= 4
                    ? "bg-green-50 border-green-200"
                    : task.feedback.rating === 3
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {task.feedback.isSatisfiedOnly ? (
                      <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-800">
                          {t("admin.tasks.clientSatisfied")}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-700">
                          {t("admin.tasks.rating")}:
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-6 h-6 ${
                                star <= task.feedback.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-xl font-bold text-gray-800">
                          {task.feedback.rating}/5
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-gray-600">
                    {new Date(task.feedback.submittedAt).toLocaleString()}
                  </div>
                </div>

                {task.feedback.comment && (
                  <div className="bg-white/80 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {t("admin.tasks.clientComment")}:
                        </p>
                        <p className="text-gray-900 leading-relaxed">
                          "{task.feedback.comment}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {task.feedback.image && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t("admin.tasks.evidencePhoto")}:
                    </p>
                    <img
                      src={task.feedback.image}
                      alt="Feedback evidence"
                      className="w-full max-h-80 object-contain rounded-lg border-2 border-white shadow-lg cursor-pointer hover:opacity-90"
                      onClick={() => window.open(task.feedback.image, "_blank")}
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Site Info */}
          {task.site && (
            <Card title={t("admin.tasks.siteInformation")}>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {task.site.coverImage?.url ? (
                    <img
                      src={task.site.coverImage.url}
                      alt={task.site.name}
                      className="w-40 h-20 rounded object-cover shrink-0"
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
                      {t("common.type")}: {task.site.siteType}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("admin.siteSections.totalArea")}: {task.site.totalArea}{" "}
                      m²
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* GPS Tracking */}
          {(task.startLocation || task.endLocation) && (
            <Card title={t("admin.tasks.gpsTracking")}>
              <div className="space-y-4">
                {task.startLocation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">
                        {t("admin.tasks.startLocation")}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("common.time")}:{" "}
                      {new Date(task.startLocation.timestamp).toLocaleString()}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${task.startLocation.coordinates.latitude},${task.startLocation.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                    >
                      📍 {t("common.viewOnGoogleMaps")}
                    </a>
                  </div>
                )}

                {task.endLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">
                        {t("admin.tasks.endLocation")}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("common.time")}:{" "}
                      {new Date(task.endLocation.timestamp).toLocaleString()}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${task.endLocation.coordinates.latitude},${task.endLocation.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline text-sm font-medium"
                    >
                      📍 {t("common.viewOnGoogleMaps")}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* QTN-Based Work Documentation */}
          {referenceImages.length > 0 && (
            <Card title={t("admin.tasks.workDocumentation")}>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium">
                    {t("admin.tasks.totalRequiredPhotos")}:{" "}
                    {referenceImages.reduce((sum, r) => sum + (r.qtn || 1), 0)}{" "}
                    × {t("admin.tasks.beforeAfter")}
                  </p>
                </div>

                {referenceImages.map((refMedia, refIndex) => {
                  const qtn = refMedia.qtn || 1;
                  const isRefVideo = refMedia.mediaType === "video";

                  return (
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
                          {refMedia.caption ||
                            t("admin.tasks.workArea", { index: refIndex + 1 })}
                        </h4>
                        {qtn > 1 && (
                          <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {t("admin.tasks.locationsCount", { count: qtn })}
                          </span>
                        )}
                      </div>

                      {/* Reference Media */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("admin.tasks.reference")}{" "}
                          {isRefVideo ? t("common.video") : t("common.image")}
                        </label>
                        <div
                          className="relative h-48 bg-gray-100 rounded-lg border-2 border-primary-300 overflow-hidden cursor-pointer hover:opacity-90"
                          onClick={() =>
                            handleMediaClick(
                              refMedia,
                              `${t("admin.tasks.reference")} ${refIndex + 1}`
                            )
                          }
                        >
                          {isRefVideo ? (
                            <>
                              <video
                                src={refMedia.url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-12 h-12 text-white fill-white" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={refMedia.url}
                              alt={`${t("admin.tasks.reference")} ${
                                refIndex + 1
                              }`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>

                      {/* QTN-Based Upload Grid */}
                      <div className="space-y-4">
                        {Array.from({ length: qtn }).map((_, qtnIdx) => {
                          const beforeMedia =
                            previewsByRef[refIndex]?.[qtnIdx]?.before;
                          const afterMedia =
                            previewsByRef[refIndex]?.[qtnIdx]?.after;
                          const isBeforeVideo =
                            beforeMedia?.mediaType === "video";
                          const isAfterVideo =
                            afterMedia?.mediaType === "video";

                          return (
                            <div
                              key={qtnIdx}
                              className="bg-white rounded-lg p-3 border border-gray-300"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                                  {t("admin.tasks.location")} #{qtnIdx + 1}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                {/* Before */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-2">
                                    {t("admin.tasks.beforeWork")}
                                  </label>
                                  {beforeMedia ? (
                                    <div
                                      className="relative h-32 bg-gray-100 rounded-lg border-2 border-blue-300 overflow-hidden cursor-pointer hover:opacity-90"
                                      onClick={() =>
                                        handleMediaClick(
                                          beforeMedia,
                                          `${t("admin.tasks.before")} ${
                                            refIndex + 1
                                          }-${qtnIdx + 1}`
                                        )
                                      }
                                    >
                                      {isBeforeVideo ? (
                                        <>
                                          <video
                                            src={beforeMedia.url}
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <Play className="w-8 h-8 text-white fill-white" />
                                          </div>
                                        </>
                                      ) : (
                                        <img
                                          src={beforeMedia.url}
                                          alt={`${t(
                                            "admin.tasks.before"
                                          )} ${refIndex}-${qtnIdx}`}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                        {t("admin.tasks.uploaded")}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
                                      <span className="text-xs text-gray-400">
                                        {t("admin.tasks.notUploaded")}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* After */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-2">
                                    {t("admin.tasks.afterWork")}
                                  </label>
                                  {afterMedia ? (
                                    <div className="relative group">
                                      <div
                                        className="relative h-32 bg-gray-100 rounded-lg border-2 border-green-300 overflow-hidden cursor-pointer hover:opacity-90"
                                        onClick={() =>
                                          handleMediaClick(
                                            afterMedia,
                                            `${t("admin.tasks.after")} ${
                                              refIndex + 1
                                            }-${qtnIdx + 1}`
                                          )
                                        }
                                      >
                                        {isAfterVideo ? (
                                          <>
                                            <video
                                              src={afterMedia.url}
                                              className="w-full h-full object-cover"
                                              preload="metadata"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                              <Play className="w-8 h-8 text-white fill-white" />
                                            </div>
                                          </>
                                        ) : (
                                          <img
                                            src={afterMedia.url}
                                            alt={`${t(
                                              "admin.tasks.after"
                                            )} ${refIndex}-${qtnIdx}`}
                                            className="w-full h-full object-cover"
                                          />
                                        )}
                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                          {t("admin.tasks.uploaded")}
                                        </div>
                                      </div>

                                      {/* Toggle Visibility */}
                                      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={
                                              afterMedia.isVisibleToClient
                                            }
                                            onChange={() =>
                                              toggleImageVisibility(
                                                afterMedia._id,
                                                "after"
                                              )
                                            }
                                            className="w-4 h-4 text-green-600"
                                          />
                                          <span className="font-medium text-gray-700">
                                            👁️{" "}
                                            {t("admin.tasks.visibleToClient")}
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
                                      <span className="text-xs text-gray-400">
                                        {t("admin.tasks.notUploaded")}
                                      </span>
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

                {/* Overall Progress */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-800">
                      {t("admin.tasks.completion")}:{" "}
                      {Object.values(previewsByRef).reduce(
                        (sum, ref) =>
                          sum +
                          Object.values(ref).filter(
                            (qtn) => qtn.before && qtn.after
                          ).length,
                        0
                      )}
                      /
                      {referenceImages.reduce(
                        (sum, r) => sum + (r.qtn || 1),
                        0
                      )}{" "}
                      {t("admin.tasks.complete")}
                    </span>
                    {Object.values(previewsByRef).every((ref) =>
                      Object.values(ref).every((qtn) => qtn.before && qtn.after)
                    ) && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Admin Review */}
          <Card title={t("admin.tasks.adminReview")}>
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border-2 ${
                  reviewStatus === "approved"
                    ? "bg-green-50 border-green-300"
                    : reviewStatus === "rejected"
                    ? "bg-red-50 border-red-300"
                    : "bg-yellow-50 border-yellow-300"
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {t("admin.tasks.currentReviewStatus")}:
                </p>
                <p
                  className={`text-lg font-bold ${
                    reviewStatus === "approved"
                      ? "text-green-700"
                      : reviewStatus === "rejected"
                      ? "text-red-700"
                      : "text-yellow-700"
                  }`}
                >
                  {t(`status.${reviewStatus}`).toUpperCase()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.tasks.reviewComments")}
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={t("admin.tasks.reviewCommentsPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleSaveReview("approved")}
                  disabled={
                    updateTaskMutation.isPending ||
                    reviewStatus === "approved"
                  }
                  variant="success"
                  icon={CheckCircle}
                  className="w-full"
                >
                  {updateTaskMutation.isPending
                    ? t("common.saving")
                    : t("common.approve")}
                </Button>

                <Button
                  onClick={() => handleSaveReview("pending")}
                  disabled={updateTaskMutation.isPending}
                  variant="secondary"
                  className="w-full"
                >
                  {updateTaskMutation.isPending
                    ? t("common.saving")
                    : t("status.pending")}
                </Button>

                <Button
                  onClick={() => handleSaveReview("rejected")}
                  disabled={
                    updateTaskMutation.isPending ||
                    reviewStatus === "rejected"
                  }
                  variant="danger"
                  icon={XCircle}
                  className="w-full"
                >
                  {updateTaskMutation.isPending
                    ? t("common.saving")
                    : t("common.reject")}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <Card title={t("admin.tasks.taskInformation")}>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">{t("common.client")}</p>
                <p className="font-semibold">{task.client?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">{t("common.worker")}</p>
                <p className="font-semibold">
                  {task.worker?.name || t("common.unassigned")}
                </p>
              </div>
              <div>
                <p className="text-gray-500">
                  {t("admin.tasks.scheduledDate")}
                </p>
                <p className="font-semibold">
                  {new Date(task.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              {task.startedAt && (
                <div>
                  <p className="text-gray-500">{t("admin.tasks.startedAt")}</p>
                  <p className="font-semibold">
                    {new Date(task.startedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {task.completedAt && (
                <div>
                  <p className="text-gray-500">
                    {t("admin.tasks.completedAt")}
                  </p>
                  <p className="font-semibold">
                    {new Date(task.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Review History */}
          {task.adminReview?.reviewedAt && (
            <Card title={t("admin.tasks.reviewHistory")}>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">{t("admin.tasks.reviewedAt")}</p>
                  <p className="font-semibold">
                    {new Date(task.adminReview.reviewedAt).toLocaleString()}
                  </p>
                </div>
                {task.adminReview.comments && (
                  <div>
                    <p className="text-gray-500">{t("admin.tasks.comments")}</p>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1">
                      {task.adminReview.comments}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Media Modal */}
      <MediaModal
        isOpen={!!selectedMedia}
        onClose={() => {
          setSelectedMedia(null);
          setSelectedMediaType("image");
          setSelectedMediaTitle("");
        }}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        title={selectedMediaTitle}
      />
    </div>
  );
};

export default AdminTaskDetail;