// frontend/src/pages/admin/Tasks.jsx - REFACTORED WITH REACT QUERY
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Eye,
  Layers,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ReactSelect from "react-select";

// React Query hooks
import { useTasks } from "../../hooks/queries/useTasks";
import { useWorkers } from "../../hooks/queries/useUsers";
import { useSites } from "../../hooks/queries/useSites";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import TaskModal from "./TaskModal";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination";

const Tasks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const pageSize = 10;

  // React Query data fetching with pagination
  const { data: tasksData, isLoading } = useTasks({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    worker: selectedWorker?.value,
    site: selectedSite?.value,
    status: selectedStatus?.value,
  });

  const allTasks = tasksData?.data || [];
  const totalCount = tasksData?.total || 0;
  const totalPages = tasksData?.totalPages || 0;

  const { data: workersData } = useWorkers();
  const workers = workersData?.data || [];
  const { data: sitesData } = useSites(); 
  const sites = sitesData?.data || [];

  const handleAddNew = useCallback(() => {
    setSelectedTask(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleRowClick = useCallback((task) => {
    navigate(`/admin/tasks/${task._id}`);
  }, [navigate]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }, []);

  const statusOptions = [
    { value: "pending", label: t("status.pending") },
    { value: "assigned", label: t("status.assigned") },
    { value: "in-progress", label: t("status.in-progress") },
    { value: "completed", label: t("status.completed") },
  ];

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("admin.tasks.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {totalCount} {t("admin.tasks.found")}
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t("admin.tasks.createTask")}
        </Button>
      </div>

      {/* Filters Row */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("admin.tasks.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Worker Select */}
          <div>
            <ReactSelect
              placeholder={t("admin.tasks.filterWorker")}
              value={selectedWorker}
              onChange={(val) => {
                setSelectedWorker(val);
                setCurrentPage(1);
              }}
              options={[
                { value: "", label: t("common.all") },
                ...workers.map((w) => ({ value: w._id, label: w.name })),
              ]}
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "48px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 12px",
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
          </div>

          {/* Site Select */}
          <div>
            <ReactSelect
              placeholder={t("admin.tasks.filterSite")}
              value={selectedSite}
              onChange={(val) => {
                setSelectedSite(val);
                setCurrentPage(1);
              }}
              options={[
                { value: "", label: t("common.all") },
                ...sites.map((s) => ({ value: s._id, label: s.name })),
              ]}
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "48px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 12px",
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
          </div>

          {/* Status Select */}
          <div>
            <ReactSelect
              placeholder={t("admin.tasks.filterStatus")}
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              options={[
                { value: "", label: t("common.all") },
                ...statusOptions,
              ]}
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "48px",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 12px",
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tasks Table */}
      <Card>
        {allTasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">
              {t("admin.tasks.noTasks")}
            </p>
            <p className="text-gray-400 text-sm">
              {t("admin.tasks.adjustFilters")}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.tasks.task")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.tasks.siteSections")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.tasks.client")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.tasks.worker")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.tasks.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.tasks.review")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allTasks.map((task) => (
                    <tr
                      key={task._id}
                      onClick={() => handleRowClick(task)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 max-w-[300px]">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </div>
                        {task.adminReview.comments && (
                          <div className="text-xs text-red-600 mt-1 truncate">
                            {task.adminReview.comments}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900">
                            {task.site?.name || "N/A"}
                          </span>
                          {task.sections?.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-primary-600">
                              <Layers className="w-3 h-3" />
                              {task.sections.length} section
                              {task.sections.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {task.client?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {task.worker?.name || t("admin.tasks.unassigned")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status === "rejected" && (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {t(`status.${task.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                            task.adminReview.status
                          )}`}
                        >
                          {t(`status.${task.adminReview.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(task);
                          }}
                          className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          {t("common.view")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalCount={totalCount}
              limit={pageSize}
            />
          </>
        )}
      </Card>

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        task={selectedTask}
      />
    </div>
  );
};

export default Tasks;