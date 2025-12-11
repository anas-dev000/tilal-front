// frontend/src/pages/admin/SiteModal.jsx
import { useState, useEffect } from "react";
import { Upload, X, Plus, Image as ImageIcon, Layers } from "lucide-react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ImageUpload from "../../components/common/ImageUpload";
import { sitesAPI } from "../../services/api";

const SiteModal = ({ isOpen, onClose, site, clients, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    siteType: "residential",
    totalArea: "",
    description: "",
    location: {
      address: "",
      city: "",
      googleMapsLink: "",
    },
    notes: "",
  });

  // Cover image states
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  // Reset form when modal opens/closes or site changes
  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name || "",
        client: site.client?._id || "",
        siteType: site.siteType || "residential",
        totalArea: site.totalArea || "",
        description: site.description || "",
        location: {
          address: site.location?.address || "",
          city: site.location?.city || "",
          googleMapsLink: site.location?.googleMapsLink || "",
        },
        notes: site.notes || "",
      });
      setCoverImagePreview(site.coverImage?.url || null);
    } else {
      setFormData({
        name: "",
        client: "",
        siteType: "residential",
        totalArea: "",
        description: "",
        location: { address: "", city: "", googleMapsLink: "" },
        notes: "",
      });
      setCoverImagePreview(null);
    }
    setCoverImage(null);
    setError("");
  }, [site, isOpen]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("client", formData.client);
      formDataToSend.append("siteType", formData.siteType);
      formDataToSend.append("totalArea", formData.totalArea || 0);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location[address]", formData.location.address);
      formDataToSend.append("location[city]", formData.location.city);
      formDataToSend.append(
        "location[googleMapsLink]",
        formData.location.googleMapsLink || ""
      );
      formDataToSend.append("notes", formData.notes || "");

      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      }

      if (site) {
        await sitesAPI.updateSite(site._id, formDataToSend);
      } else {
        await sitesAPI.createSite(formDataToSend);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving site:", err);
      setError(err.response?.data?.message || "Failed to save site");
    } finally {
      setLoading(false);
    }
  };

  const siteTypes = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "industrial", label: "Industrial" },
    { value: "public", label: "Public" },
    { value: "agricultural", label: "Agricultural" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={site ? "Edit Site" : "Add New Site"}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Cover Image - Using shared ImageUpload component */}
        <ImageUpload
          label="Cover Image"
          id="cover-image-upload"
          onChange={handleCoverImageChange}
          preview={coverImagePreview}
          onRemove={handleRemoveCoverImage}
        />

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Site Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Villa Garden Project"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={formData.client}
                onChange={(e) =>
                  setFormData({ ...formData, client: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select client...</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Site Type & Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Site Type"
            value={formData.siteType}
            onChange={(e) =>
              setFormData({ ...formData, siteType: e.target.value })
            }
            options={siteTypes}
            required
          />
          <Input
            label="Total Area (m²)"
            type="number"
            value={formData.totalArea}
            onChange={(e) =>
              setFormData({ ...formData, totalArea: e.target.value })
            }
            placeholder="e.g., 500"
            min="0"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Address"
              value={formData.location.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, address: e.target.value },
                })
              }
            />
            <Input
              placeholder="City"
              value={formData.location.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, city: e.target.value },
                })
              }
            />
          </div>
          <Input
            placeholder="Google Maps Link (optional)"
            value={formData.location.googleMapsLink || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                location: {
                  ...formData.location,
                  googleMapsLink: e.target.value,
                },
              })
            }
          />
          <p className="text-xs text-gray-500">
            Paste a Google Maps link (e.g., https://maps.google.com/...)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of the site..."
            maxLength={2000}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Additional notes..."
          />
        </div>

        {/* Info Message for new sites */}
        {!site && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <Layers className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Note:</p>
              <p>
                After creating the site, you can add sections with reference
                images.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : site ? "Update Site" : "Create Site"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SiteModal;
