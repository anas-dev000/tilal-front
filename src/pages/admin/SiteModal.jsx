// frontend/src/pages/admin/SiteModal.jsx
import { useState, useEffect } from "react";
import { Upload, X, Plus, Image as ImageIcon, Layers } from "lucide-react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ImageUpload from "../../components/common/ImageUpload";
import { sitesAPI } from "../../services/api";
import ReactSelect from "react-select";

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

      // Required fields - must be sent even if empty (except client which is required)
      formDataToSend.append("name", formData.name.trim());

      // Client is REQUIRED - validate before sending
      if (!formData.client || formData.client === "") {
        setError("Please select a client");
        setLoading(false);
        return;
      }
      formDataToSend.append("client", formData.client);

      formDataToSend.append("siteType", formData.siteType || "residential");
      formDataToSend.append("totalArea", formData.totalArea || "0");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("notes", formData.notes || "");

      // Location fields
      formDataToSend.append(
        "location[address]",
        formData.location.address || ""
      );
      formDataToSend.append("location[city]", formData.location.city || "");
      formDataToSend.append(
        "location[googleMapsLink]",
        formData.location.googleMapsLink || ""
      );

      // Cover Image
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
    { value: "residential", label: "Individual Client" },
    { value: "commercial", label: "Company / Organization" },
    { value: "industrial", label: "Industrial Site" },
    { value: "public", label: "Public Space" },
    { value: "agricultural", label: "Agricultural Site" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={site ? "Edit Site" : "Add New Site"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image (Optional)
          </label>
          <ImageUpload
            onChange={handleCoverImageChange}
            preview={coverImagePreview}
            onRemove={handleRemoveCoverImage}
          />
        </div>

        {/* Name */}
        <Input
          label="Site Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Villa Garden"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <ReactSelect
              placeholder="Select client..."
              value={
                clients.find((c) => c._id === formData.client)
                  ? {
                      value: formData.client,
                      label: clients.find((c) => c._id === formData.client)
                        .name,
                    }
                  : null
              }
              onChange={(option) =>
                setFormData({ ...formData, client: option ? option.value : "" })
              }
              options={clients.map((client) => ({
                value: client._id,
                label: client.name,
              }))}
              isClearable
              className="flex-1"
            />
          </div>
        </div>

        {/* Site Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Type
          </label>
          <Select
            value={siteTypes.find((opt) => opt.value === formData.siteType)}
            onChange={(opt) =>
              setFormData({ ...formData, siteType: opt.value })
            }
            options={siteTypes}
          />
        </div>

        {/* Total Area */}
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
