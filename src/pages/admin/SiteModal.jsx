// frontend/src/pages/admin/SiteModal.jsx
import { useState, useEffect } from 'react';
import { Upload, X, Plus, Image as ImageIcon, Layers } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { sitesAPI, clientsAPI } from '../../services/api';

const SiteModal = ({ isOpen, onClose, site, clients, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);

  // Site Data
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    siteType: 'residential',
    totalArea: '',
    description: '',
    location: {
      address: '',
      city: '',
      googleMapsLink: ''
    },
    notes: ''
  });

  // Cover Image
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  // New Client Form
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name || '',
        client: site.client?._id || '',
        siteType: site.siteType || 'residential',
        totalArea: site.totalArea || '',
        description: site.description || '',
        location: {
          address: site.location?.address || '',
          city: site.location?.city || '',
          googleMapsLink: site.location?.googleMapsLink || ''

        },
        notes: site.notes || ''
      });
      setCoverImagePreview(site.coverImage?.url || null);
    } else {
      setFormData({
        name: '',
        client: '',
        siteType: 'residential',
        totalArea: '',
        description: '',
        location: {
          address: '',
          city: '',
          location: { address: '', city: '', googleMapsLink: '' },
        },
        notes: ''
      });
      setCoverImagePreview(null);
    }
    setCoverImage(null);
    setError('');
  }, [site, isOpen]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      alert('Please fill all client fields');
      return;
    }

    try {
      const response = await clientsAPI.createClient(newClient);
      if (response.data.success) {
        const clientId = response.data.data.client._id;
        setFormData({ ...formData, client: clientId });
        setShowAddClient(false);
        setNewClient({ name: '', email: '', phone: '' });
        alert('Client added successfully!');
      }
    } catch (err) {
      console.error('Error adding client:', err);
      alert('Failed to add client');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('client', formData.client);
      formDataToSend.append('siteType', formData.siteType);
      formDataToSend.append('totalArea', formData.totalArea || 0);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location[address]', formData.location.address);
      formDataToSend.append('location[city]', formData.location.city);
      formDataToSend.append('notes', formData.notes);

      // Cover image
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      if (site) {
        await sitesAPI.updateSite(site._id, formDataToSend);
      } else {
        await sitesAPI.createSite(formDataToSend);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving site:', err);
      setError(err.response?.data?.message || 'Failed to save site');
    } finally {
      setLoading(false);
    }
  };

  const siteTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'public', label: 'Public' },
    { value: 'agricultural', label: 'Agricultural' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={site ? 'Edit Site' : 'Add New Site'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="flex items-start gap-4">
            {coverImagePreview && (
              <div className="relative">
                <img
                  src={coverImagePreview}
                  alt="Cover"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
                id="cover-image"
              />
              <label
                htmlFor="cover-image"
                className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {coverImagePreview ? 'Change Cover Image' : 'Upload Cover Image'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Site Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Villa Garden Project"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select client...</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddClient(!showAddClient)}
                icon={Plus}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Add Client Form (Collapsible) */}
        {showAddClient && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Add New Client</h4>
              <button
                type="button"
                onClick={() => setShowAddClient(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="Client name"
              />
              <Input
                label="Email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="client@example.com"
              />
              <Input
                label="Phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="+966..."
              />
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddClient}
            >
              Save Client
            </Button>
          </div>
        )}

        {/* Site Type & Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Site Type"
            value={formData.siteType}
            onChange={(e) => setFormData({ ...formData, siteType: e.target.value })}
            options={siteTypes}
            required
          />

          <Input
            label="Total Area (m²)"
            type="number"
            value={formData.totalArea}
            onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
            placeholder="e.g., 500"
            min="0"
          />
        </div>

  {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Address"
              value={formData.location.address}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, address: e.target.value }
              })}
            />
            <Input
              placeholder="City"
              value={formData.location.city}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, city: e.target.value }
              })}
            />
          </div>
          
          {/* ✅ NEW: Google Maps Link */}
          <Input
            placeholder="Google Maps Link (optional)"
            value={formData.location.googleMapsLink || ''}
            onChange={(e) => setFormData({
              ...formData,
              location: { ...formData.location, googleMapsLink: e.target.value }
            })}
          />
          <p className="text-xs text-gray-500">
            📍 Paste a Google Maps link (e.g., https://maps.google.com/...)
          </p>
        </div>

  
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of the site..."
            maxLength={2000}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Additional notes..."
          />
        </div>

        {/* Info Message */}
        {!site && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <Layers className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Note:</p>
              <p>After creating the site, you can add sections with reference images.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : site ? 'Update Site' : 'Create Site'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SiteModal;