/* eslint-disable no-unused-vars */
// frontend/src/pages/admin/SiteSectionsPage.jsx - REFACTORED WITH REACT QUERY
import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Layers,
  Edit,
  Plus,
  AlertCircle,
} from "lucide-react";

// React Query hooks
import { useSite } from "../../hooks/queries/useSites";
import { useClients } from "../../hooks/queries/useClients";
import { useTasks } from "../../hooks/queries/useTasks";

import Button from "../../components/common/Button";
import SectionManagement from "./SectionManagement";
import SiteModal from "./SiteModal";
import TaskModal from "./TaskModal";
import Loading from "../../components/common/Loading";
import { toast } from "sonner";

const SiteSectionsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // React Query data fetching
  const { data: site, isLoading: siteLoading, isError } = useSite(id);
  const { data: clients = [] } = useClients();
  const { data: tasks = [] } = useTasks({ site: id });

  const isLoading = siteLoading;

  // Memoized rejected tasks (last 2 rejected with comments)
  const rejectedTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.adminReview?.status === "rejected" &&
          task.adminReview?.comments
      )
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      })
      .slice(0, 2);
  }, [tasks]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleEditSite = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleAddTask = useCallback(() => {
    setIsTaskModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleTaskModalClose = useCallback(() => {
    setIsTaskModalOpen(false);
  }, []);

  const handleSuccess = useCallback(() => {
    // React Query invalidation will handle refetching automatically
  }, []);

  const handleTaskSuccess = useCallback(() => {
    // React Query invalidation will handle refetching automatically
  }, []);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (isError || !site) {
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
            {t("common.edit")} {t("common.site")}
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
                <span className="font-medium">{t("common.client")}:</span>
                {site.client?.name || t("common.notFound")}
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
                {site.totalArea || 0} m²
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

          {/* Rejected Tasks Section */}
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
                      {t(
                        rejectedTasks.length === 1
                          ? "admin.siteSections.lastRejected"
                          : "admin.siteSections.lastRejectedPlural",
                        { count: rejectedTasks.length }
                      )}
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
                              {task.sections.length}{" "}
                              {task.sections.length > 1
                                ? t("admin.siteSections.sectionsPlural")
                                : t("admin.siteSections.sectionSingular")}
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
                        📍 {t("common.viewOnGoogleMaps")}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Section Management Component */}
      <SectionManagement site={site} onUpdate={() => {}} />

      {/* Edit Site Modal */}
      <SiteModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        site={site}
        clients={clients}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleTaskModalClose}
        task={null}
        preFillSite={site}
      />
    </div>
  );
};

export default SiteSectionsPage;