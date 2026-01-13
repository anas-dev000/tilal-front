import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const WorkerTaskList = ({ tasks }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">
          {t("components.taskList.noTasksAssigned")}
        </p>
      </div>
    );
  }

  const handleTaskClick = (taskId) => {
    navigate(`/admin/tasks/${taskId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">
          {t("components.taskList.recentTasks")}
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {tasks.slice(0, 5).map((task) => (
          <div
            key={task._id}
            onClick={() => handleTaskClick(task._id)}
            className="p-6 hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t("common.site")}: {task.site?.name || t("common.notFound")}{" "}
                  • {t("common.client")}:{" "}
                  {task.client?.name || t("common.notFound")}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : task.status === "in-progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {t(`status.${task.status}`)}
              </span>
            </div>

            <div className="mt-3 text-sm text-gray-500">
              {t("components.taskList.assigned")}:{" "}
              {format(new Date(task.createdAt), "dd MMM yyyy")}
            </div>
          </div>
        ))}
      </div>

      {tasks.length > 5 && (
        <div className="px-6 py-4 text-center">
          <Link
            to={`/admin/tasks?worker=${tasks[0].assignedTo?._id}`}
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t("components.taskList.viewAllTasks")} →
          </Link>
        </div>
      )}
    </div>
  );
};

export default WorkerTaskList;
