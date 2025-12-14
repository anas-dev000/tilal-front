import { useState } from "react";
import { Star, Send } from "lucide-react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import ImageUpload from "../../../components/common/ImageUpload";
import { toast } from "sonner";

const FeedbackModal = ({ task, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(task?.feedback?.rating || 0);
  const [feedback, setFeedback] = useState(task?.feedback?.comment || "");
  const [imageNumber, setImageNumber] = useState(
    task?.feedback?.imageNumber || ""
  );
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [feedbackImagePreview, setFeedbackImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeedbackImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeedbackImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFeedbackImage(null);
    setFeedbackImagePreview(null);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating", {
        duration: 5000,
      });
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", feedback);
    if (imageNumber) formData.append("imageNumber", imageNumber);
    if (feedbackImage) formData.append("feedbackImage", feedbackImage);

    await onSubmit(formData);

    setSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Feedback"
      size="md"
      className="max-h-[90vh]"
    >
      <div className="space-y-4 overflow-y-auto max-h-[80vh">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 ">
            Rating <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoveredStar || rating);

              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-12 h-12 transition-all duration-300 drop-shadow-lg ${
                      isFilled
                        ? "fill-yellow-400 text-yellow-400 scale-110"
                        : "text-gray-300 hover:text-yellow-300 hover:scale-110"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <p className="text-center mt-4 text-lg font-semibold text-gray-700">
            {rating > 0 ? `${rating} / 5 Stars` : "Please select a rating"}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            className="w-full pt-1 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Share your experience..."
          />
        </div>

        {/* Image Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Number (if there's an issue)
          </label>
          <input
            type="number"
            min="1"
            value={imageNumber}
            onChange={(e) => setImageNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., 3"
          />
        </div>

        {/* Upload Image */}
        <ImageUpload
          onChange={handleImageChange}
          preview={feedbackImagePreview}
          onRemove={handleRemoveImage}
          label="Upload Image (Optional)"
          id="feedback-image"
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            icon={Send}
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackModal;
