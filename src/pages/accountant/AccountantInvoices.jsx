// src/pages/accountant/AccountantInvoices.jsx
import { useState, memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Eye, DollarSign, Search, CheckCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination";
import Select from "react-select";
import useDebounce from "../../hooks/useDebounce";

const PAGE_SIZE = 10;

// React Query hooks
import { 
  useInvoices, 
  useUpdateInvoice,
  useAccountantClients,
  useAccountantSites
} from "../../hooks/queries/useInvoices";

import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";
import Skeleton, { TableSkeleton } from "../../components/common/Skeleton";
import Modal from "../../components/common/Modal";
import { toast } from "sonner";
import Input from "../../components/common/Input";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const AccountantInvoices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local State
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // PDF Viewing State
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [showPaidConfirm, setShowPaidConfirm] = useState(false);
  const [invoiceToMarkPaid, setInvoiceToMarkPaid] = useState(null);

  // Debounce Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Filter Data
  const { data: clientsData, isLoading: clientsLoading } = useAccountantClients();
  const clients = clientsData?.data || [];
  
  const { data: sitesData, isLoading: sitesLoading } = useAccountantSites();
  const sites = sitesData?.data || [];

  // Filter Options
  const clientOptions = useMemo(() => [
    { value: "", label: t("accountant.allClients") },
    ...clients.map(c => ({ value: c._id, label: c.name }))
  ], [clients, t]);

  const siteOptions = useMemo(() => [
    { value: "", label: t("accountant.allSites") },
    ...sites.map(s => ({ value: s._id, label: s.name }))
  ], [sites, t]);

  // Fetch Invoices
  const { data: invoicesData, isLoading } = useInvoices({
    page: currentPage,
    limit: PAGE_SIZE,
    paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
    search: debouncedSearch,
    client: selectedClient?.value,
    site: selectedSite?.value
  });

  const invoices = invoicesData?.data || [];
  const totalCount = invoicesData?.total || 0;
  const totalPages = invoicesData?.totalPages || 0;

  const updateInvoiceMutation = useUpdateInvoice();

  const handleCreateNew = () => {
    navigate("/accountant/invoices/create");
  };

  const handleStatusFilterChange = (f) => {
    setPaymentStatus(f);
    setCurrentPage(1);
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
      toast.error("PDF not available for this invoice");
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleMarkAsPaid = (invoice) => {
    setInvoiceToMarkPaid(invoice);
    setShowPaidConfirm(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!invoiceToMarkPaid) return;

    try {
      const formData = new FormData();
      formData.append('paymentStatus', 'paid');
      formData.append('paidAt', new Date().toISOString());

      await updateInvoiceMutation.mutateAsync({
        id: invoiceToMarkPaid._id,
        data: formData
      });
      toast.success(t("accountant.markedAsPaid"));
      setShowPaidConfirm(false);
      setInvoiceToMarkPaid(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const cancelPaidConfirm = () => {
    setShowPaidConfirm(false);
    setInvoiceToMarkPaid(null);
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
      className: "font-mono font-medium text-blue-600"
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
        <div className="flex items-center gap-2">

          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => handleViewDetails(row)}
            title={t("accountant.viewDetails")}
          />
          
          <Button
            size="sm"
            variant="secondary"
            icon={FileText}
            onClick={() => handleViewPdf(row)}
            disabled={!(row.pdfFile?.url || row.pdfUrl)}
            title={t("accountant.viewPDF")}
          />

                    {/* Mark as Paid Button (Only for pending/overdue) */}
          {(row.paymentStatus === 'pending' || row.paymentStatus === 'overdue') && (
            <Button
              size="sm"
              variant="success"
              icon={CheckCircle}
              onClick={() => handleMarkAsPaid(row)}
              title={t("accountant.markAsPaid")}
              className="bg-green-100 text-green-700 hover:bg-green-200 border-none"
            />
          )}
        </div>
      ),
    },
  ];

  if ((isLoading && !invoicesData) || clientsLoading || sitesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="200px" height="40px" />
          <Skeleton variant="rectangle" width="120px" height="40px" />
        </div>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
            <Skeleton variant="rectangle" height="40px" />
            <Skeleton variant="rectangle" height="40px" />
            <Skeleton variant="rectangle" height="40px" />
            <Skeleton variant="rectangle" height="40px" />
          </div>
        </Card>
        <Card>
          <TableSkeleton rows={10} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("accountant.invoices")}</h1>
          <p className="text-gray-500 mt-1">{totalCount} {t("accountant.invoicesManaged")}</p>
        </div>
        <Button onClick={handleCreateNew} icon={Plus} variant="primary">
          {t("accountant.createInvoice")}
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="p-4 bg-gray-50/50 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search by ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t("accountant.invoiceNumber")}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                placeholder={t("accountant.searchInvoiceId")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Client Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t("common.client")}</label>
            <Select
              options={clientOptions}
              value={selectedClient}
              onChange={(opt) => {
                setSelectedClient(opt);
                setCurrentPage(1);
              }}
              placeholder={t("accountant.filterByClient")}
              isClearable
              className="text-sm"
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          {/* Site Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t("common.site")}</label>
            <Select
              options={siteOptions}
              value={selectedSite}
              onChange={(opt) => {
                setSelectedSite(opt);
                setCurrentPage(1);
              }}
              placeholder={t("accountant.filterBySite")}
              isClearable
              className="text-sm"
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t("accountant.modal.status")}</label>
            <Select
              options={[
                { value: "all", label: t("status.all") },
                { value: "paid", label: t("status.paid") },
                { value: "pending", label: t("status.pending") },
                { value: "overdue", label: t("status.overdue") }
              ]}
              value={{ value: paymentStatus, label: t(`status.${paymentStatus}`) }}
              onChange={(opt) => handleStatusFilterChange(opt.value)}
              placeholder={t("accountant.filterByStatus")}
              className="text-sm"
              isSearchable={false}
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
        </div>
      </Card>

      <Card>
        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">{t("accountant.noInvoicesFound")}</p>
            <p className="text-gray-400">{t("accountant.timeToGenerate")}</p>
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

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Invoice ${selectedInvoice?.invoiceNumber}`}
        size="md"
      >
        {selectedInvoice && (
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
          </div>
        )}
      </Modal>

      {/* PDF View Modal */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title={t("accountant.viewPDF")}
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
             <p className="text-gray-500">{t("accountant.modal.noPreview")}</p>
           )}
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showPaidConfirm}
        onClose={cancelPaidConfirm}
        onConfirm={confirmMarkAsPaid}
        title={t("accountant.markAsPaid")}
        message={`Mark invoice ${invoiceToMarkPaid?.invoiceNumber} as PAID?`}
        confirmText={t("common.confirm")}
        confirmVariant="success"
      />
    </div>
  );
};

export default memo(AccountantInvoices);
