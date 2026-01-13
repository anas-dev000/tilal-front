import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useCreateUser, useUpdateUser } from "../../../hooks/queries/useUsers";
import Modal from "../../common/Modal";
import Input from "../../common/Input";
import Select from "../../common/Select";
import Button from "../../common/Button";

const EmployeeModal = ({ isOpen, onClose, employee }) => {
  const { t } = useTranslation();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isEditMode = !!employee;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: employee || {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "worker",
      isActive: "true",
      notes: "",
    },
  });

  // Watch role to conditionally show document uploads
  const selectedRole = watch("role");

  // Reset form when employee prop changes
  useEffect(() => {
    if (employee) {
      reset({
        ...employee,
        isActive: employee.isActive ? "true" : "false",
        password: "", // clear password
      });
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
    }
  }, [employee, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append text fields
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("role", data.role);
      formData.append("isActive", data.isActive === "true");
      formData.append("notes", data.notes || "");

      if (!isEditMode && data.password) {
        formData.append("password", data.password);
      }

      // Append files
      const appendFile = (fieldName) => {
        const fileInput = data[fieldName];
        // Only append if it's a FileList with a File object
        if (fileInput && fileInput.length > 0 && fileInput[0] instanceof File) {
          formData.append(fieldName, fileInput[0]);
        }
      };

      // Profile Picture (For all roles)
      appendFile("profilePicture");

      // Specific Worker Documents
      if (data.role === 'worker') {
        appendFile("residencePhoto");
        appendFile("licensePhoto");
        appendFile("idPhoto");
        
        // Multiple Files (otherFiles)
        if (data.otherFiles && data.otherFiles.length > 0) {
          Array.from(data.otherFiles).forEach((file) => {
             if (file instanceof File) {
                formData.append("otherFiles", file);
             }
          });
        }
      }

      if (isEditMode) {
        await updateUserMutation.mutateAsync({
          id: employee._id,
          data: formData,
        });
        toast.success(t("common.updatedSuccessfully") || "Employee updated successfully");
      } else {
        await createUserMutation.mutateAsync(formData);
        toast.success(t("common.createdSuccessfully") || "Employee created successfully");
      }

      onClose();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        (isEditMode
          ? "Failed to update employee"
          : "Failed to create employee");
      toast.error(errorMessage);
    }
  };

  const isLoading = isSubmitting || createUserMutation.isPending || updateUserMutation.isPending;

  // Custom Image Upload Component (Avatar Style)
  const ImageUpload = ({ name, label, currentUrl }) => {
    const fileList = watch(name);
    const file = fileList && fileList.length > 0 ? fileList[0] : null;
    // Ensure file is actually a File object
    const previewUrl = (file instanceof File) ? URL.createObjectURL(file) : currentUrl;
    
    const [removed, setRemoved] = useState(false);
    const displayUrl = removed ? null : previewUrl;

    const handleRemove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setRemoved(true);
    };

    return (
      <div className="flex flex-col items-center mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative group cursor-pointer">
           <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
              {displayUrl ? (
                <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-300 font-bold">
                   {watch("name")?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                 <span className="text-xs font-medium">Change</span>
              </div>
           </div>
           <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              {...register(name)}
              onChange={(e) => {
                register(name).onChange(e);
                setRemoved(false);
              }}
           />
           {/* Delete Button */}
           {displayUrl && (
             <button
               type="button"
               onClick={handleRemove}
               className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-md z-10"
               title="Remove image"
             >
               <X className="w-3 h-3" />
             </button>
           )}
        </div>
      </div>
    );
  };

  // Custom Document Upload Component (Box Style with Preview)
  const DocumentUpload = ({ name, label, accept, multiple = false }) => {
     const fileList = watch(name);
     const allFiles = fileList ? Array.from(fileList) : [];
     const [removedIndices, setRemovedIndices] = useState([]);
     
     // Filter out removed files for display
     const files = allFiles.filter((_, idx) => !removedIndices.includes(idx));
     const hasFiles = files.length > 0;

     const handleRemoveFile = (e, originalIndex) => {
       e.preventDefault();
       e.stopPropagation();
       setRemovedIndices(prev => [...prev, originalIndex]);
     };
     
     return (
       <div className="form-control w-full">
         <label className="label">
           <span className="label-text font-medium text-gray-700">{label}</span>
         </label>
         <div className={`relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer min-h-[120px] flex flex-col items-center justify-center ${hasFiles ? 'items-start' : ''}`}>
            <input 
               type="file" 
               accept={accept}
               multiple={multiple}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               {...register(name)}
               onChange={(e) => {
                 register(name).onChange(e);
                 setRemovedIndices([]); // Reset when new files selected
               }}
            />
            
            {hasFiles ? (
                <div className="w-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                       {allFiles.map((file, idx) => {
                           if (removedIndices.includes(idx)) return null;
                           
                           // Safe createObjectURL
                           const isImage = file.type?.startsWith('image/');
                           let previewUrl = null;
                           if (isImage) {
                               try { previewUrl = URL.createObjectURL(file); } catch (e) { /* ignore */ }
                           }
                           
                           return (
                               <div key={idx} className="relative bg-white p-2 rounded-lg border shadow-sm flex flex-col items-center group">
                                   {isImage && previewUrl ? (
                                       <img src={previewUrl} className="h-20 w-full object-cover rounded mb-2" alt="preview" />
                                   ) : (
                                       <div className="h-20 w-full bg-gray-100 rounded flex items-center justify-center mb-2 text-gray-500">
                                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                       </div>
                                   )}
                                   <span className="text-xs text-gray-600 truncate w-full text-center px-1">{file.name}</span>
                                   {/* Delete Button */}
                                   <button
                                     type="button"
                                     onClick={(e) => handleRemoveFile(e, idx)}
                                     className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-md z-20 opacity-0 group-hover:opacity-100"
                                     title="Remove file"
                                   >
                                     <X className="w-3 h-3" />
                                   </button>
                               </div>
                           );
                       })}
                    </div>
                    <p className="text-center text-xs text-blue-600 mt-3 font-medium">Click to add/change files</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 pointer-events-none w-full">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                   </div>
                   <div className="text-sm text-gray-500">
                      <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
                   </div>
                   <p className="text-xs text-gray-400">
                      {accept === "image/*" ? "PNG, JPG (max 5MB)" : "PDF, Images (max 10MB)"}
                   </p>
                </div>
            )}
         </div>
       </div>
     );
  };

  const currentProfilePic = employee?.profilePicture;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("common.edit") : t("admin.employees.addEmployee")}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Profile Picture - Avatar Style */}
        <ImageUpload 
           name="profilePicture" 
           label={t("admin.workers.profilePicture") || "Profile Picture"}
           currentUrl={currentProfilePic}
        />

        {/* Global error */}
        {(createUserMutation.error || updateUserMutation.error) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {createUserMutation.error?.response?.data?.message ||
              updateUserMutation.error?.response?.data?.message ||
              "An unexpected error occurred"}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <Select
            label={t("common.role")}
            {...register("role")}
            options={[
              { value: "worker", label: t("roles.worker") },
              { value: "accountant", label: t("roles.accountant") },
            ]}
          />

          {/* Status - only shown in edit mode */}
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


        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.workers.notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            maxLength={1000}
            placeholder={t("admin.workers.notesPlaceholder") || "Add notes..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
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
  );
};

export default EmployeeModal;
