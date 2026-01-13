// src/pages/admin/Sites.jsx - REFACTORED WITH REACT QUERY
import { useState, useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce";

// React Query hooks
import { useSites, useDeleteSite } from "../../hooks/queries/useSites";
import { useClients } from "../../hooks/queries/useClients";

import Button from "../../components/common/Button";
import SiteModal from "../../components/admin/modals/SiteModal";
import Skeleton, { CardSkeleton } from "../../components/common/Skeleton";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from "sonner";

const Sites = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [siteIdToDelete, setSiteIdToDelete] = useState(null);
  const pageSize = 9; // Grid layout usually looks better with multiples of 3

  // Debounced Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // React Query data
  const { data: sitesData, isLoading: sitesLoading } = useSites({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    client: clientFilter === "all" ? "" : clientFilter
  });

  const allSites = sitesData?.data || [];
  const totalCount = sitesData?.total || 0;
  const totalPages = sitesData?.totalPages || 0;

  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const allClients = clientsData?.data || [];
  const deleteSiteMutation = useDeleteSite();

  // Memoized client options for react-select
  const clientOptions = useMemo(
    () => [
      {
        value: "all",
        label: `${t("admin.sites.allClients")}`,
      },
      ...allClients.map((client) => ({
        value: client._id,
        label: client.name,
      })),
    ],
    [allClients, t]
  );

  // Handlers
  const handleSiteClick = useCallback(
    (site) => {
      navigate(`/admin/sites/${site._id}/sections`);
    },
    [navigate]
  );

  const handleEdit = useCallback((e, site) => {
    e.stopPropagation();
    setSelectedSite(site);
    setIsModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedSite(null);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (e, id) => {
      e.stopPropagation();
      setSiteIdToDelete(id);
      setShowDeleteConfirm(true);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!siteIdToDelete) return;

    try {
      await deleteSiteMutation.mutateAsync(siteIdToDelete);
      setShowDeleteConfirm(false);
      setSiteIdToDelete(null);
    } catch (error) {
      console.error("Site deletion error:", error);
      toast.error(t("admin.sites.failedToDelete"), { duration: 5000 });
    }
  }, [deleteSiteMutation, siteIdToDelete, t]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setSiteIdToDelete(null);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSite(null);
  }, []);

  const getSiteTypeColor = useCallback((type) => {
    const colors = {
      residential: "bg-blue-100 text-blue-800",
      commercial: "bg-green-100 text-green-800",
      industrial: "bg-gray-100 text-gray-800",
      public: "bg-purple-100 text-purple-800",
      agricultural: "bg-yellow-100 text-yellow-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  }, []);

  // Only show full loader if sites are loading AND we have no data, OR if clients are loading initially
  if ((sitesLoading && !sitesData) || clientsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton variant="text" width="200px" height="40px" />
            <Skeleton variant="text" width="100px" />
          </div>
          <Skeleton variant="rectangle" width="120px" height="40px" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
          <Skeleton variant="rectangle" className="flex-1" height="40px" />
          <Skeleton variant="rectangle" width="256px" height="40px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-primary-600" />
            {t("admin.sites.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {totalCount} {t("admin.sites.total")}
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t("admin.sites.addNewSite")}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("admin.sites.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="w-full md:w-64">
          <Select
            options={clientOptions}
            value={clientOptions.find((c) => c.value === clientFilter)}
            onChange={(selected) => {
              setClientFilter(selected.value);
              setCurrentPage(1);
            }}
            isSearchable
          />
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSites.map((site) => (
            <div
              key={site._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group h-[500px] flex flex-col"
              onClick={() => handleSiteClick(site)}
            >
              {/* Cover Image */}
              <div className="h-48 bg-gray-100 overflow-hidden relative shrink-0">
                {site.coverImage?.url ? (
                  <img
                    src={site.coverImage.url}
                    alt={site.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-100 to-primary-200">
                    <MapPin className="w-16 h-16 text-primary-400" />
                  </div>
                )}

                <div className="absolute inset-0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white rounded-lg px-4 py-2 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-900">
                      {t("admin.sites.manageSections")}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary-600" />
                  </div>
                </div>
              </div>

              {/* Site Info */}
              <div className="p-6 space-y-3 flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-start shrink-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                      {site.name}
                    </h3>
                    <div className="flex items-center gap-2 max-w-full">
                      <p className="text-sm text-gray-500 truncate">
                        {site.client?.name || t("admin.sites.noClient")}
                      </p>
                      {site.client?._id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/clients/${site.client._id}`);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
                          title={t("admin.sites.viewClientDetails") || "View Client Details"}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 shrink-0 ${getSiteTypeColor(
                      site.siteType
                    )}`}
                  >
                    {site.siteType || "unknown"}
                  </span>
                </div>

                {site.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 shrink-0">
                    {site.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 pt-3 border-t shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {t("admin.sites.area")}
                    </p>
                    <p className="font-semibold text-sm">
                      {site.totalArea || 0}m²
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {t("admin.sites.sections")}
                    </p>
                    <p className="font-semibold text-sm flex items-center justify-center gap-1 text-primary-600">
                      <Layers className="w-3 h-3" />
                      {site.sections?.length || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {t("admin.sites.tasks")}
                    </p>
                    <p className="font-semibold text-sm">
                      {site.totalTasks || 0}
                    </p>
                  </div>
                </div>

                {site.location?.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 shrink-0">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">
                      {site.location.address}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t mt-auto shrink-0">
                  <button
                    onClick={(e) => handleEdit(e, site)}
                    className="flex-1 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {t("admin.sites.editInfo")}
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, site._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalCount={totalCount}
          limit={pageSize}
        />

      {/* Modal - onSuccess handled inside useCreateSite / useUpdateSite */}
      <SiteModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        site={selectedSite}
        clients={allClients}
        // onSuccess no longer needed → invalidation is handled in hooks
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={t("common.confirmDelete")}
        message={t("admin.sites.deleteConfirmation")}
        confirmText={t("common.delete")}
      />
    </div>
  );
};

// Optional: Memoize if parent re-renders are frequent
export default memo(Sites);