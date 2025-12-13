// frontend/src/pages/admin/AdminTaskDetail.jsx - ✅ WITH VIDEO SUPPORT
import { useState, useEffect, useCallback } from "react";
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
  AlertTriangle,
  Play,
  Video,
} from "lucide-react";
import { tasksAPI } from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import MediaModal from "../../components/common/MediaModal";

const AdminTaskDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [reviewStatus, setReviewStatus] = useState("pending");
  const [reviewComments, setReviewComments] = useState("");

  const [referenceImages, setReferenceImages] = useState([]);
  const [beforePreviews, setBeforePreviews] = useState([]);
  const [afterPreviews, setAfterPreviews] = useState([]);

  // ✅ Media Modal State
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState('image');
  const [selectedMediaTitle, setSelectedMediaTitle] = useState('');

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTask(id);
      const data = response.data.data;

      setTask(data);
      setReviewStatus(data.adminReview?.status || "pending");
      setReviewComments(data.adminReview?.comments || "");

      if (data.referenceImages?.length > 0) {
        setReferenceImages(data.referenceImages);

        const refCount = data.referenceImages.length;
        const loadedBefore = new Array(refCount).fill(null);
        const loadedAfter = new Array(refCount).fill(null);

        data.images?.before?.forEach((img, idx) => {
          if (idx < refCount)
            loadedBefore[idx] = { 
              url: img.url, 
              _id: img._id,
              mediaType: img.mediaType || 'image',
              duration: img.duration
            };
        });

        data.images?.after?.forEach((img, idx) => {
          if (idx < refCount)
            loadedAfter[idx] = {
              url: img.url,
              _id: img._id,
              mediaType: img.mediaType || 'image',
              duration: img.duration,
              isVisibleToClient: img.isVisibleToClient || false,
            };
        });

        setBeforePreviews(loadedBefore);
        setAfterPreviews(loadedAfter);
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      alert("Failed to load task details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleSaveReview = async (status) => {
    try {
      if (!reviewComments && status === "rejected") {
        alert("Please add comments for rejection");
        return;
      }

      setSaving(true);

      await tasksAPI.updateTask(id, {
        adminReview: {
          status: status,
          comments: reviewComments,
          reviewedAt: new Date(),
        },
      });

      setReviewStatus(status);

      alert(`Task ${status} successfully ✅`);
      fetchTask();
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const toggleImageVisibility = async (imageId, imageType) => {
    try {
      await tasksAPI.updateTask(id, {
        [`images.${imageType}`]: task.images[imageType].map((img) =>
          img._id === imageId
            ? { ...img, isVisibleToClient: !img.isVisibleToClient }
            : img
        ),
      });

      fetchTask();
    } catch (error) {
      console.error("Error toggling image visibility:", error);
      alert("Failed to update image visibility");
    }
  };

  // ✅ Handle media click
  const handleMediaClick = (media, title) => {
    setSelectedMedia(media.url);
    setSelectedMediaType(media.mediaType || 'image');
    setSelectedMediaTitle(title);
  };

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
      <Button
        variant="secondary"
        icon={ArrowLeft}
        onClick={() => navigate(-1)}
      >
        Back
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
              Review: {reviewStatus}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ CLIENT FEEDBACK SECTION */}
          {task.feedback && (
            <Card title="💬 Client Feedback">
              <div
                className={`rounded-xl p-5 border-2 border-gray-50 ${
                  task.feedback.isSatisfiedOnly
                    ? "bg-linear-to-br from-green-50 to-emerald-50 "
                    : task.feedback.rating >= 4
                    ? "bg-linear-to-br from-green-50 to-emerald-50 "
                    : task.feedback.rating === 3
                    ? "bg-linear-to-br from-yellow-50 to-amber-50 "
                    : "bg-linear-to-br from-red-50 to-rose-50 "
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {task.feedback.isSatisfiedOnly ? (
                      <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-800">
                          Client is Satisfied ✓
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-700">
                          Rating:
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
                          Client's Comment:
                        </p>
                        <p className="text-gray-900 leading-relaxed">
                          "{task.feedback.comment}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {task.feedback.imageNumber && (
                  <div className="bg-orange-100 border-l-4 border-orange-500 rounded p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-900">
                          Issue Reported on Image
                        </p>
                        <p className="text-sm text-orange-800">
                          Image #{task.feedback.imageNumber} needs attention
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {task.feedback.image && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Evidence Photo:
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

          {/* Site & Section Info */}
          {task.site && (
            <Card title="🏢 Site Information">
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
                  <div className="flex-1 flex flex-col space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {task.site.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Type: {task.site.siteType}
                    </p>
                    <p className="text-sm text-gray-600">
                      Area: {task.site.totalArea}m²
                    </p>
                  </div>
                </div>

                {task.section && referenceImages.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        Section: {task.section.name || "Specific Section"}
                      </h4>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>
                          {referenceImages.length} Reference Media Files
                        </strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* GPS Tracking Card */}
          {(task.startLocation || task.endLocation) && (
            <Card title="🌍 GPS Tracking">
              <div className="space-y-4">
                {task.startLocation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">
                        Start Location
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Time:{" "}
                      {new Date(task.startLocation.timestamp).toLocaleString()}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${task.startLocation.coordinates.latitude},${task.startLocation.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                    >
                      📍 View on Google Maps
                    </a>
                  </div>
                )}

                {task.endLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">
                        End Location
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Time:{" "}
                      {new Date(task.endLocation.timestamp).toLocaleString()}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${task.endLocation.coordinates.latitude},${task.endLocation.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline text-sm font-medium"
                    >
                      📍 View on Google Maps
                    </a>
                  </div>
                )}

                {task.startLocation && task.endLocation && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800 font-medium">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      View both locations on map:
                    </p>
                    <a
                      href={`https://www.google.com/maps/dir/${task.startLocation.coordinates.latitude},${task.startLocation.coordinates.longitude}/${task.endLocation.coordinates.latitude},${task.endLocation.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline text-sm"
                    >
                      Show Route on Google Maps →
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Reference Images/Videos with Before/After */}
          {referenceImages.length > 0 && (
            <Card title="📸 Work Documentation">
              <div className="space-y-6">
                {referenceImages.map((refMedia, refIndex) => {
                  const isRefVideo = refMedia.mediaType === 'video';
                  const beforeMedia = beforePreviews[refIndex];
                  const afterMedia = afterPreviews[refIndex];
                  const isBeforeVideo = beforeMedia?.mediaType === 'video';
                  const isAfterVideo = afterMedia?.mediaType === 'video';

                  return (
                    <div
                      key={refIndex}
                      className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                          #{refIndex + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900">
                          {refMedia.caption || `Work Area ${refIndex + 1}`}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Reference */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            📋 Reference
                          </label>
                          <div 
                            className="relative h-40 bg-gray-100 rounded-lg border-2 border-primary-300 overflow-hidden cursor-pointer hover:opacity-90"
                            onClick={() => handleMediaClick(refMedia, `Reference ${refIndex + 1}`)}
                          >
                            {isRefVideo ? (
                              <>
                                <video
                                  src={refMedia.url}
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play className="w-10 h-10 text-white fill-white" />
                                </div>
                              </>
                            ) : (
                              <img
                                src={refMedia.url}
                                alt={`Reference ${refIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>

                        {/* Before */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            📷 Before Work
                          </label>
                          {beforeMedia ? (
                            <div 
                              className="relative h-40 bg-gray-100 rounded-lg border-2 border-blue-300 overflow-hidden cursor-pointer hover:opacity-90"
                              onClick={() => handleMediaClick(beforeMedia, `Before ${refIndex + 1}`)}
                            >
                              {isBeforeVideo ? (
                                <>
                                  <video
                                    src={beforeMedia.url}
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Play className="w-10 h-10 text-white fill-white" />
                                  </div>
                                </>
                              ) : (
                                <img
                                  src={beforeMedia.url}
                                  alt={`Before ${refIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                ✅ Uploaded
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center">
                              <span className="text-xs text-gray-400">
                                Not uploaded
                              </span>
                            </div>
                          )}
                        </div>

                        {/* After */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            ✅ After Work
                          </label>
                          {afterMedia ? (
                            <div className="relative group">
                              <div 
                                className="relative h-40 bg-gray-100 rounded-lg border-2 border-green-300 overflow-hidden cursor-pointer hover:opacity-90"
                                onClick={() => handleMediaClick(afterMedia, `After ${refIndex + 1}`)}
                              >
                                {isAfterVideo ? (
                                  <>
                                    <video
                                      src={afterMedia.url}
                                      className="w-full h-full object-cover"
                                      preload="metadata"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <Play className="w-10 h-10 text-white fill-white" />
                                    </div>
                                  </>
                                ) : (
                                  <img
                                    src={afterMedia.url}
                                    alt={`After ${refIndex + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                  ✅ Uploaded
                                </div>
                              </div>

                              {/* Toggle Visibility to Client */}
                              <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={afterMedia.isVisibleToClient}
                                    onChange={() =>
                                      toggleImageVisibility(
                                        afterMedia._id,
                                        "after"
                                      )
                                    }
                                    className="w-4 h-4 text-green-600"
                                  />
                                  <span className="font-medium text-gray-700">
                                    👁️ Visible to Client
                                  </span>
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center">
                              <span className="text-xs text-gray-400">
                                Not uploaded
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-800">
                      Completion: {beforePreviews.filter((p) => p).length}/
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

          {/* Admin Review */}
          <Card title="🛡️ Admin Review & Approval">
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
                  Current Review Status:
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
                  {reviewStatus.toUpperCase()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Review Comments
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Add your review comments here..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleSaveReview("approved")}
                  disabled={saving || reviewStatus === "approved"}
                  variant="success"
                  icon={CheckCircle}
                  className="w-full"
                >
                  {saving ? "..." : "✅ Approve"}
                </Button>

                <Button
                  onClick={() => handleSaveReview("pending")}
                  disabled={saving}
                  variant="secondary"
                  className="w-full"
                >
                  {saving ? "..." : "⏳ Pending"}
                </Button>

                <Button
                  onClick={() => handleSaveReview("rejected")}
                  disabled={saving || reviewStatus === "rejected"}
                  variant="danger"
                  icon={XCircle}
                  className="w-full"
                >
                  {saving ? "..." : "❌ Reject"}
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Approving will mark task as completed.
                  Rejecting will send it back to worker.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <Card title="ℹ️ Task Information">
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Client</p>
                <p className="font-semibold">{task.client?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Worker</p>
                <p className="font-semibold">
                  {task.worker?.name || "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Scheduled Date</p>
                <p className="font-semibold">
                  {new Date(task.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              {task.startedAt && (
                <div>
                  <p className="text-gray-500">Started At</p>
                  <p className="font-semibold">
                    {new Date(task.startedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {task.completedAt && (
                <div>
                  <p className="text-gray-500">Completed At</p>
                  <p className="font-semibold">
                    {new Date(task.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Review History */}
          {task.adminReview?.reviewedAt && (
            <Card title="📋 Review History">
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Reviewed At</p>
                  <p className="font-semibold">
                    {new Date(task.adminReview.reviewedAt).toLocaleString()}
                  </p>
                </div>
                {task.adminReview.comments && (
                  <div>
                    <p className="text-gray-500">Comments</p>
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

      {/* ✅ Media Modal */}
      <MediaModal
        isOpen={!!selectedMedia}
        onClose={() => {
          setSelectedMedia(null);
          setSelectedMediaType('image');
          setSelectedMediaTitle('');
        }}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        title={selectedMediaTitle}
      />
    </div>
  );
};

export default AdminTaskDetail;