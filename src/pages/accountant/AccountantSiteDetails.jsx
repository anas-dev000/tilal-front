// src/pages/accountant/AccountantSiteDetails.jsx
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  ChevronLeft, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit2
} from "lucide-react";

import { useAccountantSite, useInvoices, useAccountantUpdateSite } from "../../hooks/queries/useInvoices";

import Loading from "../../components/common/Loading";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Table from "../../components/common/Table";
import PaymentBadge from "../../components/common/PaymentBadge";
import EditCycleModal from "../../components/accountant/EditCycleModal";

const AccountantSiteDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [isEditCycleModalOpen, setIsEditCycleModalOpen] = useState(false);
  const pageSize = 10;

  // Fetch Site Details
  const { data: siteData, isLoading: siteLoading } = useAccountantSite(id);
  const site = siteData?.data || siteData; // Handle both wrapped/unwrapped responses

  // Fetch Site Invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({
    site: id,
    page: currentPage,
    limit: pageSize
  });

  const invoices = invoicesData?.data || [];

  // Calculate Stats
  const stats = useMemo(() => {
    if (!invoices) return { total: 0, paid: 0, pending: 0, overdue: 0 };
    return invoices.reduce((acc, inv) => {
      acc.total += inv.total || 0;
      if (inv.paymentStatus === 'paid') acc.paid += inv.total || 0;
      if (inv.paymentStatus === 'pending') acc.pending += inv.total || 0;
      if (inv.paymentStatus === 'overdue') acc.overdue += inv.total || 0;
      return acc;
    }, { total: 0, paid: 0, pending: 0, overdue: 0 });
  }, [invoices]);

  if (siteLoading || invoicesLoading) return <Loading fullScreen />;

  if (!site) return <div className="p-8 text-center">{t("common.notFound")}</div>;

  const columns = [
    { 
      header: t("accountant.invoiceNumber"), 
      accessor: "invoiceNumber",
      className: "font-mono font-medium text-blue-600"
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
        <Badge variant={
          row.paymentStatus === 'paid' ? 'success' : 
          row.paymentStatus === 'item' ? 'warning' : 'danger'
        }>
          {t(`status.${row.paymentStatus}`)}
        </Badge>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          <p className="text-gray-500 flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4" /> {site.client?.name}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("accountant.totalInvoiced")}</p>
              <h3 className="text-xl font-bold text-gray-900">SAR {stats.total.toLocaleString()}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-full text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("accountant.totalPaid")}</p>
              <h3 className="text-xl font-bold text-gray-900">SAR {stats.paid.toLocaleString()}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("accountant.totalPending")}</p>
              <h3 className="text-xl font-bold text-gray-900">SAR {stats.pending.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-full text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("accountant.totalOverdue")}</p>
              <h3 className="text-xl font-bold text-gray-900">SAR {stats.overdue.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Site Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title={t("accountant.siteInfo")}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t("admin.sites.location")}</p>
                  <p className="text-sm text-gray-500">{site.location?.address}</p>
                  <p className="text-sm text-gray-500">{site.location?.city}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t("admin.sites.contact")}</p>
                  <p className="text-sm text-gray-500">{site.client?.phone}</p>
                  <p className="text-sm text-gray-500">{site.client?.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-2">{t("accountant.paymentCycle")}</p>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-bold capitaliz text-gray-700">
                      {site.paymentCycle ? t(`status.${site.paymentCycle.toLowerCase()}`) : t("status.monthly")}
                    </span>
                    <button 
                      onClick={() => setIsEditCycleModalOpen(true)}
                      className="text-gray-400 hover:text-green-600 transition-colors p-1"
                      title={t("accountant.editCycle")}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <PaymentBadge nextPaymentDate={site.nextPaymentDate} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="lg:col-span-2">
          <Card title={t("accountant.invoices")}>
            {invoices.length > 0 ? (
               <Table columns={columns} data={invoices} />
            ) : (
              <div className="text-center py-8 text-gray-500">{t("accountant.noInvoicesFound")}</div>
            )}
          </Card>
        </div>
      </div>

      <EditCycleModal 
        isOpen={isEditCycleModalOpen}
        onClose={() => setIsEditCycleModalOpen(false)}
        site={site}
      />
    </div>
  );
};

export default AccountantSiteDetails;
