import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { clientsAPI } from '../../services/api';

const ClientModal = ({ isOpen, onClose, client, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: client || {}
  });

  useEffect(() => {
    if (client) {
      reset(client);
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        password: '', // ✅ Required
        paymentType: 'cash',
        address: {
          street: '',
          city: ''
        },
        propertyType: 'residential',
        propertySize: '',
        notes: ''
      });
    }
  }, [client, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      if (client) {
        // Update existing client
        await clientsAPI.updateClient(client._id, data);
      } else {
        // Create new client
        await clientsAPI.createClient(data);
      }

      onSuccess();
      onClose();
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? t('common.edit') : t('admin.clients.addClient')}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('admin.clients.name')}
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            required
          />

          <Input
            label={t('admin.clients.email')}
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message}
            required
          />

          <Input
            label={t('admin.clients.phone')}
            {...register('phone', { required: 'Phone is required' })}
            error={errors.phone?.message}
            required
          />

          <Input
            label={t('admin.clients.whatsapp')}
            {...register('whatsapp')}
            error={errors.whatsapp?.message}
          />
        </div>

        {/* ✅ Password (Required - Type Text) */}
        {!client && (
          <Input
            label="Password"
            type="text"
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
            placeholder="Enter password"
            required
          />
        )}

        {/* Payment Type */}
        <Select
          label="Payment Type"
          {...register('paymentType')}
          options={[
            { value: 'cash', label: '💵 Cash' },
            { value: 'online', label: '💳 Online Payment' }
          ]}
          required
        />

        {/* ✅ Address - WITH LABELS */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('admin.clients.address')} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Street Address"
              {...register('address.street', { required: 'Street is required' })}
              error={errors.address?.street?.message}
              required
            />
            <Input
              label="City"
              {...register('address.city', { required: 'City is required' })}
              error={errors.address?.city?.message}
              required
            />
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('admin.clients.propertyType')}
            {...register('propertyType')}
            options={[
              { value: 'residential', label: '🏠 Residential (سكني)' },
              { value: 'commercial', label: '🏢 Commercial (تجاري)' }
            ]}
          />

          <Input
            label={t('admin.clients.propertySize')}
            type="number"
            placeholder="sq meters"
            {...register('propertySize')}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.clients.notes')}
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={1000}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientModal;