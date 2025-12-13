// src/pages/admin/SectionManagement.jsx - COMPLETE FILE
import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Layers,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sitesAPI } from "../../services/api";
import Button from "../../components/common/Button";
import SectionModal from "./SectionModal";

const SectionManagement = ({ site, onUpdate }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);

  const handleAddSection = () => {
    setSelectedSection(null);
    setIsModalOpen(true);
  };

  const handleEditSection = (e, section) => {
    e.stopPropagation();
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const handleDeleteSection = async (e, sectionId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this section? All reference images will be deleted."
      )
    ) {
      return;
    }

    try {
      setDeletingSection(sectionId);
      await sitesAPI.deleteSection(site._id, sectionId);
      onUpdate();
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    } finally {
      setDeletingSection(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  const handleSuccess = () => {
    onUpdate();
  };

  // Navigate to section detail
  const handleViewSection = (sectionId) => {
    navigate(`/admin/sites/${site._id}/sections/${sectionId}`);
  };

  // Get last task status badge
  const getLastTaskStatusBadge = (section) => {
    if (!section.lastTaskStatus) return null;

    const statusConfig = {
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
        icon: CheckCircle,
        label: "Last: Completed",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
        icon: AlertCircle,
        label: "Last: Rejected",
      },
      "in-progress": {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
        icon: Clock,
        label: "Last: In Progress",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
        icon: Clock,
        label: "Last: Pending",
      },
    };

    const config =
      statusConfig[section.lastTaskStatus] || statusConfig["pending"];
    const Icon = config.icon;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-4 h-4" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold">{config.label}</span>
          {section.lastTaskDate && (
            <span className="text-xs opacity-80">
              {new Date(section.lastTaskDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Site Sections ({site.sections?.length || 0})
          </h2>
        </div>
        <Button onClick={handleAddSection} icon={Plus}>
          Add Section
        </Button>
      </div>

      {site.sections && site.sections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {site.sections.map((section) => (
            <div
              key={section._id}
              className="border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all hover:border-primary-300 flex flex-col h-full cursor-pointer group"
              onClick={() => handleViewSection(section._id)}
            >
              {/* Section Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                    {section.name}
                  </h3>
                  {section.area > 0 && (
                    <p className="text-sm text-gray-600">
                      Area: {section.area}m²
                    </p>
                  )}
                </div>

                {/* Show Last Task Status Badge */}
                {getLastTaskStatusBadge(section)}
              </div>

              {/* Description */}
              {section.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {section.description}
                </p>
              )}

              {/* Reference Images */}
              {section.referenceImages &&
                section.referenceImages.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {section.referenceImages.length} Reference Image
                        {section.referenceImages.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {section.referenceImages.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={img.url}
                            alt={`Reference ${idx + 1}`}
                            className="w-full h-20 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(img.url, "_blank");
                            }}
                          />
                          {/* QTN Badge on Thumbnail */}
                          {img.qtn && img.qtn > 1 && (
                            <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                              x{img.qtn}
                            </div>
                          )}
                        </div>
                      ))}
                      {section.referenceImages.length > 3 && (
                        <div className="w-full h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                          +{section.referenceImages.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    section.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : section.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : section.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {section.status}
                </span>
              </div>

              {/* Notes */}
              {section.notes && (
                <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 line-clamp-2">
                      {section.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t mt-auto shrink-0">
                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSection(section._id);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                
                {/* Edit Button */}
                <button
                  onClick={(e) => handleEditSection(e, section)}
                  className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteSection(e, section._id)}
                  disabled={deletingSection === section._id}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {deletingSection === section._id ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No sections yet</p>
          <p className="text-gray-500 text-sm mb-4">
            Add sections to organize this site's tasks
          </p>
          <Button onClick={handleAddSection} icon={Plus}>
            Add First Section
          </Button>
        </div>
      )}

      {/* Section Modal */}
      <SectionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        site={site}
        section={selectedSection}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default SectionManagement;