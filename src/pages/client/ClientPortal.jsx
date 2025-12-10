import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Star, Send, Eye, MapPin, 
  Calendar, CheckCircle, Image as ImageIcon, Upload 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { tasksAPI, clientsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import Loading from '../../components/common/Loading';

const ClientPortal = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [imageNumber, setImageNumber] = useState('');
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [feedbackImagePreview, setFeedbackImagePreview] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Image Viewer
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // ✅ Check authentication and role
    if (!user || user.role !== 'client') {
      console.log('❌ Not authenticated as client, redirecting to login');
      navigate('/login');
      return;
    }
    
    fetchTasks();
  }, [user, navigate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // ✅ FIX: Get client ID correctly (handle both _id and id)
      const clientId = user._id || user.id;
      
      if (!clientId) {
        console.error('❌ No client ID found in user object:', user);
        // setError('Invalid user session. Please login again.');
        return;
      }

      console.log('✅ Fetching tasks for client:', clientId);
      const response = await clientsAPI.getClientTasks(clientId);
      setTasks(response.data.data || []);
      console.log('✅ Tasks loaded:', response.data.data?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      
      // ✅ Better error handling
      if (error.response?.status === 401) {
        console.log('❌ Unauthorized - Session expired');
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
  };

  const handleOpenFeedbackModal = (task) => {
    setSelectedTask(task);
    setRating(task.feedback?.rating || 0);
    setFeedback(task.feedback?.comment || '');
    setImageNumber(task.feedback?.imageNumber || '');
    setShowFeedbackModal(true);
  };

  const handleFeedbackImageChange = (e) => {
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

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmittingFeedback(true);

      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('comment', feedback);
      if (imageNumber) formData.append('imageNumber', imageNumber);
      if (feedbackImage) formData.append('feedbackImage', feedbackImage);

      await tasksAPI.submitFeedback(selectedTask._id, formData);

      alert('Feedback submitted successfully! Thank you 🎉');
      setShowFeedbackModal(false);
      fetchTasks();
      
      // Reset form
      setRating(0);
      setFeedback('');
      setImageNumber('');
      setFeedbackImage(null);
      setFeedbackImagePreview(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-600">🌿 Garden MS</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              icon={LogOut}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Tasks</h2>
          
          {tasks.length === 0 ? (
            <Card className="bg-white text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No tasks yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Your completed tasks will appear here
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => {
                const visibleAfterImages = task.images?.after?.filter(img => img.isVisibleToClient) || [];
                
                return (
                  <Card key={task._id} className="bg-white hover:shadow-xl transition-shadow">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>

                      {/* Site Info */}
                      {task.site && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="truncate">{task.site.name}</span>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Scheduled: {new Date(task.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        {task.completedAt && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Image Count */}
                      {visibleAfterImages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ImageIcon className="w-4 h-4" />
                          <span>{visibleAfterImages.length} images available</span>
                        </div>
                      )}

                      {/* Feedback Status */}
                      {task.feedback && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                          <p className="text-sm font-medium text-yellow-800 flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            Feedback Submitted
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewTask(task)}
                          icon={Eye}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        
                        {task.status === 'completed' && !task.feedback && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleOpenFeedbackModal(task)}
                            icon={Star}
                            className="flex-1"
                          >
                            Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && !showFeedbackModal && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          size="xl"
        >
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{selectedTask.description}</p>
            </div>

            {/* Site Info */}
            {selectedTask.site && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Site</h4>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium">{selectedTask.site.name}</p>
                  {selectedTask.site.location?.address && (
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {selectedTask.site.location.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Visible After Images ONLY */}
            {selectedTask.images?.after && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">After Work Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedTask.images.after
                    .filter(img => img.isVisibleToClient)
                    .map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage(img.url)}
                      >
                        <img
                          src={img.url}
                          alt={`After ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg shadow-md group-hover:opacity-90 transition"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>
                    ))}
                </div>
                
                {selectedTask.images.after.filter(img => img.isVisibleToClient).length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No images available yet
                  </p>
                )}
              </div>
            )}

            {/* Feedback Section */}
            {selectedTask.feedback ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Your Feedback</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= selectedTask.feedback.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {selectedTask.feedback.comment && (
                    <p className="text-gray-700">{selectedTask.feedback.comment}</p>
                  )}
                  {selectedTask.feedback.imageNumber && (
                    <p className="text-sm text-gray-600">
                      Issue with Image #{selectedTask.feedback.imageNumber}
                    </p>
                  )}
                </div>
              </div>
            ) : selectedTask.status === 'completed' && (
              <Button
                variant="success"
                onClick={() => {
                  setShowFeedbackModal(true);
                }}
                icon={Star}
                className="w-full"
              >
                Submit Feedback
              </Button>
            )}
          </div>
        </Modal>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedTask && (
        <Modal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          title="Submit Feedback"
          size="md"
        >
          <form onSubmit={handleSubmitFeedback} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 3"
              />
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeedbackImageChange}
                  className="hidden"
                  id="feedback-image"
                />
                <label
                  htmlFor="feedback-image"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload image
                  </span>
                </label>
                
                {feedbackImagePreview && (
                  <div className="mt-4">
                    <img
                      src={feedbackImagePreview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
                disabled={submittingFeedback}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                icon={Send}
                disabled={submittingFeedback || rating === 0}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Image Viewer"
          size="xl"
        >
          <div className="text-center">
            <img
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[70vh] mx-auto rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientPortal;