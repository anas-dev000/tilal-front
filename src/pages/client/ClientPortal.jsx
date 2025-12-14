// frontend/src/pages/client/ClientPortal.jsx - ✅ WITH MEDIA MODAL
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Star,
  Eye,
  MapPin,
  Calendar,
  CheckCircle,
  ImageIcon,
  ThumbsUp,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { tasksAPI, clientsAPI } from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import Loading from "../../components/common/Loading";
import SuccessToast from "../../components/common/SuccessToast";
import TaskDetailModal from "./modals/TaskDetailModal";
import FeedbackModal from "./modals/FeedbackModal";
import MediaModal from "../../components/common/MediaModal";
import { toast } from "sonner";

const ClientPortal = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // ✅ Media Modal States
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [selectedMediaTitle, setSelectedMediaTitle] = useState("");

  // Toast State
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const clientId = user._id || user.id;

      if (!clientId) {
        console.error("❌ No client ID found in user object:", user);
        return;
      }

      console.log("✅ Fetching tasks for client:", clientId);
      const response = await clientsAPI.getClientTasks(clientId);
      setTasks(response.data.data || []);
      console.log("✅ Tasks loaded:", response.data.data?.length || 0);
    } catch (error) {
      console.error("❌ Error fetching tasks:", error);

      if (error.response?.status === 401) {
        console.log("❌ Unauthorized - Session expired");
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate, user]);

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== "client") {
      console.log("❌ Not authenticated as client, redirecting to login");
      navigate("/login");
      return;
    }

    fetchTasks();
  }, [user, navigate, fetchTasks]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
    setShowFeedbackModal(false);
  };

  const handleOpenFeedbackModal = (task) => {
    setSelectedTask(task);
    setShowFeedbackModal(true);
    setShowDetailModal(false);
  };

  const handleSubmitFeedback = async (formData) => {
    try {
      await tasksAPI.submitFeedback(selectedTask._id, formData);

      setSuccessMessage("Feedback submitted successfully!");
      setShowSuccessToast(true);
      setShowFeedbackModal(false);
      setShowDetailModal(false);

      await fetchTasks();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback", {
        duration: 5000,
      });
    }
  };

  const handleMarkSatisfied = async (taskId) => {
    if (
      !window.confirm(
        "Are you satisfied with this work? This will mark the task as completed with 5 stars."
      )
    ) {
      return;
    }

    try {
      await tasksAPI.markSatisfied(taskId);

      setSuccessMessage("Thank you! Task marked as satisfied ✓");
      setShowSuccessToast(true);

      await fetchTasks();
    } catch (error) {
      console.error("Error marking satisfied:", error);
      toast.error("Failed to mark task as satisfied", {
        duration: 5000,
      });
    }
  };

  // ✅ Handle media click
  const handleMediaClick = (
    mediaUrl,
    mediaType = "image",
    title = "Task Media"
  ) => {
    setSelectedMedia(mediaUrl);
    setSelectedMediaType(mediaType);
    setSelectedMediaTitle(title);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-600">🌿 Garden MS</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              icon={LogOut}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter((t) => t.status === "completed").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tasks.filter((t) => t.status === "in-progress").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter((t) => t.status === "pending").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Tasks</h2>

          {tasks.length === 0 ? (
            <Card className="bg-white text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No tasks yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Your completed tasks will appear here
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => {
                const visibleAfterImages =
                  task.images?.after?.filter((img) => img.isVisibleToClient) ||
                  [];

                return (
                  <div
                    key={task._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col h-full overflow-hidden"
                  >
                    <div className="flex-1 p-6 space-y-4 min-h-0">
                      {task.feedback && (
                        <div
                          className={`border rounded-lg p-3 ${
                            task.feedback.isSatisfiedOnly
                              ? "bg-linear-to-br from-green-50 to-emerald-50 border-green-200"
                              : "bg-linear-to-br from-yellow-50 to-orange-50 border-yellow-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {task.feedback.isSatisfiedOnly ? (
                                <>
                                  <ThumbsUp className="w-5 h-5 text-green-600" />
                                  <span className="text-sm font-semibold text-green-800">
                                    You're Satisfied ✓
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                  <span className="text-sm font-semibold text-yellow-800">
                                    Your Rating
                                  </span>
                                </>
                              )}
                            </div>
                            {!task.feedback.isSatisfiedOnly && (
                              <div className="flex items-center gap-1">
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
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
                          {task.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </div>

                      {task.site && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
                          <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="truncate">{task.site.name}</span>
                        </div>
                      )}

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>
                            Scheduled:{" "}
                            {new Date(task.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                        {task.completedAt && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>
                              Completed:{" "}
                              {new Date(task.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {visibleAfterImages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ImageIcon className="w-4 h-4 shrink-0" />
                          <span>
                            {visibleAfterImages.length} media files available
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 px-6 py-4 mt-auto">
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewTask(task)}
                          icon={Eye}
                        >
                          View Details
                        </Button>

                        {task.status === "completed" &&
                          !task.feedback?.isSatisfiedOnly &&
                          !task.feedback?.rating && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleMarkSatisfied(task._id)}
                                icon={ThumbsUp}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                Satisfied
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenFeedbackModal(task)}
                                icon={Star}
                                className="flex-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                              ></Button>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        onOpenFeedback={() => {
          setShowDetailModal(false);
          setShowFeedbackModal(true);
        }}
        onImageClick={handleMediaClick}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        task={selectedTask}
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmitFeedback}
      />

      {/* ✅ Media Modal */}
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

      {/* Success Toast */}
      {showSuccessToast && (
        <SuccessToast
          message={successMessage}
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes check {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }

        .animate-check {
          stroke-dasharray: 100;
          animation: check 0.5s ease-out 0.2s forwards;
        }
      `}</style>
    </div>
  );
};

export default ClientPortal;
