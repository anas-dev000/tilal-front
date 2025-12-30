// src/pages/accountant/AccountantInvoices.jsx
import { useState, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Download, Eye, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React Query hooks
import { useInvoices, useDeleteInvoice } from "../../hooks/queries/useInvoices";

import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const AccountantInvoices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data with React Query
  const { data: invoices = [], isLoading } = useInvoices(filter !== "all" ? { paymentStatus: filter } : {});
  const deleteInvoiceMutation = useDeleteInvoice();

  const handleCreateNew = () => {
    navigate("/accountant/invoices/create");
  };

  const getSafePdfUrl = useCallback((invoice) => {
    let url = invoice.pdfFile?.url || invoice.pdfUrl;
    if (!url) return null;

    // If it's a Cloudinary URL
    if (url.includes('cloudinary.com')) {
      // 1. If it's an image resource, we can safely append .pdf to transform it
      if (url.includes('/image/upload/')) {
        if (!url.toLowerCase().endsWith('.pdf')) {
          url = `${url}.pdf`;
        }
        // Add flags to ensure it displays inline
        url = url.replace('/upload/', '/upload/f_auto,q_auto/');
      }
      // 2. If it's a raw resource, we MUST NOT append .pdf unless it's already there
    }

    // 3. Append PDF view parameters to fit to width (prevents horizontal scrolling)
    if (url.toLowerCase().endsWith('.pdf')) {
      url = `${url}#view=FitH`;
    }
    
    return url;
  }, []);

  const handleDownload = (invoice) => {
    const url = getSafePdfUrl(invoice);
    if (url) {
      // Create a temporary link to force proper download if needed
      // or just open in new tab if Cloudinary handles headers
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `Invoice-${invoice.invoiceNumber || 'file'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("PDF not available for this invoice");
    }
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("accountant.confirmDelete"))) {
      try {
        await deleteInvoiceMutation.mutateAsync(id);
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const statusVariants = {
    paid: "success",
    pending: "warning",
    "partially-paid": "info",
    overdue: "danger",
    cancelled: "neutral",
  };

  const columns = [
    { 
      header: t("accountant.invoiceNumber"), 
      accessor: "invoiceNumber",
      className: "font-mono font-medium"
    },
    {
      header: t("accountant.clientSite"),
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.client?.name || "N/A"}</p>
          <p className="text-xs text-gray-500">{row.site?.name || "General Invoice"}</p>
        </div>
      ),
    },
    {
      header: t("accountant.amount"),
      render: (row) => (
        <span className="font-bold text-gray-900">
          SAR {(row.total || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: t("accountant.date"),
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: t("accountant.status"),
      render: (row) => (
        <Badge variant={statusVariants[row.paymentStatus] || "neutral"}>
          {t(`status.${row.paymentStatus.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      header: t("accountant.actions"),
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => handleView(row)}
            title={t("accountant.viewDetails")}
          />
          <Button
            size="sm"
            variant="secondary"
            icon={Download}
            onClick={() => handleDownload(row)}
            disabled={!(row.pdfFile?.url || row.pdfUrl)}
            title={t("accountant.downloadPDF")}
          />
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => handleDelete(row._id)}
            title={t("accountant.deleteInvoice")}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("accountant.invoices")}</h1>
          <p className="text-gray-500 mt-1">{invoices.length} {t("accountant.invoicesManaged")}</p>
        </div>
        <Button onClick={handleCreateNew} icon={Plus} variant="primary">
          {t("accountant.createInvoice")}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-max sm:w-fit">
          {["all", "paid", "pending", "overdue"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                filter === f
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {t(`status.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">{t("accountant.noInvoicesFound")}</p>
            <p className="text-gray-400">{t("accountant.timeToGenerate")}</p>
          </div>
        ) : (
          <Table columns={columns} data={invoices} />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Invoice ${selectedInvoice?.invoiceNumber}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t("accountant.modal.client")}</span>
                  <span className="font-bold text-gray-900">{selectedInvoice.client?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t("accountant.modal.site")}</span>
                  <span className="font-bold text-gray-900">{selectedInvoice.site?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <span className="text-sm text-gray-500">{t("accountant.modal.issuedOn")}</span>
                  <span className="text-gray-900 font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t("accountant.modal.status")}</span>
                  <Badge variant={statusVariants[selectedInvoice.paymentStatus]}>
                    {t(`status.${selectedInvoice.paymentStatus.toLowerCase()}`)}
                  </Badge>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-blue-100">
                <div className="flex justify-between items-center text-white">
                  <span className="text-blue-100 font-medium">{t("accountant.modal.totalAmount")}</span>
                  <span className="text-2xl font-black">SAR {(selectedInvoice.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">{t("accountant.modal.notes")}</label>
                  <p className="text-gray-600 bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm italic leading-relaxed">
                    "{selectedInvoice.notes}"
                  </p>
                </div>
              )}

              <Button 
                variant="primary" 
                className="w-full py-4 text-lg font-bold shadow-xl shadow-blue-100" 
                icon={Download}
                onClick={() => handleDownload(selectedInvoice)}
                disabled={!(selectedInvoice.pdfFile?.url || selectedInvoice.pdfUrl)}
              >
                {t("accountant.modal.download")}
              </Button>
            </div>

            <div className="h-[400px] lg:h-auto border-2 border-gray-100 rounded-3xl overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner aspect-[1/1.4] lg:aspect-auto">
              {getSafePdfUrl(selectedInvoice) ? (
                <iframe 
                  src={getSafePdfUrl(selectedInvoice)}
                  className="w-full h-full border-none"
                  title={t("accountant.modal.preview")}
                />
              ) : (
                <div className="text-center text-gray-300 p-12">
                  <DollarSign className="w-20 h-20 mx-auto mb-4 opacity-10" />
                  <p className="font-medium">{t("accountant.modal.noPreview")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default memo(AccountantInvoices);
