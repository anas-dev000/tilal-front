// frontend/src/pages/admin/InvoiceDetailModal.jsx - NEW FILE
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import { invoicesAPI } from '../../services/api';

const InvoiceDetailModal = ({ isOpen, onClose, invoice, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  
  // ✅ Payment Status Management
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentMethod, setPaymentMethod] = useState('');
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
      setPaymentStatus(data.paymentStatus || 'pending');
      setPaymentMethod(data.paymentMethod || '');
      setPaidAmount(data.paidAmount || 0);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      setLoading(true);
      
      await invoicesAPI.updatePaymentStatus(invoice._id, {
        paymentStatus,
        paymentMethod,
        paidAmount: parseFloat(paidAmount),
        paymentDate: paymentStatus === 'paid' ? new Date() : null
      });

      alert('Payment status updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!invoiceData?.pdfUrl) {
      alert('PDF not available');
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001';
    const pdfUrl = `${baseUrl}/uploads/${invoiceData.pdfUrl}`;
    window.open(pdfUrl, '_blank');
  };

  if (!invoiceData) {
    return null;
  }

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'partially-paid', label: 'Partially Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'online', label: 'Online Payment' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoiceData.invoiceNumber}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <p className="text-sm text-gray-500">Client</p>
            <p className="font-semibold">{invoiceData.client?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Invoice Date</p>
            <p className="font-semibold">
              {new Date(invoiceData.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="font-semibold">${invoiceData.subtotal?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tax ({invoiceData.tax?.rate || 15}%)</p>
            <p className="font-semibold">${invoiceData.tax?.amount?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Discount</p>
            <p className="font-semibold">${invoiceData.discount?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-semibold text-lg text-primary-600">
              ${invoiceData.total?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Payment Management */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900">💰 Payment Management</h3>
          
          {/* Payment Status */}
          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            options={paymentStatusOptions}
          />

          {/* Payment Method */}
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={paymentMethodOptions}
            placeholder="Select payment method"
          />

          {/* Paid Amount */}
          <Input
            label="Paid Amount"
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            min="0"
            step="0.01"
            max={invoiceData.total}
          />

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                setPaymentStatus('paid');
                setPaidAmount(invoiceData.total);
              }}
            >
              Mark as Fully Paid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPaymentStatus('pending');
                setPaidAmount(0);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Items */}
        {invoiceData.items && invoiceData.items.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📦 Items</h3>
            <div className="space-y-2">
              {invoiceData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b pb-2">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-gray-500">
                      {item.quantity} {item.unit} × ${item.unitPrice}
                    </p>
                  </div>
                  <p className="font-semibold">${item.total?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoiceData.notes && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📝 Notes</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {invoiceData.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t('common.close')}
          </Button>
          
          {invoiceData.pdfUrl && (
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          )}
          
          <Button
            variant="success"
            onClick={handleUpdatePaymentStatus}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Payment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceDetailModal;