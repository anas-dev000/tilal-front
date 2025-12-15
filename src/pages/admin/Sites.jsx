// src/pages/admin/Sites.jsx
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Layers,
  ArrowRight,
} from "lucide-react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { sitesAPI, clientsAPI } from "../../services/api";
import Button from "../../components/common/Button";
import SiteModal from "./SiteModal";
import Loading from "../../components/common/Loading";
import { toast } from "sonner";

const Sites = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // States
  const [allSites, setAllSites] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  // Fetch all data ONCE
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [sitesRes, clientsRes] = await Promise.all([
          sitesAPI.getAllSites(), // No params → get everything
          clientsAPI.getClients(), // Get all clients
        ]);

        setAllSites(sitesRes.data.data || []);
        setAllClients(clientsRes.data.data || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error(t("common.errorOccurred"), {
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Refetch data after create/update/delete
  const refetchSites = async () => {
    try {
      const response = await sitesAPI.getAllSites();
      setAllSites(response.data.data || []);
    } catch (error) {
      console.error("Error refetching sites:", error);
    }
  };

  // Client-side filtering
  const filteredSites = useMemo(() => {
    let filtered = allSites;

    // Filter by client
    if (clientFilter !== "all") {
      filtered = filtered.filter((site) => site.client?._id === clientFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (site) =>
          site.name.toLowerCase().includes(term) ||
          site.location?.address?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allSites, clientFilter, searchTerm]);

  const handleSiteClick = (site) => {
    navigate(`/admin/sites/${site._id}/sections`);
  };

  const handleEdit = (e, site) => {
    e.stopPropagation();
    setSelectedSite(site);
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm(t("admin.sites.deleteConfirmation"))) {
      try {
        await sitesAPI.deleteSite(id);
        refetchSites();
      } catch (error) {
        console.error("Error deleting site:", error);
        toast.error(t("admin.sites.failedToDelete"), {
          duration: 5000,
        });
      }
    }
  };

  const clientOptions = [
    {
      value: "all",
      label: `${t("admin.sites.allClients")} (${allSites.length})`,
    },
    ...allClients.map((client) => ({
      value: client._id,
      label: client.name,
    })),
  ];

  const handleAddNew = () => {
    setSelectedSite(null);
    setIsModalOpen(true);
  };

  const getSiteTypeColor = (type) => {
    const colors = {
      residential: "bg-blue-100 text-blue-800",
      commercial: "bg-green-100 text-green-800",
      industrial: "bg-gray-100 text-gray-800",
      public: "bg-purple-100 text-purple-800",
      agricultural: "bg-yellow-100 text-yellow-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <Loading fullScreen />;
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
            {filteredSites.length} {t("admin.sites.sitesDisplayed")} •{" "}
            {allSites.length} {t("admin.sites.total")}
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t("admin.sites.addNewSite")}
        </Button>
      </div>

      {/* Filters - Instant (No API call) */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("admin.sites.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="w-full md:w-64">
          <Select
            options={clientOptions}
            value={clientOptions.find((c) => c.value === clientFilter)}
            onChange={(selected) => setClientFilter(selected.value)}
            isSearchable
          />
        </div>
      </div>

      {/* Sites Grid */}
      {filteredSites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {t("admin.sites.noSitesFound")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
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

                <div className="absolute inset-0 group-hover:bg-opacity-40 hover:bg-black/4 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg px-4 py-2 flex items-center gap-2">
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
                    <p className="text-sm text-gray-500 truncate">
                      {site.client?.name || t("admin.sites.noClient")}
                    </p>
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
      )}

      {/* Modal */}
      <SiteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSite(null);
        }}
        site={selectedSite}
        clients={allClients}
        onSuccess={refetchSites}
      />
    </div>
  );
};

export default Sites;
