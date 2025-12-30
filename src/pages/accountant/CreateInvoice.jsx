// src/pages/accountant/CreateInvoice.jsx
import React, { useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  FileUp, 
  X, 
  FileText, 
  CheckCircle, 
  ChevronLeft, 
  UploadCloud,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "sonner";

// React Query hooks
import { useAccountantSites, useCreateInvoice } from "../../hooks/queries/useInvoices";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";

const CreateInvoice = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoice();

  const { data: sites = [], isLoading: sitesLoading } = useAccountantSites();

  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    site: null,
    total: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    paymentStatus: "pending"
  });

  // PDF Upload State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Memoized site options
  const siteOptions = useMemo(() => 
    sites.map(s => ({
      value: s._id,
      label: s.name,
      client: s.client,
      paymentCycle: s.paymentCycle
    })),
  [sites]);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      processFile(file);
    } else {
      toast.error("Please upload a valid PDF file");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    setPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfPreview(url);
  };

  const removeFile = () => {
    setPdfFile(null);
    setPdfPreview(null);
  };

  // Handle Site Selection & Auto-fill
  const handleSiteChange = (option) => {
    setFormData(prev => ({
      ...prev,
      site: option,
      // Logic for due date based on payment cycle can be added here
    }));
    
    if (option?.paymentCycle) {
      toast.info(`${t("common.site")} has a ${option.paymentCycle} payment cycle`);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.site) return toast.error(t("accountant.create.selectSiteRequired"));
    if (!formData.total) return toast.error(t("accountant.create.error")); // General error for now
    if (!pdfFile) return toast.error(t("accountant.create.uploadPDF"));

    const data = new FormData();
    data.append("invoiceNumber", formData.invoiceNumber);
    data.append("site", formData.site.value);
    data.append("client", formData.site.client?._id || "");
    data.append("total", formData.total);
    data.append("issueDate", formData.issueDate);
    data.append("dueDate", formData.dueDate);
    data.append("notes", formData.notes);
    data.append("paymentStatus", formData.paymentStatus);
    data.append("pdfFile", pdfFile);

    try {
      await createInvoiceMutation.mutateAsync(data);
      navigate("/accountant/invoices");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  if (sitesLoading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 shrink-0">
        <Button 
          variant="outline" 
          size="sm" 
          icon={ChevronLeft} 
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{t("accountant.create.title")}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Form */}
        <div className="w-full lg:w-[45%] space-y-6">
          <Card className="p-6 border-none shadow-premium">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("accountant.invoiceNumber")}
                  value={formData.invoiceNumber}
                  readOnly
                  className="bg-gray-50 font-mono"
                  icon={FileText}
                />
                <Input
                  label={`${t("accountant.amount")} (SAR)`}
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: e.target.value})}
                  placeholder="0.00"
                  icon={DollarSign}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {t("accountant.create.selectSite")} *
                </label>
                <Select
                  options={siteOptions}
                  value={formData.site}
                  onChange={handleSiteChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder={t("accountant.create.searchSitePlaceholder")}
                  isSearchable
                />
                {formData.site && (
                  <p className="text-xs text-blue-600 mt-1 font-medium italic">
                    Connected to: {formData.site.client?.name || "No Client"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("accountant.create.issueDate")}
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                  icon={Calendar}
                />
                <Input
                  label={t("accountant.create.dueDate")}
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  icon={Calendar}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("accountant.modal.status")}</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {["pending", "paid"].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({...formData, paymentStatus: status})}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        formData.paymentStatus === status 
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100" 
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {t(`status.${status}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("accountant.modal.notes")}</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder={t("accountant.create.notesPlaceholder")}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-4 text-lg font-bold shadow-lg"
                isLoading={createInvoiceMutation.isPending}
              >
                {t("accountant.create.submit")}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: PDF Preview/Upload */}
        <div className="w-full lg:w-[55%] flex flex-col min-h-[400px] lg:min-h-0">
          {!pdfFile ? (
            <div 
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all px-12 text-center
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <UploadCloud className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("accountant.create.uploadPDF")}</h2>
              <p className="text-gray-500 mb-8 max-w-sm">
                {t("accountant.create.dragDrop")}
              </p>
              
              <Button 
                variant="outline" 
                size="lg" 
                icon={FileUp}
                onClick={() => fileInputRef.current?.click()}
              >
                {t("accountant.create.browseFiles")}
              </Button>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="application/pdf"
                onChange={handleFileChange}
              />

              <div className="mt-8 flex items-center gap-6 text-sm text-gray-400 font-medium">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> {t("accountant.create.pdfOnly")}</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> {t("accountant.create.maxSize")}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden relative group min-h-[500px] lg:min-h-full aspect-[1/1.4] lg:aspect-auto">
              {/* PDF Preview Frame */}
              <iframe 
                src={pdfPreview} 
                className="w-full h-full border-none"
                title="Invoice Preview"
              />
              
              {/* Overlay Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={removeFile}
                  className="p-2 bg-red-600/90 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors backdrop-blur-sm"
                  title="Remove File"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Ensure the PDF corresponds exactly to the amount and site selected on the left. This file will be visible to the client in their portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
