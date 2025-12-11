// frontend/src/pages/admin/SiteSectionsPage.jsx - NEW FILE
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Layers, Edit } from "lucide-react";
import { sitesAPI } from "../../services/api";
import Button from "../../components/common/Button";
import SectionManagement from "./SectionManagement";
import SiteModal from "./SiteModal";
import Loading from "../../components/common/Loading";

const SiteSectionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchSite();
    fetchClients();
  }, [id]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const response = await sitesAPI.getSite(id);
      setSite(response.data.data);
    } catch (error) {
      console.error("Error fetching site:", error);
      alert("Failed to load site details");
      navigate("/admin/sites");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { clientsAPI } = await import("../../services/api");
      const response = await clientsAPI.getClients();
      setClients(response.data.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleEditSite = () => {
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleSuccess = () => {
    fetchSite();
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Site not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={() => navigate("/admin/sites")}
        >
          Back to Sites
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
            className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit Site Info
          </button>
        </div>

        {/* Site Details */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {site.name}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="font-medium">Client:</span>
                {site.client?.name || "N/A"}
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
              <p className="text-sm text-gray-500">Total Area</p>
              <p className="text-xl font-bold text-gray-900">
                {site.totalArea || 0}m²
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sections</p>
              <p className="text-xl font-bold text-primary-600 flex items-center gap-1">
                <Layers className="w-5 h-5" />
                {site.sections?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900">
                {site.totalTasks || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-green-600">
                {site.completedTasks || 0}
              </p>
            </div>
          </div>

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
    </div>
  );
};

export default SiteSectionsPage;
