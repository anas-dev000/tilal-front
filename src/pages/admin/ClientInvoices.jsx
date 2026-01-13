import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  DollarSign, 
  ArrowLeft, 
  Eye, 
  FileText, 
  Download,
  AlertCircle
} from "lucide-react";
import { useAdminInvoices } from "../../hooks/queries/useInvoices";
import { useClient } from "../../hooks/queries/useClients";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Skeleton, { CardSkeleton, TableSkeleton } from "../../components/common/Skeleton";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import InvoiceDetailModal from "../../components/admin/modals/InvoiceDetailModal";
import Modal from "../../components/common/Modal";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const ClientInvoices = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Fetch Client Data for header
  const { data: client, isLoading: clientLoading } = useClient(id);

  // Fetch Invoices for this client
  const { data: invoicesData, isLoading: invoicesLoading, refetch } = useAdminInvoices({
    page: currentPage,
    limit: PAGE_SIZE,
    client: id
  });

  const invoices = invoicesData?.data || [];
  const totalCount = invoicesData?.total || 0;
  const totalPages = invoicesData?.totalPages || 1;

  // Calculate Finance Summary
  const financeSummary = useMemo(() => {
    if (!invoices.length) return { total: 0, paid: 0, pending: 0 };
    return invoices.reduce((acc, inv) => {
      acc.total += (inv.total || 0);
      if (inv.paymentStatus === 'paid') {
        acc.paid += (inv.total || 0);
      } else {
        acc.pending += (inv.total || 0);
      }
      return acc;
    }, { total: 0, paid: 0, pending: 0 });
  }, [invoices]);

  const statusVariants = {
    paid: "success",
    pending: "warning",
    "partially-paid": "info",
    overdue: "danger",
    cancelled: "neutral",
  };

  const getSafePdfUrl = useCallback((invoice) => {
    let url = invoice.pdfFile?.url || invoice.pdfUrl;
    if (!url) return null;

    if (url.includes('cloudinary.com')) {
      if (url.includes('/image/upload/')) {
        if (!url.toLowerCase().endsWith('.pdf')) {
          url = `${url}.pdf`;
        }
        url = url.replace('/upload/', '/upload/f_auto,q_auto/');
      }
    }

    if (url.toLowerCase().endsWith('.pdf')) {
      url = `${url}#view=FitH`;
    }
    
    return url;
  }, []);

  const handleViewPdf = (invoice) => {
    const url = getSafePdfUrl(invoice);
    if (url) {
      setPdfUrl(url);
      setIsPdfModalOpen(true);
    } else {
      toast.error(t("errors.pdfNotAvailable") || "PDF not available");
    }
  };

  const columns = [
    { 
      header: t("accountant.invoiceNumber"), 
      accessor: "invoiceNumber",
      className: "font-mono font-medium text-blue-600"
    },
    {
      header: t("common.site"),
      render: (row) => row.site?.name || t("common.general")
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
        <Badge variant={statusVariants[row.paymentStatus?.toLowerCase()] || "neutral"}>
          {t(`status.${row.paymentStatus?.toLowerCase()}`) || row.paymentStatus}
        </Badge>
      ),
    },
    {
      header: t("accountant.actions"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => {
              setSelectedInvoice(row);
              setIsModalOpen(true);
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            icon={FileText}
            onClick={() => handleViewPdf(row)}
            disabled={!(row.pdfFile?.url || row.pdfUrl)}
            title={t("common.viewPdf") || "View PDF"}
          />
        </div>
      ),
    },
  ];

  if (clientLoading || (invoicesLoading && !invoicesData)) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="250px" height="40px" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <Card>
          <TableSkeleton rows={8} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {client?.name} - {t("accountant.invoices")}
            </h1>
            <p className="text-gray-500 mt-1">{t("admin.clientDetails.financialOverview") || "Financial Overview"}</p>
          </div>
        </div>
      </div>

      {/* Finance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("status.paid")}</p>
              <p className="text-2xl font-bold text-green-600">SAR {financeSummary.paid.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("status.unpaid") || "Unpaid / Late"}</p>
              <p className="text-2xl font-bold text-red-600">SAR {financeSummary.pending.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">{t("accountant.noInvoicesFound")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table columns={columns} data={invoices} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalCount={totalCount}
              limit={PAGE_SIZE}
            />
          </div>
        )}
      </Card>

      <InvoiceDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
      />

      {/* PDF View Modal */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title={t("accountant.invoicePdf") || "Invoice PDF"}
        size="4xl"
      >
        <div className="h-[80vh] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
           {pdfUrl ? (
             <iframe
               src={pdfUrl}
               className="w-full h-full border-none"
               title="PDF Viewer"
             />
           ) : (
             <p className="text-gray-500">{t("errors.noPdfAvailable") || "No PDF available"}</p>
           )}
         </div>
      </Modal>
    </div>
  );
};

export default ClientInvoices;
