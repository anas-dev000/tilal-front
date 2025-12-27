// src/pages/admin/SectionModal.jsx - REFACTORED + FULL OPTIMISTIC UI (ADD & DELETE)
import { useEffect, useState } from "react";
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

// React Query hooks
import {
  useCreateSection,
  useUpdateSection,
  useDeleteReferenceImage,
} from "../../hooks/queries/useSites";

import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { toast } from "sonner";
import { t } from "i18next";

// Confirmation Modal Component (simple inline version)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t("common.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SectionModal = ({ isOpen, onClose, site, section }) => {
  const { t } = useTranslation();

  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteImageMutation = useDeleteReferenceImage();

  const [newMedia, setNewMedia] = useState([]); // files selected but not yet submitted
  const [previewUrls, setPreviewUrls] = useState([]); // temp preview URLs
  const [previewTypes, setPreviewTypes] = useState([]);
  const [deletingMedia, setDeletingMedia] = useState({});

  // Full local reference images state (existing + newly added optimistically)
  const [localReferenceImages, setLocalReferenceImages] = useState([]);

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [mediaIndexToDelete, setMediaIndexToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Initialize local state when modal opens / section changes
  useEffect(() => {
    if (section) {
      reset({
        name: section.name || "",
        description: section.description || "",
        area: section.area || "",
        status: section.status || "pending",
        notes: section.notes || "",
      });

      // Start with real existing images
      setLocalReferenceImages(section.referenceImages || []);
    } else {
      reset({
        name: "",
        description: "",
        area: "",
        status: "pending",
        notes: "",
      });
      setLocalReferenceImages([]);
    }

    // Reset new uploads
    setNewMedia([]);
    setPreviewUrls([]);
    setPreviewTypes([]);
    setDeletingMedia({});
  }, [section, reset]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewMedia((prev) => [...prev, ...files]);

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

  const requestDeleteExistingMedia = (media, mediaIndex) => {
    setMediaToDelete(media);
    setMediaIndexToDelete(mediaIndex);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete || mediaIndexToDelete === null) return;

    const media = mediaToDelete;
    const mediaIndex = mediaIndexToDelete;

    const key = `existing-${mediaIndex}`;
    setDeletingMedia((prev) => ({ ...prev, [key]: true }));
    setShowConfirm(false);

    try {
      await deleteImageMutation.mutateAsync({
        entityType: "section",
        entityId: site._id,
        sectionId: section._id,
        imageId: media._id,
        cloudinaryId: media.cloudinaryId,
        resourceType: media.mediaType === "video" ? "video" : "image",
        imageType: "reference",
      });

      // Instant optimistic remove
      setLocalReferenceImages((prev) =>
        prev.filter((img) => img._id !== media._id)
      );

      toast.success(t("common.successDelete"));
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("admin.sections.failedToDelete")
      );
    } finally {
      setDeletingMedia((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      setMediaToDelete(null);
      setMediaIndexToDelete(null);
    }
  };

  const onSubmit = async (data) => {
    try {
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

      let response;
      if (section) {
        response = await updateSectionMutation.mutateAsync({
          id: section._id,
          siteId: site._id,
          formData,
        });
      } else {
        response = await createSectionMutation.mutateAsync({
          siteId: site._id,
          formData,
        });
      }

      // Optimistic + real update: use server response if available
      if (response?.data?.data?.referenceImages) {
        setLocalReferenceImages(response.data.data.referenceImages);
      } else {
        // Fallback optimistic add (using previews)
        const newAdded = newMedia.map((file, idx) => ({
          _id: `optimistic-${Date.now()}-${idx}`,
          url: previewUrls[idx],
          mediaType: previewTypes[idx] === "video" ? "video" : "image",
          caption: file.name,
          qtn: 1,
          uploadedAt: new Date().toISOString(),
        }));

        setLocalReferenceImages((prev) => [...prev, ...newAdded]);
      }

      onClose();

      // Cleanup
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      reset();
      setNewMedia([]);
      setPreviewUrls([]);
      setPreviewTypes([]);
    } catch (err) {
      console.error("Section save error:", err);
      toast.error(t("common.errorOccurred"));
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

        {/* Reference Images Grid - Shows BOTH existing + newly added optimistically */}
        {localReferenceImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.sections.sectionModal.referenceImages")}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {localReferenceImages.map((media, idx) => {
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

                    <button
                      type="button"
                      onClick={() => requestDeleteExistingMedia(media, idx)}
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
            disabled={
              createSectionMutation.isPending ||
              updateSectionMutation.isPending
            }
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={
              createSectionMutation.isPending ||
              updateSectionMutation.isPending
            }
          >
            {createSectionMutation.isPending ||
            updateSectionMutation.isPending
              ? section
                ? t("admin.sections.sectionModal.updating")
                : t("admin.sections.sectionModal.creating")
              : section
              ? t("common.update")
              : t("admin.sections.addSection")}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setMediaToDelete(null);
          setMediaIndexToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t("common.confirmDelete")}
        message={t("admin.sections.sectionModal.deleteImageConfirm", {
          type:
            mediaToDelete?.mediaType === "video"
              ? t("common.video")
              : t("common.image"),
        })}
      />
    </Modal>
  );
};

export default SectionModal;