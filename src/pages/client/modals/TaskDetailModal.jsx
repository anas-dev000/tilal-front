// src/pages/client/modals/TaskDetailModal.jsx - ✅ WITH VIDEO SUPPORT
import { X, Calendar, MapPin, CheckCircle, Star, Play, Video, Image as ImageIcon } from "lucide-react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";

const TaskDetailModal = ({ task, isOpen, onClose, onOpenFeedback, onImageClick }) => {
  if (!task) return null;

  const visibleAfterMedia = task.images?.after?.filter((media) => media.isVisibleToClient) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
      <div className="space-y-6">
        {/* Task Header */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                task.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {task.status}
            </span>
          </div>
          {task.description && (
            <p className="text-gray-600 mt-2">{task.description}</p>
          )}
        </div>

        {/* Site Info */}
        {task.site && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <MapPin className="w-5 h-5" />
              <h3 className="font-semibold">Site Location</h3>
            </div>
            <p className="text-gray-700">{task.site.name}</p>
          </div>
        )}

        {/* Task Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <p className="text-sm font-medium">Scheduled Date</p>
            </div>
            <p className="font-semibold text-gray-900">
              {new Date(task.scheduledDate).toLocaleDateString()}
            </p>
          </div>

          {task.completedAt && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CheckCircle className="w-4 h-4" />
                <p className="text-sm font-medium">Completed On</p>
              </div>
              <p className="font-semibold text-green-900">
                {new Date(task.completedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* ✅ After Media Gallery (Images & Videos) */}
        {visibleAfterMedia.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-600" />
              Work Completion Media ({visibleAfterMedia.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {visibleAfterMedia.map((media, idx) => {
                const isVideo = media.mediaType === 'video';
                
                return (
                  <div
                    key={idx}
                    className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border-2 border-gray-200 hover:border-primary-400"
                    onClick={() => onImageClick(media.url, media.mediaType || 'image', `Work Media ${idx + 1}`)}
                  >
                    {/* Media Container */}
                    <div className="relative aspect-video bg-gray-100">
                      {isVideo ? (
                        <>
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                            <div className="bg-white rounded-full p-3 group-hover:scale-110 transition-transform">
                              <Play className="w-8 h-8 text-primary-600 fill-primary-600" />
                            </div>
                          </div>
                          
                          {/* Video Badge */}
                          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                            <Video className="w-3 h-3" />
                            <span>VIDEO</span>
                          </div>
                          
                          {/* Duration Badge */}
                          {media.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                              {Math.round(media.duration)}s
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <img
                            src={media.url}
                            alt={`After work ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Image Badge */}
                          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                            <ImageIcon className="w-3 h-3" />
                            <span>IMAGE</span>
                          </div>
                        </>
                      )}
                      
                      {/* Click to View Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                        <div className="p-3 text-white w-full">
                          <p className="text-xs font-medium">
                            {isVideo ? 'Click to play' : 'Click to view full size'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Media Number Badge */}
                    <div className="absolute top-2 right-2 bg-white text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-gray-200">
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Message */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Click on any media to view in full size or play videos.
              </p>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {task.feedback ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              <h3 className="font-semibold text-yellow-900">Your Feedback</h3>
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= task.feedback.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {task.feedback.comment && (
              <p className="text-sm text-gray-700 italic">
                "{task.feedback.comment}"
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Submitted on{" "}
              {new Date(task.feedback.submittedAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          task.status === "completed" && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                💬 The work has been completed. Would you like to provide
                feedback?
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
                icon={Star}
              >
                Provide Feedback
              </Button>
            </div>
          )
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;