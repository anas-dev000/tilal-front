// src/pages/admin/ClientModal.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X, FileText, Upload, ExternalLink } from "lucide-react";

// React Query hooks
import {
  useCreateClient,
  useUpdateClient,
} from "../../../hooks/queries/useClients";

import Modal from "../../common/Modal";
import Input from "../../common/Input";
import Select from "../../common/Select";
import Button from "../../common/Button";

// Standalone PDF Preview Component for maximum reliability
const PdfPreviewModal = ({ isOpen, onClose, url, title }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !url) {
      setBlobUrl(null);
      setError(null);
      return;
    }

    // If it's already a blob (newly selected file), use it directly
    if (url.startsWith('blob:')) {
      setBlobUrl(url);
      return;
    }

    // Fetch remote PDF and convert to blob to bypass iframe cross-origin issues
    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const cleanUrl = url.split('#')[0];
        console.log("📥 [BLOB FETCH] Fetching PDF:", cleanUrl);
        const response = await fetch(cleanUrl);
        if (!response.ok) throw new Error(`Failed to load: ${response.statusText}`);
        const blob = await response.blob();
        const bUrl = URL.createObjectURL(blob);
        console.log("✅ [BLOB FETCH] Created blob URL:", bUrl);
        setBlobUrl(bUrl);
      } catch (err) {
        console.error("❌ [BLOB FETCH] Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (blobUrl && blobUrl.startsWith('blob:') && blobUrl !== url) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, url]);

  if (!isOpen) return null;

  const finalIframeUrl = blobUrl ? (blobUrl.includes('#view=') ? blobUrl : `${blobUrl}#view=FitH`) : null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-4">
          <h3 className="text-lg font-semibold truncate flex-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            {title}
          </h3>
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
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl relative">
          {isLoading ? (
             <div className="flex flex-col items-center gap-3">
               <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-500">Loading PDF...</p>
             </div>
          ) : error ? (
            <div className="text-center p-8">
               <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
               <p className="text-red-500 font-medium mb-4">Error loading document</p>
               <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
                 Click here to try opening in a new tab
               </a>
            </div>
          ) : finalIframeUrl ? (
            <iframe
              key={finalIframeUrl}
              src={finalIframeUrl}
              className="w-full h-full bg-white"
              title="PDF Preview"
            />
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

const ClientModal = ({ isOpen, onClose, client }) => {
  const { t } = useTranslation();

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const isEditMode = !!client;
  
  // PDF file state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [removedPdf, setRemovedPdf] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (client) {
      reset({
        ...client,
        address: client.address || { street: "", city: "" },
      });
      // Set existing PDF if available (handle both string URL and object {url, cloudinaryId})
      if (client.contractPdf) {
        const pdfUrl = typeof client.contractPdf === 'string' 
          ? client.contractPdf 
          : client.contractPdf.url;
        setPdfPreview(pdfUrl);
      } else {
        setPdfPreview(null);
      }
      setPdfFile(null);
      setRemovedPdf(false);
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        password: "",
        paymentType: "cash",
        address: {
          street: "",
          city: "",
        },
        propertyType: "residential",
        propertySize: "",
        notes: "",
      });
      setPdfFile(null);
      setPdfPreview(null);
      setRemovedPdf(false);
    }
  }, [client, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      if (data.whatsapp) formData.append("whatsapp", data.whatsapp);
      if (data.password) formData.append("password", data.password);
      formData.append("paymentType", data.paymentType);
      formData.append("propertyType", data.propertyType);
      if (data.propertySize) formData.append("propertySize", data.propertySize);
      if (data.notes) formData.append("notes", data.notes);

      // Append Address fields separately
      formData.append("address[street]", data.address.street);
      formData.append("address[city]", data.address.city);

      // Append PDF File (from state)
      if (pdfFile) {
        formData.append("contractPdf", pdfFile);
      }
      
      // Handle PDF removal in edit mode
      if (isEditMode && removedPdf) {
        formData.append("remove_contractPdf", "true");
      }

      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: client._id,
          data: formData,
        });
        toast.success("تم تحديث بيانات العميل بنجاح");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("تم إضافة العميل بنجاح");
      }

      onClose();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message || "حدث خطأ أثناء الحفظ";
      toast.error(message);
    }
  };

  const getSafePdfUrl = useCallback((url) => {
    if (!url) return null;

    let finalUrl = url;

    // Handle Cloudinary URLs
    if (finalUrl.includes('cloudinary.com')) {
      if (finalUrl.includes('/image/upload/')) {
        if (!finalUrl.toLowerCase().endsWith('.pdf')) {
          finalUrl = `${finalUrl}.pdf`;
        }
        finalUrl = finalUrl.replace('/upload/', '/upload/f_auto,q_auto/');
      }
    }
    
    if (finalUrl.toLowerCase().endsWith('.pdf') && !finalUrl.includes('#view=')) {
      finalUrl = `${finalUrl}#view=FitH`;
    }
    
    return finalUrl;
  }, []);

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      // Create a local URL for previewing the newly selected file
      const localUrl = URL.createObjectURL(file);
      setPdfPreview(localUrl);
      setRemovedPdf(false);
    }
  };

  const handleRemovePdf = () => {
    // If it's a local object URL, revoke it to prevent memory leaks
    if (pdfFile && pdfPreview && pdfPreview.startsWith('blob:')) {
      URL.revokeObjectURL(pdfPreview);
    }
    setPdfFile(null);
    setPdfPreview(null);
    setRemovedPdf(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("common.edit") : t("admin.clients.addClient")}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Message */}
        {(createMutation.error || updateMutation.error) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {createMutation.error?.response?.data?.message ||
              updateMutation.error?.response?.data?.message ||
              "An error occurred"}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("admin.clients.name")}
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
            required
          />

          <Input
            label={t("admin.clients.email")}
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
            required
          />

          <Input
            label={t("admin.clients.phone")}
            {...register("phone", { required: "Phone is required" })}
            error={errors.phone?.message}
            required
          />

          <Input
            label={t("admin.clients.whatsapp")}
            {...register("whatsapp")}
            error={errors.whatsapp?.message}
          />
        </div>

        {/* Password (only on create) */}
        {!isEditMode && (
          <Input
            label="Password"
            type="text"
            {...register("password", { required: "Password is required" })}
            error={errors.password?.message}
            placeholder="Enter password"
            required
          />
        )}

        {/* Payment Type */}
        <Select
          label="Payment Type"
          {...register("paymentType")}
          options={[
            { value: "cash", label: "Cash" },
            { value: "online", label: "Online Payment" },
          ]}
          required
        />

        {/* Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("admin.clients.address")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Street Address"
              {...register("address.street", {
                required: "Street is required",
              })}
              error={errors.address?.street?.message}
              required
            />
            <Input
              label="City"
              {...register("address.city", { required: "City is required" })}
              error={errors.address?.city?.message}
              required
            />
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t("admin.clients.propertyType")}
            {...register("propertyType")}
            options={[
              { value: "residential", label: "Residential (سكني)" },
              { value: "commercial", label: "Commercial (تجاري)" },
            ]}
          />

          <Input
            label={t("admin.clients.propertySize")}
            type="number"
            placeholder="sq meters"
            {...register("propertySize")}
          />
        </div>

        {/* Contract PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.clients.contractPdf") || "Contract PDF"} (.pdf)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition bg-gray-50">
            {pdfPreview ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-red-50 rounded-lg shrink-0">
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pdfFile ? pdfFile.name : "Contract PDF"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : "Existing file"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {pdfPreview && (
                    <button
                      type="button"
                      onClick={() => setShowPdfModal(true)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer py-4">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload PDF</span>
                <span className="text-xs text-gray-400 mt-1">PDF files only, max 10MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("admin.clients.notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={1000}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>

      <PdfPreviewModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        url={getSafePdfUrl(pdfPreview)}
        title={t("admin.clients.contractPdf") || "Contract PDF"}
      />
    </>
  );
};

export default ClientModal;