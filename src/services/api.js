import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// ✅ Client Auth & API (UNIFIED)
export const clientsAPI = {
  // ✅ Client login - now returns standard JWT token
  clientLogin: (credentials) => api.post('/clients/login', credentials),
  
  // Client CRUD
  getClients: (params) => api.get('/clients', { params }),
  getClient: (id) => api.get(`/clients/${id}`),
  getClientTasks: (id) => api.get(`/clients/${id}/tasks`),
  createClient: (data) => api.post('/clients', data),
  updateClient: (id, data) => api.put(`/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/clients/${id}`),
};

// ✅ Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  getWorkers: () => api.get('/users/workers'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// ✅ Sites API
export const sitesAPI = {
  getAllSites: (params) => api.get('/sites', { params }),
  getSite: (id) => api.get(`/sites/${id}`),
  createSite: (formData) => api.post('/sites', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateSite: (id, formData) => api.put(`/sites/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteSite: (id) => api.delete(`/sites/${id}`),
  
  // Section Management
  addSection: (siteId, formData) => api.post(`/sites/${siteId}/sections`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateSection: (siteId, sectionId, formData) => api.put(`/sites/${siteId}/sections/${sectionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteSection: (siteId, sectionId) => api.delete(`/sites/${siteId}/sections/${sectionId}`),
  deleteReferenceImage: (siteId, sectionId, imageId) => api.delete(`/sites/${siteId}/sections/${sectionId}/images/${imageId}`),
};

// ✅ Tasks API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  assignTask: (id, data) => api.post(`/tasks/${id}/assign`, data),
  startTask: (id, location) => api.post(`/tasks/${id}/start`, location),
  completeTask: (id, location) => api.post(`/tasks/${id}/complete`, location),
  
  // Upload images
  uploadTaskImages: (id, formData) => api.post(`/tasks/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteTaskImage: (id, imageId, imageType) => api.delete(`/tasks/${id}/images/${imageId}`, {
    data: { imageType }
  }),
  toggleImageVisibility: (taskId, imageId, imageType) => 
    api.put(`/tasks/${taskId}/images/${imageId}/visibility`, { imageType }),
  bulkUpdateImageVisibility: (taskId, imageIds, imageType, isVisible) => 
    api.put(`/tasks/${taskId}/images/bulk-visibility`, { 
      imageIds, 
      imageType, 
      isVisible 
    }),
  submitFeedback: (id, formData) => api.post(`/tasks/${id}/feedback`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ✅ Plants API
export const plantsAPI = {
  getPlants: (params) => api.get('/plants', { params }),
  getPlant: (id) => api.get(`/plants/${id}`),
  getPlantCategories: () => api.get('/plants/categories'),
  createPlant: (formData) => api.post('/plants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePlant: (id, formData) => api.put(`/plants/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletePlant: (id) => api.delete(`/plants/${id}`),
};

// ✅ Inventory API
export const inventoryAPI = {
  getInventory: (params) => api.get('/inventory', { params }),
  getInventoryItem: (id) => api.get(`/inventory/${id}`),
  createInventoryItem: (data) => api.post('/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/inventory/${id}`),
  withdrawInventory: (id, data) => api.post(`/inventory/${id}/withdraw`, data),
  restockInventory: (id, data) => api.post(`/inventory/${id}/restock`, data),
};

// ✅ Invoices API
export const invoicesAPI = {
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
  updatePaymentStatus: (id, data) => api.put(`/invoices/${id}/payment-status`, data),
  downloadInvoice: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};

// ✅ Reports API
export const reportsAPI = {
  getDashboardStats: (params) => api.get('/reports/dashboard', { params }),
  getWeeklyReport: () => api.get('/reports/weekly'),
  getMonthlyReport: () => api.get('/reports/monthly'),
  getWorkerPerformance: (params) => api.get('/reports/workers', { params }),
};

// ✅ Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// ✅ Helper function for localized text
export const getLocalizedText = (multiLangObj, language = 'en') => {
  if (!multiLangObj) return '';
  if (typeof multiLangObj === 'string') return multiLangObj;
  return multiLangObj[language] || multiLangObj.en || multiLangObj.ar || '';
};

export default api;