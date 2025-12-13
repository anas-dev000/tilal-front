    // src/components/common/MediaUpload.jsx
import { Upload, X, Play, Camera, Video } from "lucide-react";
import { useState } from "react";

/**
 * MediaUpload Component - يدعم الصور والفيديوهات
 * 
 * Usage:
 * <MediaUpload
 *   onChange={handleMediaChange}
 *   preview={mediaPreview}
 *   mediaType={mediaType} // 'image' or 'video'
 *   onRemove={handleRemoveMedia}
 *   label="Upload Media"
 *   id="unique-id"
 *   acceptVideo={true}
 * />
 */

const MediaUpload = ({
  onChange,
  preview,
  mediaType = 'image',
  onRemove,
  label = "Upload Media",
  id = "media-upload",
  acceptVideo = true,
  maxSize = 100, // MB
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`File size must be less than ${maxSize}MB`);
      e.target.value = '';
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      e.target.value = '';
      return;
    }

    if (isVideo && !acceptVideo) {
      alert('Video upload is not enabled');
      e.target.value = '';
      return;
    }

    setUploading(true);
    
    try {
      if (onChange) {
        await onChange(e);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const getAcceptString = () => {
    if (!acceptVideo) return "image/*";
    return "image/*,video/*";
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition">
        <input
          type="file"
          accept={getAcceptString()}
          onChange={handleFileChange}
          className="hidden"
          id={id}
          disabled={uploading || disabled}
        />

        {!preview ? (
          <label
            htmlFor={id}
            className={`flex flex-col items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div className="flex gap-4 mb-2">
              <Camera className="w-12 h-12 text-gray-400" />
              {acceptVideo && <Video className="w-12 h-12 text-gray-400" />}
            </div>
            <span className="text-sm text-gray-600">
              Click to upload {acceptVideo ? 'photo or video' : 'photo'}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              {acceptVideo ? 'Image or Video' : 'Image'} up to {maxSize}MB
            </span>
          </label>
        ) : (
          <div className="relative">
            {mediaType === 'video' ? (
              <div className="relative">
                <video
                  src={preview}
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                  preload="metadata"
                />
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  <span>VIDEO</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>IMAGE</span>
                </div>
              </div>
            )}
            
            {!disabled && (
              <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {uploading && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Uploading...
        </p>
      )}
    </div>
  );
};

export default MediaUpload;