// src/pages/admin/EmployeeDetails.jsx
/* eslint-disable no-unused-vars */
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit, Power, Save, FileText, X, Search, ExternalLink } from "lucide-react";
import { useMemo, useCallback, memo, useState, useEffect } from "react";
import { toast } from "sonner";

// React Query hooks
import { useUser, useUpdateUser } from "../../hooks/queries/useUsers";
import { useTasks } from "../../hooks/queries/useTasks";

// Components
import Loading from "../../components/common/Loading";
import Skeleton, { CardSkeleton, TableSkeleton } from "../../components/common/Skeleton";
import WorkerStatsGrid from "../../components/workers/WorkerStatsGrid";
import WorkerTaskList from "../../components/workers/WorkerTaskList";
import EmployeeModal from "../../components/employees/EmployeeModal";
import WorkerModal from "./WorkerModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Button from "../../components/common/Button";

const PreviewModal = ({ isOpen, onClose, type, url, title }) => {
  if (!isOpen) return null;

  const getSafePdfUrl = (url) => {
    if (!url) return null;
    if (url.includes('cloudinary.com')) {
      if (url.includes('/image/upload/')) {
        if (!url.toLowerCase().endsWith('.pdf')) {
          url = `${url}.pdf`;
        }
        url = url.replace('/upload/', '/upload/f_auto,q_auto/');
      }
    }
    if (url.toLowerCase().endsWith('.pdf') && !url.includes('#view=')) {
      url = `${url}#view=FitH`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-4">
           <h3 className="text-lg font-semibold truncate flex-1">{title}</h3>
           <div className="flex items-center gap-2">
             <a 
               href={url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
               title="Open in new tab / Download"
             >
                <ExternalLink className="w-6 h-6" />
             </a>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
             </button>
           </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-black/50 rounded-lg overflow-hidden flex items-center justify-center border border-white/10 relative">
           {type === 'image' ? (
              <img src={url} alt={title} className="max-w-full max-h-full object-contain" />
           ) : type === 'pdf' ? (
               <iframe
                 src={getSafePdfUrl(url)}
                 className="w-full h-full bg-white"
                 title={title}
               />
           ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                 <div className="bg-white/10 p-6 rounded-full mb-4 ring-1 ring-white/20">
                    <FileText className="w-16 h-16 text-white" />
                 </div>
                 <h4 className="text-xl font-medium text-white mb-2 max-w-md truncate px-4">{title}</h4>
                 <p className="text-gray-400 mb-6 max-w-md">
                    Click below to view this document.
                 </p>
                 <a 
                   href={url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                 >
                    <ExternalLink className="w-5 h-5" />
                    Open Document
                 </a>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

const EmployeeDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Preview Modal State
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    type: "image",
    url: "",
    title: "",
  });

  const openPreview = (type, url, title) => {
    setPreviewModal({ isOpen: true, type, url, title });
  };

  const closePreview = () => {
    setPreviewModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Local state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "", // "activate" | "deactivate"
  });

  // ==================== Data Fetching ====================
  const {
    data: employee,
    isLoading: isEmployeeLoading,
    error: employeeError,
  } = useUser(id);

  // Only fetch tasks if the user is a worker
  const isWorker = employee?.role === "worker";
  const { data: tasksData, isLoading: isTasksLoading } = useTasks(
    { worker: id },
    { enabled: !!id && isWorker }
  );
  
  const tasks = tasksData?.data || [];

  const updateUserMutation = useUpdateUser();

  const isLoading = isEmployeeLoading || (isWorker && isTasksLoading);

  // Sync notes when employee data loads
  useEffect(() => {
    if (employee?.notes) {
      setNotes(employee.notes);
    }
  }, [employee?.notes]);

  // ==================== Memoized Values ====================
  const joinDate = useMemo(() => {
    if (!employee?.createdAt) return "—";
    return new Date(employee.createdAt).toLocaleDateString();
  }, [employee?.createdAt]);

  const statusText = useMemo(() => {
    return employee?.isActive
      ? t("admin.workerDetails.active")
      : t("admin.workerDetails.inactive");
  }, [employee?.isActive, t]);

  const statusColor = useMemo(() => {
    return employee?.isActive ? "text-green-600" : "text-red-600";
  }, [employee?.isActive]);

  // ==================== Handlers ====================
  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleToggleStatus = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      action: employee?.isActive ? "deactivate" : "activate",
    });
  }, [employee?.isActive]);

  const handleConfirmModalClose = useCallback(() => {
    setConfirmModal({ isOpen: false, action: "" });
  }, []);

  const confirmToggleStatus = useCallback(() => {
    if (!employee) return;

    updateUserMutation.mutate(
      {
        id: employee._id,
        data: { isActive: !employee.isActive },
      },
      {
        onSuccess: () => {
          handleConfirmModalClose();
        },
      }
    );
  }, [employee, updateUserMutation, handleConfirmModalClose]);

  const handleSaveNotes = async () => {
    if (!employee) return;
    setIsSavingNotes(true);
    try {
      await updateUserMutation.mutateAsync({
        id: employee._id,
        data: { notes },
      });
      toast.success(t("common.updatedSuccessfully"));
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // ==================== Render ====================
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="300px" height="48px" />
          <div className="flex gap-2">
            <Skeleton variant="rectangle" width="100px" height="40px" />
            <Skeleton variant="rectangle" width="100px" height="40px" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton className="lg:col-span-1" />
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (employeeError || !employee) {
    return (
      <div className="text-center py-12 text-red-600">
        {t("admin.workerDetails.notFound")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/employees')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← {t("common.back")}
          </button>
          <h1 className="text-3xl font-bold">{employee.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            employee.role === 'worker' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {t(`roles.${employee.role}`)}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            {t("common.edit")}
          </button>

          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              employee.isActive
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            <Power className="w-4 h-4" />
            {employee.isActive ? t("common.deactivate") : t("common.activate")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-all relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  if (employee?.profilePicture) {
                    openPreview('image', employee.profilePicture, employee.name);
                  }
                }}
              >
                {employee?.profilePicture ? (
                  <>
                    <img 
                      src={employee.profilePicture} 
                      alt={employee.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <span className="text-primary-600 font-semibold text-3xl">
                    {employee?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>

              <div className="overflow-hidden">
                <h2 className="text-2xl font-bold truncate">{employee.name}</h2>
                <p className="text-gray-600 truncate">{employee.email}</p>
                <p className="text-sm text-gray-500">{employee.phone}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("admin.workerDetails.status")}
                </span>
                <span className={`font-medium ${statusColor}`}>
                  {statusText}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("admin.workerDetails.joinDate")}
                </span>
                <span>{joinDate}</span>
              </div>
            </div>

            {/* Documents Section - Reorganized */}
            <div className="mt-6 pt-6 border-t border-gray-200">
               {(() => {
                  const images = [];
                  const docs = [];

                  // Helper
                  const isImage = (url) => /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(url);

                  // 1. Collect Images
                  if (employee.documents?.residence) 
                     images.push({ url: employee.documents.residence, name: t("admin.workers.residencePhoto") || "Residence" });
                  if (employee.documents?.license) 
                     images.push({ url: employee.documents.license, name: t("admin.workers.licensePhoto") || "License" });
                  if (employee.documents?.identity) 
                     images.push({ url: employee.documents.identity, name: t("admin.workers.idPhoto") || "Identity" });
                  
                  // 2. Collect Docs
                  // Contract PDF First
                  if (employee.contractPdf) {
                     const url = typeof employee.contractPdf === 'string' ? employee.contractPdf : employee.contractPdf.url;
                     if (url) docs.push({ url, name: t("admin.workers.contractPdf") || "Employment Contract", type: 'contract' });
                  }

                  // Then Other Files
                  if (employee.documents?.files) {
                     employee.documents.files.forEach(file => {
                        if (isImage(file.url || file.name)) {
                           images.push({ url: file.url, name: file.name });
                        } else {
                           docs.push({ url: file.url, name: file.name, type: 'file' });
                        }
                     });
                  }

                  return (
                    <div className="space-y-6">
                       {/* Images Grid */}
                       {images.length > 0 && (
                          <div>
                             <h3 className="font-semibold text-gray-900 mb-4">{t("admin.workers.photos") || "Photos"}</h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {images.map((img, idx) => (
                                   <button 
                                      key={`img-${idx}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPreview('image', img.url, img.name);
                                      }} 
                                      className="block group w-full text-left"
                                    >
                                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative mb-1">
                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                          <Search className="w-6 h-6" />
                                        </div>
                                      </div>
                                      <span className="text-xs font-medium text-gray-600 block truncate" title={img.name}>{img.name}</span>
                                    </button>
                                ))}
                             </div>
                          </div>
                       )}

                       {/* Documents List */}
                       {docs.length > 0 && (
                          <div>
                             <h3 className="font-semibold text-gray-900 mb-3">{t("admin.workers.documents") || "Documents & Contracts"}</h3>
                             <div className="space-y-2">
                                {docs.map((doc, idx) => (
                                   <button 
                                    key={`doc-${idx}`}
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       openPreview('pdf', doc.url, doc.name);
                                    }}
                                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group w-full text-left"
                                  >
                                     <div className={`p-2 rounded-lg transition-colors ${doc.type === 'contract' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-100' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                                       <FileText className="w-5 h-5" />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                        <p className="text-xs text-gray-500">{doc.type === 'contract' ? 'Employment Contract' : 'Document'}</p>
                                     </div>
                                     <div className="text-gray-400 group-hover:text-primary-600">
                                        <Search className="w-4 h-4" />
                                     </div>
                                  </button>
                                ))}
                             </div>
                          </div>
                       )}

                       {images.length === 0 && docs.length === 0 && (
                          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                             No documents or photos available.
                          </div>
                       )}
                    </div>
                  );
               })()}
            </div>

            {/* Notes Section - Now editable directly */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    {t("admin.workers.notes")}
                  </h4>
                </div>
                {notes !== (employee.notes || "") && (
                  <Button
                    onClick={handleSaveNotes}
                    size="sm"
                    isLoading={isSavingNotes}
                    icon={Save}
                  >
                    {t("common.save")}
                  </Button>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("admin.workers.notesPlaceholder") || "Add notes about this employee..."}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-sm text-gray-700 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Role Specific Content */}
        <div className="lg:col-span-2 space-y-6">
          {isWorker ? (
            <>
              <WorkerStatsGrid worker={employee} totalTasks={tasks.length} />
              <WorkerTaskList tasks={tasks} />
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-gray-200 min-h-[400px]">
              <div className="bg-purple-100 p-4 rounded-full">
                <FileText className="w-12 h-12 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("roles.accountant")}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  {/* Providing a more descriptive empty state for accountants */}
                  Accountant details focus on administrative notes and profile management. Task tracking is currently optimized for workers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== Modals ==================== */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        type={previewModal.type}
        url={previewModal.url}
        title={previewModal.title}
      />

      {isWorker ? (
        <WorkerModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          worker={employee}
        />
      ) : (
        <EmployeeModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          employee={employee}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleConfirmModalClose}
        onConfirm={confirmToggleStatus}
        title={
          confirmModal.action === "deactivate"
            ? t("admin.workers.deactivateWorker")
            : t("admin.workers.activateWorker")
        }
        message={`${t("common.areYouSure")} ${
          confirmModal.action === "deactivate"
            ? t("common.deactivate")
            : t("common.activate")
        } ${t("common.thisWorker")}?`}
        confirmText={
          confirmModal.action === "deactivate"
            ? t("common.deactivate")
            : t("common.activate")
        }
        confirmVariant={
          confirmModal.action === "deactivate" ? "warning" : "success"
        }
      />
    </div>
  );
};

export default memo(EmployeeDetails);
