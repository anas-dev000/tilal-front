// frontend/src/pages/worker/MyTasks.jsx - ENHANCED VERSION
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Calendar,
  Layers,
} from "lucide-react";
import { tasksAPI } from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const MyTasks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      assigned: "bg-blue-100 text-blue-800 border-blue-300",
      "in-progress": "bg-purple-100 text-purple-800 border-purple-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      review: "bg-orange-100 text-orange-800 border-orange-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      assigned: <AlertCircle className="w-4 h-4" />,
      "in-progress": <Clock className="w-4 h-4 animate-pulse" />,
      completed: <CheckCircle className="w-4 h-4" />,
      review: <AlertCircle className="w-4 h-4" />,
      rejected: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || null;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-gray-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      urgent: "text-red-600 font-bold",
    };
    return colors[priority] || "text-gray-600";
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "active")
      return ["assigned", "in-progress"].includes(task.status);
    return task.status === filter;
  });

  // Calculate statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    assigned: tasks.filter((t) => t.status === "assigned").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    active: tasks.filter((t) => ["assigned", "in-progress"].includes(t.status))
      .length,
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("worker.myTasks")}
        </h1>
        <p className="text-gray-600">
          {stats.active} active tasks • {stats.completed} completed
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={filter === "all" ? "primary" : "secondary"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All ({stats.total})
        </Button>
        <Button
          variant={filter === "active" ? "primary" : "secondary"}
          onClick={() => setFilter("active")}
          size="sm"
        >
          Active ({stats.active})
        </Button>
        <Button
          variant={filter === "assigned" ? "primary" : "secondary"}
          onClick={() => setFilter("assigned")}
          size="sm"
        >
          Assigned ({stats.assigned})
        </Button>
        <Button
          variant={filter === "in-progress" ? "primary" : "secondary"}
          onClick={() => setFilter("in-progress")}
          size="sm"
        >
          In Progress ({stats.inProgress})
        </Button>
        <Button
          variant={filter === "completed" ? "primary" : "secondary"}
          onClick={() => setFilter("completed")}
          size="sm"
        >
          Completed ({stats.completed})
        </Button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card
            key={task._id}
            className="hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
            onClick={() => navigate(`/worker/tasks/${task._id}`)}
          >
            {/* Priority Indicator (Left Border) */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                task.priority === "urgent"
                  ? "bg-red-500"
                  : task.priority === "high"
                  ? "bg-orange-500"
                  : task.priority === "medium"
                  ? "bg-yellow-500"
                  : "bg-gray-300"
              }`}
            />

            <div className="space-y-4 pl-2">
              {/* Header with Status Badge */}
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                  {task.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 shrink-0 ${getStatusColor(
                    task.status
                  )}`}
                >
                  {getStatusIcon(task.status)}
                  <span className="whitespace-nowrap">
                    {t(`status.${task.status}`)}
                  </span>
                </span>
              </div>

              {/* Site Info with Icon */}
              {task.site && (
                <div className="flex items-start gap-2 bg-primary-50 p-2 rounded-lg border border-primary-200">
                  <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {task.site.name}
                    </p>
                    {task.section && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                        <Layers className="w-3 h-3" />
                        <span className="truncate">
                          Section: {task.section}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Review Status (if rejected or commented) */}
              {task.adminReview?.status === "rejected" &&
                task.adminReview?.comments && (
                  <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-800 mb-1">
                          Admin Rejected Task
                        </p>
                        <p className="text-xs text-red-700 line-clamp-2">
                          {task.adminReview.comments}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Regular Admin Comments (for pending review) */}
              {task.adminReview?.comments &&
                task.adminReview?.status === "pending" && (
                  <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-yellow-800 mb-1">
                          📝 Admin Note
                        </p>
                        <p className="text-xs text-yellow-700 line-clamp-2">
                          {task.adminReview.comments}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Task Metadata */}
              <div className="space-y-2 text-sm">
                {/* Due Date */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    Due: {new Date(task.scheduledDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className={`w-4 h-4 shrink-0 ${getPriorityColor(
                      task.priority
                    )}`}
                  />
                  <span
                    className={`font-semibold ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority === "urgent" && "🔥 "}
                    {t(`priority.${task.priority}`)} Priority
                  </span>
                </div>

                {/* Client Name */}
                {task.client && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-xs">Client: {task.client.name}</span>
                  </div>
                )}
              </div>

              {/* Materials Preview */}
              {task.materials && task.materials.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    📦 Materials ({task.materials.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {task.materials.slice(0, 3).map((material, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
                      >
                        {material.name}
                      </span>
                    ))}
                    {task.materials.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                        +{task.materials.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                className="w-full"
                variant={
                  task.status === "assigned"
                    ? "primary"
                    : task.status === "in-progress"
                    ? "success"
                    : "outline"
                }
                icon={Eye}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/worker/tasks/${task._id}`);
                }}
              >
                {task.status === "assigned" && "🚀 Start Task"}
                {task.status === "in-progress" && "⏳ Continue Task"}
                {task.status === "completed" && "✅ View Details"}
                {!["assigned", "in-progress", "completed"].includes(
                  task.status
                ) && "View Details"}
              </Button>

              {/* Status-specific Badges */}
              {task.status === "completed" && (
                <div className="text-center">
                  <span className="text-xs text-green-600 font-medium">
                    ✅ Task Completed
                  </span>
                </div>
              )}

              {task.status === "review" && (
                <div className="text-center">
                  <span className="text-xs text-orange-600 font-medium">
                    ⏳ Waiting for Admin Review
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {filter === "all" ? "No tasks assigned" : `No ${filter} tasks`}
          </p>
          <p className="text-gray-400 text-sm">
            {filter === "completed"
              ? "Completed tasks will appear here"
              : "New tasks will appear here when assigned"}
          </p>
        </div>
      )}

      {/* Statistics Footer */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Your Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-blue-800">Total Tasks</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {stats.inProgress}
              </p>
              <p className="text-xs text-purple-800">In Progress</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-xs text-green-800">Completed</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {stats.completed > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-orange-800">Completion Rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
