// src/pages/admin/SectionDetail.jsx - COMPLETE FILE
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Layers,
  Image as ImageIcon,
  Edit,
} from 'lucide-react';
import { sitesAPI, tasksAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import EditImageModal from '../../components/admin/EditImageModal';

const SectionDetail = () => {
  const { siteId, sectionId } = useParams();
  const navigate = useNavigate();
  
  const [section, setSection] = useState(null);
  const [site, setSite] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSectionDetails();
  }, [siteId, sectionId]);

  const fetchSectionDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch site data
      const siteResponse = await sitesAPI.getSite(siteId);
      
      if (siteResponse.data.success) {
        setSite(siteResponse.data.data);
        
        // Find the specific section
        const foundSection = siteResponse.data.data.sections.find(
          s => s._id === sectionId
        );
        setSection(foundSection);
      }

      // Fetch related tasks
      const tasksResponse = await tasksAPI.getTasks({ 
        site: siteId, 
        section: sectionId 
      });
      
      if (tasksResponse.data.success) {
        setTasks(tasksResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching section details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = (e, image) => {
    e.stopPropagation();
    setEditingImage(image);
    setIsEditModalOpen(true);
  };

  const handleSaveImage = async (formData) => {
    try {
      await sitesAPI.updateReferenceImage(
        siteId,
        sectionId,
        editingImage._id,
        formData
      );
      
      // Refresh section details
      await fetchSectionDetails();
      setIsEditModalOpen(false);
      setEditingImage(null);
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      maintenance: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      review: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLastTaskStatusBadge = () => {
    if (!section?.lastTaskStatus) return null;

    const statusConfig = {
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: CheckCircle,
        label: 'Last: Completed'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: AlertCircle,
        label: 'Last: Rejected'
      },
      'in-progress': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: Clock,
        label: 'Last: In Progress'
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: Clock,
        label: 'Last: Pending'
      }
    };

    const config = statusConfig[section.lastTaskStatus] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-5 h-5" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{config.label}</span>
          {section.lastTaskDate && (
            <span className="text-xs opacity-80">
              {new Date(section.lastTaskDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!section || !site) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Section not found</p>
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={() => navigate(`/admin/sites/${siteId}/sections`)}
          className="mt-4"
        >
          Back to Site
        </Button>
      </div>
    );
  }

  const totalQuantity = section.referenceImages?.reduce(
    (sum, img) => sum + (img.qtn || 1), 
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="secondary"
        icon={ArrowLeft}
        onClick={() => navigate(`/admin/sites/${siteId}/sections`)}
      >
        Back to Site Sections
      </Button>

      {/* Section Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-8 h-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">{section.name}</h1>
            </div>
            {section.description && (
              <p className="text-gray-600 mt-2">{section.description}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(section.status)}`}>
              {section.status}
            </span>
            {getLastTaskStatusBadge()}
          </div>
        </div>

        {/* Site Info */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Site</p>
            <p className="font-semibold text-gray-900">{site.name}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
            <ImageIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">
              {section.referenceImages?.length || 0}
            </p>
            <p className="text-xs text-blue-600 uppercase font-medium">
              Reference Images
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
            <Layers className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">
              {totalQuantity}
            </p>
            <p className="text-xs text-purple-600 uppercase font-medium">
              Total Quantity
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
            <p className="text-xs text-green-600 uppercase font-medium">
              Completed Tasks
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
            <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">
              {tasks.length}
            </p>
            <p className="text-xs text-orange-600 uppercase font-medium">
              Total Tasks
            </p>
          </div>
        </div>

        {section.area > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Area</p>
            <p className="text-lg font-semibold text-gray-900">
              {section.area}m²
            </p>
          </div>
        )}
      </div>

      {/* Reference Images Grid */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ImageIcon className="w-7 h-7 text-primary-600" />
            Reference Images
            {section.referenceImages?.length > 0 && (
              <span className="bg-primary-100 text-primary-700 text-sm font-bold px-3 py-1 rounded-full">
                {section.referenceImages.length} images
              </span>
            )}
          </h2>
        </div>

        {section.referenceImages && section.referenceImages.length > 0 ? (
          <>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full shrink-0">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">
                    📸 How to Read Reference Images
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    The <strong className="text-blue-900">badge number (QTN)</strong> on each image represents <strong>how many times</strong> this plant/location appears in this section. For example, if badge shows "x5", it means this plant exists 5 times in different spots.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {section.referenceImages.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200 hover:border-primary-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.caption || `Reference ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500"
                      onClick={() => setSelectedImage(img.url)}
                    />
                    
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white w-full">
                        <p className="text-sm font-medium">
                          Click to view full size
                        </p>
                      </div>
                    </div>

                    {/* QTN Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full shadow-2xl border-2 border-white transform group-hover:scale-110 transition-transform duration-300">
                        <div className="flex items-center gap-2">
                          <Layers className="w-5 h-5" />
                          <span className="text-2xl font-black">
                            x{img.qtn || 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Image Number Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-gray-300">
                        {idx + 1}
                      </div>
                    </div>

                    {/* Edit Button */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => handleEditImage(e, img)}
                        className="bg-white text-primary-600 p-2 rounded-full shadow-lg hover:bg-primary-50 transition-colors border-2 border-primary-200"
                        title="Edit image details"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-4 bg-white">
                    {img.caption && (
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {img.caption}
                      </h3>
                    )}
                    
                    {img.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {img.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(img.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                        <span className="text-xs font-bold">
                          QTY: {img.qtn || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Layers className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium uppercase">
                      Total Quantity in Section
                    </p>
                    <p className="text-3xl font-black text-purple-900">
                      {totalQuantity} plants/locations
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-purple-600 font-medium">
                    {section.referenceImages.length} unique types
                  </p>
                  <p className="text-xs text-purple-500 mt-1">
                    Across this section
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <ImageIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              No reference images uploaded yet
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Add reference images to help workers identify locations
            </p>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary-600" />
            Related Tasks
            {tasks.length > 0 && (
              <span className="bg-primary-100 text-primary-700 text-sm font-bold px-3 py-1 rounded-full">
                {tasks.length} tasks
              </span>
            )}
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              No tasks created yet
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Tasks for this section will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                onClick={() => navigate(`/admin/tasks/${task._id}`)}
                className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg p-5 border-2 border-gray-200 hover:border-primary-400 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      {task.worker && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">👷</span>
                          <span>{task.worker.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(task.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      {task.completedAt && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Completed {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-4 shrink-0 ${getTaskStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Section */}
      {section.notes && (
        <div className="bg-yellow-50 rounded-xl shadow-md p-6 border-2 border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Notes
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {section.notes}
          </p>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 rounded-full p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      <EditImageModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingImage(null);
        }}
        image={editingImage}
        onSave={handleSaveImage}
      />
    </div>
  );
};

export default SectionDetail;