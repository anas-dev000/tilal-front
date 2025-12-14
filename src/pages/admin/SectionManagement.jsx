// src/pages/admin/SectionManagement.jsx -  FIXED VIDEO DISPLAY
import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Layers,
  MapPin,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import SectionModal from "./SectionModal";
import { sitesAPI } from "../../services/api";
import { toast } from "sonner";

const SectionManagement = ({ site, onUpdate }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleAddSection = () => {
    setSelectedSection(null);
    setIsModalOpen(true);
  };

  const handleEditSection = (section) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const handleDeleteSection = async (sectionId) => {
    if (
      window.confirm(
        "Are you sure? This will delete all reference images/videos in this section."
      )
    ) {
      try {
        await sitesAPI.deleteSection(site._id, sectionId);
        onUpdate();
      } catch (error) {
        console.error("Error deleting section:", error);
        toast.error("Failed to delete section", {
          duration: 5000,
        });
      }
    }
  };

  const handleSectionClick = (sectionId) => {
    navigate(`/admin/sites/${site._id}/sections/${sectionId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      maintenance: "bg-orange-100 text-orange-800 border-orange-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getLastTaskStatusBadge = (section) => {
    if (!section.lastTaskStatus) return null;

    const statusConfig = {
      completed: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: CheckCircle,
        label: "Last: Completed",
      },
      rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: AlertCircle,
        label: "Last: Rejected",
      },
      "in-progress": {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: Clock,
        label: "Last: In Progress",
      },
    };

    const config = statusConfig[section.lastTaskStatus] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-3 h-3" />
        <span className="text-xs font-semibold">{config.label}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="w-7 h-7 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Site Sections</h2>
            <p className="text-sm text-gray-600">
              {site.sections?.length || 0} sections
            </p>
          </div>
        </div>
        <Button onClick={handleAddSection} icon={Plus}>
          Add Section
        </Button>
      </div>

      {!site.sections || site.sections.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Layers className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            No sections created yet
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Add sections to organize this site's work areas
          </p>
          <Button onClick={handleAddSection} icon={Plus} className="mt-4">
            Create First Section
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {site.sections.map((section) => {
            const totalQuantity =
              section.referenceImages?.reduce(
                (sum, img) => sum + (img.qtn || 1),
                0
              ) || 0;

            return (
              <div
                key={section._id}
                className="group bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => handleSectionClick(section._id)}
              >
                {/* Section Preview */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {section.referenceImages &&
                  section.referenceImages.length > 0 ? (
                    <div className="relative w-full h-full">
                      {/*  FIX: Check media type and render accordingly */}
                      {section.referenceImages[0].mediaType === "video" ? (
                        <>
                          <video
                            src={section.referenceImages[0].url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            preload="metadata"
                          />
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                            <div className="bg-white rounded-full p-3">
                              <Play className="w-8 h-8 text-primary-600 fill-primary-600" />
                            </div>
                          </div>

                          {/* Video Badge */}
                          <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>VIDEO</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={section.referenceImages[0].url}
                            alt={section.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }}
                          />
                          {/* Image Badge */}
                          <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>IMAGE</span>
                          </div>
                        </>
                      )}

                      {/* Media Count Badge */}
                      {section.referenceImages.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                          +{section.referenceImages.length - 1} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-r from-gray-100 to-gray-200">
                      <Layers className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-lg ${getStatusColor(
                        section.status
                      )}`}
                    >
                      {section.status}
                    </span>
                  </div>
                </div>

                {/* Section Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {section.name}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Media</p>
                      <p className="font-semibold text-sm flex items-center justify-center gap-1">
                        <ImageIcon className="w-3 h-3 text-primary-600" />
                        {section.referenceImages?.length || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-semibold text-sm text-purple-600">
                        {totalQuantity}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Area</p>
                      <p className="font-semibold text-sm">
                        {section.area || 0}m²
                      </p>
                    </div>
                  </div>

                  {/* Last Task Status */}
                  {getLastTaskStatusBadge(section)}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSection(section);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section._id);
                      }}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <SectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSection(null);
        }}
        site={site}
        section={selectedSection}
        onSuccess={onUpdate}
      />
    </div>
  );
};

export default SectionManagement;
