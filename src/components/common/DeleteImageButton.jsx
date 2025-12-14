// frontend/src/components/common/DeleteImageButton.jsx
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteImageAPI } from "../../services/api";
import { toast } from "sonner";

/**
 * Reusable Delete Image Button Component
 * @param {Object} props
 * @param {Object} props.imageData - Image data with cloudinaryId, mediaType, _id
 * @param {string} props.entityType - 'site' | 'section' | 'task' | 'feedback'
 * @param {string} props.entityId - Entity ID
 * @param {string} props.sectionId - Section ID (required if entityType='section')
 * @param {string} props.imageType - 'before' | 'after' | 'reference' | 'cover' | 'feedback'
 * @param {Function} props.onSuccess - Callback after successful deletion
 * @param {string} props.position - 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.showOnHover - Show button only on hover
 */
const DeleteImageButton = ({
  imageData,
  entityType,
  entityId,
  sectionId,
  imageType,
  onSuccess,
  position = "top-right",
  size = "md",
  showOnHover = true,
  confirmMessage,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events

    const message =
      confirmMessage ||
      `Are you sure you want to delete this ${
        imageData.mediaType === "video" ? "video" : "image"
      }? This action cannot be undone.`;

    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteImageAPI.deleteImage({
        cloudinaryId: imageData.cloudinaryId,
        resourceType: imageData.mediaType === "video" ? "video" : "image",
        entityType,
        entityId,
        sectionId,
        imageId: imageData._id,
        imageType,
      });

      toast.success(
        `${
          imageData.mediaType === "video" ? "Video" : "Image"
        } deleted successfully`
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Delete image error:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${
            imageData.mediaType === "video" ? "video" : "image"
          }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Position classes
  const positionClasses = {
    "top-right": "top-2 right-2",
    "top-left": "top-2 left-2",
    "bottom-right": "bottom-2 right-2",
    "bottom-left": "bottom-2 left-2",
  };

  // Size classes
  const sizeClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className={`
        absolute ${positionClasses[position]}
        bg-red-600 hover:bg-red-700 
        text-white rounded-full 
        shadow-lg 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${showOnHover ? "opacity-0 group-hover:opacity-100" : "opacity-100"}
        ${sizeClasses[size]}
        hover:scale-110
        z-10
      `}
      title={`Delete ${imageData.mediaType === "video" ? "video" : "image"}`}
    >
      {isDeleting ? (
        <div
          className={`${iconSizes[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}
        />
      ) : (
        <Trash2 className={iconSizes[size]} />
      )}
    </button>
  );
};

export default DeleteImageButton;
