// src/pages/admin/Invoices.jsx
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Eye, DollarSign, Search, CheckCircle, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination";
import Select from "react-select";
import useDebounce from "../../hooks/useDebounce";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";
import Skeleton, { TableSkeleton } from "../../components/common/Skeleton";
import Modal from "../../components/common/Modal";
import { toast } from "sonner";
import InvoiceDetailModal from "./InvoiceDetailModal";

// API & Hooks
import { 
  useAdminInvoices, 
  useAdminUpdateInvoice 
} from "../../hooks/queries/useInvoices";
import { useClients } from "../../hooks/queries/useClients";
import { useSites } from "../../hooks/queries/useSites";

const PAGE_SIZE = 10;

const Invoices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local State
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  
  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Debounce Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Filter Data
  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const clients = clientsData?.data || [];
  
  const { data: sitesData, isLoading: sitesLoading } = useSites();
  const sites = sitesData?.data || [];

  // Filter Options
  const clientOptions = useMemo(() => [
    { value: "", label: t("common.allClients") || "All Clients" },
    ...clients.map(c => ({ value: c._id, label: c.name }))
  ], [clients, t]);

  const siteOptions = useMemo(() => [
    { value: "", label: t("common.allSites") || "All Sites" },
    ...sites.map(s => ({ value: s._id, label: s.name }))
  ], [sites, t]);

  // Fetch Invoices
  const { data: invoicesData, isLoading, refetch } = useAdminInvoices({
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

  const updateInvoiceMutation = useAdminUpdateInvoice();

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

  const handleDownloadPdf = (invoice) => {
    const url = getSafePdfUrl(invoice);
    if (!url) {
      toast.error("PDF not available");
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleMarkAsPaid = async (invoice) => {
    if (window.confirm(`Mark invoice ${invoice.invoiceNumber} as PAID?`)) {
      try {
        const formData = new FormData();
        formData.append('paymentStatus', 'paid');
        formData.append('paidAt', new Date().toISOString());
        // For simple update, native usage of hook which might expect object or FormData
        // references say updateInvoice takes { id, data }
        
        await updateInvoiceMutation.mutateAsync({
          id: invoice._id,
          data: { paymentStatus: 'paid', paidAt: new Date() } // Sending JSON as safe bet if API supports it, or FormData
        });
        toast.success(t("accountant.markedAsPaid"));
      } catch (err) {
        console.error("Update failed", err);
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
      header: t("accountant.invoiceNumber") || "Invoice #", 
      accessor: "invoiceNumber",
      className: "font-mono font-medium text-blue-600"
    },
    {
      header: t("accountant.clientSite") || "Client / Site",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.client?.name || "N/A"}</p>
          <p className="text-xs text-gray-500">{row.site?.name || "General Invoice"}</p>
        </div>
      ),
    },
    {
      header: t("accountant.amount") || "Amount",
      render: (row) => (
        <span className="font-bold text-gray-900">
          SAR {(row.total || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: t("accountant.date") || "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: t("accountant.status") || "Status",
      render: (row) => (
        <Badge variant={statusVariants[row.paymentStatus] || "neutral"}>
          {t(`status.${row.paymentStatus.toLowerCase()}`) || row.paymentStatus}
        </Badge>
      ),
    },
    {
      header: t("accountant.actions") || "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => handleViewDetails(row)}
            title="View Details"
          />
          
          <Button
            size="sm"
            variant="secondary"
            icon={FileText}
            onClick={() => handleViewPdf(row)}
            disabled={!(row.pdfFile?.url || row.pdfUrl)}
            title="View PDF"
          />
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
          <h1 className="text-3xl font-bold text-gray-900">{t("admin.invoices.title") || "Invoices"}</h1>
          <p className="text-gray-500 mt-1">{totalCount} invoices found</p>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-4 bg-gray-50/50 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search by ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Invoice #</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                placeholder="Search ID..."
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
            <label className="text-sm font-medium text-gray-700">Client</label>
            <Select
              options={clientOptions}
              value={selectedClient}
              onChange={(opt) => {
                setSelectedClient(opt);
                setCurrentPage(1);
              }}
              placeholder="Filter by Client"
              isClearable
              className="text-sm"
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          {/* Site Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Site</label>
            <Select
              options={siteOptions}
              value={selectedSite}
              onChange={(opt) => {
                setSelectedSite(opt);
                setCurrentPage(1);
              }}
              placeholder="Filter by Site"
              isClearable
              className="text-sm"
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              options={[
                { value: "all", label: "All Statuses" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "overdue", label: "Overdue" }
              ]}
              value={{ value: paymentStatus, label: paymentStatus === 'all' ? 'All Statuses' : paymentStatus }}
              onChange={(opt) => handleStatusFilterChange(opt.value)}
              placeholder="Filter by Status"
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
            <p className="text-gray-500 text-lg font-medium">No invoices found</p>
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

      {/* Invoice Detail Modal (Editable) */}
      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        invoice={selectedInvoice}
        onSuccess={() => refetch()}
      />

      {/* PDF View Modal (Read Only) */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title="Invoice PDF"
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
             <p className="text-gray-500">No PDF available</p>
           )}
        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
