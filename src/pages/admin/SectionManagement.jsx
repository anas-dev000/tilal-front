// frontend/src/pages/admin/SectionManagement.jsx
import { useState } from "react";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { sitesAPI } from "../../services/api";

const SectionManagement = ({ site, onUpdate }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Section Form
  const [newSection, setNewSection] = useState({
    name: "",
    description: "",
    area: "",
    notes: "",
  });

  // Reference Images
  const [referenceImages, setReferenceImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleAddSection = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", newSection.name);
      formData.append("description", newSection.description);
      formData.append("area", newSection.area || 0);
      formData.append("notes", newSection.notes);

      // Add reference images
      referenceImages.forEach((file) => {
        formData.append("referenceImages", file);
      });

      await sitesAPI.addSection(site._id, formData);

      // Reset form
      setNewSection({ name: "", description: "", area: "", notes: "" });
      setReferenceImages([]);
      setImagePreviews([]);
      setIsAddModalOpen(false);

      onUpdate();
      alert("Section added successfully!");
    } catch (error) {
      console.error("Error adding section:", error);
      alert("Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", newSection.name);
      formData.append("description", newSection.description);
      formData.append("area", newSection.area || 0);
      formData.append("notes", newSection.notes);

      // Add new reference images
      referenceImages.forEach((file) => {
        formData.append("referenceImages", file);
      });

      await sitesAPI.updateSection(site._id, selectedSection._id, formData);

      setIsEditModalOpen(false);
      setSelectedSection(null);
      setReferenceImages([]);
      setImagePreviews([]);

      onUpdate();
      alert("Section updated successfully!");
    } catch (error) {
      console.error("Error updating section:", error);
      alert("Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this section? All reference images will be deleted."
      )
    ) {
      try {
        await sitesAPI.deleteSection(site._id, sectionId);
        onUpdate();
        alert("Section deleted successfully!");
      } catch (error) {
        console.error("Error deleting section:", error);
        alert("Failed to delete section");
      }
    }
  };

  const handleDeleteReferenceImage = async (sectionId, imageId) => {
    if (window.confirm("Delete this reference image?")) {
      try {
        await sitesAPI.deleteReferenceImage(site._id, sectionId, imageId);
        onUpdate();
        alert("Image deleted successfully!");
      } catch (error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image");
      }
    }
  };

  const openEditModal = (section) => {
    setSelectedSection(section);
    setNewSection({
      name: section.name,
      description: section.description || "",
      area: section.area || "",
      notes: section.notes || "",
    });
    setReferenceImages([]);
    setImagePreviews([]);
    setIsEditModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imagePreviews.length > 20) {
      alert("Maximum 20 images allowed");
      return;
    }

    setReferenceImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      maintenance: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary-600" />
          Sections ({site.sections?.length || 0})
        </h2>
        <Button
          onClick={() => {
            setNewSection({ name: "", description: "", area: "", notes: "" });
            setReferenceImages([]);
            setImagePreviews([]);
            setIsAddModalOpen(true);
          }}
          icon={Plus}
          size="sm"
        >
          Add Section
        </Button>
      </div>

      {/* Sections List */}
      {!site.sections || site.sections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No sections added yet</p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            size="sm"
            className="mt-4"
          >
            Add First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {site.sections.map((section) => (
            <div
              key={section._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {section.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        section.status
                      )}`}
                    >
                      {section.status}
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(section)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {section.area > 0 && (
                <p className="text-sm text-gray-500 mb-3">
                  Area: {section.area} m²
                </p>
              )}

              {/* Reference Images */}
              {section.referenceImages &&
                section.referenceImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        Reference Images ({section.referenceImages.length})
                      </p>
                      <p className="text-xs text-gray-500">Hover to delete</p>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {section.referenceImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img.url}
                            alt={`Reference ${idx + 1}`}
                            className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-90"
                            onClick={() => window.open(img.url, "_blank")}
                          />
                          <button
                            onClick={() => {
                              if (
                                window.confirm("Delete this reference image?")
                              ) {
                                handleDeleteReferenceImage(
                                  section._id,
                                  img._id
                                );
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            title="Delete image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {section.notes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Notes: {section.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Section Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Section"
        size="large"
      >
        <form onSubmit={handleAddSection} className="space-y-4">
          <Input
            label="Section Name"
            value={newSection.name}
            onChange={(e) =>
              setNewSection({ ...newSection, name: e.target.value })
            }
            placeholder="e.g., Front Garden, Backyard, Pool Area"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newSection.description}
              onChange={(e) =>
                setNewSection({ ...newSection, description: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Brief description..."
            />
          </div>

          <Input
            label="Area (m²)"
            type="number"
            value={newSection.area}
            onChange={(e) =>
              setNewSection({ ...newSection, area: e.target.value })
            }
            placeholder="Optional"
            min="0"
          />

          {/* Reference Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Images (Max 20)
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="reference-images"
              />
              <label
                htmlFor="reference-images"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload images ({imagePreviews.length}/20)
                </span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Notes"
            value={newSection.notes}
            onChange={(e) =>
              setNewSection({ ...newSection, notes: e.target.value })
            }
            placeholder="Optional notes..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Section"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Section Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Section"
        size="large"
      >
        <form onSubmit={handleEditSection} className="space-y-4">
          <Input
            label="Section Name"
            value={newSection.name}
            onChange={(e) =>
              setNewSection({ ...newSection, name: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newSection.description}
              onChange={(e) =>
                setNewSection({ ...newSection, description: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <Input
            label="Area (m²)"
            type="number"
            value={newSection.area}
            onChange={(e) =>
              setNewSection({ ...newSection, area: e.target.value })
            }
            min="0"
          />

          {/* Add More Reference Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add More Reference Images
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="edit-reference-images"
              />
              <label
                htmlFor="edit-reference-images"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to add more images ({imagePreviews.length} new)
                </span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Notes"
            value={newSection.notes}
            onChange={(e) =>
              setNewSection({ ...newSection, notes: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Section"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SectionManagement;
