// frontend/src/pages/admin/InvoiceDetailModal.jsx - NEW FILE
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Download, X, Eye, FileText, DollarSign } from "lucide-react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import { invoicesAPI } from "../../services/api";
import { toast } from "sonner";
import { useCallback } from "react";

const InvoiceDetailModal = ({ isOpen, onClose, invoice, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  //  Payment Status Management
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    if (invoice) {
      fetchInvoiceDetails();
    }
  }, [invoice]);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await invoicesAPI.getInvoice(invoice._id);
      const data = response.data.data;
      setInvoiceData(data);
      setPaymentStatus(data.paymentStatus || "pending");
      setPaymentMethod(data.paymentMethod || "");
      setPaidAmount(data.paidAmount || 0);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      setLoading(true);

      await invoicesAPI.updatePaymentStatus(invoice._id, {
        paymentStatus,
        paymentMethod,
        paidAmount: parseFloat(paidAmount),
        paymentDate: paymentStatus === "paid" ? new Date() : null,
      });
      toast.success("Payment status updated successfully", {
        duration: 5000,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error(
        error.response?.data?.message || "Failed to update payment status",
        {
          duration: 5000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const getSafePdfUrl = useCallback((rawUrl) => {
    if (!rawUrl) return null;
    let url = rawUrl;
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

  const handleDownload = () => {
    const url = getSafePdfUrl(invoiceData.pdfUrl || invoiceData.pdfFile?.url);
    if (!url) {
      toast.error("PDF not available", { duration: 5000 });
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `Invoice-${invoiceData.invoiceNumber || 'file'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!invoiceData) {
    return null;
  }

  const paymentStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "partially-paid", label: "Partially Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentMethodOptions = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "bank-transfer", label: "Bank Transfer" },
    { value: "online", label: "Online Payment" },
    { value: "other", label: "Other" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoiceData.invoiceNumber}`}
      size="lg"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="font-semibold">
                {invoiceData.client?.name || "Not Found"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Invoice Date</p>
              <p className="font-semibold">
                {new Date(invoiceData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-primary-600 bg-primary-50 p-2 rounded-lg border border-primary-100 flex justify-between items-center">
                <span>SAR {(invoiceData.total || 0).toLocaleString()}</span>
                {invoiceData.pdfUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={handleDownload}
                    className="shadow-sm"
                  >
                    PDF
                  </Button>
                )}
              </p>
            </div>
          </div>

          {/* Payment Management */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Payment Management
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                options={paymentStatusOptions}
              />

              <Select
                label="Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={paymentMethodOptions}
                placeholder="Select method"
              />
            </div>

            <Input
              label={`Paid Amount (Total: SAR ${invoiceData.total || 0})`}
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              min="0"
              step="0.01"
              max={invoiceData.total}
            />

            <div className="flex gap-2">
              <Button
                variant="success"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setPaymentStatus("paid");
                  setPaidAmount(invoiceData.total);
                }}
              >
                Fully Paid
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setPaymentStatus("pending");
                  setPaidAmount(0);
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Notes</h3>
              <p className="text-sm text-blue-800 italic">
                "{invoiceData.notes}"
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              {t("common.close")}
            </Button>
            <Button
              variant="success"
              onClick={handleUpdatePaymentStatus}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? "Updating..." : "Update Payment"}
            </Button>
          </div>
        </div>

        {/* PDF Preview Area */}
        <div className="h-[500px] lg:h-auto border-2 border-gray-200 rounded-3xl overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner aspect-[1/1.4] lg:aspect-auto">
          {getSafePdfUrl(invoiceData.pdfUrl || invoiceData.pdfFile?.url) ? (
            <iframe 
              src={getSafePdfUrl(invoiceData.pdfUrl || invoiceData.pdfFile?.url)}
              className="w-full h-full border-none"
              title="Invoice PDF Preview"
            />
          ) : (
            <div className="text-center text-gray-300 p-8">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-medium text-gray-400">PDF Preview Not Available</p>
              <p className="text-xs text-gray-400 mt-1">Upload a PDF to see it here</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceDetailModal;
