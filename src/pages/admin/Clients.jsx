import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { clientsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import ClientModal from './ClientModal';
import Loading from '../../components/common/Loading';

const Clients = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getClients({ search: searchTerm });
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Failed to fetch clients. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await clientsAPI.deleteClient(id);
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert(error.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleSuccess = () => {
    fetchClients();
  };

  // ✅ Updated Columns with Payment Type
  const columns = [
    { header: t('admin.clients.name'), accessor: 'name' },
    { header: t('admin.clients.email'), accessor: 'email' },
    { header: t('admin.clients.phone'), accessor: 'phone' },
    { 
      header: 'Property Type',
      render: (row) => {
        const typeKey = `ar_additions.propertyTypes.${row.propertyType}`;
        const translated = t(typeKey);
        const label = translated === typeKey ? row.propertyType : translated;
        
        return (
          <span className="capitalize">
            {row.propertyType === 'residential' ? '🏠' : '🏢'} {label}
          </span>
        );
      }
    },
    {
      // ✅ NEW: Payment Type Column
      header: 'Payment Type',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.paymentType === 'cash' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {row.paymentType === 'cash' ? '💵 Cash' : '💳 Online'}
        </span>
      )
    },
    {
      header: t('admin.clients.status'),
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {t(`status.${row.status}`)}
        </span>
      ),
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row)} 
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t('common.edit')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row._id)} 
            className="text-red-600 hover:text-red-800 p-1"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t('admin.clients.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('ar_additions.common.subtitle')} {clients.length} {t('nav.clients')}
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t('admin.clients.addClient')}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.noData')}</p>
          </div>
        ) : (
          <Table columns={columns} data={filteredClients} />
        )}
      </Card>

      {/* Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        client={selectedClient}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Clients;