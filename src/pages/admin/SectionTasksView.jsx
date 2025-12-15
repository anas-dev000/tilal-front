// frontend/src/pages/admin/SectionTasksView.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { tasksAPI } from "../../services/api";
import Loading from "../../components/common/Loading";

const SectionTasksView = () => {
  const { t } = useTranslation();
  const { siteId, sectionId } = useParams();
  const location = useLocation();
  const { sectionName = "Section", siteName = "Site" } = location.state || {};

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await tasksAPI.getTasks({
          site: siteId,
          section: sectionId,
        });
        setTasks(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [siteId, sectionId]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return `px-3 py-1 text-xs font-medium rounded-full ${
      styles[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to={`/admin/sites/${siteId}/sections`}
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("admin.sectionTasks.backToSections")}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("admin.sectionTasks.title", { section: sectionName })}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("admin.sectionTasks.site")}:{" "}
            <span className="font-medium">{siteName}</span>
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {t("admin.sectionTasks.noTasksFound")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {task.title}
                  </h3>
                  <span className={getStatusBadge(task.status)}>
                    {task.status.replace("-", " ").charAt(0).toUpperCase() +
                      task.status.slice(1)}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {task.description}
                  </p>
                )}

                <div className="space-y-3 text-sm text-gray-600">
                  {task.worker && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{task.worker.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(task.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  {task.completedAt && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {t("admin.sectionTasks.completedOn", {
                          date: new Date(task.completedAt).toLocaleDateString(),
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {t("admin.sectionTasks.estimatedDuration", {
                        duration: task.estimatedDuration,
                      })}
                    </span>
                  </div>
                </div>

                {(task.images.before.length > 0 ||
                  task.images.after.length > 0) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      {t("admin.sectionTasks.photos", {
                        before: task.images.before.length,
                        after: task.images.after.length,
                      })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionTasksView;
