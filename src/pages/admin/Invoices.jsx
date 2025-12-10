// frontend/src/pages/admin/Invoices.jsx - FIXED with Modal
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Eye, DollarSign } from 'lucide-react';
import { invoicesAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import InvoiceDetailModal from './InvoiceDetailModal';
import Loading from '../../components/common/Loading';

const Invoices = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // ✅ NEW: Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { paymentStatus: filter } : {};
      const response = await invoicesAPI.getInvoices(params);
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoice) => {
    try {
      if (!invoice.pdfUrl) {
        alert('PDF not generated yet');
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001';
      const pdfUrl = `${baseUrl}/uploads/${invoice.pdfUrl}`;
      
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download invoice');
    }
  };

  // ✅ NEW: Open Modal
  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleSuccess = () => {
    fetchInvoices();
  };

  const getStatusColor = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'partially-paid': 'bg-blue-100 text-blue-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { header: t('admin.invoices.invoiceNumber'), accessor: 'invoiceNumber' },
    { 
      header: t('admin.invoices.client'), 
      render: (row) => row.client?.name || 'N/A'
    },
    {
      header: t('admin.invoices.amount'),
      render: (row) => `$${(row.total || 0).toFixed(2)}`,
    },
    { 
      header: t('admin.invoices.date'), 
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: t('admin.invoices.status'),
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.paymentStatus)}`}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="primary" 
            icon={Eye}
            onClick={() => handleView(row)}
          >
            {t('admin.invoices.view')}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            icon={Download}
            onClick={() => handleDownload(row)}
            disabled={!row.pdfUrl}
          >
            PDF
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t('admin.invoices.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {invoices.length} invoices found
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          All ({invoices.length})
        </Button>
        <Button
          variant={filter === 'paid' ? 'primary' : 'secondary'}
          onClick={() => setFilter('paid')}
        >
          Paid
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'secondary'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'partially-paid' ? 'primary' : 'secondary'}
          onClick={() => setFilter('partially-paid')}
        >
          Partially Paid
        </Button>
        <Button
          variant={filter === 'overdue' ? 'primary' : 'secondary'}
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </Button>
      </div>

      <Card>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('common.noData')}</p>
          </div>
        ) : (
          <Table columns={columns} data={invoices} />
        )}
      </Card>

      {/* ✅ NEW: Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        invoice={selectedInvoice}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Invoices;