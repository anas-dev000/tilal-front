// src/pages/admin/SectionModal.jsx - WITH DELETE MEDIA SUPPORT
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  Image as ImageIcon,
  X,
  Upload,
  Play,
  Video,
  Trash2,
} from "lucide-react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { sitesAPI, deleteImageAPI } from "../../services/api";
import { toast } from "sonner";

const SectionModal = ({ isOpen, onClose, site, section, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newMedia, setNewMedia] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [previewTypes, setPreviewTypes] = useState([]);
  const [deletingMedia, setDeletingMedia] = useState({});

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
    setNewMedia([]);
    setPreviewUrls([]);
    setPreviewTypes([]);
    setDeletingMedia({});
  }, [section, reset]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewMedia((prev) => [...prev, ...files]);

      // Create preview URLs and detect types
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith("video/");

        setPreviewUrls((prev) => [...prev, url]);
        setPreviewTypes((prev) => [...prev, isVideo ? "video" : "image"]);
      });
    }
  };

  const removeNewMedia = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setNewMedia((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setPreviewTypes((prev) => prev.filter((_, i) => i !== index));
  };

  // 🗑️ DELETE EXISTING MEDIA
  const handleDeleteExistingMedia = async (media, mediaIndex) => {
    const confirmed = window.confirm(
      t("admin.sections.sectionModal.deleteImageConfirm", {
        type:
          media.mediaType === "video"
            ? t("common.video", "video")
            : t("common.image", "image"),
      })
    );
    if (!confirmed) return;

    const key = `existing-${mediaIndex}`;
    setDeletingMedia((prev) => ({ ...prev, [key]: true }));

    try {
      await deleteImageAPI.deleteImage({
        cloudinaryId: media.cloudinaryId,
        resourceType: media.mediaType === "video" ? "video" : "image",
        entityType: "section",
        entityId: site._id,
        sectionId: section._id,
        imageId: media._id,
        imageType: "reference",
      });

      toast.success(
        `${
          media.mediaType === "video"
            ? t("common.video", "Video")
            : t("common.image", "Image")
        } ${t("common.success", "deleted successfully")}`
      );
      onSuccess(); // Refresh parent data
    } catch (error) {
      console.error("Delete media error:", error);
      toast.error(
        error.response?.data?.message || t("admin.sections.failedToDelete")
      );
    } finally {
      setDeletingMedia((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
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

      // Append new media files
      newMedia.forEach((file) => {
        formData.append("referenceImages", file);
      });

      if (section) {
        await sitesAPI.updateSection(site._id, section._id, formData);
        toast.success(t("admin.sections.sectionModal.updated"));
      } else {
        await sitesAPI.addSection(site._id, formData);
        toast.success(t("admin.sections.sectionModal.created"));
      }

      onSuccess();
      onClose();

      // Cleanup
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      reset();
      setNewMedia([]);
      setPreviewUrls([]);
      setPreviewTypes([]);
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        section
          ? t("admin.sections.sectionModal.editSection")
          : t("admin.sections.sectionModal.addSection")
      }
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
          label={t("admin.sections.sectionModal.sectionName")}
          {...register("name", {
            required:
              t("admin.sections.sectionModal.sectionName") +
              " " +
              t("common.required", "is required"),
          })}
          error={errors.name?.message}
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("common.description")}
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder={t(
              "admin.sections.sectionModal.description",
              "Brief description..."
            )}
          />
        </div>

        {/* Area */}
        <Input
          label={`${t("admin.sections.sectionModal.area")} (m²)`}
          type="number"
          {...register("area")}
          placeholder={t("common.optional", "Optional")}
          min="0"
        />

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("common.status", "Status")}
          </label>
          <select
            {...register("status")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="pending">{t("status.pending")}</option>
            <option value="in-progress">{t("status.in-progress")}</option>
            <option value="completed">{t("status.completed")}</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("common.notes", "Notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder={t(
              "admin.sections.sectionModal.notes",
              "Any additional notes..."
            )}
          />
        </div>

        {/* Existing Reference Media (if editing) */}
        {section &&
          section.referenceImages &&
          section.referenceImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.sections.sectionModal.referenceImages")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {section.referenceImages.map((media, idx) => {
                  const isVideo = media.mediaType === "video";
                  const isDeletingThis = deletingMedia[`existing-${idx}`];

                  return (
                    <div key={idx} className="relative group">
                      {isVideo ? (
                        <div className="relative">
                          <video
                            src={media.url}
                            className="w-full h-20 object-cover rounded border cursor-pointer"
                            onClick={() => window.open(media.url, "_blank")}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(media.url, "_blank")}
                        />
                      )}

                      {/* Media Type Badge */}
                      <div
                        className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold text-white ${
                          isVideo ? "bg-purple-600" : "bg-blue-600"
                        }`}
                      >
                        {isVideo ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                      </div>

                      {/* 🗑️ DELETE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingMedia(media, idx)}
                        disabled={isDeletingThis}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`Delete ${isVideo ? "video" : "image"}`}
                      >
                        {isDeletingThis ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.sections.sectionModal.clickToPlay")} • Hover to delete
              </p>
            </div>
          )}

        {/* New Reference Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            {t("admin.sections.sectionModal.uploadMedia")}
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="hidden"
              id="section-media"
            />
            <label
              htmlFor="section-media"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="flex gap-3">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <Video className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                Images (PNG, JPG, WEBP) or Videos (MP4, MOV, WEBM) up to 100MB
              </span>
            </label>
          </div>

          {/* Preview New Media */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {previewUrls.map((url, idx) => {
                const isVideo = previewTypes[idx] === "video";

                return (
                  <div key={idx} className="relative group">
                    {isVideo ? (
                      <div className="relative">
                        <video
                          src={url}
                          className="w-full h-20 object-cover rounded border"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                          VIDEO
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                          IMAGE
                        </div>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => removeNewMedia(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Upload both images and videos to help
            workers identify the work areas more clearly.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? section
                ? t("admin.sections.sectionModal.updating")
                : t("admin.sections.sectionModal.creating")
              : section
              ? t("common.update")
              : t("admin.sections.addSection")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SectionModal;
