import { Eye, Star, MapPin, Calendar, CheckCircle } from "lucide-react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";

const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onOpenFeedback,
  onImageClick,
}) => {
  if (!task) return null;

  const visibleAfterImages =
    task.images?.after?.filter((img) => img.isVisibleToClient) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="xl">
      <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 -mx-6">
          <div className="max-w-full">
            {/* Feedback Banner */}
            {task.feedback && (
              <div className="bg-linear-to-r from-yellow-50 to-amber-50 border-b-4 border-amber-400 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-full shrink-0">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Your Feedback
                    </h3>
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= task.feedback.rating
                              ? "fill-amber-500 text-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-base font-semibold text-gray-700">
                        {task.feedback.rating}/5
                      </span>
                    </div>
                    {task.feedback.comment && (
                      <p className="text-sm text-gray-800 leading-relaxed wrap-break-word">
                        "{task.feedback.comment}"
                      </p>
                    )}
                    {task.feedback.imageNumber && (
                      <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-100 inline-block px-3 py-1 rounded-full">
                        Issue reported on Image #{task.feedback.imageNumber}
                      </p>
                    )}
                    {task.feedback.image && (
                      <img
                        src={task.feedback.image}
                        alt="Feedback evidence"
                        className="mt-3 w-full max-h-48 object-cover rounded-lg shadow-lg border-2 border-white"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4 min-w-0">
                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-green-600">Description</span>
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {task.description}
                  </p>
                </div>

                {/* Site & Dates */}
                <div className="space-y-3">
                  {task.site && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <h4 className="font-bold text-sm text-green-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">Site Location</span>
                      </h4>
                      <p className="font-semibold text-sm text-green-800 truncate">
                        {task.site.name}
                      </p>
                      {task.site.location?.address && (
                        <p className="text-xs text-green-700 mt-1 wrap-break-word">
                          {task.site.location.address}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 text-center">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-blue-600 uppercase font-medium">
                        Scheduled
                      </p>
                      <p className="font-bold text-sm text-blue-900">
                        {new Date(task.scheduledDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                    </div>
                    {task.completedAt && (
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                        <p className="text-xs text-emerald-600 uppercase font-medium">
                          Completed
                        </p>
                        <p className="font-bold text-sm text-emerald-900">
                          {new Date(task.completedAt).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column – After Work Photos */}
              <div className="min-w-0">
                <div className="bg-linear-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 flex-wrap">
                    <span className="text-green-600">After Work Photos</span>
                    {visibleAfterImages.length > 0 && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full shrink-0">
                        {visibleAfterImages.length} photos
                      </span>
                    )}
                  </h3>

                  {visibleAfterImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {visibleAfterImages.map((img, idx) => (
                        <div
                          key={img._id || idx}
                          className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          onClick={() => onImageClick(img.url)}
                        >
                          <img
                            src={img.url}
                            alt={`After work ${idx + 1}`}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                            <div className="p-3 text-white">
                              <Eye className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 bg-white text-gray-900 font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-100 rounded-lg">
                      <div className="bg-gray-200 border-2 border-dashed rounded-lg w-16 h-16 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">
                        No photos uploaded yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Button at Bottom */}
        {!task.feedback && task.status === "completed" && (
          <div className="shrink-0 mt-4 pt-4 border-t-2 border-gray-200 bg-gray-50 -mx-6 px-6 pb-2">
            <Button
              variant="success"
              size="lg"
              onClick={onOpenFeedback}
              icon={Star}
              className="w-full text-base font-semibold py-3 shadow-lg hover:shadow-xl transition-all"
            >
              Submit Your Feedback
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
