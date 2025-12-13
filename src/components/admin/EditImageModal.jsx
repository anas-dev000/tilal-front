// src/components/admin/EditImageModal.jsx - ✅ WITH FULL VIDEO SUPPORT
import { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Play, Video } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const EditImageModal = ({ isOpen, onClose, image, onSave }) => {
  const [formData, setFormData] = useState({
    qtn: 1,
    caption: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (image) {
      setFormData({
        qtn: image.qtn || 1,
        caption: image.caption || '',
        description: image.description || ''
      });
    }
  }, [image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.qtn < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update media');
    } finally {
      setLoading(false);
    }
  };

  if (!image) return null;

  const isVideo = image.mediaType === 'video';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Reference ${isVideo ? 'Video' : 'Image'}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Media Preview */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-gray-200">
            {isVideo ? (
              <div className="relative aspect-video bg-gray-100">
                <video
                  src={image.url}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
                {/* Video Badge */}
                <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Video className="w-4 h-4" />
                  <span>VIDEO</span>
                </div>
                
                {/* Duration Badge */}
                {image.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                    {Math.round(image.duration)}s
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={image.url}
                  alt="Preview"
                  className="w-full h-auto max-h-80 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                />
                {/* Image Badge */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                  <ImageIcon className="w-4 h-4" />
                  <span>IMAGE</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Media Info */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-semibold text-gray-900">
                {isVideo ? '🎬 Video' : '🖼️ Image'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Format</p>
              <p className="font-semibold text-gray-900 uppercase">
                {image.format || 'N/A'}
              </p>
            </div>
            {isVideo && image.duration && (
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">
                  {Math.round(image.duration)} seconds
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-600">Uploaded</p>
              <p className="font-semibold text-gray-900">
                {new Date(image.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Quantity (QTN) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity (QTN) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="qtn"
            value={formData.qtn}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
          />
          <p className="text-xs text-gray-500 mt-1">
            How many times does this plant/location appear in this section?
          </p>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption
          </label>
          <input
            type="text"
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            placeholder={isVideo ? "e.g., Main Garden Overview Video" : "e.g., Main Palm Tree"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder={isVideo 
              ? "Detailed description of what the video shows..."
              : "Detailed description of the location or plant..."
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
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
          <Button
            type="submit"
            disabled={loading}
            icon={Save}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditImageModal;