// src/pages/admin/WorkerModal.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ExternalLink, Upload, X, FileText, Image as ImageIcon } from "lucide-react";

// React Query hooks
import { useCreateUser, useUpdateUser } from "../../hooks/queries/useUsers";

import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const WorkerModal = ({ isOpen, onClose, worker }) => {
  const { t } = useTranslation();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isEditMode = !!worker;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: worker || {
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "worker",
        isActive: "true",
        notes: "",
    },
  });

  const [removedFiles, setRemovedFiles] = useState([]);
  const [removedOtherFiles, setRemovedOtherFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // Reset form when worker prop changes
  useEffect(() => {
    if (worker) {
      reset({
        ...worker,
        isActive: worker.isActive ? "true" : "false",
        password: "", // clear password
      });
      setRemovedFiles([]);
      setRemovedOtherFiles([]);
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "worker",
        isActive: "true",
        notes: "",
      });
      setRemovedFiles([]);
      setRemovedOtherFiles([]);
    }
  }, [worker, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Append basic text fields
      const simpleFields = ["name", "email", "phone", "role", "isActive", "notes"];
      simpleFields.forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
              formData.append(key, data[key]);
          }
      });

      // Explicitly append password if creating new user
      if (!isEditMode && data.password) {
        formData.append("password", data.password);
      }

      // Helper to append a single file ONLY if it is a new File object
      const appendIfFile = (fieldName) => {
        const fileInput = data[fieldName];
        // If it's a FileList (from input type=file), get the first file
        if (fileInput && fileInput.length > 0 && fileInput[0] instanceof File) {
             formData.append(fieldName, fileInput[0]);
        }
      };

      appendIfFile("profilePicture");
      appendIfFile("residencePhoto"); 
      appendIfFile("licensePhoto");
      appendIfFile("idPhoto");
      appendIfFile("contractPdf");

      // Handle Multiple Files (otherFiles)
      // Check if data.otherFiles has files
      if (data.otherFiles && data.otherFiles.length > 0) {
          Array.from(data.otherFiles).forEach(file => {
              if (file instanceof File) {
                  formData.append("otherFiles", file);
              }
          });
      }

      // Handle removed files (Single - e.g. profilePicture)
      removedFiles.forEach(fieldName => {
          formData.append(`remove_${fieldName}`, 'true');
      });

      // Handle removed additional files (Array - URLs)
      removedOtherFiles.forEach(url => {
          formData.append('remove_otherFiles', url);
      });

      if (isEditMode) {
        await updateUserMutation.mutateAsync({
          id: worker._id,
          data: formData, // Send FormData
        });
        toast.success(t("common.updatedSuccessfully") || "Worker updated successfully");
      } else {
        await createUserMutation.mutateAsync(formData); // Send FormData
        toast.success(t("common.createdSuccessfully") || "Worker created successfully");
      }

      onClose();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        (isEditMode
          ? "Failed to update worker"
          : "Failed to create worker");

      toast.error(errorMessage);
      console.error("Worker save error:", error);
    }
  };

  const isLoading = isSubmitting || createUserMutation.isPending || updateUserMutation.isPending;

  // --- Components ---

  // 1. Box Style File Input (Used for single files)
  const BoxFileInput = ({ label, name, accept, existingValue, icon: Icon = Upload }) => {
    const isRemoved = removedFiles.includes(name);
    const newFiles = watch(name);
    const hasNewFile = newFiles && newFiles.length > 0;
    
    // Preview Logic for New File
    const [newPreview, setNewPreview] = useState(null);
    useEffect(() => {
        if (hasNewFile && newFiles[0] instanceof File && accept.includes('image')) {
            const url = URL.createObjectURL(newFiles[0]);
            setNewPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setNewPreview(null);
        }
    }, [hasNewFile, newFiles, accept]);

    const handleRemove = (e) => {
        e.preventDefault();
        setRemovedFiles(prev => [...prev, name]);
    };

    const handleUndo = (e) => {
        e.preventDefault();
        setRemovedFiles(prev => prev.filter(f => f !== name));
    };

    // Determine what to show
    const showExisting = !isRemoved && existingValue && !hasNewFile;
    const showNew = hasNewFile;
    
    return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text font-medium text-gray-700">{label}</span>
            </label>
            
            <div className={`relative border-2 border-dashed ${errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg p-3 hover:bg-gray-100 transition-colors h-32 flex flex-col items-center justify-center text-center group cursor-pointer overflow-hidden`}>
                <input
                    type="file"
                    accept={accept}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    {...register(name)}
                />

                {showNew ? (
                    // Showing New Upload
                    accept.includes('image') && newPreview ? (
                        <div className="absolute inset-0">
                             <img src={newPreview} alt="New Upload" className="w-full h-full object-cover" />
                             <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs py-1 truncate px-2">
                                New: {newFiles[0].name}
                             </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-blue-600">
                             <FileText className="w-8 h-8 mb-2" />
                             <span className="text-xs font-medium truncate max-w-[150px]">{newFiles[0].name}</span>
                        </div>
                    )
                ) : showExisting ? (
                    // Showing Existing File
                    <div className="absolute inset-0">
                         {accept.includes('image') ? (
                             <img 
                                src={existingValue} 
                                alt="Existing" 
                                className="w-full h-full object-cover" 
                                onClick={(e) => {
                                    e.preventDefault(); // prevent input click
                                    setPreviewImage(existingValue);
                                }}
                             />
                         ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50">
                                <FileText className="w-10 h-10 text-blue-500 mb-2" />
                                <a 
                                    href={existingValue?.url || existingValue} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline relative z-20"
                                    onClick={e => e.stopPropagation()}
                                >
                                    View Document
                                </a>
                            </div>
                         )}

                         {/* Remove Button for Existing */}
                         <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-20 opacity-0 group-hover:opacity-100"
                            title="Remove"
                         >
                            <X className="w-3 h-3" />
                         </button>
                    </div>
                ) : (
                    // Value Removed or Empty
                    <>
                        <Icon className={`w-8 h-8 mb-2 ${isRemoved ? 'text-red-400' : 'text-gray-400'}`} />
                        <span className={`text-xs ${isRemoved ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            {isRemoved ? "Marked for Deletion" : "Click to Upload"}
                        </span>
                        {isRemoved && (
                            <button 
                                onClick={handleUndo} 
                                className="text-xs text-blue-600 underline mt-1 z-20 relative"
                            >
                                Undo
                            </button>
                        )}
                    </>
                )}
            </div>
            {errors[name] && <span className="text-red-500 text-xs mt-1">{errors[name].message}</span>}
        </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? t("common.edit") : t("admin.workers.addWorker")}
        size="2xl" // Wider modal
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2">
                 <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1 border-b">Basic Information</h3>
             </div>
             
             <Input
              label={t("admin.workers.name")}
              {...register("name", { required: t("validation.nameRequired") || "Name is required" })}
              error={errors.name?.message}
              required
            />

            <Input
              label={t("admin.workers.email")}
              type="email"
              {...register("email", {
                required: t("validation.emailRequired") || "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("validation.invalidEmail") || "Invalid email address",
                },
              })}
              error={errors.email?.message}
              required
            />

            {!isEditMode && (
              <Input
                label={t("auth.password")}
                type="password"
                {...register("password", {
                  required: t("validation.passwordRequired") || "Password is required",
                  minLength: {
                    value: 6,
                    message: t("validation.passwordMinLength") || "Password must be at least 6 characters",
                  },
                })}
                error={errors.password?.message}
                required
              />
            )}

            <Input
              label={t("admin.workers.phone")}
              {...register("phone", {
                required: t("validation.phoneRequired") || "Phone is required",
              })}
              error={errors.phone?.message}
              required
            />
            
           {isEditMode && (
             <Select
               label={t("common.status")}
               {...register("isActive")}
               options={[
                 { value: "true", label: t("common.active") },
                 { value: "false", label: t("common.inactive") },
               ]}
             />
           )}
          </div>

          {/* Section 2: Photos (Grouped) - Only in Edit Mode */}
          {isEditMode && (
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
               <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <ImageIcon className="w-4 h-4 text-blue-600" />
                   {t("admin.workers.photos") || "Worker Photos"}
               </h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <BoxFileInput 
                       label={t("admin.workers.profilePicture") || "Profile"} 
                       name="profilePicture" 
                       accept="image/*" 
                       existingValue={worker?.profilePicture}
                       icon={ImageIcon}
                   />
                   <BoxFileInput 
                       label={t("admin.workers.residencePhoto") || "Residence"} 
                       name="residencePhoto" 
                       accept="image/*" 
                       existingValue={worker?.documents?.residence}
                       icon={ImageIcon}
                   />
                   <BoxFileInput 
                       label={t("admin.workers.licensePhoto") || "License"} 
                       name="licensePhoto" 
                       accept="image/*" 
                       existingValue={worker?.documents?.license}
                       icon={ImageIcon}
                   />
                   <BoxFileInput 
                       label={t("admin.workers.idPhoto") || "ID Card"} 
                       name="idPhoto" 
                       accept="image/*" 
                       existingValue={worker?.documents?.identity}
                       icon={ImageIcon}
                   />
               </div>
            </div>
          )}

          {/* Section 3: Documents (Grouped) - Only in Edit Mode */}
          {isEditMode && (
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
               <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <FileText className="w-4 h-4 text-orange-600" />
                   {t("admin.workers.documents") || "Documents & Contracts"}
               </h3>
               <div className="grid grid-cols-1 gap-4">
                   {/* Contract PDF (Single) */}
                   <div className="w-full">
                       <BoxFileInput 
                           label={t("admin.workers.contractPdf") || "Employment Contract (PDF)"} 
                           name="contractPdf" 
                           accept="application/pdf" 
                           existingValue={worker?.contractPdf ? (typeof worker.contractPdf === 'string' ? worker.contractPdf : worker.contractPdf.url) : null}
                           icon={FileText}
                       />
                   </div>

                   {/* Other Files (Multiple) - Custom handling */}
                   <div className="w-full border-t border-gray-200 pt-4 mt-2">
                       <label className="label">
                          <span className="label-text font-medium text-gray-700">{t("admin.workers.otherDocuments") || "Additional Files"}</span>
                       </label>
                       
                       {/* List Existing Other Files */}
                       <div className="flex flex-wrap gap-3 mb-3">
                           {worker?.documents?.files?.map((file, idx) => {
                               if (removedOtherFiles.includes(file.url)) return null;
                               const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.url) || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);
                               
                               return (
                                   <div key={idx} className="relative group w-20 h-20 border rounded-lg overflow-hidden bg-white shadow-sm">
                                       {isImage ? (
                                           <img src={file.url} alt="file" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage(file.url)} />
                                       ) : (
                                           <a href={file.url} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center text-gray-500 hover:text-blue-600">
                                               <FileText className="w-8 h-8"/>
                                           </a>
                                       )}
                                       <button
                                          type="button"
                                          onClick={() => setRemovedOtherFiles(prev => [...prev, file.url])}
                                          className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-sm transition-opacity"
                                       >
                                          <X className="w-3 h-3" />
                                       </button>
                                   </div>
                               );
                           })}
                       </div>

                       {/* Upload New Multiple */}
                       <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-center">
                           <input 
                               type="file" 
                               multiple 
                               accept="*/*"
                               {...register("otherFiles")}
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           />
                           <div className="flex flex-col items-center text-gray-500">
                               <Upload className="w-6 h-6 mb-1" />
                               <span className="text-xs">Click to upload multiple files</span>
                               {watch("otherFiles")?.length > 0 && (
                                   <span className="text-xs text-blue-600 font-medium mt-1">
                                       {watch("otherFiles").length} files selected
                                   </span>
                               )}
                           </div>
                       </div>
                   </div>
               </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.workers.notes")}
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              maxLength={1000}
              placeholder={t("admin.workers.notesPlaceholder") || "Add notes about this worker (optional)..."}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("common.maxCharacters", { count: 1000 })} • {watch("notes")?.length || 0}/1000
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewImage} alt="Full Preview" className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        </div>
      )}
    </>
  );
};

export default WorkerModal;