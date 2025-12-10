import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Power } from 'lucide-react';
import { usersAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import WorkerModal from './WorkerModal';
import Loading from '../../components/common/Loading';

const Workers = () => {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers({ role: 'worker' });
      setWorkers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await usersAPI.deleteUser(id);
        fetchWorkers();
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker');
      }
    }
  };

  // ✅ NEW: Toggle Worker Status (Activate/Deactivate)
  const toggleWorkerStatus = async (id, newStatus) => {
    try {
      await usersAPI.updateUser(id, { isActive: newStatus });
      fetchWorkers();
    } catch (error) {
      console.error('Error toggling worker status:', error);
      alert('Failed to update worker status');
    }
  };

  const handleAddNew = () => {
    setSelectedWorker(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedWorker(null);
  };

  const handleSuccess = () => {
    fetchWorkers();
  };

  // ✅ UPDATED Columns (Removed Specialization, Added Status Toggle)
  const columns = [
    { header: t('admin.workers.name'), accessor: 'name' },
    { header: t('admin.workers.email'), accessor: 'email' },
    { header: t('admin.workers.phone'), accessor: 'phone' },
    {
      header: t('admin.workers.status'),
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.isActive ? '✅ Active' : '🔴 Inactive'}
        </span>
      ),
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-2">
          {/* Edit Button */}
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t('common.edit')}
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {/* ✅ Toggle Status Button */}
          <button
            onClick={() => toggleWorkerStatus(row._id, !row.isActive)}
            className={`p-1 ${
              row.isActive 
                ? 'text-red-600 hover:text-red-800' 
                : 'text-green-600 hover:text-green-800'
            }`}
            title={row.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className="w-4 h-4" />
          </button>
          
          {/* Delete Button */}
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

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.workers.title')}</h1>
          <p className="text-gray-600 mt-1">
            {workers.length} workers • {workers.filter(w => w.isActive).length} active
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t('admin.workers.addWorker')}
        </Button>
      </div>

      <Card>
        {workers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.noData')}</p>
          </div>
        ) : (
          <Table columns={columns} data={workers} />
        )}
      </Card>

      <WorkerModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        worker={selectedWorker}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Workers;