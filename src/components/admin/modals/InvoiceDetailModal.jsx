// frontend/src/pages/admin/InvoiceDetailModal.jsx - NEW FILE
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Download, X, Eye, FileText, DollarSign } from "lucide-react";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import Select from "../../common/Select";
import Input from "../../common/Input";
import Badge from "../../common/Badge";
import { invoicesAPI } from "../../../services/api";
import { toast } from "sonner";
import { useCallback } from "react";

const InvoiceDetailModal = ({ isOpen, onClose, invoice }) => {
  const { t } = useTranslation();

  if (!invoice) return null;

  const statusVariants = {
    paid: "success",
    pending: "warning",
    "partially-paid": "info",
    overdue: "danger",
    cancelled: "neutral",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Invoice Info Card */}
        <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t("accountant.modal.client")}</span>
            <span className="font-bold text-gray-900">{invoice.client?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t("accountant.modal.site")}</span>
            <span className="font-bold text-gray-900">{invoice.site?.name || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-4">
            <span className="text-sm text-gray-500">{t("accountant.modal.issuedOn")}</span>
            <span className="text-gray-900 font-medium">
              {new Date(invoice.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t("accountant.modal.status")}</span>
            <Badge variant={statusVariants[invoice.paymentStatus?.toLowerCase()] || "neutral"}>
              {t(`status.${invoice.paymentStatus?.toLowerCase()}`) || invoice.paymentStatus}
            </Badge>
          </div>
        </div>

        {/* Amount Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-blue-100">
          <div className="flex justify-between items-center text-white">
            <span className="text-blue-100 font-medium">{t("accountant.modal.totalAmount")}</span>
            <span className="text-2xl font-black">
              SAR {(invoice.total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">
              {t("accountant.modal.notes")}
            </label>
            <p className="text-gray-600 bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm italic leading-relaxed">
              "{invoice.notes}"
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            {t("common.close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};


export default InvoiceDetailModal;
