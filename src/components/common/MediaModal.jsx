// src/components/common/MediaModal.jsx - ✅ NEW: Modal for Images & Videos
import { X, Play, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

/**
 * MediaModal - عرض الصور والفيديوهات في Modal
 * 
 * Usage:
 * <MediaModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   mediaUrl="https://..."
 *   mediaType="image" // or "video"
 *   title="صورة قبل العمل"
 * />
 */
const MediaModal = ({ isOpen, onClose, mediaUrl, mediaType = 'image', title }) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10 backdrop-blur-md"
        title="إغلاق"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Title */}
      {title && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-md z-10">
          <p className="text-sm font-medium">{title}</p>
        </div>
      )}

      {/* Zoom Controls - Images Only */}
      {mediaType === 'image' && (
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button
            onClick={handleZoomOut}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all backdrop-blur-md"
            title="تصغير"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full transition-all backdrop-blur-md text-sm font-medium"
            title="إعادة ضبط"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all backdrop-blur-md"
            title="تكبير"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Media Container */}
      <div className="relative max-w-[95vw] max-h-[90vh] overflow-auto custom-scrollbar">
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <source src={mediaUrl} type="video/mp4" />
            <source src={mediaUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={mediaUrl}
            alt={title || "Media"}
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Media Type Indicator */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full backdrop-blur-md text-xs font-medium z-10">
        {mediaType === 'video' ? (
          <div className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            <span>فيديو</span>
          </div>
        ) : (
          <span>صورة</span>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default MediaModal;