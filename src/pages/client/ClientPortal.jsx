// frontend/src/pages/client/ClientPortal.jsx - MINIMALIST REDESIGN
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Star,
  Eye,
  MapPin,
  Calendar,
  CheckCircle,
  Image as ImageIcon,
  ThumbsUp,
  Clock,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "../../contexts/AuthContext";

// React Query hooks
import {
  useTasks,
  useSubmitFeedback,
  useMarkSatisfied,
} from "../../hooks/queries/useTasks";

import Button from "../../components/common/Button";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import Skeleton, { CardSkeleton } from "../../components/common/Skeleton";
import SuccessToast from "../../components/common/SuccessToast";
import TaskDetailModal from "./modals/TaskDetailModal";
import FeedbackModal from "./modals/FeedbackModal";
import MediaModal from "../../components/common/MediaModal";
import Pagination from "../../components/common/Pagination";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from "sonner";

const PAGE_SIZE = 12;

const ClientPortal = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: tasksData, isLoading } = useTasks({
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const tasks = tasksData?.data || [];
  const totalCount = tasksData?.total || 0;
  const totalPages = tasksData?.totalPages || 0;

  const submitFeedbackMutation = useSubmitFeedback();
  const markSatisfiedMutation = useMarkSatisfied();

  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Media Modal States
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [selectedMediaTitle, setSelectedMediaTitle] = useState("");

  // Toast State
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSatisfiedConfirm, setShowSatisfiedConfirm] = useState(false);
  const [satisfiedTaskId, setSatisfiedTaskId] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewTask = useCallback((task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
    setShowFeedbackModal(false);
  }, []);

  const handleOpenFeedbackModal = useCallback((task) => {
    setSelectedTask(task);
    setShowFeedbackModal(true);
    setShowDetailModal(false);
  }, []);

  const handleSubmitFeedback = useCallback(async (formData) => {
    if (!selectedTask?._id) return;

    try {
      await submitFeedbackMutation.mutateAsync({
        id: selectedTask._id,
        formData: formData,
      });

      setSuccessMessage("Feedback submitted successfully!");
      setShowSuccessToast(true);
      setShowFeedbackModal(false);
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback", { duration: 5000 });
    }
  }, [selectedTask?._id, submitFeedbackMutation]);

  const handleMarkSatisfied = useCallback((taskId) => {
    setSatisfiedTaskId(taskId);
    setShowSatisfiedConfirm(true);
  }, []);

  const confirmSatisfied = useCallback(async () => {
    if (!satisfiedTaskId) return;

    try {
      await markSatisfiedMutation.mutateAsync(satisfiedTaskId);

      setSuccessMessage("Thank you! Task marked as satisfied ✓");
      setShowSuccessToast(true);
      setShowSatisfiedConfirm(false);
      setSatisfiedTaskId(null);
    } catch (error) {
      console.error("Error marking satisfied:", error);
      toast.error("Failed to mark task as satisfied", { duration: 5000 });
    }
  }, [markSatisfiedMutation, satisfiedTaskId]);

  const cancelSatisfiedConfirm = useCallback(() => {
    setShowSatisfiedConfirm(false);
    setSatisfiedTaskId(null);
  }, []);

  const handleMediaClick = useCallback(
    (mediaUrl, mediaType = "image", title = "Task Media") => {
      setSelectedMedia(mediaUrl);
      setSelectedMediaType(mediaType);
      setSelectedMediaTitle(title);
    },
    []
  );

  const getStatusColor = useCallback((status) => {
    const colors = {
      completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      "in-progress": "bg-blue-50 text-blue-700 border border-blue-100",
      pending: "bg-gray-50 text-gray-700 border border-gray-100",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border border-gray-100";
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: totalCount,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      pending: tasks.filter((t) => t.status === "pending").length,
    };
  }, [tasks, totalCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 space-y-8">
        <div className="flex justify-between items-center mb-8">
           <Skeleton variant="rectangle" width="200px" height="60px" />
           <div className="flex gap-4">
             <Skeleton variant="circle" width="40px" height="40px" />
             <Skeleton variant="rectangle" width="100px" height="40px" />
           </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      {/* Navbar - Minimalist White */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="KTC Logo" 
                className="w-8 h-8 object-contain" 
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                  Kingdom Telal
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                     <span className="font-semibold text-emerald-700 text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                     </span>
                 </div>
              </div>

               <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                icon={LogOut}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Simple Header */}
        <div>
           <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
           <p className="text-gray-500 mt-1">Welcome back to your client portal.</p>
        </div>

        {/* Minimalist Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <StatsCard 
             title="Total Services" 
             value={stats.total} 
             icon={Activity} 
           />
           <StatsCard 
             title="Completed" 
             value={stats.completed} 
             icon={CheckCircle} 
             iconColor="text-emerald-500"
           />
           <StatsCard 
             title="In Progress" 
             value={stats.inProgress} 
             icon={Clock} 
             iconColor="text-blue-500"
           />
           <StatsCard 
             title="Pending" 
             value={stats.pending} 
             icon={Calendar} 
             iconColor="text-amber-500"
           />
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-lg font-medium text-gray-900">
               Recent Tasks
            </h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
               {totalCount} Total
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-gray-500">No services found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tasks.map((task) => (
                  <TaskCard 
                    key={task._id}
                    task={task}
                    onClick={() => handleViewTask(task)}
                    onFeedback={() => handleOpenFeedbackModal(task)}
                    onSatisfied={() => handleMarkSatisfied(task._id)}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
              
              <div className="mt-8 flex justify-center">
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalCount={totalCount}
                    limit={PAGE_SIZE}
                 />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modals - Reusing existing components */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        onOpenFeedback={() => {
          setShowDetailModal(false);
          setShowFeedbackModal(true);
        }}
        onImageClick={handleMediaClick}
      />

      <FeedbackModal
        task={selectedTask}
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmitFeedback}
      />

      <MediaModal
        isOpen={!!selectedMedia}
        onClose={() => {
          setSelectedMedia(null);
          setSelectedMediaType("image");
          setSelectedMediaTitle("");
        }}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        title={selectedMediaTitle}
      />

      <ConfirmationModal
        isOpen={showSatisfiedConfirm}
        onClose={cancelSatisfiedConfirm}
        onConfirm={confirmSatisfied}
        title="Mark as Satisfied"
        message="Are you satisfied with work?"
        confirmText="Yes, Satisfied"
        confirmVariant="success"
      />

      {showSuccessToast && (
        <SuccessToast
          message={successMessage}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
};

// --- Minimalist Sub-Components ---

const StatsCard = ({ title, value, icon: Icon, iconColor = "text-gray-400" }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
         <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

const TaskCard = ({ task, onClick, onFeedback, onSatisfied, getStatusColor }) => {
  const visibleAfterImages = task.images?.after?.filter((img) => img.isVisibleToClient) || [];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full overflow-hidden"
    >
      <div className="p-5 flex-1 flex flex-col gap-3">
         
         <div className="flex justify-between items-start gap-3">
             <h3 className="font-medium text-gray-900 text-base line-clamp-2">
               {task.title}
             </h3>
             <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(task.status)}`}>
                {task.status}
             </span>
         </div>

         {task.site && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
               <MapPin className="w-3.5 h-3.5" />
               <span className="truncate">{task.site.name}</span>
            </div>
         )}
         
         <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
            <div className="flex items-center gap-1">
               <Calendar className="w-3.5 h-3.5" />
               <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
            </div>
            {visibleAfterImages.length > 0 && (
               <div className="flex items-center gap-1">
                 <ImageIcon className="w-3.5 h-3.5" />
                 <span>{visibleAfterImages.length}</span>
               </div>
            )}
         </div>

         {/* Minimalist Feedback Status */}
         {task.feedback && (
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-2">
               {task.feedback.isSatisfiedOnly ? (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> Satisfied
                  </span>
               ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Rated:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < task.feedback.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
               )}
            </div>
         )}
      </div>

      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex gap-2">
          <Button 
             variant="white" 
             size="sm"
             className="flex-1 h-8 text-xs border-gray-200 text-gray-600"
             onClick={onClick}
          >
             Details
          </Button>
          
          {task.status === "completed" && !task.feedback?.rating && !task.feedback?.isSatisfiedOnly && (
             <>
               <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 h-8 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  onClick={onSatisfied}
               >
                  Satisfied
               </Button>
               <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 h-8 text-xs border-amber-200 text-amber-600 hover:bg-amber-50"
                  onClick={onFeedback}
               >
                  <Star className="w-3 h-3 mr-1" /> Rate
               </Button>
             </>
          )}
      </div>
    </motion.div>
  );
};

export default ClientPortal;