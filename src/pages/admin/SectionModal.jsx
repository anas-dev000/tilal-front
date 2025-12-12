// frontend/src/pages/admin/SectionModal.jsx - Complete Section Modal
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { sitesAPI } from "../../services/api";

const SectionModal = ({ isOpen, onClose, site, section, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (section) {
      reset({
        name: section.name || "",
        description: section.description || "",
        area: section.area || "",
        status: section.status || "pending",
        notes: section.notes || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        area: "",
        status: "pending",
        notes: "",
      });
    }
    setNewImages([]);
    setPreviewUrls([]);
  }, [section, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewImages((prev) => [...prev, ...files]);

      // Create preview URLs
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...urls]);
    }
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("area", data.area || 0);
      formData.append("status", data.status);
      formData.append("notes", data.notes || "");

      // Append new images
      newImages.forEach((file) => {
        formData.append("referenceImages", file);
      });

      if (section) {
        await sitesAPI.updateSection(site._id, section._id, formData);
      } else {
        await sitesAPI.addSection(site._id, formData);
      }

      onSuccess();
      onClose();

      // Cleanup
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      reset();
      setNewImages([]);
      setPreviewUrls([]);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={section ? "Edit Section" : "Add Section"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Section Name */}
        <Input
          label="Section Name"
          {...register("name", { required: "Section name is required" })}
          error={errors.name?.message}
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description..."
          />
        </div>

        {/* Area */}
        <Input
          label="Area (m²)"
          type="number"
          {...register("area")}
          placeholder="Optional"
          min="0"
        />

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            {...register("status")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Any additional notes..."
          />
        </div>

        {/* Existing Reference Images (if editing) */}
        {section &&
          section.referenceImages &&
          section.referenceImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Reference Images
              </label>
              <div className="grid grid-cols-4 gap-2">
                {section.referenceImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Reference ${idx + 1}`}
                    className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(img.url, "_blank")}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click images to view full size
              </p>
            </div>
          )}

        {/* New Reference Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            Add Reference Images
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="section-images"
            />
            <label
              htmlFor="section-images"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, WEBP up to 10MB
              </span>
            </label>
          </div>

          {/* Preview New Images */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
            {loading ? "Saving..." : section ? "Update Section" : "Add Section"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SectionModal;
