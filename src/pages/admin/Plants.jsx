// frontend/src/pages/admin/Plants.jsx - FIXED CATEGORY
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Search, Flower2, Image as ImageIcon } from 'lucide-react';
import { plantsAPI } from '../../services/api';
import { getLocalizedText } from '../../services/translationService';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const Plants = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: { ar: '', en: '', bn: '' },
    scientificName: '',
    category: 'flower', // ✅ FIXED: Changed from 'flowers' to 'flower'
    description: { ar: '', en: '', bn: '' },
    careInstructions: {
      watering: '',
      sunlight: '',
      soil: '',
      temperature: ''
    },
    price: '',
    stockQuantity: '',
    unit: 'piece',
    image: null
  });

  // ✅ FIXED: Updated categories to match backend enum
  const categories = [
    { value: 'flower', label: t('plantCategories.flower') },
    { value: 'tree', label: t('plantCategories.tree') },
    { value: 'shrub', label: t('plantCategories.shrub') },
    { value: 'herb', label: t('plantCategories.herb') },
    { value: 'vegetable', label: t('plantCategories.vegetable') },
    { value: 'fruit', label: t('plantCategories.fruit') },
    { value: 'succulent', label: t('plantCategories.succulent') },
    { value: 'grass', label: t('plantCategories.grass') },
    { value: 'other', label: t('plantCategories.other') }
  ];

  const units = [
    { value: 'piece', label: t('units.piece') },
    { value: 'pot', label: t('units.pot') },
    { value: 'kg', label: t('units.kg') },
    { value: 'bundle', label: t('units.bundle') }
  ];

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const response = await plantsAPI.getPlants({ 
        category: categoryFilter !== 'all' ? categoryFilter : undefined 
      });
      setPlants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plant = null) => {
    if (plant) {
      setEditingPlant(plant);
      setFormData({
        name: plant.name || { ar: '', en: '', bn: '' },
        scientificName: plant.scientificName || '',
        category: plant.category || 'flower', // ✅ FIXED
        description: plant.description || { ar: '', en: '', bn: '' },
        careInstructions: plant.careInstructions || {
          watering: '',
          sunlight: '',
          soil: '',
          temperature: ''
        },
        price: plant.price || '',
        stockQuantity: plant.stockQuantity || '',
        unit: plant.unit || 'piece',
        image: null
      });
      setImagePreview(plant.image || null);
    } else {
      setEditingPlant(null);
      setFormData({
        name: { ar: '', en: '', bn: '' },
        scientificName: '',
        category: 'flower', // ✅ FIXED
        description: { ar: '', en: '', bn: '' },
        careInstructions: {
          watering: '',
          sunlight: '',
          soil: '',
          temperature: ''
        },
        price: '',
        stockQuantity: '',
        unit: 'piece',
        image: null
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlant(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Add multilingual fields
      formDataToSend.append('name[ar]', formData.name.ar);
      formDataToSend.append('name[en]', formData.name.en);
      formDataToSend.append('name[bn]', formData.name.bn);
      formDataToSend.append('description[ar]', formData.description.ar);
      formDataToSend.append('description[en]', formData.description.en);
      formDataToSend.append('description[bn]', formData.description.bn);
      
      // Add other fields
      formDataToSend.append('scientificName', formData.scientificName);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('careInstructions[watering]', formData.careInstructions.watering);
      formDataToSend.append('careInstructions[sunlight]', formData.careInstructions.sunlight);
      formDataToSend.append('careInstructions[soil]', formData.careInstructions.soil);
      formDataToSend.append('careInstructions[temperature]', formData.careInstructions.temperature);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stockQuantity', formData.stockQuantity);
      formDataToSend.append('unit', formData.unit);
      
      // Add image if selected
      if (formData.image) {
        formDataToSend.append('plantImage', formData.image);
      }

      if (editingPlant) {
        await plantsAPI.updatePlant(editingPlant._id, formDataToSend);
      } else {
        await plantsAPI.createPlant(formDataToSend);
      }

      fetchPlants();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving plant:', error);
      alert(error.response?.data?.message || 'Failed to save plant');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await plantsAPI.deletePlant(id);
        fetchPlants();
      } catch (error) {
        console.error('Error deleting plant:', error);
        alert(error.response?.data?.message || 'Failed to delete plant');
      }
    }
  };

  const filteredPlants = plants.filter(plant => {
    const name = getLocalizedText(plant.name, currentLang).toLowerCase();
    const scientificName = (plant.scientificName || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || scientificName.includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Flower2 className="w-8 h-8 text-primary-600" />
            {t('admin.plants.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('admin.plants.subtitle')}</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          {t('admin.plants.addPlant')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-1">
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
        </div>
        <div className="w-full md:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              fetchPlants();
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">{t('common.allCategories')}</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Plants Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Flower2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">{t('admin.plants.noPlants')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.map(plant => (
            <div key={plant._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Plant Image */}
              <div className="h-48 bg-gray-100 relative">
                {plant.image ? (
                  <img
                    src={plant.image}
                    alt={getLocalizedText(plant.name, currentLang)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium">
                  {categories.find(c => c.value === plant.category)?.label || plant.category}
                </div>
              </div>

              {/* Plant Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {getLocalizedText(plant.name, currentLang)}
                </h3>
                {plant.scientificName && (
                  <p className="text-sm text-gray-500 italic mb-2">{plant.scientificName}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {getLocalizedText(plant.description, currentLang)}
                </p>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600">{t('common.stock')}:</span>
                  <span className="font-medium">{plant.stockQuantity} {plant.unit}</span>
                </div>
                
                {plant.price > 0 && (
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-600">{t('common.price')}:</span>
                    <span className="font-medium text-primary-600">${plant.price}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(plant)}
                    icon={Edit}
                    className="flex-1"
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(plant._id)}
                    icon={Trash2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPlant ? t('admin.plants.editPlant') : t('admin.plants.addPlant')}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.plants.image')}
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
          </div>

          {/* Name (Multilingual) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={`${t('admin.plants.name')} (${t('common.arabic')})`}
              value={formData.name.ar}
              onChange={(e) => setFormData({
                ...formData,
                name: { ...formData.name, ar: e.target.value }
              })}
              required
            />
            <Input
              label={`${t('admin.plants.name')} (${t('common.english')})`}
              value={formData.name.en}
              onChange={(e) => setFormData({
                ...formData,
                name: { ...formData.name, en: e.target.value }
              })}
              required
            />
            <Input
              label={`${t('admin.plants.name')} (${t('common.bengali')})`}
              value={formData.name.bn}
              onChange={(e) => setFormData({
                ...formData,
                name: { ...formData.name, bn: e.target.value }
              })}
            />
          </div>

          {/* Scientific Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('admin.plants.scientificName')}
              value={formData.scientificName}
              onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
            />
            <Select
              label={t('admin.plants.category')}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories}
              required
            />
          </div>

          {/* Description (Multilingual) */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {t('admin.plants.description')}
            </label>
            <textarea
              placeholder={t('common.arabic')}
              value={formData.description.ar}
              onChange={(e) => setFormData({
                ...formData,
                description: { ...formData.description, ar: e.target.value }
              })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <textarea
              placeholder={t('common.english')}
              value={formData.description.en}
              onChange={(e) => setFormData({
                ...formData,
                description: { ...formData.description, en: e.target.value }
              })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <textarea
              placeholder={t('common.bengali')}
              value={formData.description.bn}
              onChange={(e) => setFormData({
                ...formData,
                description: { ...formData.description, bn: e.target.value }
              })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Care Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('admin.plants.watering')}
              value={formData.careInstructions.watering}
              onChange={(e) => setFormData({
                ...formData,
                careInstructions: { ...formData.careInstructions, watering: e.target.value }
              })}
            />
            <Input
              label={t('admin.plants.sunlight')}
              value={formData.careInstructions.sunlight}
              onChange={(e) => setFormData({
                ...formData,
                careInstructions: { ...formData.careInstructions, sunlight: e.target.value }
              })}
            />
            <Input
              label={t('admin.plants.soil')}
              value={formData.careInstructions.soil}
              onChange={(e) => setFormData({
                ...formData,
                careInstructions: { ...formData.careInstructions, soil: e.target.value }
              })}
            />
            <Input
              label={t('admin.plants.temperature')}
              value={formData.careInstructions.temperature}
              onChange={(e) => setFormData({
                ...formData,
                careInstructions: { ...formData.careInstructions, temperature: e.target.value }
              })}
            />
          </div>

          {/* Price, Stock, Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('common.price')}
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              min="0"
              step="0.01"
            />
            <Input
              label={t('common.stock')}
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              min="0"
              required
            />
            <Select
              label={t('common.unit')}
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={units}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingPlant ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Plants;