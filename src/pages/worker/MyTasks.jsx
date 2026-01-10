// frontend/src/pages/worker/MyTasks.jsx - REFACTORED WITH REACT QUERY
import { useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Eye,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Calendar,
  Layers,
} from "lucide-react";

// React Query hooks
import { useTasks, useStartTask } from "../../hooks/queries/useTasks";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import Skeleton, { CardSkeleton } from "../../components/common/Skeleton";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const MyTasks = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [startingTaskId, setStartingTaskId] = useState(null);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [taskToStartWithoutLocation, setTaskToStartWithoutLocation] = useState(null);

  // React Query hooks
  const { data: tasksData, isLoading: loading, error } = useTasks();
  const tasks = tasksData?.data || [];
  const startTaskMutation = useStartTask();

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    if (filter === "active") {
      return tasks.filter((task) =>
        ["assigned", "in-progress"].includes(task.status)
      );
    }
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  // Memoized stats
  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      assigned: tasks.filter((t) => t.status === "assigned").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      active: tasks.filter((t) =>
        ["assigned", "in-progress"].includes(t.status)
      ).length,
    }),
    [tasks]
  );

  const handleStartTask = useCallback(
    async (taskId, e) => {
      if (e) e.stopPropagation();
      setStartingTaskId(taskId);

      const getLocation = () =>
        new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error(t("worker.errors.geolocationNotSupported")));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: Infinity,
          });
        });

      const startWithoutLocation = async (id) => {
        try {
          await startTaskMutation.mutateAsync({
            id,
            data: {},
          });
          toast.error(t("worker.taskStartedNoLocation"), {
            duration: 5000,
          });
        } catch (err) {
          toast.error(t("worker.errors.failedToStart"));
        } finally {
          setStartingTaskId(null);
        }
      };

      try {
        const position = await getLocation();
        await startTaskMutation.mutateAsync({
          id: taskId,
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        toast.success(t("worker.taskOpened"), { duration: 8000 });
        setStartingTaskId(null);
      } catch (locationError) {
        if (locationError.code === 1) {
          toast.error(
            t("worker.errors.locationDenied"),
            { duration: 5000 }
          );
          setStartingTaskId(null);
        } else if (locationError.code === 2) {
          setTaskToStartWithoutLocation(taskId);
          setShowLocationConfirm(true);
        } else {
          toast.error(t("worker.errors.locationError"), { duration: 5000 });
          setStartingTaskId(null);
        }
      }
    },
    [startTaskMutation]
  );

  const confirmStartWithoutLocation = useCallback(async () => {
    if (!taskToStartWithoutLocation) return;
    
    // We need to re-define the logic or call handleStartTask differently
    // Actually, we can just call the mutation directly here
    try {
      await startTaskMutation.mutateAsync({
        id: taskToStartWithoutLocation,
        data: {},
      });
      toast.error(t("worker.taskStartedNoLocation"), {
        duration: 5000,
      });
    } catch (err) {
      toast.error(t("worker.errors.failedToStart"));
    } finally {
      setShowLocationConfirm(false);
      setTaskToStartWithoutLocation(null);
      setStartingTaskId(null);
    }
  }, [startTaskMutation, taskToStartWithoutLocation]);

  const cancelLocationConfirm = useCallback(() => {
    setShowLocationConfirm(false);
    setTaskToStartWithoutLocation(null);
    setStartingTaskId(null);
  }, []);

  // Memoized status color getter
  const getStatusColor = useCallback((status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      assigned: "bg-blue-100 text-blue-800 border-blue-300",
      "in-progress": "bg-purple-100 text-purple-800 border-purple-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      review: "bg-orange-100 text-orange-800 border-orange-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  }, []);

  const getStatusIcon = useCallback((status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      assigned: <AlertCircle className="w-4 h-4" />,
      "in-progress": <Clock className="w-4 h-4 animate-pulse" />,
      completed: <CheckCircle className="w-4 h-4" />,
      review: <AlertCircle className="w-4 h-4" />,
      rejected: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || null;
  }, []);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      low: "text-gray-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      urgent: "text-red-600 font-bold",
    };
    return colors[priority] || "text-gray-600";
  }, []);

  // Stable filter handlers
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const handleNavigateToTask = useCallback(
    (taskId) => {
      navigate(`/worker/tasks/${taskId}`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton variant="text" width="200px" height="40px" />
          <Skeleton variant="text" width="300px" />
        </div>
        <CardSkeleton />
        <div className="flex gap-2 justify-center">
          <Skeleton variant="rectangle" width="80px" height="32px" />
          <Skeleton variant="rectangle" width="80px" height="32px" />
          <Skeleton variant="rectangle" width="80px" height="32px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {error.message || t("worker.errors.failedToLoad")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("worker.myTasks")}
        </h1>
        <p className="text-gray-600">
          {t("worker.stats.activeCount", { count: stats.active })} • {t("worker.stats.completedCount", { count: stats.completed })}
        </p>
      </div>

      {tasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("worker.myStats")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-blue-800">{t("worker.stats.total")}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {stats.inProgress}
              </p>
              <p className="text-xs text-purple-800">{t("worker.stats.inProgress")}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-xs text-green-800">{t("worker.stats.completed")}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {stats.completed > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-orange-800">{t("worker.stats.completionRate")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap justify-center items-center">
        <Button
          variant={filter === "all" ? "primary" : "secondary"}
          onClick={() => handleFilterChange("all")}
          size="sm"
        >
          {t("worker.filters.all")} ({stats.total})
        </Button>
        <Button
          variant={filter === "active" ? "primary" : "secondary"}
          onClick={() => handleFilterChange("active")}
          size="sm"
        >
          {t("worker.filters.active")} ({stats.active})
        </Button>
        <Button
          variant={filter === "assigned" ? "primary" : "secondary"}
          onClick={() => handleFilterChange("assigned")}
          size="sm"
        >
          {t("worker.filters.assigned")} ({stats.assigned})
        </Button>
        <Button
          variant={filter === "in-progress" ? "primary" : "secondary"}
          onClick={() => handleFilterChange("in-progress")}
          size="sm"
        >
          {t("worker.filters.inProgress")} ({stats.inProgress})
        </Button>
        <Button
          variant={filter === "completed" ? "primary" : "secondary"}
          onClick={() => handleFilterChange("completed")}
          size="sm"
        >
          {t("worker.filters.completed")} ({stats.completed})
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card
            key={task._id}
            className="hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
            onClick={() => handleNavigateToTask(task._id)}
          >
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

              {task.site && (
                <div className="flex items-start gap-2 bg-primary-50 p-2 rounded-lg border border-primary-200">
                  <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {task.site.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    {t("worker.due")}: {new Date(task.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
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
                    {task.priority === "urgent" && "🔥 "}{" "}
                    {t(`priority.${task.priority}`)} {t("common.priority")}
                  </span>
                </div>
              </div>

              {task.status === "pending" && (
                <Button
                  className="w-full"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartTask(task._id, e);
                    handleNavigateToTask(task._id);
                  }}
                  disabled={startingTaskId === task._id}
                >
                  {startingTaskId === task._id ? t("worker.starting") : t("worker.startTask")}
                </Button>
              )}

              {task.status === "in-progress" && (
                <Button
                  className="w-full"
                  variant="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartTask(task._id, e);
                    handleNavigateToTask(task._id);
                  }}
                >
                  {t("worker.continueTask")}
                </Button>
              )}

              {task.status === "completed" && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateToTask(task._id);
                  }}
                >
                  {t("common.viewDetails")}
                </Button>
              )}

              {!["assigned", "in-progress", "completed", "pending"].includes(
                task.status
              ) && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateToTask(task._id);
                  }}
                >
                  {t("common.viewDetails")}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmationModal
        isOpen={showLocationConfirm}
        onClose={cancelLocationConfirm}
        onConfirm={confirmStartWithoutLocation}
        title={t("worker.locationUnreachable")}
        message={t("worker.startWithoutLocationMsg")}
        confirmText={t("common.confirm")}
      />

      {filteredTasks.length === 0 && <EmptyState filter={filter} />}
    </div>
  );
};

// Memoized EmptyState component
const EmptyState = memo(({ filter }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg font-medium mb-2">
        {filter === "all" ? t("worker.empty.all") : t("worker.empty.filter", { filter: t(`worker.filters.${filter}`) })}
      </p>
      <p className="text-gray-400 text-sm">
        {filter === "completed"
          ? t("worker.empty.completedDesc")
          : t("worker.empty.newDesc")}
      </p>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

export default memo(MyTasks);
