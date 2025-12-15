// frontend/src/pages/admin/SiteSectionsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Layers,
  Edit,
  Plus,
  AlertCircle,
} from "lucide-react";
import Button from "../../components/common/Button";
import SectionManagement from "./SectionManagement";
import SiteModal from "./SiteModal";
import TaskModal from "./TaskModal";
import Loading from "../../components/common/Loading";
import { sitesAPI, clientsAPI, tasksAPI } from "../../services/api";
import { toast } from "sonner";

const SiteSectionsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [rejectedTasks, setRejectedTasks] = useState([]);

  const fetchSite = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sitesAPI.getSite(id);
      setSite(response.data.data);
    } catch (error) {
      console.error("Error fetching site:", error);
      toast.error("Failed to load site details", {
        duration: 5000,
      });
      navigate("/admin/sites");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await clientsAPI.getClients();
      setClients(response.data.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }, []);

  //  جلب آخر 2 tasks rejected على الـ site
  const fetchRejectedTasks = useCallback(async () => {
    try {
      const response = await tasksAPI.getTasks({ site: id });
      const tasks = response.data.data || [];

      // فلترة الـ tasks اللي عليها rejected أو عندها comments
      const rejected = tasks
        .filter(
          (task) =>
            task.adminReview?.status === "rejected" &&
            task.adminReview?.comments
        )
        // ترتيب حسب التاريخ (الأحدث أولاً)
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        })
        // أخذ أول 2 فقط
        .slice(0, 2);

      setRejectedTasks(rejected);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchSite();
    fetchClients();
    fetchRejectedTasks();
  }, [fetchSite, fetchClients, fetchRejectedTasks]);

  const handleEditSite = () => {
    setIsEditModalOpen(true);
  };

  const handleAddTask = () => {
    setIsTaskModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
  };

  const handleSuccess = () => {
    fetchSite();
    fetchRejectedTasks();
  };

  const handleTaskSuccess = () => {
    fetchSite();
    fetchRejectedTasks();
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("admin.siteSections.siteNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={() => navigate("/admin/sites")}
        >
          {t("admin.siteSections.backToSites")}
        </Button>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleAddTask}
          className="bg-green-600 hover:bg-green-700"
        >
          {t("admin.siteSections.addTask")}
        </Button>
      </div>

      {/* Site Overview Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Cover Image */}
        <div className="h-64 bg-gray-100 relative">
          {site.coverImage?.url ? (
            <img
              src={site.coverImage.url}
              alt={site.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-100 to-primary-200">
              <MapPin className="w-24 h-24 text-primary-400" />
            </div>
          )}

          {/* Edit Site Button (Floating) */}
          <button
            onClick={handleEditSite}
            className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Site
          </button>
        </div>

        {/* Site Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {site.name}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="font-medium">Client:</span>
                {site.client?.name || "Not Found"}
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {site.siteType}
            </span>
          </div>

          {site.description && (
            <p className="text-gray-700 mb-4">{site.description}</p>
          )}

          {/* Site Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">
                {t("admin.siteSections.totalArea")}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {site.totalArea || 0}m²
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t("admin.siteSections.sections")}
              </p>
              <p className="text-xl font-bold text-primary-600 flex items-center gap-1">
                <Layers className="w-5 h-5" />
                {site.sections?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t("admin.siteSections.totalTasks")}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {site.totalTasks || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t("admin.siteSections.completedStatus")}
              </p>
              <p className="text-xl font-bold text-green-600">
                {site.completedTasks || 0}
              </p>
            </div>
          </div>

          {/*  Admin Review Comments Section - فوق Location */}
          {rejectedTasks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-red-900 mb-1">
                      {t("admin.siteSections.rejectedTasks")}
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                      {t("admin.siteSections.lastRejected", {
                        count: rejectedTasks.length,
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {rejectedTasks.map((task) => (
                    <div
                      key={task._id}
                      className="bg-white rounded-md p-3 border border-red-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">
                            {task.title}
                          </p>
                          <p className="text-sm text-red-600">
                            {task.adminReview.comments}
                          </p>
                          {task.sections && task.sections.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {task.sections.length} section
                              {task.sections.length > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/admin/tasks/${task._id}`)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                        >
                          {t("admin.siteSections.viewTask")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Location Info */}
          {site.location &&
            (site.location.address || site.location.googleMapsLink) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    {site.location.address && (
                      <p className="text-gray-700 mb-1">
                        {site.location.address}
                      </p>
                    )}
                    {site.location.city && (
                      <p className="text-sm text-gray-600">
                        {site.location.city}
                      </p>
                    )}
                    {site.location.googleMapsLink && (
                      <a
                        href={site.location.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 underline mt-2 inline-block"
                      >
                        📍 View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Section Management Component */}
      <SectionManagement site={site} onUpdate={fetchSite} />

      {/* Edit Site Modal */}
      <SiteModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        site={site}
        clients={clients}
        onSuccess={handleSuccess}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleTaskModalClose}
        task={null}
        onSuccess={handleTaskSuccess}
        preFillSite={site}
      />
    </div>
  );
};

export default SiteSectionsPage;
